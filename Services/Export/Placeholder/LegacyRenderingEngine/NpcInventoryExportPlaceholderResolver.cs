using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Data.Styr;
using GoNorth.Extensions;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.LanguageKeyGeneration;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Placeholder.LegacyRenderingEngine
{
    /// <summary>
    /// Npc Inventory Export Template Placeholder Resolver
    /// </summary>
    public class NpcInventoryExportTemplatePlaceholderResolver : BaseExportPlaceholderResolver, IExportTemplateTopicPlaceholderResolver
    {
        /// <summary>
        /// Start of the content that will only be rendered if the Npc has items
        /// </summary>
        private const string Placeholder_HasItems_Start = "Npc_HasItems_Start";
        
        /// <summary>
        /// End of the content that will only be rendered if the Npc has items
        /// </summary>
        private const string Placeholder_HasItems_End = "Npc_HasItems_End";


        /// <summary>
        /// Inventory
        /// </summary>
        private const string Placeholder_Inventory = "Npc_Inventory";

        /// <summary>
        /// Start of the Item List
        /// </summary>
        private const string Placeholder_Inventory_Start = "Inventory_Start";

        /// <summary>
        /// End of the Item List
        /// </summary>
        private const string Placeholder_Inventory_End = "Inventory_End";

        /// <summary>
        /// Current Item Index
        /// </summary>
        private const string Placeholder_CurItem_Index = "CurItem_Index";

        /// <summary>
        /// Current Item is equipped start
        /// </summary>
        private const string Placeholder_CurItem_Is_Equipped_Start = "CurItem_Is_Equipped_Start";

        /// <summary>
        /// Current Item is equipped end
        /// </summary>
        private const string Placeholder_CurItem_Is_Equipped_End = "CurItem_Is_Equipped_End";

        /// <summary>
        /// Current Item quantity
        /// </summary>
        private const string Placeholder_CurItem_Quantity = "CurItem_Quantity";

        /// <summary>
        /// Current Item is equipped start
        /// </summary>
        private const string Placeholder_CurItem_Quantity_Not_Equal_One_Start = "CurItem_Quantity_Not_Equal_One_Start";

        /// <summary>
        /// Current Item is equipped end
        /// </summary>
        private const string Placeholder_CurItem_Quantity_Not_Equal_One_End = "CurItem_Quantity_Not_Equal_One_End";

        /// <summary>
        /// Flex Field Item Resolver Prefix
        /// </summary>
        private const string FlexField_Item_Prefix = "CurItem";


        /// <summary>
        /// Placeholder Resolver
        /// </summary>
        private IExportTemplatePlaceholderResolver _placeholderResolver;

        /// <summary>
        /// Export default template provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Export Cached Db Access
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// Language Key Generator
        /// </summary>
        private readonly ILanguageKeyGenerator _languageKeyGenerator;

        /// <summary>
        /// Resolver for flex field items
        /// </summary>
        private readonly FlexFieldExportTemplatePlaceholderResolver _itemPlaceholderResolver;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public NpcInventoryExportTemplatePlaceholderResolver(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, 
                                                             IStringLocalizerFactory localizerFactory) : base(localizerFactory.Create(typeof(NpcInventoryExportTemplatePlaceholderResolver)))
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedDbAccess = cachedDbAccess;
            _languageKeyGenerator = languageKeyGenerator;
            _itemPlaceholderResolver = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, _cachedDbAccess, languageKeyGenerator, localizerFactory, FlexField_Item_Prefix);
        }

        /// <summary>
        /// Sets the export template placeholder resolver
        /// </summary>
        /// <param name="placeholderResolver">Placeholder Resolver</param>
        public void SetExportTemplatePlaceholderResolver(IExportTemplatePlaceholderResolver placeholderResolver)
        {
            _placeholderResolver = placeholderResolver;
            _itemPlaceholderResolver.SetExportTemplatePlaceholderResolver(placeholderResolver);
        }

        /// <summary>
        /// Fills the placeholders of a code
        /// </summary>
        /// <param name="code">Code to fill</param>
        /// <param name="data">Export Data</param>
        /// <returns>Filled Code</returns>
        public async Task<string> FillPlaceholders(string code, ExportObjectData data)
        {
            // Check Data
            if(!data.ExportData.ContainsKey(ExportConstants.ExportDataObject))
            {
                return code;
            }

            KortistoNpc npc = data.ExportData[ExportConstants.ExportDataObject] as KortistoNpc;
            if(npc == null)
            {
                return code;
            }

            // Replace Inventory Placeholders
            _itemPlaceholderResolver.SetErrorMessageCollection(_errorCollection);            
            return await FillInventoryPlaceholders(code, npc, data);
        }

        /// <summary>
        /// Fills the inventory placeholders
        /// </summary>
        /// <param name="code">Code</param>
        /// <param name="npc">Npc</param>
        /// <param name="data">Export Data</param>
        /// <returns>Filled code</returns>
        private async Task<string> FillInventoryPlaceholders(string code, KortistoNpc npc, ExportObjectData data)
        {
            code = await ExportUtil.BuildPlaceholderRegex(Placeholder_Inventory, ExportConstants.ListIndentPrefix).ReplaceAsync(code, async m => {
                return await RenderInventory(data, m.Groups[1].Value); 
            });

            code = ExportUtil.RenderPlaceholderIfTrue(code, Placeholder_HasItems_Start, Placeholder_HasItems_End, npc.Inventory != null && npc.Inventory.Count > 0);

            code = ExportUtil.BuildRangePlaceholderRegex(Placeholder_Inventory_Start, Placeholder_Inventory_End).Replace(code, m => {
                return ExportUtil.TrimEmptyLines(BuildInventory(m.Groups[1].Value, npc));
            });

            return code;
        }

        /// <summary>
        /// Renders the inventory based on the shared template
        /// </summary>
        /// <param name="data">Export Data</param>
        /// <param name="indent">Indentation</param>
        /// <returns>Item List</returns>
        private async Task<string> RenderInventory(ExportObjectData data, string indent)
        {
            GoNorthProject project = await _cachedDbAccess.GetUserProject();
            ExportTemplate inventoryTemplate = await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.ObjectInventory);

            ExportPlaceholderFillResult fillResult = await _placeholderResolver.FillPlaceholders(TemplateType.ObjectInventory, inventoryTemplate.Code, data, inventoryTemplate.RenderingEngine);
            _errorCollection.Merge(fillResult.Errors);

            return ExportUtil.IndentListTemplate(fillResult.Code, indent);
        }

        /// <summary>
        /// Builds the inventory
        /// </summary>
        /// <param name="itemCode">Code for the items to repeat</param>
        /// <param name="npc">Npc</param>
        /// <returns>Inventory of the npc</returns>
        private string BuildInventory(string itemCode, KortistoNpc npc)
        {
            if(npc.Inventory == null)
            {
                return string.Empty;
            }

            int itemIndex = 0;
            string inventoryCode = string.Empty;
            foreach(KortistoInventoryItem curItem in npc.Inventory)
            {
                string curItemCode = ExportUtil.BuildPlaceholderRegex(Placeholder_CurItem_Index).Replace(itemCode, itemIndex.ToString());
                curItemCode = ExportUtil.RenderPlaceholderIfTrue(curItemCode, Placeholder_CurItem_Is_Equipped_Start, Placeholder_CurItem_Is_Equipped_End, curItem.IsEquipped);
                curItemCode = ExportUtil.RenderPlaceholderIfTrue(curItemCode, Placeholder_CurItem_Quantity_Not_Equal_One_Start, Placeholder_CurItem_Quantity_Not_Equal_One_End, curItem.Quantity != 1);
                curItemCode = ExportUtil.BuildPlaceholderRegex(Placeholder_CurItem_Quantity).Replace(curItemCode, curItem.Quantity.ToString());

                StyrItem item = _cachedDbAccess.GetItemById(curItem.ItemId).Result;
                if(item != null)
                {
                    ExportObjectData itemExportData = new ExportObjectData();
                    itemExportData.ExportData.Add(ExportConstants.ExportDataObject, item);
                    itemExportData.ExportData.Add(ExportConstants.ExportDataObjectType, ExportConstants.ExportObjectTypeItem);
                    curItemCode = _itemPlaceholderResolver.FillPlaceholders(curItemCode, itemExportData).Result;
                }
                
                inventoryCode += curItemCode;
                ++itemIndex;
            }
            
            return inventoryCode;
        }

        /// <summary>
        /// Returns if the placeholder resolver is valid for a template type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>true if the template type is valid for the template type</returns>
        public bool IsValidForTemplateType(TemplateType templateType)
        {
            return templateType == TemplateType.ObjectNpc || templateType == TemplateType.ObjectInventory;
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder>();
            if(templateType == TemplateType.ObjectNpc)
            {
                exportPlaceholders.Add(CreatePlaceHolder(Placeholder_Inventory));
            }

            exportPlaceholders.AddRange(new List<ExportTemplatePlaceholder>() {
                CreatePlaceHolder(Placeholder_HasItems_Start),
                CreatePlaceHolder(Placeholder_HasItems_End),
                CreatePlaceHolder(Placeholder_Inventory_Start),
                CreatePlaceHolder(Placeholder_Inventory_End),
                CreatePlaceHolder(Placeholder_CurItem_Index),
                CreatePlaceHolder(Placeholder_CurItem_Is_Equipped_Start),
                CreatePlaceHolder(Placeholder_CurItem_Is_Equipped_End),
                CreatePlaceHolder(Placeholder_CurItem_Quantity),
                CreatePlaceHolder(Placeholder_CurItem_Quantity_Not_Equal_One_Start),
                CreatePlaceHolder(Placeholder_CurItem_Quantity_Not_Equal_One_End)
            });

            exportPlaceholders.AddRange(_itemPlaceholderResolver.GetExportTemplatePlaceholdersForType(TemplateType.ObjectItem));

            return exportPlaceholders;
        }
    }
}