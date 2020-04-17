using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Data.ProjectConfig;
using GoNorth.Services.Export.DailyRoutine;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util
{
    /// <summary>
    /// Util class for interacting with daily routine events
    /// </summary>
    public static class ScribanDailyRoutineEventUtil
    {

        /// <summary>
        /// Maps the daily routine data of an npc
        /// </summary>
        /// <param name="cachedDbAccess">Gecachter Datenzugriff</param>
        /// <param name="dailyRoutineFunctionNameGenerator">Daily routine function name generator</param>
        /// <param name="npc">Npc</param>
        /// <param name="dailyRoutine">Daily routine data</param>
        /// <returns>Mapped daily routine events</returns>
        public static async Task<List<ScribanExportDailyRoutineEvent>> MapNpcDailyRoutineEvents(IExportCachedDbAccess cachedDbAccess, IDailyRoutineFunctionNameGenerator dailyRoutineFunctionNameGenerator, KortistoNpc npc, List<KortistoNpcDailyRoutineEvent> dailyRoutine)
        {
            if(dailyRoutine == null || !dailyRoutine.Any())
            {
                return new List<ScribanExportDailyRoutineEvent>();
            }

            GoNorthProject project = await cachedDbAccess.GetDefaultProject();
            MiscProjectConfig projectConfig = await cachedDbAccess.GetMiscProjectConfig();
            ExportSettings exportSettings = await cachedDbAccess.GetExportSettings(project.Id);

            List<ScribanExportDailyRoutineEvent> mappedEvents = new List<ScribanExportDailyRoutineEvent>();
            foreach(KortistoNpcDailyRoutineEvent curEvent in dailyRoutine)
            {
                ScribanExportDailyRoutineEvent convertedEvent = await ConvertDailyRoutineEvent(dailyRoutineFunctionNameGenerator, npc, curEvent, project, projectConfig, exportSettings);
                mappedEvents.Add(convertedEvent);
            }

            return mappedEvents;
        }

        /// <summary>
        /// Builds a flex field value object
        /// </summary>
        /// <param name="dailyRoutineFunctionNameGenerator">Daily routine function name generator</param>
        /// <param name="npc">Npc to which the event belongs</param>
        /// <param name="exportEvent">Export event</param>
        /// <param name="project">Project</param>
        /// <param name="projectConfig">Project config</param>
        /// <param name="exportSettings">Export settings</param>
        /// <returns>Converted value</returns>
        public static async Task<ScribanExportDailyRoutineEvent> ConvertDailyRoutineEvent(IDailyRoutineFunctionNameGenerator dailyRoutineFunctionNameGenerator, KortistoNpc npc, KortistoNpcDailyRoutineEvent exportEvent, GoNorthProject project, 
                                                                                          MiscProjectConfig projectConfig, ExportSettings exportSettings)
        {
            ScribanExportDailyRoutineEvent convertedEvent = new ScribanExportDailyRoutineEvent();
            convertedEvent.OriginalEvent = exportEvent;
            convertedEvent.EventId = exportEvent.EventId;
            convertedEvent.EarliestTime = ConvertEventTime(exportEvent.EarliestTime, projectConfig);
            convertedEvent.LatestTime = ConvertEventTime(exportEvent.LatestTime, projectConfig);
            convertedEvent.UnescapedMovementTarget = exportEvent.MovementTarget != null && !string.IsNullOrEmpty(exportEvent.MovementTarget.Name) ? exportEvent.MovementTarget.Name : null;
            convertedEvent.UnescapedMovementTargetExportName = exportEvent.MovementTarget != null && !string.IsNullOrEmpty(exportEvent.MovementTarget.ExportName) ? exportEvent.MovementTarget.ExportName : null;
            convertedEvent.UnescapedMovementTargetExportNameOrName = GetMovementTargetExportNameOrName(exportEvent.MovementTarget);
            convertedEvent.MovementTarget = EscapeValueIfExist(convertedEvent.UnescapedMovementTarget, exportSettings);
            convertedEvent.MovementTargetExportName = EscapeValueIfExist(convertedEvent.UnescapedMovementTargetExportName, exportSettings);
            convertedEvent.MovementTargetExportNameOrName = EscapeValueIfExist(convertedEvent.UnescapedMovementTargetExportNameOrName, exportSettings);
            convertedEvent.ScriptType = ConvertScriptType(exportEvent.ScriptType);
            if(exportEvent.ScriptType != ExportConstants.ScriptType_None)
            {
                convertedEvent.ScriptName = exportEvent.ScriptName;
                convertedEvent.ScriptFunctionName = await dailyRoutineFunctionNameGenerator.GetNewDailyRoutineStepFunction(project.Id, npc.Id, exportEvent.EventId);
            }
            else
            {
                convertedEvent.ScriptName = null;
                convertedEvent.ScriptFunctionName = null;
            }
            convertedEvent.TargetState = !string.IsNullOrEmpty(exportEvent.TargetState) ? exportEvent.TargetState : null;
            convertedEvent.IsEnabledByDefault = exportEvent.EnabledByDefault;

            return convertedEvent;
        }

        /// <summary>
        /// Escapes a value if it exists
        /// </summary>
        /// <param name="unescapedValue">Unescaped value</param>
        /// <param name="exportSettings">Export settings</param>
        /// <returns>Escaped value</returns>
        private static string EscapeValueIfExist(string unescapedValue, ExportSettings exportSettings)
        {
            if(unescapedValue == null)
            {
                return null;
            }

            return ExportUtil.EscapeCharacters(unescapedValue, exportSettings.EscapeCharacter, exportSettings.CharactersNeedingEscaping, exportSettings.NewlineCharacter);
        }

        /// <summary>
        /// Converts an event time
        /// </summary>
        /// <param name="eventTime">Event time to convert</param>
        /// <param name="projectConfig">Project config</param>
        /// <returns>Converted event</returns>
        private static ScribanExportDailyRoutineEventTime ConvertEventTime(KortistoNpcDailyRoutineTime eventTime, MiscProjectConfig projectConfig)
        {
            return new ScribanExportDailyRoutineEventTime {
                Hours = eventTime.Hours,
                Minutes = eventTime.Minutes,
                TotalMinutes = (eventTime.Hours * projectConfig.MinutesPerHour + eventTime.Minutes)
            };
        }

        /// <summary>
        /// Converts the script type
        /// </summary>
        /// <param name="scriptType">Script type to export</param>
        /// <returns>Export script type</returns>
        private static string ConvertScriptType(int scriptType)
        {
            if(scriptType == ExportConstants.ScriptType_Code)
            {
                return "Code";
            }
            else if(scriptType == ExportConstants.ScriptType_NodeGraph)
            {
                return "NodeGraph";
            }

            return "None";
        }

        /// <summary>
        /// Returns the movement target export name or name
        /// </summary>
        /// <param name="movementTarget">Movement target</param>
        /// <returns>Export name or name</returns>        
        private static string GetMovementTargetExportNameOrName(KortistoNpcDailyRoutineMovementTarget movementTarget)
        {
            if(movementTarget == null)
            {
                return null;
            }
            
            if(!string.IsNullOrEmpty(movementTarget.ExportName))
            {
                return movementTarget.ExportName;
            }

            if(!string.IsNullOrEmpty(movementTarget.Name))
            {
                return movementTarget.Name;
            }

            return null;
        }
    }
}