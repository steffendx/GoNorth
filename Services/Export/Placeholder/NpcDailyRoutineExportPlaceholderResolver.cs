using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.LanguageKeyGeneration;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Placeholder
{
    /// <summary>
    /// Npc Daily Routine Export Template Placeholder Resolver
    /// </summary>
    public class NpcDailyRoutineExportPlaceholderResolver : BaseExportPlaceholderResolver, IExportTemplateTopicPlaceholderResolver
    {
        /// <summary>
        /// Start of the content that will only be rendered if the Npc has a daily routine
        /// </summary>
        private const string Placeholder_HasDailyRoutine_Start = "Npc_HasDailyRoutine_Start";
        
        /// <summary>
        /// End of the content that will only be rendered if the Npc has a daily routine
        /// </summary>
        private const string Placeholder_HasDailyRoutine_End = "Npc_HasDailyRoutine_End";


        /// <summary>
        /// Daily Routine Event List
        /// </summary>
        private const string Placeholder_DailyRoutine_Events = "Npc_DailyRoutine_Events";

        /// <summary>
        /// Start of the Event List
        /// </summary>
        private const string Placeholder_DailyRoutine_Events_Start = "DailyRoutine_Events_Start";

        /// <summary>
        /// End of the Event List
        /// </summary>
        private const string Placeholder_DailyRoutine_Events_End = "DailyRoutine_Events_End";


        /// <summary>
        /// Daily Routine Function List
        /// </summary>
        private const string Placeholder_DailyRoutine_Functions = "Npc_DailyRoutine_Functions";

        /// <summary>
        /// Start of the Function List
        /// </summary>
        private const string Placeholder_DailyRoutine_Functions_Start = "DailyRoutine_Functions_Start";

        /// <summary>
        /// End of the Function List
        /// </summary>
        private const string Placeholder_DailyRoutine_Functions_End = "DailyRoutine_Functions_End";

        
        /// <summary>
        /// Daily Routine Function List
        /// </summary>
        private const string Placeholder_DailyRoutine_Function = "DailyRoutine_Function";


        /// <summary>
        /// Current Event Index
        /// </summary>
        private const string Placeholder_CurEvent_Index = "CurEvent_Index";


        /// <summary>
        /// Export default template provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Export Cached Db Access
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// Daily routine event placeholder resolver
        /// </summary>
        private readonly IDailyRoutineEventPlaceholderResolver _eventPlaceholderResolver;

        /// <summary>
        /// Daily routine event content placeholder resolver
        /// </summary>
        private readonly IDailyRoutineEventContentPlaceholderResolver _eventContentPlaceholderResolver;

        /// <summary>
        /// Language Key Generator
        /// </summary>
        private readonly ILanguageKeyGenerator _languageKeyGenerator;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="eventPlaceholderResolver">Daily routine event placeholder resolver</param>
        /// <param name="eventContentPlaceholderResolver">Daily routine event content palceholder resolver</param>
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public NpcDailyRoutineExportPlaceholderResolver(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, IDailyRoutineEventPlaceholderResolver eventPlaceholderResolver, 
                                                        IDailyRoutineEventContentPlaceholderResolver eventContentPlaceholderResolver, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory) 
                                                        : base(localizerFactory.Create(typeof(NpcDailyRoutineExportPlaceholderResolver)))
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedDbAccess = cachedDbAccess;
            _eventPlaceholderResolver = eventPlaceholderResolver;
            _eventContentPlaceholderResolver = eventContentPlaceholderResolver;
            _languageKeyGenerator = languageKeyGenerator;
        }

        /// <summary>
        /// Fills the placeholders of a code
        /// </summary>
        /// <param name="code">Code to fill</param>
        /// <param name="data">Export Data</param>
        /// <returns>Filled Code</returns>
        public async Task<string> FillPlaceholders(string code, ExportObjectData data)
        {
            // Check Data
            if(!data.ExportData.ContainsKey(ExportConstants.ExportDataObject))
            {
                return code;
            }

            KortistoNpc npc = data.ExportData[ExportConstants.ExportDataObject] as KortistoNpc;
            if(npc == null)
            {
                return code;
            }

            // Replace Daily routine Placeholders       
            return await FillDailyRoutinePlaceholders(code, npc);
        }

        /// <summary>
        /// Fills the daily routine placeholders
        /// </summary>
        /// <param name="code">Code</param>
        /// <param name="npc">Npc</param>
        /// <returns>Filled code</returns>
        private async Task<string> FillDailyRoutinePlaceholders(string code, KortistoNpc npc)
        {
            GoNorthProject project = await _cachedDbAccess.GetDefaultProject();
            ExportTemplate dailyRoutineEventTemplate = await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.ObjectDailyRoutineEventList);
            ExportTemplate dailyRoutineFunctionListTemplate = await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.ObjectDailyRoutineFunctionList);
            ExportTemplate dailyRoutineFunctionTemplate = await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.ObjectDailyRoutineFunction);

            code = ExportUtil.BuildPlaceholderRegex(Placeholder_DailyRoutine_Events, ExportConstants.ListIndentPrefix).Replace(code, m => {
                return ExportUtil.IndentListTemplate(dailyRoutineEventTemplate.Code, m.Groups[1].Value);
            });
            
            code = ExportUtil.BuildPlaceholderRegex(Placeholder_DailyRoutine_Functions, ExportConstants.ListIndentPrefix).Replace(code, m => {
                return ExportUtil.IndentListTemplate(dailyRoutineFunctionListTemplate.Code, m.Groups[1].Value);
            });

            code = ExportUtil.BuildPlaceholderRegex(Placeholder_DailyRoutine_Function, ExportConstants.ListIndentPrefix).Replace(code, m => {
                return ExportUtil.IndentListTemplate(dailyRoutineFunctionTemplate.Code, m.Groups[1].Value);
            });

            code = ExportUtil.RenderPlaceholderIfTrue(code, Placeholder_HasDailyRoutine_Start, Placeholder_HasDailyRoutine_End, npc.DailyRoutine != null && npc.DailyRoutine.Count > 0);

            code = ExportUtil.BuildRangePlaceholderRegex(Placeholder_DailyRoutine_Events_Start, Placeholder_DailyRoutine_Events_End).Replace(code, m => {
                return ExportUtil.TrimEmptyLines(BuildEventList(m.Groups[1].Value, project, npc));
            });
            
            code = ExportUtil.BuildRangePlaceholderRegex(Placeholder_DailyRoutine_Functions_Start, Placeholder_DailyRoutine_Functions_End).Replace(code, m => {
                return ExportUtil.TrimEmptyLines(BuildFunctionList(m.Groups[1].Value, project, npc));
            });

            return code;
        }

        /// <summary>
        /// Sorts the daily routine of an npc
        /// </summary>
        /// <param name="dailyRoutine">Daily routine to sort</param>
        private void SortDailyRoutine(List<KortistoNpcDailyRoutineEvent> dailyRoutine)
        {
            dailyRoutine.Sort((d1, d2) => {
                if(d1.EarliestTime == null && d2.EarliestTime != null) {
                    return -1;
                } else if(d1.EarliestTime != null && d2.EarliestTime == null) {
                    return 1;
                } else if(d1.EarliestTime == null && d2.EarliestTime == null) {
                    return 0;
                }

                if(d1.EarliestTime.Hours < d2.EarliestTime.Hours)
                {
                    return -1;
                }
                else if(d2.EarliestTime.Hours < d1.EarliestTime.Hours)
                {
                    return 1;
                }

                if(d1.EarliestTime.Minutes < d2.EarliestTime.Minutes)
                {
                    return -1;
                }
                else if(d2.EarliestTime.Minutes < d1.EarliestTime.Minutes)
                {
                    return 1;
                }

                return 0;
            });
        }

        /// <summary>
        /// Builds the event list
        /// </summary>
        /// <param name="eventCode">Code for the events to repeat</param>
        /// <param name="project">Project to export for</param>
        /// <param name="npc">Npc</param>
        /// <returns>Daily Routine event list of the npc</returns>
        private string BuildEventList(string eventCode, GoNorthProject project, KortistoNpc npc)
        {
            if(npc.DailyRoutine == null)
            {
                return string.Empty;
            }

            SortDailyRoutine(npc.DailyRoutine);

            int eventIndex = 0;
            string eventListCode = string.Empty;
            foreach(KortistoNpcDailyRoutineEvent curEvent in npc.DailyRoutine)
            {
                string curEventCode = ExportUtil.BuildPlaceholderRegex(Placeholder_CurEvent_Index).Replace(eventCode, eventIndex.ToString());

                curEventCode = _eventPlaceholderResolver.ResolveDailyRoutineEventPlaceholders(curEventCode, npc, curEvent).Result;

                eventListCode += curEventCode;
                ++eventIndex;
            }
            
            return eventListCode;
        }
        
        /// <summary>
        /// Builds the function list
        /// </summary>
        /// <param name="functionCode">Code for the functions to repeat</param>
        /// <param name="project">Project to export for</param>
        /// <param name="npc">Npc</param>
        /// <returns>Daily Routine function list of the npc</returns>
        private string BuildFunctionList(string functionCode, GoNorthProject project, KortistoNpc npc)
        {
            if(npc.DailyRoutine == null)
            {
                return string.Empty;
            }

            SortDailyRoutine(npc.DailyRoutine);

            int eventIndex = 0;
            string eventListCode = string.Empty;
            foreach(KortistoNpcDailyRoutineEvent curEvent in npc.DailyRoutine)
            {
                string curEventCode = ExportUtil.BuildPlaceholderRegex(Placeholder_CurEvent_Index).Replace(functionCode, eventIndex.ToString());

                try
                {
                    _errorCollection.CurrentErrorContext = _localizer["DailyRoutineErrorContext", curEvent.EarliestTime.Hours.ToString().PadLeft(2, '0'), curEvent.EarliestTime.Minutes.ToString().PadLeft(2, '0')].Value;
                    curEventCode = _eventContentPlaceholderResolver.ResolveDailyRoutineEventContentPlaceholders(curEventCode, npc, curEvent, _errorCollection);
                    curEventCode = _eventPlaceholderResolver.ResolveDailyRoutineEventPlaceholders(curEventCode, npc, curEvent).Result;
                }
                finally
                {
                    _errorCollection.CurrentErrorContext = string.Empty;
                }

                eventListCode += curEventCode;
                ++eventIndex;
            }
            
            return eventListCode;
        }

        /// <summary>
        /// Returns if the placeholder resolver is valid for a template type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>true if the template type is valid for the template type</returns>
        public bool IsValidForTemplateType(TemplateType templateType)
        {
            return templateType == TemplateType.ObjectNpc || templateType == TemplateType.ObjectDailyRoutineEventList || templateType == TemplateType.ObjectDailyRoutineFunctionList || templateType == TemplateType.ObjectDailyRoutineFunction;
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder>();
            if(templateType == TemplateType.ObjectNpc)
            {
                exportPlaceholders.Add(CreatePlaceHolder(Placeholder_DailyRoutine_Events));
                exportPlaceholders.Add(CreatePlaceHolder(Placeholder_DailyRoutine_Functions));
            }

            if(templateType == TemplateType.ObjectDailyRoutineEventList || templateType == TemplateType.ObjectNpc)
            {
                exportPlaceholders.Add(CreatePlaceHolder(Placeholder_DailyRoutine_Events_Start));
                exportPlaceholders.Add(CreatePlaceHolder(Placeholder_DailyRoutine_Events_End));
            }
            
            if(templateType == TemplateType.ObjectDailyRoutineFunctionList || templateType == TemplateType.ObjectNpc)
            {
                exportPlaceholders.Add(CreatePlaceHolder(Placeholder_DailyRoutine_Functions_Start));
                exportPlaceholders.Add(CreatePlaceHolder(Placeholder_DailyRoutine_Functions_End));
                exportPlaceholders.Add(CreatePlaceHolder(Placeholder_DailyRoutine_Function));
            }

            exportPlaceholders.AddRange(new List<ExportTemplatePlaceholder>() {
                CreatePlaceHolder(Placeholder_HasDailyRoutine_Start),
                CreatePlaceHolder(Placeholder_HasDailyRoutine_End),
                CreatePlaceHolder(Placeholder_CurEvent_Index)
            });
            exportPlaceholders.AddRange(_eventPlaceholderResolver.GetPlaceholders());
            exportPlaceholders.AddRange(_eventContentPlaceholderResolver.GetPlaceholders(templateType));

            return exportPlaceholders;
        }
    }
}