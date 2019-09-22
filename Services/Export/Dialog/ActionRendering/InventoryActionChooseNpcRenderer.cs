using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Data.Styr;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ActionRendering
{
    /// <summary>
    /// Class for rendering an inventory action where the target npc gets choosen
    /// </summary>
    public class InventoryActionChooseNpcRenderer : BaseActionRenderer<InventoryActionChooseNpcRenderer.InventoryChooseNpcActionData>
    {
        /// <summary>
        /// Inventory choose npc action data
        /// </summary>
        public class InventoryChooseNpcActionData
        {
            /// <summary>
            /// Item Id
            /// </summary>
            public string ItemId { get; set; }
            
            /// <summary>
            /// Npc Id
            /// </summary>
            public string NpcId { get; set; }

            /// <summary>
            /// Quantity
            /// </summary>
            public int? Quantity { get; set; }
        }


        /// <summary>
        /// Quantity
        /// </summary>
        private const string Placeholder_Quantity = "Tale_Action_Quantity";

        /// <summary>
        /// Flex Field Item Resolver Prefix
        /// </summary>
        private const string FlexField_Item_Prefix = "Tale_Action_SelectedItem";

        /// <summary>
        /// Flex Field Npc Resolver Prefix
        /// </summary>
        private const string FlexField_Npc_Prefix = "Tale_Action_SelectedNpc";


        /// <summary>
        /// Default Template Provider
        /// </summary>
        protected readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Cached Db Access
        /// </summary>
        protected readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Resolver for the item flex field values
        /// </summary>
        private readonly FlexFieldExportTemplatePlaceholderResolver _flexFieldPlaceholderResolverItem;
        
        /// <summary>
        /// Resolver for the npc flex field values
        /// </summary>
        private readonly FlexFieldExportTemplatePlaceholderResolver _flexFieldPlaceholderResolverNpc;

        /// <summary>
        /// true if the action renderer is for a removal, else false
        /// </summary>
        private readonly bool _isRemoval;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>        
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="isRemoval">True if the action is for a removal, else false</param>
        public InventoryActionChooseNpcRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory,
                                                bool isRemoval)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedDbAccess = cachedDbAccess;
            _localizer = localizerFactory.Create(typeof(InventoryActionChooseNpcRenderer));
            _flexFieldPlaceholderResolverItem = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, FlexField_Item_Prefix);
            _flexFieldPlaceholderResolverNpc = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, FlexField_Npc_Prefix);

            _isRemoval = isRemoval;
        }

        /// <summary>
        /// Builds an action from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="data">Dialog data</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Action string</returns>
        public override async Task<string> BuildActionFromParsedData(InventoryActionChooseNpcRenderer.InventoryChooseNpcActionData parsedData, ExportDialogData data, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            ExportTemplate actionTemplate = await GetExportTemplate(project);
            IFlexFieldExportable itemObject = await GetItem(parsedData, errorCollection);
            if(itemObject == null)
            {
                return string.Empty;
            }
            IFlexFieldExportable npcObject = await GetNpc(parsedData, errorCollection);
            if(npcObject == null)
            {
                return string.Empty;
            }

            string actionCode = actionTemplate.Code;
            actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Quantity).Replace(actionCode, parsedData.Quantity.HasValue ? parsedData.Quantity.Value.ToString() : "1");

            ExportObjectData itemExportData = new ExportObjectData();
            itemExportData.ExportData.Add(ExportConstants.ExportDataObject, itemObject);
            itemExportData.ExportData.Add(ExportConstants.ExportDataObjectType, ExportConstants.ExportObjectTypeItem);
            _flexFieldPlaceholderResolverItem.SetErrorMessageCollection(errorCollection);
            actionCode = _flexFieldPlaceholderResolverItem.FillPlaceholders(actionCode, itemExportData).Result;

            ExportObjectData npcExportData = new ExportObjectData();
            npcExportData.ExportData.Add(ExportConstants.ExportDataObject, npcObject);
            npcExportData.ExportData.Add(ExportConstants.ExportDataObjectType, ExportConstants.ExportObjectTypeNpc);
            _flexFieldPlaceholderResolverNpc.SetErrorMessageCollection(errorCollection);
            actionCode = _flexFieldPlaceholderResolverNpc.FillPlaceholders(actionCode, npcExportData).Result;

            return actionCode;
        }

        /// <summary>
        /// Builds a preview text from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="child">Child node</param>
        /// <param name="parent">Parent</param>
        /// <returns>Preview text</returns>
        public override async Task<string> BuildPreviewTextFromParsedData(InventoryActionChooseNpcRenderer.InventoryChooseNpcActionData parsedData, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection, ExportDialogData child, ExportDialogData parent)
        {
            IFlexFieldExportable itemObject = await GetItem(parsedData, errorCollection);
            if(itemObject == null)
            {
                return string.Empty;
            }
            
            IFlexFieldExportable npcObject = await GetNpc(parsedData, errorCollection);
            if(npcObject == null)
            {
                return string.Empty;
            }

            string prefix = "";
            if(_isRemoval) 
            {
                prefix = "RemoveItemFromChooseNpcInventory";
            }
            else
            {
                prefix = "SpawnItemFromChooseNpcInventory";
            }

            return prefix + " (" + itemObject.Name + " in " + npcObject.Name + ")";
        }


        /// <summary>
        /// Returns the export template to use
        /// </summary>
        /// <param name="project">Project</param>
        /// <returns>Export template to use</returns>
        private async Task<ExportTemplate> GetExportTemplate(GoNorthProject project)
        {
            return await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, _isRemoval ? TemplateType.TaleActionRemoveItemFromChooseNpc : TemplateType.TaleActionSpawnItemForChooseNpc);
        }

        /// <summary>
        /// Returns the item to use
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Value Object</returns>
        private async Task<IFlexFieldExportable> GetItem(InventoryActionChooseNpcRenderer.InventoryChooseNpcActionData parsedData, ExportPlaceholderErrorCollection errorCollection)
        {
            StyrItem item = await _cachedDbAccess.GetItemById(parsedData.ItemId);
            if(item == null) 
            {
                errorCollection.AddDialogItemNotFoundError();
                return null;
            }

            return item;
        }
        
        /// <summary>
        /// Returns the npc to use
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Value Object</returns>
        private async Task<IFlexFieldExportable> GetNpc(InventoryActionChooseNpcRenderer.InventoryChooseNpcActionData parsedData, ExportPlaceholderErrorCollection errorCollection)
        {
            KortistoNpc npc = await _cachedDbAccess.GetNpcById(parsedData.NpcId);
            if(npc == null) 
            {
                errorCollection.AddDialogNpcNotFoundError();
                return null;
            }

            return npc;
        }

        /// <summary>
        /// Returns true if the action renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the action renderer has placeholders for the template type</returns>
        public override bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            return (templateType == TemplateType.TaleActionRemoveItemFromChooseNpc && _isRemoval) || (templateType == TemplateType.TaleActionSpawnItemForChooseNpc && !_isRemoval);
        }   

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder> {
                ExportUtil.CreatePlaceHolder(Placeholder_Quantity, _localizer)
            };

            exportPlaceholders.AddRange(_flexFieldPlaceholderResolverItem.GetExportTemplatePlaceholdersForType(TemplateType.ObjectNpc));
            exportPlaceholders.AddRange(_flexFieldPlaceholderResolverNpc.GetExportTemplatePlaceholdersForType(TemplateType.ObjectNpc));

            return exportPlaceholders;
        }
    }
}