using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Data.ProjectConfig;
using GoNorth.Extensions;
using GoNorth.Services.Export.DailyRoutine;
using GoNorth.Services.Export.Data;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Placeholder.LegacyRenderingEngine
{
    /// <summary>
    /// Legacy class for resolving the placeholders for a single daily routine event
    /// </summary>
    public class LegacyDailyRoutineEventPlaceholderResolver : ILegacyDailyRoutineEventPlaceholderResolver
    {
        /// <summary>
        /// Placeholder for the event id
        /// </summary>
        private const string Placeholder_EventId = "DailyRoutine_Event_Id";
        
        /// <summary>
        /// Placeholder for the event earliest time hours
        /// </summary>
        private const string Placeholder_EarliestTime_Hours = "DailyRoutine_EarliestTime_Hours";

        /// <summary>
        /// Placeholder for the event earliest time minutes
        /// </summary>
        private const string Placeholder_EarliestTime_Minutes = "DailyRoutine_EarliestTime_Minutes";
        
        /// <summary>
        /// Placeholder for the event earliest time total minutes
        /// </summary>
        private const string Placeholder_EarliestTime_TotalMinutes = "DailyRoutine_EarliestTime_TotalMinutes";
        
        /// <summary>
        /// Placeholder for the event latest time hours
        /// </summary>
        private const string Placeholder_LatestTime_Hours = "DailyRoutine_LatestTime_Hours";

        /// <summary>
        /// Placeholder for the event latest time minutes
        /// </summary>
        private const string Placeholder_LatestTime_Minutes = "DailyRoutine_LatestTime_Minutes";
        
        /// <summary>
        /// Placeholder for the event latest time total minutes
        /// </summary>
        private const string Placeholder_LatestTime_TotalMinutes = "DailyRoutine_LatestTime_TotalMinutes";
        

        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if the event has a movement target
        /// </summary>
        private const string Placeholder_HasMovementTargetStart = "DailyRoutine_HasMovementTarget_Start";
        
        /// <summary>
        /// Placeholder for the end of the content that will only be rendered if the event has a movement target
        /// </summary>
        private const string Placeholder_HasMovementTargetEnd = "DailyRoutine_HasMovementTarget_End";
        
        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if the event has no movement target
        /// </summary>
        private const string Placeholder_HasNoMovementTargetStart = "DailyRoutine_HasNoMovementTarget_Start";
        
        /// <summary>
        /// Placeholder for the end of the content that will only be rendered if the event has no movement target
        /// </summary>
        private const string Placeholder_HasNoMovementTargetEnd = "DailyRoutine_HasNoMovementTarget_End";
        
        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if the event has a movement target export name
        /// </summary>
        private const string Placeholder_HasMovementTargetExportNameStart = "DailyRoutine_HasMovementTargetExportName_Start";
        
        /// <summary>
        /// Placeholder for the end of the content that will only be rendered if the event has a movement target export name
        /// </summary>
        private const string Placeholder_HasMovementTargetExportNameEnd = "DailyRoutine_HasMovementTargetExportName_End";
        
        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if the event has no movement target export name
        /// </summary>
        private const string Placeholder_HasNoMovementTargetExportNameStart = "DailyRoutine_HasNoMovementTargetExportName_Start";
        
        /// <summary>
        /// Placeholder for the end of the content that will only be rendered if the event has no movement target export name
        /// </summary>
        private const string Placeholder_HasNoMovementTargetExportNameEnd = "DailyRoutine_HasNoMovementTargetExportName_End";

        /// <summary>
        /// Placeholder for the movement target
        /// </summary>
        private const string Placeholder_MovementTargetName = "DailyRoutine_MovementTarget_Name";
        
        /// <summary>
        /// Placeholder for the movement target export name
        /// </summary>
        private const string Placeholder_MovementTargetExportName = "DailyRoutine_MovementTarget_ExportName";
        
        /// <summary>
        /// Placeholder for the movement target export name or name for fallback
        /// </summary>
        private const string Placeholder_MovementTargetExportNameOrName = "DailyRoutine_MovementTarget_ExportNameOrName";


        
        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if the event has no script
        /// </summary>
        private const string Placeholder_HasNoScriptStart = "DailyRoutine_HasNoScript_Start";
        
        /// <summary>
        /// Placeholder for the end of the content that will only be rendered if the event has no script
        /// </summary>
        private const string Placeholder_HasNoScriptEnd = "DailyRoutine_HasNoScript_End";
        
        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if the event has a script
        /// </summary>
        private const string Placeholder_HasScriptStart = "DailyRoutine_HasScript_Start";
        
        /// <summary>
        /// Placeholder for the end of the content that will only be rendered if the event has a script
        /// </summary>
        private const string Placeholder_HasScriptEnd = "DailyRoutine_HasScript_End";

        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if the event has a node graph script
        /// </summary>
        private const string Placeholder_HasNodeGraphScriptStart = "DailyRoutine_HasNodeGraphScript_Start";
        
        /// <summary>
        /// Placeholder for the end of the content that will only be rendered if the event has a node graph script
        /// </summary>
        private const string Placeholder_HasNodeGraphScriptEnd = "DailyRoutine_HasNodeGraphScript_End";
        
        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if the event has a code script
        /// </summary>
        private const string Placeholder_HasCodeScriptStart = "DailyRoutine_HasCodeScript_Start";
        
        /// <summary>
        /// Placeholder for the end of the content that will only be rendered if the event has a code script
        /// </summary>
        private const string Placeholder_HasCodeScriptEnd = "DailyRoutine_HasCodeScript_End";
        
        /// <summary>
        /// Placeholder for the name of the script function
        /// </summary>
        private const string Placeholder_ScriptFunctionName = "DailyRoutine_ScriptFunctionName";

        /// <summary>
        /// Placeholder for the name of the script
        /// </summary>
        private const string Placeholder_ScriptName = "DailyRoutine_ScriptName";
        

        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if the event has a movement target
        /// </summary>
        private const string Placeholder_HasTargetStateStart = "DailyRoutine_HasTargetState_Start";
        
        /// <summary>
        /// Placeholder for the end of the content that will only be rendered if the event has a movement target
        /// </summary>
        private const string Placeholder_HasTargetStateEnd = "DailyRoutine_HasTargetState_End";
        
        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if the event has no movement target
        /// </summary>
        private const string Placeholder_HasNoTargetStateStart = "DailyRoutine_HasNoTargetState_Start";
        
        /// <summary>
        /// Placeholder for the end of the content that will only be rendered if the event has no movement target
        /// </summary>
        private const string Placeholder_HasNoTargetStateEnd = "DailyRoutine_HasNoTargetState_End";
        
        /// <summary>
        /// Placeholder for the name of the script
        /// </summary>
        private const string Placeholder_TargetState = "DailyRoutine_TargetState";
        

        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if the event is enabled by default
        /// </summary>
        private const string Placeholder_IsEnabledByDefaultStart = "DailyRoutine_IsEnabledByDefault_Start";
        
        /// <summary>
        /// Placeholder for the end of the content that will only be rendered if the event is enabled by default
        /// </summary>
        private const string Placeholder_IsEnabledByDefaultEnd = "DailyRoutine_IsEnabledByDefault_End";

        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if the event is disabled by default
        /// </summary>
        private const string Placeholder_IsDisabledByDefaultStart = "DailyRoutine_IsDisabledByDefault_Start";
        
        /// <summary>
        /// Placeholder for the end of the content that will only be rendered if the event is disabled by default
        /// </summary>
        private const string Placeholder_IsDisabledByDefaultEnd = "DailyRoutine_IsDisabledByDefault_End";
        

        /// <summary>
        /// Cached Db Access
        /// </summary>
        protected readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// Daily routine function name generator
        /// </summary>
        private readonly IDailyRoutineFunctionNameGenerator _dailyRoutineFunctionNameGenerator;

        /// <summary>
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="cachedDbAccess">Cached Db Access</param>        
        /// <param name="dailyRoutineFunctionNameGenerator">Daily routine function name generator</param>
        /// <param name="localizerFactory">Localizer factory</param>
        public LegacyDailyRoutineEventPlaceholderResolver(IExportCachedDbAccess cachedDbAccess, IDailyRoutineFunctionNameGenerator dailyRoutineFunctionNameGenerator, IStringLocalizerFactory localizerFactory)
        {
            _cachedDbAccess = cachedDbAccess;
            _dailyRoutineFunctionNameGenerator = dailyRoutineFunctionNameGenerator;
            _localizer = localizerFactory.Create(typeof(LegacyDailyRoutineEventPlaceholderResolver));
        }

        /// <summary>
        /// Resolves the placeholders for a single daily routine event
        /// </summary>
        /// <param name="code">Code to resolve the placeholders in</param>
        /// <param name="npc">Npc to which the event belongs</param>
        /// <param name="dailyRoutineEvent">Daily routine to use for resolving the placeholders</param>
        /// <returns>Code with resolved placeholders</returns>
        public async Task<string> ResolveDailyRoutineEventPlaceholders(string code, KortistoNpc npc, KortistoNpcDailyRoutineEvent dailyRoutineEvent)
        {
            GoNorthProject defaultProject = await _cachedDbAccess.GetUserProject();
            MiscProjectConfig projectConfig = await _cachedDbAccess.GetMiscProjectConfig();

            code = ExportUtil.RenderPlaceholderIfTrue(code, Placeholder_HasMovementTargetStart, Placeholder_HasMovementTargetEnd, dailyRoutineEvent.MovementTarget != null && !string.IsNullOrEmpty(dailyRoutineEvent.MovementTarget.Name));
            code = ExportUtil.RenderPlaceholderIfTrue(code, Placeholder_HasNoMovementTargetStart, Placeholder_HasNoMovementTargetEnd, dailyRoutineEvent.MovementTarget == null || string.IsNullOrEmpty(dailyRoutineEvent.MovementTarget.Name));
            code = ExportUtil.RenderPlaceholderIfTrue(code, Placeholder_HasMovementTargetExportNameStart, Placeholder_HasMovementTargetExportNameEnd, dailyRoutineEvent.MovementTarget != null && !string.IsNullOrEmpty(dailyRoutineEvent.MovementTarget.ExportName));
            code = ExportUtil.RenderPlaceholderIfTrue(code, Placeholder_HasNoMovementTargetExportNameStart, Placeholder_HasNoMovementTargetExportNameEnd, dailyRoutineEvent.MovementTarget == null || string.IsNullOrEmpty(dailyRoutineEvent.MovementTarget.ExportName));
            code = ResolveDailyRoutineEventHasScript(code, dailyRoutineEvent.ScriptType != ExportConstants.ScriptType_None);
            code = ExportUtil.RenderPlaceholderIfTrue(code, Placeholder_HasNodeGraphScriptStart, Placeholder_HasNodeGraphScriptEnd, dailyRoutineEvent.ScriptType == ExportConstants.ScriptType_NodeGraph);
            code = ExportUtil.RenderPlaceholderIfTrue(code, Placeholder_HasCodeScriptStart, Placeholder_HasCodeScriptEnd, dailyRoutineEvent.ScriptType == ExportConstants.ScriptType_Code);
            code = ExportUtil.RenderPlaceholderIfTrue(code, Placeholder_HasTargetStateStart, Placeholder_HasTargetStateEnd, !string.IsNullOrEmpty(dailyRoutineEvent.TargetState));
            code = ExportUtil.RenderPlaceholderIfTrue(code, Placeholder_HasNoTargetStateStart, Placeholder_HasNoTargetStateEnd, string.IsNullOrEmpty(dailyRoutineEvent.TargetState));
            code = ExportUtil.RenderPlaceholderIfTrue(code, Placeholder_IsEnabledByDefaultStart, Placeholder_IsEnabledByDefaultEnd, dailyRoutineEvent.EnabledByDefault);
            code = ExportUtil.RenderPlaceholderIfTrue(code, Placeholder_IsDisabledByDefaultStart, Placeholder_IsDisabledByDefaultEnd, !dailyRoutineEvent.EnabledByDefault);

            code = ExportUtil.BuildPlaceholderRegex(Placeholder_EventId).Replace(code, dailyRoutineEvent.EventId);
            code = ExportUtil.BuildPlaceholderRegex(Placeholder_EarliestTime_Hours).Replace(code, dailyRoutineEvent.EarliestTime != null ? dailyRoutineEvent.EarliestTime.Hours.ToString() : string.Empty);
            code = ExportUtil.BuildPlaceholderRegex(Placeholder_EarliestTime_Minutes).Replace(code, dailyRoutineEvent.EarliestTime != null ? dailyRoutineEvent.EarliestTime.Minutes.ToString() : string.Empty);
            code = ExportUtil.BuildPlaceholderRegex(Placeholder_EarliestTime_TotalMinutes).Replace(code, dailyRoutineEvent.EarliestTime != null ? (dailyRoutineEvent.EarliestTime.Hours * projectConfig.MinutesPerHour + dailyRoutineEvent.EarliestTime.Minutes).ToString() : string.Empty);
            code = ExportUtil.BuildPlaceholderRegex(Placeholder_LatestTime_Hours).Replace(code, dailyRoutineEvent.LatestTime != null ? dailyRoutineEvent.LatestTime.Hours.ToString() : string.Empty);
            code = ExportUtil.BuildPlaceholderRegex(Placeholder_LatestTime_Minutes).Replace(code, dailyRoutineEvent.LatestTime != null ? dailyRoutineEvent.LatestTime.Minutes.ToString() : string.Empty);
            code = ExportUtil.BuildPlaceholderRegex(Placeholder_LatestTime_TotalMinutes).Replace(code, dailyRoutineEvent.LatestTime != null ? (dailyRoutineEvent.LatestTime.Hours * projectConfig.MinutesPerHour + dailyRoutineEvent.LatestTime.Minutes).ToString() : string.Empty);
            code = ExportUtil.BuildPlaceholderRegex(Placeholder_MovementTargetName).Replace(code, dailyRoutineEvent.MovementTarget != null && dailyRoutineEvent.MovementTarget.Name != null ? dailyRoutineEvent.MovementTarget.Name : string.Empty);
            code = ExportUtil.BuildPlaceholderRegex(Placeholder_MovementTargetExportName).Replace(code, dailyRoutineEvent.MovementTarget != null && dailyRoutineEvent.MovementTarget.ExportName != null ? dailyRoutineEvent.MovementTarget.ExportName : string.Empty);
            code = ExportUtil.BuildPlaceholderRegex(Placeholder_MovementTargetExportNameOrName).Replace(code, dailyRoutineEvent.MovementTarget != null && !string.IsNullOrEmpty(dailyRoutineEvent.MovementTarget.ExportName) ? dailyRoutineEvent.MovementTarget.ExportName : (dailyRoutineEvent.MovementTarget != null && dailyRoutineEvent.MovementTarget.Name != null ? dailyRoutineEvent.MovementTarget.Name : string.Empty));
            code = await ExportUtil.BuildPlaceholderRegex(Placeholder_ScriptFunctionName).ReplaceAsync(code, async m => {
                return await _dailyRoutineFunctionNameGenerator.GetNewDailyRoutineStepFunction(defaultProject.Id, npc.Id, dailyRoutineEvent.EventId);
            });
            code = ExportUtil.BuildPlaceholderRegex(Placeholder_ScriptName).Replace(code, dailyRoutineEvent.ScriptName != null ? dailyRoutineEvent.ScriptName : string.Empty);
            code = ExportUtil.BuildPlaceholderRegex(Placeholder_TargetState).Replace(code, dailyRoutineEvent.TargetState != null ? dailyRoutineEvent.TargetState : string.Empty);

            return code;
        }

        /// <summary>
        /// Resolves the placeholders for a daily routine event having a function
        /// </summary>
        /// <param name="code">Code to resolve the placeholders in</param>
        /// <param name="hasScript">true if the event has a script</param>
        /// <returns>Code with resolved placeholders</returns>
        public string ResolveDailyRoutineEventHasScript(string code, bool hasScript)
        {
            code = ExportUtil.RenderPlaceholderIfTrue(code, Placeholder_HasNoScriptStart, Placeholder_HasNoScriptEnd, !hasScript);
            code = ExportUtil.RenderPlaceholderIfTrue(code, Placeholder_HasScriptStart, Placeholder_HasScriptEnd, hasScript);

            return code;
        }

        /// <summary>
        /// Returns the placeholders that are available for a daily routine event
        /// </summary>
        /// <returns>Placeholders</returns>
        public List<ExportTemplatePlaceholder> GetPlaceholders()
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder> {
                ExportUtil.CreatePlaceHolder(Placeholder_EventId, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_EarliestTime_Hours, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_EarliestTime_Minutes, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_EarliestTime_TotalMinutes, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_LatestTime_Hours, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_LatestTime_Minutes, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_LatestTime_TotalMinutes, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_HasMovementTargetStart, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_HasMovementTargetEnd, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_HasNoMovementTargetStart, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_HasNoMovementTargetEnd, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_HasMovementTargetExportNameStart, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_HasMovementTargetExportNameEnd, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_HasNoMovementTargetExportNameStart, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_HasNoMovementTargetExportNameEnd, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_MovementTargetName, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_MovementTargetExportName, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_MovementTargetExportNameOrName, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_HasNoScriptStart, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_HasNoScriptEnd, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_HasScriptStart, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_HasScriptEnd, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_HasNodeGraphScriptStart, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_HasNodeGraphScriptEnd, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_HasCodeScriptStart, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_HasCodeScriptEnd, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ScriptFunctionName, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ScriptName, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_HasTargetStateStart, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_HasTargetStateEnd, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_HasNoTargetStateStart, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_HasNoTargetStateEnd, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_TargetState, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_IsEnabledByDefaultStart, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_IsEnabledByDefaultEnd, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_IsDisabledByDefaultStart, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_IsDisabledByDefaultEnd, _localizer)
            };

            return exportPlaceholders;
        }
    }
}