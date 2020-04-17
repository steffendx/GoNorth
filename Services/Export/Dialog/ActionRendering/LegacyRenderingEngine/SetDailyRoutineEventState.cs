using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Export.DailyRoutine;
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
    /// Class for rendering daily routine event state setting action
    /// </summary>
    public class SetDailyRoutineEventState : BaseSetDailyRoutineEventState
    {
        /// <summary>
        /// Npc Placeholder Prefix
        /// </summary>
        private const string NpcPlaceholderPrefix = "Tale_Action_Npc";


        /// <summary>
        /// Daily Routine Event placeholder resolver
        /// </summary>
        private readonly ILegacyDailyRoutineEventPlaceholderResolver _dailyRoutineEventPlaceholderResolver;

        /// <summary>
        /// Resolver for flex field values
        /// </summary>
        private readonly FlexFieldExportTemplatePlaceholderResolver _flexFieldPlaceholderResolver;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="dailyRoutineEventPlaceholderResolver">Daily Rotuine event placeholder resolver</param>        
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="isDisable">true if the event is for a disable action</param>
        public SetDailyRoutineEventState(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILegacyDailyRoutineEventPlaceholderResolver dailyRoutineEventPlaceholderResolver, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory, bool isDisable) :
                                         base(cachedDbAccess, isDisable)
        {
            _dailyRoutineEventPlaceholderResolver = dailyRoutineEventPlaceholderResolver;
            _flexFieldPlaceholderResolver = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, NpcPlaceholderPrefix);
        }

        /// <summary>
        /// Sets the export template placeholder resolver
        /// </summary>
        /// <param name="templatePlaceholderResolver">Template placeholder resolver</param>
        public override void SetExportTemplatePlaceholderResolver(IExportTemplatePlaceholderResolver templatePlaceholderResolver) 
        {
            _flexFieldPlaceholderResolver.SetExportTemplatePlaceholderResolver(templatePlaceholderResolver);
        }

        /// <summary>
        /// Fills the placeholders
        /// </summary>
        /// <param name="template">Template to use</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="parsedData">Parsed config data</param>
        /// <param name="eventNpc">Npc to which the event belongs</param>
        /// <param name="exportEvent">Event to export</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="curStep">Current step that is rendered</param>
        /// <param name="nextStep">Next step that is being rendered</param>
        /// <param name="project">Project</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Filled placeholders</returns>
        protected override async Task<string> FillPlaceholders(ExportTemplate template, ExportPlaceholderErrorCollection errorCollection, SetDailyRoutineEventStateData parsedData, KortistoNpc eventNpc, KortistoNpcDailyRoutineEvent exportEvent, 
                                                               FlexFieldObject flexFieldObject, ExportDialogData curStep, ExportDialogData nextStep, GoNorthProject project, ExportSettings exportSettings, IActionStepRenderer stepRenderer)
        {
            string actionCode = await _dailyRoutineEventPlaceholderResolver.ResolveDailyRoutineEventPlaceholders(template.Code, eventNpc, exportEvent);

            ExportObjectData flexFieldExportData = new ExportObjectData();
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObject, eventNpc);
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObjectType, ExportConstants.ExportObjectTypeNpc);

            _flexFieldPlaceholderResolver.SetErrorMessageCollection(errorCollection);
            actionCode = _flexFieldPlaceholderResolver.FillPlaceholders(actionCode, flexFieldExportData).Result;

            return await stepRenderer.ReplaceBasePlaceholders(errorCollection, actionCode, curStep, nextStep, flexFieldObject);
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = _dailyRoutineEventPlaceholderResolver.GetPlaceholders();
            exportPlaceholders.AddRange(_flexFieldPlaceholderResolver.GetExportTemplatePlaceholdersForType(TemplateType.ObjectNpc));

            return exportPlaceholders;
        }
    }
}