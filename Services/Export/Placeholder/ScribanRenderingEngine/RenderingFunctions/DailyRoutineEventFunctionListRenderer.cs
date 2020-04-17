using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Microsoft.Extensions.Localization;
using Scriban;
using Scriban.Runtime;
using Scriban.Syntax;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingFunctions
{
    /// <summary>
    /// Class to render daily routine event function list
    /// </summary>
    public class DailyRoutineEventFunctionListRenderer : IScriptCustomFunction
    {
        /// <summary>
        /// Name of the function
        /// </summary>
        public const string DailyRoutineEventFunctionListFunctionName = "daily_routine_event_function_list";

        /// <summary>
        /// Template placeholder resolver
        /// </summary>
        private readonly IExportTemplatePlaceholderResolver _templatePlaceholderResolver;

        /// <summary>
        /// Default template provider
        /// </summary>
        private readonly IExportCachedDbAccess _exportCachedDbAccess;

        /// <summary>
        /// Default template provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Error collection
        /// </summary>
        private readonly ExportPlaceholderErrorCollection _errorCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="templatePlaceholderResolver">Template placeholder resolver</param>
        /// <param name="exportCachedDbAccess">Export cached database access</param>
        /// <param name="defaultTemplateProvider">Default template provider</param>
        /// <param name="errorCollection">Error collection</param>
        public DailyRoutineEventFunctionListRenderer(IExportTemplatePlaceholderResolver templatePlaceholderResolver, IExportCachedDbAccess exportCachedDbAccess, ICachedExportDefaultTemplateProvider defaultTemplateProvider, 
                                                     ExportPlaceholderErrorCollection errorCollection)
        {
            _templatePlaceholderResolver = templatePlaceholderResolver;
            _exportCachedDbAccess = exportCachedDbAccess;
            _defaultTemplateProvider = defaultTemplateProvider;
            _errorCollection = errorCollection;
        }

        /// <summary>
        /// Renders an daily routine function list
        /// </summary>
        /// <param name="context">Template context</param>
        /// <param name="callerContext">Caller context</param>
        /// <param name="arguments">Arguments to render the list with</param>
        /// <returns>Rendered daily routine function list</returns>
        private async ValueTask<object> RenderDailyRoutineFunctionList(TemplateContext context, ScriptNode callerContext, ScriptArray arguments)
        {
            List<ScribanExportDailyRoutineFunction> functionList = ScribanParsingUtil.GetArrayFromScribanArgument<ScribanExportDailyRoutineFunction>(arguments, 0);
            if(functionList == null)
            {
                _errorCollection.AddInvalidParameter(ScribanErrorUtil.FormatScribanSpan(callerContext.Span));
                return "<<DID NOT PROVIDE VALID FUNCTION LIST>>";
            }

            GoNorthProject curProject = await _exportCachedDbAccess.GetDefaultProject();
            ExportTemplate functionListTemplate = await _defaultTemplateProvider.GetDefaultTemplateByType(curProject.Id, TemplateType.ObjectDailyRoutineFunctionList);

            ExportObjectData objectData =  new ExportObjectData();
            objectData.ExportData.Add(ExportConstants.ExportDataObject, functionList.Select(f => f.ToDailyRoutineFunction()).ToList());

            ExportPlaceholderFillResult fillResult = await _templatePlaceholderResolver.FillPlaceholders(TemplateType.ObjectDailyRoutineFunctionList, functionListTemplate.Code, objectData, functionListTemplate.RenderingEngine);
            _errorCollection.Merge(fillResult.Errors);

            return ScribanOutputUtil.IndentMultilineCode(context, fillResult.Code);
        }

        /// <summary>
        /// Invokes the daily routine function list generation
        /// </summary>
        /// <param name="context">Template context</param>
        /// <param name="callerContext">Caller context</param>
        /// <param name="arguments">Arguments</param>
        /// <param name="blockStatement">Block Statement</param>
        /// <returns>Daily routine function list</returns>
        public object Invoke(TemplateContext context, ScriptNode callerContext, ScriptArray arguments, ScriptBlockStatement blockStatement)
        {
            return RenderDailyRoutineFunctionList(context, callerContext, arguments).Result;
        }

        /// <summary>
        /// Invokes the daily routine function list generation async
        /// </summary>
        /// <param name="context">Template context</param>
        /// <param name="callerContext">Caller context</param>
        /// <param name="arguments">Arguments</param>
        /// <param name="blockStatement">Block Statement</param>
        /// <returns>Daily routine function list</returns>
        public async ValueTask<object> InvokeAsync(TemplateContext context, ScriptNode callerContext, ScriptArray arguments, ScriptBlockStatement blockStatement)
        {
            return await RenderDailyRoutineFunctionList(context, callerContext, arguments);
        }


        /// <summary>
        /// Returns a list of supported placeholders
        /// </summary>
        /// <returns>List of supported placeholders</returns>
        public static List<ExportTemplatePlaceholder> GetPlaceholders(IStringLocalizerFactory localizerFactory)
        {
            IStringLocalizer localizer = localizerFactory.Create(typeof(DailyRoutineEventFunctionListRenderer));
            return new List<ExportTemplatePlaceholder> {
                new ExportTemplatePlaceholder(string.Format("<DAILY_ROUTINE_FUNCTION_LIST> | {0}", DailyRoutineEventFunctionListFunctionName), localizer["PlaceholderDesc_DailyRoutineEventFunctionList"])
            };
        }
    }
}