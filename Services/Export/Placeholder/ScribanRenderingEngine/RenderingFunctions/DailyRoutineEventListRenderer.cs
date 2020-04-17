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
    /// Class to render daily routine event list
    /// </summary>
    public class DailyRoutineEventListRenderer : IScriptCustomFunction
    {
        /// <summary>
        /// Name of the function
        /// </summary>
        public const string DailyRoutineEventListFunctionName = "daily_routine_event_list";

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
        /// Export object data
        /// </summary>
        private readonly ExportObjectData _exportObjectData;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="templatePlaceholderResolver">Template placeholder resolver</param>
        /// <param name="exportCachedDbAccess">Export cached database access</param>
        /// <param name="defaultTemplateProvider">Default template provider</param>
        /// <param name="errorCollection">Error collection</param>
        /// <param name="exportObjectData">Export object data</param>
        public DailyRoutineEventListRenderer(IExportTemplatePlaceholderResolver templatePlaceholderResolver, IExportCachedDbAccess exportCachedDbAccess, ICachedExportDefaultTemplateProvider defaultTemplateProvider, 
                                             ExportPlaceholderErrorCollection errorCollection, ExportObjectData exportObjectData)
        {
            _templatePlaceholderResolver = templatePlaceholderResolver;
            _exportCachedDbAccess = exportCachedDbAccess;
            _defaultTemplateProvider = defaultTemplateProvider;
            _errorCollection = errorCollection;
            _exportObjectData = exportObjectData;
        }

        /// <summary>
        /// Renders an daily routine event list
        /// </summary>
        /// <param name="context">Template context</param>
        /// <param name="callerContext">Caller context</param>
        /// <param name="arguments">Arguments to render the list with</param>
        /// <returns>Rendered daily routine event list</returns>
        private async ValueTask<object> RenderDailyRoutineEventList(TemplateContext context, ScriptNode callerContext, ScriptArray arguments)
        {
            List<ScribanExportDailyRoutineEvent> eventList = ScribanParsingUtil.GetArrayFromScribanArgument<ScribanExportDailyRoutineEvent>(arguments, 0);
            if(eventList == null)
            {
                _errorCollection.AddInvalidParameter(ScribanErrorUtil.FormatScribanSpan(callerContext.Span));
                return "<<DID NOT PROVIDE VALID EVENT LIST>>";
            }

            GoNorthProject curProject = await _exportCachedDbAccess.GetDefaultProject();
            ExportTemplate eventListTemplate = await _defaultTemplateProvider.GetDefaultTemplateByType(curProject.Id, TemplateType.ObjectDailyRoutineEventList);

            ExportObjectData objectData =  _exportObjectData.Clone();
            if(objectData.ExportData.ContainsKey(ExportConstants.ExportDataObject) && objectData.ExportData[ExportConstants.ExportDataObject] is KortistoNpc)
            {
                ((KortistoNpc)objectData.ExportData[ExportConstants.ExportDataObject]).DailyRoutine = eventList.Select(e => e.OriginalEvent).ToList();
            }

            ExportPlaceholderFillResult fillResult = await _templatePlaceholderResolver.FillPlaceholders(TemplateType.ObjectDailyRoutineEventList, eventListTemplate.Code, objectData, eventListTemplate.RenderingEngine);
            _errorCollection.Merge(fillResult.Errors);

            return ScribanOutputUtil.IndentMultilineCode(context, fillResult.Code);
        }

        /// <summary>
        /// Invokes the daily routine event list generation
        /// </summary>
        /// <param name="context">Template context</param>
        /// <param name="callerContext">Caller context</param>
        /// <param name="arguments">Arguments</param>
        /// <param name="blockStatement">Block Statement</param>
        /// <returns>Daily routine event list</returns>
        public object Invoke(TemplateContext context, ScriptNode callerContext, ScriptArray arguments, ScriptBlockStatement blockStatement)
        {
            return RenderDailyRoutineEventList(context, callerContext, arguments).Result;
        }

        /// <summary>
        /// Invokes the daily routine event list generation async
        /// </summary>
        /// <param name="context">Template context</param>
        /// <param name="callerContext">Caller context</param>
        /// <param name="arguments">Arguments</param>
        /// <param name="blockStatement">Block Statement</param>
        /// <returns>Daily routine event list</returns>
        public async ValueTask<object> InvokeAsync(TemplateContext context, ScriptNode callerContext, ScriptArray arguments, ScriptBlockStatement blockStatement)
        {
            return await RenderDailyRoutineEventList(context, callerContext, arguments);
        }


        /// <summary>
        /// Returns a list of supported placeholders
        /// </summary>
        /// <returns>List of supported placeholders</returns>
        public static List<ExportTemplatePlaceholder> GetPlaceholders(IStringLocalizerFactory localizerFactory)
        {
            IStringLocalizer localizer = localizerFactory.Create(typeof(DailyRoutineEventListRenderer));
            return new List<ExportTemplatePlaceholder> {
                new ExportTemplatePlaceholder(string.Format("<DAILY_ROUTINE_LIST> | {0}", DailyRoutineEventListFunctionName), localizer["PlaceholderDesc_DailyRoutineEventList"])
            };
        }
    }
}