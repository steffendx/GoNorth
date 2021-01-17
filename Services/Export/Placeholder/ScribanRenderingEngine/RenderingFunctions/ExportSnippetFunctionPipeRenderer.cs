using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
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
    /// Class to render an export snippet function
    /// </summary>
    public class ExportSnippetFunctionPipeRenderer : ScribanBaseStringRenderingFunction<ScribanExportSnippetFunction>
    {
        /// <summary>
        /// Name of the function
        /// </summary>
        public const string ExportSnippetFunctionName = "export_snippet_function";

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
        public ExportSnippetFunctionPipeRenderer(IExportTemplatePlaceholderResolver templatePlaceholderResolver, IExportCachedDbAccess exportCachedDbAccess, ICachedExportDefaultTemplateProvider defaultTemplateProvider, 
                                                 ExportPlaceholderErrorCollection errorCollection)
        {
            _templatePlaceholderResolver = templatePlaceholderResolver;
            _exportCachedDbAccess = exportCachedDbAccess;
            _defaultTemplateProvider = defaultTemplateProvider;
            _errorCollection = errorCollection;
        }

        /// <summary>
        /// Renders an export snippet function
        /// </summary>
        /// <param name="context">Template context</param>
        /// <param name="callerContext">Caller context</param>
        /// <param name="arguments">Arguments to render the function with</param>
        /// <returns>Rendered export snippet function</returns>
        private async ValueTask<object> RenderExportSnippetFunction(TemplateContext context, ScriptNode callerContext, ScriptArray arguments)
        {
            if(arguments.Count != 1 || !(arguments[0] is ScribanExportSnippetFunction))
            {
                _errorCollection.AddInvalidParameter(ScribanErrorUtil.FormatScribanSpan(callerContext.Span));
                return "<<DID NOT PROVIDE VALID EXPORT SNIPPET FUNCTION>>";
            }
            ScribanExportSnippetFunction exportFunction = (ScribanExportSnippetFunction)arguments[0];

            GoNorthProject curProject = await _exportCachedDbAccess.GetUserProject();
            ExportTemplate snippetFunctionTemplate = await _defaultTemplateProvider.GetDefaultTemplateByType(curProject.Id, TemplateType.ObjectExportSnippetFunction);

            ExportObjectData objectData = new ExportObjectData();
            objectData.ExportData.Add(ExportConstants.ExportDataObject, exportFunction.ToExportSnippetFunction());

            ExportPlaceholderFillResult fillResult = await _templatePlaceholderResolver.FillPlaceholders(TemplateType.ObjectExportSnippetFunction, snippetFunctionTemplate.Code, objectData, snippetFunctionTemplate.RenderingEngine);
            _errorCollection.Merge(fillResult.Errors);

            return ScribanOutputUtil.IndentMultilineCode(context, fillResult.Code);
        }

        /// <summary>
        /// Invokes the export snippet function generation
        /// </summary>
        /// <param name="context">Template context</param>
        /// <param name="callerContext">Caller context</param>
        /// <param name="arguments">Arguments</param>
        /// <param name="blockStatement">Block Statement</param>
        /// <returns>Export snippet function</returns>
        public override object Invoke(TemplateContext context, ScriptNode callerContext, ScriptArray arguments, ScriptBlockStatement blockStatement)
        {
            return RenderExportSnippetFunction(context, callerContext, arguments).Result;
        }

        /// <summary>
        /// Invokes the Export snippet function generation async
        /// </summary>
        /// <param name="context">Template context</param>
        /// <param name="callerContext">Caller context</param>
        /// <param name="arguments">Arguments</param>
        /// <param name="blockStatement">Block Statement</param>
        /// <returns>Export snippet function</returns>
        public override async ValueTask<object> InvokeAsync(TemplateContext context, ScriptNode callerContext, ScriptArray arguments, ScriptBlockStatement blockStatement)
        {
            return await RenderExportSnippetFunction(context, callerContext, arguments);
        }


        /// <summary>
        /// Returns a list of supported placeholders
        /// </summary>
        /// <returns>List of supported placeholders</returns>
        public static List<ExportTemplatePlaceholder> GetPlaceholders(IStringLocalizerFactory localizerFactory)
        {
            IStringLocalizer localizer = localizerFactory.Create(typeof(ExportSnippetFunctionPipeRenderer));
            return new List<ExportTemplatePlaceholder> {
                new ExportTemplatePlaceholder(string.Format("<EXPORT_SNIPPET_FUNCTION> | {0}", ExportSnippetFunctionName), localizer["PlaceholderDesc_ExportSnippetFunction"])
            };
        }
    }
}