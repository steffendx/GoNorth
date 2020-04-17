using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Extensions;
using GoNorth.Services.Export.DailyRoutine;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder.Util;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Placeholder.LegacyRenderingEngine
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
        private readonly ILegacyDailyRoutineEventPlaceholderResolver _eventPlaceholderResolver;

        /// <summary>
        /// Daily routine event content placeholder resolver
        /// </summary>
        private readonly ILegacyDailyRoutineEventContentPlaceholderResolver _eventContentPlaceholderResolver;

        /// <summary>
        /// Daily routine function renderer
        /// </summary>
        private readonly IDailyRoutineFunctionRenderer _dailyRoutineFunctionRenderer;

        /// <summary>
        /// Language Key Generator
        /// </summary>
        private readonly ILanguageKeyGenerator _languageKeyGenerator;

        /// <summary>
        /// Placeholder resolver
        /// </summary>
        private IExportTemplatePlaceholderResolver _placeholderResolver;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="legacyEventPlaceholderResolver">Legacy daily routine event placeholder resolver</param>
        /// <param name="eventContentPlaceholderResolver">Daily routine event content palceholder resolver</param>
        /// <param name="dailyRoutineFunctionRenderer">Daily routine function renderer</param>
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public NpcDailyRoutineExportPlaceholderResolver(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILegacyDailyRoutineEventPlaceholderResolver legacyEventPlaceholderResolver, 
                                                        ILegacyDailyRoutineEventContentPlaceholderResolver eventContentPlaceholderResolver, IDailyRoutineFunctionRenderer dailyRoutineFunctionRenderer, ILanguageKeyGenerator languageKeyGenerator, 
                                                        IStringLocalizerFactory localizerFactory) : base(localizerFactory.Create(typeof(NpcDailyRoutineExportPlaceholderResolver)))
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedDbAccess = cachedDbAccess;
            _eventPlaceholderResolver = legacyEventPlaceholderResolver;
            _eventContentPlaceholderResolver = eventContentPlaceholderResolver;
            _dailyRoutineFunctionRenderer = dailyRoutineFunctionRenderer;
            _languageKeyGenerator = languageKeyGenerator;
        }


        /// <summary>
        /// Sets the export template placeholder resolver
        /// </summary>
        /// <param name="placeholderResolver">Placeholder Resolver</param>
        public void SetExportTemplatePlaceholderResolver(IExportTemplatePlaceholderResolver placeholderResolver)
        {
            _dailyRoutineFunctionRenderer.SetExportTemplatePlaceholderResolver(placeholderResolver);
            _eventContentPlaceholderResolver.SetExportTemplatePlaceholderResolver(placeholderResolver);
            _placeholderResolver = placeholderResolver;
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

            if(data.ExportData[ExportConstants.ExportDataObject] is KortistoNpc)
            {
                // Replace daily routine Placeholders       
                KortistoNpc npc = (KortistoNpc)data.ExportData[ExportConstants.ExportDataObject];
                return await FillDailyRoutinePlaceholders(code, npc, data);
            }
            else if(data.ExportData[ExportConstants.ExportDataObject] is DailyRoutineFunction)
            {
                // Replace daily routine function
                DailyRoutineFunction function = (DailyRoutineFunction)data.ExportData[ExportConstants.ExportDataObject];
                return _eventContentPlaceholderResolver.FillFunctionCode(code, function);
            }
            else if(data.ExportData[ExportConstants.ExportDataObject] is List<DailyRoutineFunction>)
            {
                // Replace daily routine function
                List<DailyRoutineFunction> functions = (List<DailyRoutineFunction>)data.ExportData[ExportConstants.ExportDataObject];
                return await FillDailyRoutineFunctionListPlaceholders(code, functions);
            }
            else
            {
                return code;
            }
        }

        /// <summary>
        /// Fills the daily routine placeholders
        /// </summary>
        /// <param name="code">Code</param>
        /// <param name="npc">Npc</param>
        /// <param name="data">Export Data</param>
        /// <returns>Filled code</returns>
        private async Task<string> FillDailyRoutinePlaceholders(string code, KortistoNpc npc, ExportObjectData data)
        {
            GoNorthProject project = await _cachedDbAccess.GetDefaultProject();
            ExportTemplate dailyRoutineFunctionTemplate = await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.ObjectDailyRoutineFunction);

            code = await ExportUtil.BuildPlaceholderRegex(Placeholder_DailyRoutine_Events, ExportConstants.ListIndentPrefix).ReplaceAsync(code, async m => {
                string eventList = await ReplaceEventList(project, data);
                return ExportUtil.IndentListTemplate(eventList, m.Groups[1].Value);
            });
            
            code = await ExportUtil.BuildPlaceholderRegex(Placeholder_DailyRoutine_Functions, ExportConstants.ListIndentPrefix).ReplaceAsync(code, async m => {
                string functionList = await ReplaceFunctionList(project, npc);
                return ExportUtil.IndentListTemplate(functionList, m.Groups[1].Value);
            });

            code = ExportUtil.BuildPlaceholderRegex(Placeholder_DailyRoutine_Function, ExportConstants.ListIndentPrefix).Replace(code, m => {
                return ExportUtil.IndentListTemplate(dailyRoutineFunctionTemplate.Code, m.Groups[1].Value);
            });

            code = ExportUtil.RenderPlaceholderIfTrue(code, Placeholder_HasDailyRoutine_Start, Placeholder_HasDailyRoutine_End, npc.DailyRoutine != null && npc.DailyRoutine.Count > 0);

            code = ExportUtil.BuildRangePlaceholderRegex(Placeholder_DailyRoutine_Events_Start, Placeholder_DailyRoutine_Events_End).Replace(code, m => {
                return ExportUtil.TrimEmptyLines(BuildEventList(m.Groups[1].Value, project, npc));
            });
            
            code = await ExportUtil.BuildRangePlaceholderRegex(Placeholder_DailyRoutine_Functions_Start, Placeholder_DailyRoutine_Functions_End).ReplaceAsync(code, async m => {
                string functionList = await BuildFunctionList(m.Groups[1].Value, project, npc);
                return ExportUtil.TrimEmptyLines(functionList);
            });

            return code;
        }

        /// <summary>
        /// Renders a list of daily routine functions
        /// </summary>
        /// <param name="code">Code to use</param>
        /// <param name="functions">Function list to render</param>
        /// <returns>Filled code</returns>
        private async Task<string> FillDailyRoutineFunctionListPlaceholders(string code, List<DailyRoutineFunction> functions)
        {
            GoNorthProject project = await _cachedDbAccess.GetDefaultProject();
            ExportTemplate dailyRoutineFunctionTemplate = await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.ObjectDailyRoutineFunction);

            code = ExportUtil.BuildPlaceholderRegex(Placeholder_DailyRoutine_Function, ExportConstants.ListIndentPrefix).Replace(code, m => {
                return ExportUtil.IndentListTemplate(dailyRoutineFunctionTemplate.Code, m.Groups[1].Value);
            });

            code = await ExportUtil.BuildRangePlaceholderRegex(Placeholder_DailyRoutine_Functions_Start, Placeholder_DailyRoutine_Functions_End).ReplaceAsync(code, async m => {
                string functionCode = m.Groups[1].Value;
                string filledCode = string.Empty;
                foreach(DailyRoutineFunction curFunction in functions)
                {
                    string curFunctionCode = _eventPlaceholderResolver.ResolveDailyRoutineEventHasScript(functionCode, true);
                    curFunctionCode = _eventContentPlaceholderResolver.FillFunctionCode(curFunctionCode, curFunction);
                    filledCode += await _eventContentPlaceholderResolver.ReplaceEventFunction(curFunctionCode, curFunction, _errorCollection);
                }
                return filledCode;
            });

            return code;
        }

        /// <summary>
        /// Replaces the event list
        /// </summary>
        /// <param name="project">Current project</param>
        /// <param name="data">Export data</param>
        /// <returns>Rendered event list</returns>
        private async Task<string> ReplaceEventList(GoNorthProject project, ExportObjectData data)
        {
            ExportTemplate dailyRoutineEventTemplate = await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.ObjectDailyRoutineEventList);

            ExportPlaceholderFillResult fillResult = await _placeholderResolver.FillPlaceholders(TemplateType.ObjectDailyRoutineEventList, dailyRoutineEventTemplate.Code, data, dailyRoutineEventTemplate.RenderingEngine);
            _errorCollection.Merge(fillResult.Errors);

            return fillResult.Code;
        }
        
        /// <summary>
        /// Replaces the function list
        /// </summary>
        /// <param name="project">Current project</param>
        /// <param name="npc">Npc for which the daily routine functions must be rendered</param>
        /// <returns>Rendered function list</returns>
        private async Task<string> ReplaceFunctionList(GoNorthProject project, KortistoNpc npc)
        {
            ExportTemplate dailyRoutineFunctionListTemplate = await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.ObjectDailyRoutineFunctionList);

            if(dailyRoutineFunctionListTemplate.RenderingEngine == ExportTemplateRenderingEngine.Scriban)
            {
                _dailyRoutineFunctionRenderer.SetErrorCollection(_errorCollection);

                List<DailyRoutineFunction> functions = await _dailyRoutineFunctionRenderer.RenderDailyRoutineFunctions(npc.DailyRoutine, npc);

                ExportObjectData objectData = new ExportObjectData();
                objectData.ExportData.Add(ExportConstants.ExportDataObject, functions);

                ExportPlaceholderFillResult fillResult = await _placeholderResolver.FillPlaceholders(TemplateType.ObjectDailyRoutineFunctionList, dailyRoutineFunctionListTemplate.Code, objectData, dailyRoutineFunctionListTemplate.RenderingEngine);
                _errorCollection.Merge(fillResult.Errors);
                return fillResult.Code;
            }
            else
            {
                return dailyRoutineFunctionListTemplate.Code;
            }
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

            SharedDailyRoutineExportUtil.SortDailyRoutine(npc.DailyRoutine);

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
        private async Task<string> BuildFunctionList(string functionCode, GoNorthProject project, KortistoNpc npc)
        {
            if(npc.DailyRoutine == null)
            {
                return string.Empty;
            }

            SharedDailyRoutineExportUtil.SortDailyRoutine(npc.DailyRoutine);

            int eventIndex = 0;
            string eventListCode = string.Empty;
            foreach(KortistoNpcDailyRoutineEvent curEvent in npc.DailyRoutine)
            {
                string curEventCode = ExportUtil.BuildPlaceholderRegex(Placeholder_CurEvent_Index).Replace(functionCode, eventIndex.ToString());

                try
                {
                    _errorCollection.CurrentErrorContext = _localizer["DailyRoutineErrorContext", curEvent.EarliestTime.Hours.ToString().PadLeft(2, '0'), curEvent.EarliestTime.Minutes.ToString().PadLeft(2, '0')].Value;
                    _eventContentPlaceholderResolver.SetErrorCollection(_errorCollection);
                    curEventCode = await _eventContentPlaceholderResolver.ResolveDailyRoutineEventContentPlaceholders(curEventCode, npc, curEvent, _errorCollection);
                    curEventCode = await _eventPlaceholderResolver.ResolveDailyRoutineEventPlaceholders(curEventCode, npc, curEvent);
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

            if(templateType != TemplateType.ObjectDailyRoutineFunction)
            {
                exportPlaceholders.AddRange(new List<ExportTemplatePlaceholder>() {
                    CreatePlaceHolder(Placeholder_HasDailyRoutine_Start),
                    CreatePlaceHolder(Placeholder_HasDailyRoutine_End),
                    CreatePlaceHolder(Placeholder_CurEvent_Index)
                });
                exportPlaceholders.AddRange(_eventPlaceholderResolver.GetPlaceholders());
            }
            exportPlaceholders.AddRange(_eventContentPlaceholderResolver.GetPlaceholders(templateType));
            exportPlaceholders = exportPlaceholders.DistinctBy(p => p.Name).ToList();

            return exportPlaceholders;
        }
    }
}