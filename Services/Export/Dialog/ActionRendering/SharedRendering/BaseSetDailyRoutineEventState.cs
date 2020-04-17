using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.StepRenderers.ActionRenderer;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.Dialog.ActionRendering.SharedRendering
{
    /// <summary>
    /// Class for rendering daily routine event state setting action
    /// </summary>
    public abstract class BaseSetDailyRoutineEventState : BaseActionRenderer<SetDailyRoutineEventStateData>
    {
        /// <summary>
        /// Cached Db Access
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// true if the event is for a disable action, else false
        /// </summary>
        private readonly bool _isDisable;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="isDisable">true if the event is for a disable action</param>
        public BaseSetDailyRoutineEventState(IExportCachedDbAccess cachedDbAccess, bool isDisable)
        {
            _cachedDbAccess = cachedDbAccess;
            _isDisable = isDisable;
        }

        /// <summary>
        /// Builds an action from parsed data
        /// </summary>
        /// <param name="template">Template to export</param>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="data">Dialog data</param>
        /// <param name="nextStep">Next step in the dialog</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Action string</returns>
        public override async Task<string> BuildActionFromParsedData(ExportTemplate template, SetDailyRoutineEventStateData parsedData, ExportDialogData data, ExportDialogData nextStep, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, 
                                                                     FlexFieldObject flexFieldObject, ExportSettings exportSettings, IActionStepRenderer stepRenderer)
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

            return await FillPlaceholders(template, errorCollection, parsedData, eventNpc, exportEvent, flexFieldObject, data, nextStep, project, exportSettings, stepRenderer);
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
        protected abstract Task<string> FillPlaceholders(ExportTemplate template, ExportPlaceholderErrorCollection errorCollection, SetDailyRoutineEventStateData parsedData, KortistoNpc eventNpc, KortistoNpcDailyRoutineEvent exportEvent, 
                                                         FlexFieldObject flexFieldObject, ExportDialogData curStep, ExportDialogData nextStep, GoNorthProject project, ExportSettings exportSettings, IActionStepRenderer stepRenderer);

        /// <summary>
        /// Builds a preview text from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="child">Child node</param>
        /// <param name="parent">Parent</param>
        /// <returns>Preview text</returns>
        public override async Task<string> BuildPreviewTextFromParsedData(SetDailyRoutineEventStateData parsedData, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection, ExportDialogData child, ExportDialogData parent)
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
        /// Returns the preview prefix
        /// </summary>
        /// <returns>Preview prefix</returns>
        private string GetPreviewPrefix()
        {
            return _isDisable ? "DisableDailyRoutineEvent" : "EnableDailyRoutineEvent";
        }
    }
}