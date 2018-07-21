using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Data.Styr;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ActionConditionShared;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ActionRendering
{
    /// <summary>
    /// Class for rendering an inventory action
    /// </summary>
    public class InventoryActionRenderer : BaseActionRenderer<InventoryActionRenderer.InventoryActionData>
    {
        /// <summary>
        /// Inventory action data
        /// </summary>
        public class InventoryActionData
        {
            /// <summary>
            /// Item Id
            /// </summary>
            public string ItemId { get; set; }

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
        /// Resolver for flex field values
        /// </summary>
        private readonly FlexFieldExportTemplatePlaceholderResolver _flexFieldPlaceholderResolver;

        /// <summary>
        /// true if the action renderer is for the player, else false
        /// </summary>
        private readonly bool _isPlayer;

        /// <summary>
        /// true if the action renderer is for a transfer, else false
        /// </summary>
        private readonly bool _isTransfer;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>        
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="isPlayer">True if the action is for the player, else false</param>
        /// <param name="isTransfer">True if the action is for a transfer, false for spawn</param>
        public InventoryActionRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory,
                                       bool isPlayer, bool isTransfer)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedDbAccess = cachedDbAccess;
            _localizer = localizerFactory.Create(typeof(InventoryActionRenderer));
            _flexFieldPlaceholderResolver = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, FlexField_Item_Prefix);

            _isPlayer = isPlayer;
            _isTransfer = isTransfer;
        }

        /// <summary>
        /// Builds an action from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="data">Dialog data</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Action string</returns>
        public override async Task<string> BuildActionFromParsedData(InventoryActionRenderer.InventoryActionData parsedData, ExportDialogData data, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, KortistoNpc npc, ExportSettings exportSettings)
        {
            ExportTemplate actionTemplate = await GetExportTemplate(project);
            IFlexFieldExportable valueObject = await GetItem(parsedData, errorCollection);
            if(valueObject == null)
            {
                return string.Empty;
            }

            string actionCode = actionTemplate.Code;
            actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Quantity).Replace(actionCode, parsedData.Quantity.HasValue ? parsedData.Quantity.Value.ToString() : "1");

            ExportObjectData flexFieldExportData = new ExportObjectData();
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObject, valueObject);
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObjectType, ExportConstants.ExportObjectTypeItem);

            _flexFieldPlaceholderResolver.SetErrorMessageCollection(errorCollection);
            actionCode = _flexFieldPlaceholderResolver.FillPlaceholders(actionCode, flexFieldExportData).Result;

            return actionCode;
        }

        /// <summary>
        /// Builds a preview text from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Preview text</returns>
        public override async Task<string> BuildPreviewTextFromParsedData(InventoryActionRenderer.InventoryActionData parsedData, KortistoNpc npc, ExportPlaceholderErrorCollection errorCollection)
        {
            IFlexFieldExportable valueObject = await GetItem(parsedData, errorCollection);
            if(valueObject == null)
            {
                return string.Empty;
            }

            string prefix = "";
            if(_isPlayer) 
            {
                prefix = _isTransfer ? "TransferItemToPlayer" :  "SpawnItemInPlayerInventory";
            }
            else
            {
                prefix = _isTransfer ? "TransferItemToNpc" :  "SpawnItemInNpcInventory";
            }

            return prefix + " (" + valueObject.Name + ")";
        }


        /// <summary>
        /// Returns the export template to use
        /// </summary>
        /// <param name="project">Project</param>
        /// <returns>Export template to use</returns>
        private async Task<ExportTemplate> GetExportTemplate(GoNorthProject project)
        {
            if(_isPlayer) 
            {
                return await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, _isTransfer ? TemplateType.TaleActionTransferItemToPlayer : TemplateType.TaleActionSpawnItemForPlayer);
            }

            return await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, _isTransfer ? TemplateType.TaleActionTransferItemToNpc : TemplateType.TaleActionSpawnItemForNpc);
        }

        /// <summary>
        /// Returns the item use
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Value Object</returns>
        private async Task<IFlexFieldExportable> GetItem(InventoryActionRenderer.InventoryActionData parsedData, ExportPlaceholderErrorCollection errorCollection)
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
        /// Returns true if the action renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the action renderer has placeholders for the template type</returns>
        public override bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            if(_isPlayer) 
            {
                return (templateType == TemplateType.TaleActionTransferItemToPlayer && _isTransfer) || (templateType == TemplateType.TaleActionSpawnItemForPlayer && !_isTransfer);
            }
            return (templateType == TemplateType.TaleActionTransferItemToNpc && _isTransfer) || (templateType == TemplateType.TaleActionSpawnItemForNpc && !_isTransfer);
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

            exportPlaceholders.AddRange(_flexFieldPlaceholderResolver.GetExportTemplatePlaceholdersForType(TemplateType.ObjectNpc));

            return exportPlaceholders;
        }
    }
}