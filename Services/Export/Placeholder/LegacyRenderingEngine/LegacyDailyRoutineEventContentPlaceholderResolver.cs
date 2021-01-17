using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Export.DailyRoutine;
using GoNorth.Services.Export.Data;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Placeholder.LegacyRenderingEngine
{
    /// <summary>
    /// Class for resolving the content for a single daily routine event
    /// </summary>
    public class LegacyDailyRoutineEventContentPlaceholderResolver : ILegacyDailyRoutineEventContentPlaceholderResolver
    {        
        /// <summary>
        /// Placeholder for the name of the script function
        /// </summary>
        private const string Placeholder_ScriptFunctionName = "DailyRoutine_ScriptFunctionName";

        /// <summary>
        /// Placeholder for the content of the script
        /// </summary>
        private const string Placeholder_ScriptContent = "DailyRoutine_ScriptContent";

        /// <summary>
        /// Placeholder for the parent preview of a placeholder
        /// </summary>
        private const string Placeholder_Function_ParentPreview = "DailyRoutine_Function_ParentPreview";

        /// <summary>
        /// Start of the content that will only be rendered if the daily routine function has additional script functions
        /// </summary>
        private const string Placeholder_HasAdditionalScriptFunctions_Start = "DailyRoutine_HasAdditionalScriptFunctions_Start";
        
        /// <summary>
        /// End of the content that will only be rendered if the daily routine function has additional script functions
        /// </summary>
        private const string Placeholder_HasAdditionalScriptFunctions_End = "DailyRoutine_HasAdditionalScriptFunctions_End";
        
        /// <summary>
        /// Start of the content that will only be rendered if the daily routine function has no additional script functions
        /// </summary>
        private const string Placeholder_HasNoAdditionalScriptFunctions_Start = "DailyRoutine_HasNoAdditionalScriptFunctions_Start";
        
        /// <summary>
        /// End of the content that will only be rendered if the daily routine function has no additional script functions
        /// </summary>
        private const string Placeholder_HasNoAdditionalScriptFunctions_End = "DailyRoutine_HasNoAdditionalScriptFunctions_End";


        /// <summary>
        /// Placeholder for the additional script functions
        /// </summary>
        private const string Placeholder_AdditionalScriptFunctions = "DailyRoutine_AdditionalScriptFunctions";


        /// <summary>
        /// Cached Db access
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// Default template provider 
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Daily routine function renderer
        /// </summary>
        private readonly IDailyRoutineFunctionRenderer _dailyRoutineFunctionRenderer;

        /// <summary>
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Template placeholder resolver
        /// </summary>
        private IExportTemplatePlaceholderResolver _templatePlaceholderResolver;

        /// <summary>
        /// All events that were rendered so far
        /// </summary>
        private Dictionary<string, List<DailyRoutineFunction>> _renderedEvents;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="cachedDbAccess">Cached database access</param>
        /// <param name="defaultTemplateProvider">Default template provider</param>
        /// <param name="dailyRoutineFunctionRenderer">Daily routine function renderer</param>
        /// <param name="localizerFactory">Localizer factory</param>
        public LegacyDailyRoutineEventContentPlaceholderResolver(IExportCachedDbAccess cachedDbAccess, ICachedExportDefaultTemplateProvider defaultTemplateProvider, IDailyRoutineFunctionRenderer dailyRoutineFunctionRenderer, 
                                                                 IStringLocalizerFactory localizerFactory)
        {
            _cachedDbAccess = cachedDbAccess;
            _defaultTemplateProvider = defaultTemplateProvider;
            _dailyRoutineFunctionRenderer = dailyRoutineFunctionRenderer;
            _renderedEvents = new Dictionary<string, List<DailyRoutineFunction>>();
            _localizer = localizerFactory.Create(typeof(LegacyDailyRoutineEventContentPlaceholderResolver));
        }

        /// <summary>
        /// Sets the export template placeholder resolver
        /// </summary>
        /// <param name="templatePlaceholderResolver">Template placeholder resolver</param>
        public void SetExportTemplatePlaceholderResolver(IExportTemplatePlaceholderResolver templatePlaceholderResolver)
        {
            _dailyRoutineFunctionRenderer.SetExportTemplatePlaceholderResolver(templatePlaceholderResolver);
            _templatePlaceholderResolver = templatePlaceholderResolver;
        }

        /// <summary>
        /// Sets the error collection
        /// </summary>
        /// <param name="errorCollection">Error collection</param>
        public void SetErrorCollection(ExportPlaceholderErrorCollection errorCollection)
        {
            _dailyRoutineFunctionRenderer.SetErrorCollection(errorCollection);
        }

        /// <summary>
        /// Resolved the placeholders for a single daily routine event
        /// </summary>
        /// <param name="code">Code to resolve the placeholders in</param>
        /// <param name="npc">Npc to which the event belongs</param>
        /// <param name="dailyRoutineEvent">Daily routine to use for resolving the placeholders</param>
        /// <param name="errorCollection">Error collection</param>
        /// <returns>Code with resolved placeholders</returns>
        public async Task<string> ResolveDailyRoutineEventContentPlaceholders(string code, KortistoNpc npc, KortistoNpcDailyRoutineEvent dailyRoutineEvent, ExportPlaceholderErrorCollection errorCollection)
        {
            GoNorthProject project = await _cachedDbAccess.GetUserProject();
            ExportTemplate dailyRoutineFunctionTemplate = await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.ObjectDailyRoutineFunction);

            List<DailyRoutineFunction> functions = await this.RenderDailyRoutineFunctions(dailyRoutineEvent, npc, errorCollection);
            string finalCode = string.Empty;

            foreach(DailyRoutineFunction curFunction in functions)
            {
                if(!string.IsNullOrEmpty(finalCode))
                {
                    finalCode += Environment.NewLine;
                }

                string functionCode = code;
                if(dailyRoutineFunctionTemplate.RenderingEngine == ExportTemplateRenderingEngine.Scriban)
                {
                    functionCode = await ReplaceEventFunction(functionCode, curFunction, errorCollection);
                }
                functionCode = FillFunctionCode(functionCode, curFunction);
                finalCode += functionCode;
            }

            return finalCode;
        }

        /// <summary>
        /// Replaces the event function
        /// </summary>
        /// <param name="code">Function code</param>
        /// <param name="function">Function to render</param>
        /// <param name="errorCollection">Error collection</param>
        /// <returns>Rendered event function</returns>
        public async Task<string> ReplaceEventFunction(string code, DailyRoutineFunction function, ExportPlaceholderErrorCollection errorCollection)
        {
            ExportObjectData objectData = new ExportObjectData();
            objectData.ExportData.Add(ExportConstants.ExportDataObject, function);

            ExportPlaceholderFillResult fillResult = await _templatePlaceholderResolver.FillPlaceholders(TemplateType.ObjectDailyRoutineFunction, code, objectData, ExportTemplateRenderingEngine.Scriban);
            errorCollection.Merge(fillResult.Errors);

            return fillResult.Code;
        }

        /// <summary>
        /// Fills the function code for a daily routine
        /// </summary>
        /// <param name="code">Code to fill</param>
        /// <param name="function">Function data</param>
        /// <returns>Filled code</returns>
        public string FillFunctionCode(string code, DailyRoutineFunction function)
        {
            code = ExportUtil.RenderPlaceholderIfFuncTrue(code, Placeholder_HasAdditionalScriptFunctions_Start, Placeholder_HasAdditionalScriptFunctions_End, m =>
            {
                return false;
            });

            code = ExportUtil.RenderPlaceholderIfFuncTrue(code, Placeholder_HasNoAdditionalScriptFunctions_Start, Placeholder_HasNoAdditionalScriptFunctions_End, m =>
            {
                return false;
            });

            code = ExportUtil.BuildPlaceholderRegex(Placeholder_ScriptFunctionName).Replace(code, function.FunctionName);

            code = ExportUtil.BuildPlaceholderRegex(Placeholder_ScriptContent, ExportConstants.ListIndentPrefix).Replace(code, m =>
            {
                return ExportUtil.IndentListTemplate(function.Code, m.Groups[1].Value);
            });

            code = ExportUtil.BuildPlaceholderRegex(Placeholder_AdditionalScriptFunctions, ExportConstants.ListIndentPrefix).Replace(code, m =>
            {
                return string.Empty;
            });

            code = ExportUtil.BuildPlaceholderRegex(Placeholder_Function_ParentPreview).Replace(code, !string.IsNullOrEmpty(function.ParentPreviewText) ? function.ParentPreviewText : "None");
            return code;
        }

        /// <summary>
        /// Renders the daily routine functions
        /// </summary>
        /// <param name="dailyRoutineEvent">Daily routine event</param>
        /// <param name="npc">Npc</param>
        /// <param name="errorCollection">Error collection</param>
        /// <returns>Node graph render result</returns>
        private async Task<List<DailyRoutineFunction>> RenderDailyRoutineFunctions(KortistoNpcDailyRoutineEvent dailyRoutineEvent, KortistoNpc npc, ExportPlaceholderErrorCollection errorCollection)
        {
            if(dailyRoutineEvent == null)
            {
                return new List<DailyRoutineFunction>();
            }

            if(_renderedEvents.ContainsKey(dailyRoutineEvent.EventId))
            {
                return _renderedEvents[dailyRoutineEvent.EventId];
            }

            List<DailyRoutineFunction> functions = await _dailyRoutineFunctionRenderer.RenderDailyRoutineFunctions(new List<KortistoNpcDailyRoutineEvent> { dailyRoutineEvent }, npc);
            _renderedEvents.Add(dailyRoutineEvent.EventId, functions);
            return functions;
        }

        /// <summary>
        /// Returns the placeholders that are available for a daily routine event
        /// </summary>
        /// <returns>Placeholders</returns>
        public List<ExportTemplatePlaceholder> GetPlaceholders(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder> {
                ExportUtil.CreatePlaceHolder(Placeholder_ScriptFunctionName, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ScriptContent, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Function_ParentPreview, _localizer)
            };

            if(templateType != TemplateType.ObjectDailyRoutineFunction)
            {
                exportPlaceholders.Add(ExportUtil.CreatePlaceHolder(Placeholder_HasAdditionalScriptFunctions_Start, _localizer));
                exportPlaceholders.Add(ExportUtil.CreatePlaceHolder(Placeholder_HasAdditionalScriptFunctions_End, _localizer));
                exportPlaceholders.Add(ExportUtil.CreatePlaceHolder(Placeholder_HasNoAdditionalScriptFunctions_Start, _localizer));
                exportPlaceholders.Add(ExportUtil.CreatePlaceHolder(Placeholder_HasNoAdditionalScriptFunctions_End, _localizer));
                exportPlaceholders.Add(ExportUtil.CreatePlaceHolder(Placeholder_AdditionalScriptFunctions, _localizer));
            }

            return exportPlaceholders;
        }
    }
}