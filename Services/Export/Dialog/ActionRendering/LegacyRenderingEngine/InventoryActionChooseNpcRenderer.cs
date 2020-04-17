using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.ActionRendering.SharedRendering;
using GoNorth.Services.Export.Dialog.StepRenderers.ActionRenderer;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.LegacyRenderingEngine;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ActionRendering.LegacyRenderingEngine
{
    /// <summary>
    /// Class for rendering an inventory action where the target npc gets choosen
    /// </summary>
    public class InventoryActionChooseNpcRenderer : BaseInventoryActionChooseNpcRenderer
    {
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
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>        
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="isRemoval">True if the action is for a removal, else false</param>
        public InventoryActionChooseNpcRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory, 
                                                bool isRemoval) : base(cachedDbAccess, isRemoval)
        {
            _localizer = localizerFactory.Create(typeof(InventoryActionChooseNpcRenderer));
            _flexFieldPlaceholderResolverItem = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, FlexField_Item_Prefix);
            _flexFieldPlaceholderResolverNpc = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, FlexField_Npc_Prefix);
        }

        /// <summary>
        /// Sets the export template placeholder resolver
        /// </summary>
        /// <param name="templatePlaceholderResolver">Template placeholder resolver</param>
        public override void SetExportTemplatePlaceholderResolver(IExportTemplatePlaceholderResolver templatePlaceholderResolver) 
        {
            _flexFieldPlaceholderResolverItem.SetExportTemplatePlaceholderResolver(templatePlaceholderResolver);
            _flexFieldPlaceholderResolverNpc.SetExportTemplatePlaceholderResolver(templatePlaceholderResolver);
        }

        /// <summary>
        /// Fills the placeholders
        /// </summary>
        /// <param name="template">Template to use</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="parsedData">Parsed config data</param>
        /// <param name="itemObject">Item that was selected</param>
        /// <param name="npcObject">Npc that was selected</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="curStep">Current step that is rendered</param>
        /// <param name="nextStep">Next step that is being rendered</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Filled placeholders</returns>
        protected override async Task<string> FillPlaceholders(ExportTemplate template, ExportPlaceholderErrorCollection errorCollection, InventoryChooseNpcActionData parsedData, IFlexFieldExportable itemObject, IFlexFieldExportable npcObject,
                                                               FlexFieldObject flexFieldObject, ExportDialogData curStep, ExportDialogData nextStep, ExportSettings exportSettings, IActionStepRenderer stepRenderer)
        {
            string actionCode = template.Code;
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

            return await stepRenderer.ReplaceBasePlaceholders(errorCollection, actionCode, curStep, nextStep, flexFieldObject);
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