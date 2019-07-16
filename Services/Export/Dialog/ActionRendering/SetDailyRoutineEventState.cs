using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Data.ProjectConfig;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ActionRendering
{
    /// <summary>
    /// Class for rendering daily routine event state setting action
    /// </summary>
    public class SetDailyRoutineEventState : BaseActionRenderer<SetDailyRoutineEventState.SetDailyRoutineEventStateData>
    {
        /// <summary>
        /// Sets the daily routine event state
        /// </summary>
        public class SetDailyRoutineEventStateData
        {
            /// <summary>
            /// Npc Id
            /// </summary>
            public string NpcId { get; set; }
            
            /// <summary>
            /// Event Id
            /// </summary>
            public string EventId { get; set; }
        }


        /// <summary>
        /// Npc Placeholder Prefix
        /// </summary>
        private const string NpcPlaceholderPrefix = "Tale_Action_Npc";


        /// <summary>
        /// Default Template Provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Cached Db Access
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// Daily Routine Event placeholder resolver
        /// </summary>
        private readonly IDailyRoutineEventPlaceholderResolver _dailyRoutineEventPlaceholderResolver;

        /// <summary>
        /// Resolver for flex field values
        /// </summary>
        private readonly FlexFieldExportTemplatePlaceholderResolver _flexFieldPlaceholderResolver;

        /// <summary>
        /// true if the event is for a disable action, else false
        /// </summary>
        private readonly bool _isDisable;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="dailyRoutineEventPlaceholderResolver">Daily Rotuine event placeholder resolver</param>        
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="isDisable">true if the event is for a disable action</param>
        public SetDailyRoutineEventState(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, IDailyRoutineEventPlaceholderResolver dailyRoutineEventPlaceholderResolver, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory, bool isDisable)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedDbAccess = cachedDbAccess;
            _dailyRoutineEventPlaceholderResolver = dailyRoutineEventPlaceholderResolver;
            _flexFieldPlaceholderResolver = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, NpcPlaceholderPrefix);
            _isDisable = isDisable;
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
        public override async Task<string> BuildActionFromParsedData(SetDailyRoutineEventState.SetDailyRoutineEventStateData parsedData, ExportDialogData data, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, KortistoNpc npc, ExportSettings exportSettings)
        {
            ExportTemplate actionTemplate = await GetExportTemplate(project);
            KortistoNpc eventNpc = await _cachedDbAccess.GetNpcById(parsedData.NpcId);
            if(eventNpc == null)
            {
                return string.Empty;
            }

            KortistoNpcDailyRoutineEvent exportEvent = null;
            if(eventNpc.DailyRoutine != null)
            {
                exportEvent = eventNpc.DailyRoutine.FirstOrDefault(e => e.EventId == parsedData.EventId);
            }
            if(exportEvent == null)
            {
                errorCollection.AddDialogDailyRoutineEventNotFoundError(eventNpc.Name);
                return string.Empty;
            }

            string actionCode = await _dailyRoutineEventPlaceholderResolver.ResolveDailyRoutineEventPlaceholders(actionTemplate.Code, eventNpc, exportEvent);

            ExportObjectData flexFieldExportData = new ExportObjectData();
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObject, eventNpc);
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObjectType, ExportConstants.ExportObjectTypeNpc);

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
        public override async Task<string> BuildPreviewTextFromParsedData(SetDailyRoutineEventState.SetDailyRoutineEventStateData parsedData, KortistoNpc npc, ExportPlaceholderErrorCollection errorCollection)
        {
            KortistoNpc eventNpc = await _cachedDbAccess.GetNpcById(parsedData.NpcId);
            if(eventNpc == null)
            {
                return string.Empty;
            }

            KortistoNpcDailyRoutineEvent exportEvent = null;
            if(eventNpc.DailyRoutine != null)
            {
                exportEvent = eventNpc.DailyRoutine.FirstOrDefault(e => e.EventId == parsedData.EventId);
            }
            if(exportEvent == null)
            {
                errorCollection.AddDialogDailyRoutineEventNotFoundError(eventNpc.Name);
                return string.Empty;
            }

            string timeDisplay = FormatDailyRoutineEventTime(exportEvent.EarliestTime);
            if(exportEvent.EarliestTime != null && exportEvent.LatestTime != null && (exportEvent.EarliestTime.Hours != exportEvent.LatestTime.Hours || exportEvent.EarliestTime.Minutes != exportEvent.LatestTime.Minutes))
            {
                if(!string.IsNullOrEmpty(timeDisplay))
                {
                    timeDisplay += " - ";
                }
                timeDisplay += FormatDailyRoutineEventTime(exportEvent.LatestTime);
            }

            return GetPreviewPrefix() + " (" + eventNpc.Name + ", " + timeDisplay + ")";
        }

        /// <summary>
        /// Formats a daily routine event
        /// </summary>
        /// <param name="time">Time to format</param>
        /// <returns>Formatted time</returns>
        private string FormatDailyRoutineEventTime(KortistoNpcDailyRoutineTime time)
        {
            if(time == null)
            {
                return string.Empty;
            }

            return string.Format("{0}:{1}", time.Hours.ToString().PadLeft(2, '0'), time.Minutes.ToString().PadLeft(2, '0'));
        }


        /// <summary>
        /// Returns the export template to use
        /// </summary>
        /// <param name="project">Project</param>
        /// <returns>Export template to use</returns>
        private async Task<ExportTemplate> GetExportTemplate(GoNorthProject project)
        {
            return await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, _isDisable ? TemplateType.TaleActionDisableDailyRoutineEvent : TemplateType.TaleActionEnableDailyRoutineEvent);
        }

        /// <summary>
        /// Returns the preview prefix
        /// </summary>
        /// <returns>Preview prefix</returns>
        private string GetPreviewPrefix()
        {
            return _isDisable ? "DisableDailyRoutineEvent" : "EnableDailyRoutineEvent";
        }

        /// <summary>
        /// Returns true if the action renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the action renderer has placeholders for the template type</returns>
        public override bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            return (_isDisable && templateType == TemplateType.TaleActionDisableDailyRoutineEvent) || (!_isDisable && templateType == TemplateType.TaleActionEnableDailyRoutineEvent);
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