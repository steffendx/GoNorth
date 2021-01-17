using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Data.Styr;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Microsoft.Extensions.Localization;
using Scriban;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.ValueCollector
{
    /// <summary>
    /// Class for Inventory Scriban value collectors
    /// </summary>
    public class InventoryValueCollector : BaseScribanValueCollector
    {
        /// <summary>
        /// Prefix used for items in the placeholder definition
        /// </summary>
        private const string ItemPlaceholderDefintionPrefix = "item";

        /// <summary>
        /// Export cached database access
        /// </summary>
        private readonly IExportCachedDbAccess _exportCachedDbAccess;

        /// <summary>
        /// Language key generator
        /// </summary>
        private readonly IScribanLanguageKeyGenerator _languageKeyGenerator;

        /// <summary>
        /// Localizer Factory
        /// </summary>
        private readonly IStringLocalizerFactory _localizerFactory;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="exportCachedDbAccess">Export cached database access</param>
        /// <param name="languageKeyGenerator">Language key generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public InventoryValueCollector(IExportCachedDbAccess exportCachedDbAccess, IScribanLanguageKeyGenerator languageKeyGenerator, 
                                       IStringLocalizerFactory localizerFactory)
        {
            _exportCachedDbAccess = exportCachedDbAccess;
            _languageKeyGenerator = languageKeyGenerator;
            _localizerFactory = localizerFactory;
        }

        /// <summary>
        /// Returns true if the value collector is valid for a given template type
        /// </summary>
        /// <param name="templateType">Template type</param>
        /// <returns>True if the value collector is valid, else false</returns>
        public override bool IsValidForTemplateType(TemplateType templateType)
        {
            return templateType == TemplateType.ObjectNpc || templateType == TemplateType.ObjectInventory;
        }

        /// <summary>
        /// Collects the values for an export
        /// </summary>
        /// <param name="templateType">Template type</param>
        /// <param name="parsedTemplate">Parsed scriban template</param>
        /// <param name="scriptObject">Scriban script object to fill</param>
        /// <param name="data">Export Data</param>
        /// <returns>Task</returns>
        public override async Task CollectValues(TemplateType templateType, Template parsedTemplate, ScriptObject scriptObject, ExportObjectData data)
        {
            KortistoNpc inputNpc = data.ExportData[ExportConstants.ExportDataObject] as KortistoNpc;
            if(inputNpc == null)
            {
                return;
            }

            _languageKeyGenerator.SetErrorCollection(_errorCollection);
            
            List<ScribanExportInventoryItem> items = await LoadInventory(parsedTemplate, inputNpc); 
            scriptObject.AddOrUpdate(ExportConstants.ScribanNpcInventoryObjectKey, items);
            scriptObject.AddOrUpdate(ExportConstants.ScribanLanguageKeyName, _languageKeyGenerator);
        }

        /// <summary>
        /// Loads the inventory
        /// </summary>
        /// <param name="parsedTemplate">Parsed scriban template</param>
        /// <param name="inputNpc">Input npc</param>
        /// <returns>List of items</returns>
        private async Task<List<ScribanExportInventoryItem>> LoadInventory(Template parsedTemplate, KortistoNpc inputNpc)
        {
            if(inputNpc.Inventory == null || !inputNpc.Inventory.Any())
            {
                return new List<ScribanExportInventoryItem>();
            }
            

            GoNorthProject project = await _exportCachedDbAccess.GetUserProject();
            ExportSettings exportSettings = await _exportCachedDbAccess.GetExportSettings(project.Id);

            List<ScribanExportInventoryItem> inventoryItems = new List<ScribanExportInventoryItem>();
            List<StyrItem> items = await _exportCachedDbAccess.GetItemsById(inputNpc.Inventory.Select(i => i.ItemId).ToList());
            foreach(KortistoInventoryItem curItem in inputNpc.Inventory)
            {
                StyrItem loadedItem = items.FirstOrDefault(i => i.Id == curItem.ItemId);
                if(loadedItem == null)
                {
                    continue;
                }

                ScribanExportInventoryItem exportItem = FlexFieldValueCollectorUtil.BuildFlexFieldValueObject<ScribanExportInventoryItem>(null, parsedTemplate, loadedItem, exportSettings, _errorCollection);
                exportItem.Quantity = curItem.Quantity;
                exportItem.IsEquipped = curItem.IsEquipped;
                inventoryItems.Add(exportItem);
            }

            return inventoryItems;
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder>();
            if(templateType != TemplateType.ObjectNpc && templateType != TemplateType.ObjectInventory)
            {
                return exportPlaceholders;
            }

            if(templateType == TemplateType.ObjectInventory)
            {
                exportPlaceholders.AddRange(_languageKeyGenerator.GetExportTemplatePlaceholders(string.Format("{0}.name | {0}.field.name", ItemPlaceholderDefintionPrefix)));
            }

            IStringLocalizer stringLocalizer = _localizerFactory.Create(typeof(InventoryValueCollector));
            exportPlaceholders.Add(new ExportTemplatePlaceholder(ExportConstants.ScribanNpcInventoryObjectKey, stringLocalizer["PlaceholderDesc_Inventory"]));

            List<ExportTemplatePlaceholder> itemPlaceholders = ScribanPlaceholderGenerator.GetPlaceholdersForObject<ScribanExportInventoryItem>(_localizerFactory, ItemPlaceholderDefintionPrefix);
            itemPlaceholders.RemoveAll(p => p.Name == string.Format("{0}.{1}", ItemPlaceholderDefintionPrefix, StandardMemberRenamer.Rename(nameof(ScribanExportItem.UnusedFields))));
            exportPlaceholders.AddRange(itemPlaceholders);

            return exportPlaceholders;
        }
    }
}