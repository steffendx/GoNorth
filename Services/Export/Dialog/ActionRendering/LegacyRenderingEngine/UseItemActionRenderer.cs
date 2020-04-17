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
    /// Class for rendering a use item action
    /// </summary>
    public class UseItemActionRenderer : BaseUseItemActionRenderer
    {
        /// <summary>
        /// Flex Field Npc Resolver Prefix
        /// </summary>
        private const string FlexField_Npc_Prefix = "Tale_Action_Npc";

        /// <summary>
        /// Flex Field Item Resolver Prefix
        /// </summary>
        private const string FlexField_Item_Prefix = "Tale_Action_SelectedItem";

        /// <summary>
        /// Resolver for flex field values
        /// </summary>
        private readonly FlexFieldExportTemplatePlaceholderResolver _flexFieldPlaceholderResolverNpc;

        /// <summary>
        /// Resolver for flex field values
        /// </summary>
        private readonly FlexFieldExportTemplatePlaceholderResolver _flexFieldPlaceholderResolverItem;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>        
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="isPlayer">True if the action is for the player, else false</param>
        /// <param name="isPickNpc">True if the action is for a pick npc, else false</param>
        public UseItemActionRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory,
                                     bool isPlayer, bool isPickNpc) : base(cachedDbAccess, isPlayer, isPickNpc)
        {
            _flexFieldPlaceholderResolverNpc = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, FlexField_Npc_Prefix);
            _flexFieldPlaceholderResolverItem = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, FlexField_Item_Prefix);
        }

        /// <summary>
        /// Sets the export template placeholder resolver
        /// </summary>
        /// <param name="templatePlaceholderResolver">Template placeholder resolver</param>
        public override void SetExportTemplatePlaceholderResolver(IExportTemplatePlaceholderResolver templatePlaceholderResolver) 
        {
            _flexFieldPlaceholderResolverNpc.SetExportTemplatePlaceholderResolver(templatePlaceholderResolver);
            _flexFieldPlaceholderResolverItem.SetExportTemplatePlaceholderResolver(templatePlaceholderResolver);
        }

        /// <summary>
        /// Fills the placeholders
        /// </summary>
        /// <param name="template">Template to use</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="parsedData">Parsed config data</param>
        /// <param name="valueItem">Item to export</param>
        /// <param name="valueNpc">Npc to export</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="curStep">Current step that is rendered</param>
        /// <param name="nextStep">Next step that is being rendered</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Filled placeholders</returns>
        protected override async Task<string> FillPlaceholders(ExportTemplate template, ExportPlaceholderErrorCollection errorCollection, UseItemActionData parsedData, IFlexFieldExportable valueItem, IFlexFieldExportable valueNpc, 
                                                               FlexFieldObject flexFieldObject, ExportDialogData curStep, ExportDialogData nextStep, ExportSettings exportSettings, IActionStepRenderer stepRenderer)
        {
            string actionCode = template.Code;

            ExportObjectData flexFieldExportDataItem = new ExportObjectData();
            flexFieldExportDataItem.ExportData.Add(ExportConstants.ExportDataObject, valueItem);
            flexFieldExportDataItem.ExportData.Add(ExportConstants.ExportDataObjectType, ExportConstants.ExportObjectTypeItem);
            _flexFieldPlaceholderResolverItem.SetErrorMessageCollection(errorCollection);
            actionCode = await _flexFieldPlaceholderResolverItem.FillPlaceholders(actionCode, flexFieldExportDataItem);
            
            ExportObjectData flexFieldExportDataNpc = new ExportObjectData();
            flexFieldExportDataNpc.ExportData.Add(ExportConstants.ExportDataObject, valueNpc);
            flexFieldExportDataNpc.ExportData.Add(ExportConstants.ExportDataObjectType, ExportConstants.ExportObjectTypeNpc);
            _flexFieldPlaceholderResolverNpc.SetErrorMessageCollection(errorCollection);
            actionCode = await _flexFieldPlaceholderResolverNpc.FillPlaceholders(actionCode, flexFieldExportDataNpc);

            return await stepRenderer.ReplaceBasePlaceholders(errorCollection, actionCode, curStep, nextStep, flexFieldObject);
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder>();

            exportPlaceholders.AddRange(_flexFieldPlaceholderResolverItem.GetExportTemplatePlaceholdersForType(TemplateType.ObjectItem));
            exportPlaceholders.AddRange(_flexFieldPlaceholderResolverNpc.GetExportTemplatePlaceholdersForType(TemplateType.ObjectNpc));

            return exportPlaceholders;
        }
    }
}