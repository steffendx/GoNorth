using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Microsoft.Extensions.Localization;
using Scriban;
using Scriban.Runtime;
using Scriban.Syntax;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingFunctions
{
    /// <summary>
    /// Class to render dialog function
    /// </summary>
    public class DialogFunctionRenderer : ScribanBaseStringRenderingFunction<ScribanExportDialogFunction>
    {
        /// <summary>
        /// Name of the function
        /// </summary>
        public const string DialogFunctionName = "dialog_function";

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
        public DialogFunctionRenderer(IExportTemplatePlaceholderResolver templatePlaceholderResolver, IExportCachedDbAccess exportCachedDbAccess, ICachedExportDefaultTemplateProvider defaultTemplateProvider, 
                                      ExportPlaceholderErrorCollection errorCollection, ExportObjectData exportObjectData)
        {
            _templatePlaceholderResolver = templatePlaceholderResolver;
            _exportCachedDbAccess = exportCachedDbAccess;
            _defaultTemplateProvider = defaultTemplateProvider;
            _errorCollection = errorCollection;
            _exportObjectData = exportObjectData;
        }

        /// <summary>
        /// Renders an dialog function
        /// </summary>
        /// <param name="context">Template context</param>
        /// <param name="callerContext">Caller context</param>
        /// <param name="arguments">Arguments to render the list with</param>
        /// <returns>Rendered Dialog function</returns>
        private async ValueTask<object> RenderDialogFunction(TemplateContext context, ScriptNode callerContext, ScriptArray arguments)
        {
            if(arguments.Count != 1 || !(arguments[0] is ScribanExportDialogFunction))
            {
                _errorCollection.AddInvalidParameter(ScribanErrorUtil.FormatScribanSpan(callerContext.Span));
                return "<<DID NOT PROVIDE VALID DIALOG FUNCTION>>";
            }
            ScribanExportDialogFunction exportDialogFunction = (ScribanExportDialogFunction)arguments[0];

            GoNorthProject curProject = await _exportCachedDbAccess.GetUserProject();
            ExportTemplate dialogFunctionTemplate = await _defaultTemplateProvider.GetDefaultTemplateByType(curProject.Id, TemplateType.TaleDialogFunction);

            ExportObjectData objectData = new ExportObjectData();
            objectData.ExportData.Add(ExportConstants.ExportDataObject, ConvertScribanDialogFunctionToNodeFunction(exportDialogFunction));

            ExportPlaceholderFillResult fillResult = await _templatePlaceholderResolver.FillPlaceholders(TemplateType.TaleDialogFunction, dialogFunctionTemplate.Code, objectData, dialogFunctionTemplate.RenderingEngine);
            _errorCollection.Merge(fillResult.Errors);

            return ScribanOutputUtil.IndentMultilineCode(context, fillResult.Code);
        }

        /// <summary>
        /// Converts a scriban Export dialog function to a Node Graph Dialog function
        /// </summary>
        /// <param name="dialogFunction">Scriban dialog function</param>
        /// <returns>Node Graph Dialog Function</returns>
        private ExportDialogFunctionCode ConvertScribanDialogFunctionToNodeFunction(ScribanExportDialogFunction dialogFunction)
        {
            return new ExportDialogFunctionCode(dialogFunction.FunctionName, dialogFunction.Code, dialogFunction.ParentPreviewText);
        }

        /// <summary>
        /// Invokes the dialog function generation
        /// </summary>
        /// <param name="context">Template context</param>
        /// <param name="callerContext">Caller context</param>
        /// <param name="arguments">Arguments</param>
        /// <param name="blockStatement">Block Statement</param>
        /// <returns>Dialog function</returns>
        public override object Invoke(TemplateContext context, ScriptNode callerContext, ScriptArray arguments, ScriptBlockStatement blockStatement)
        {
            return RenderDialogFunction(context, callerContext, arguments).Result;
        }

        /// <summary>
        /// Invokes the dialog function generation async
        /// </summary>
        /// <param name="context">Template context</param>
        /// <param name="callerContext">Caller context</param>
        /// <param name="arguments">Arguments</param>
        /// <param name="blockStatement">Block Statement</param>
        /// <returns>Dialog function</returns>
        public override async ValueTask<object> InvokeAsync(TemplateContext context, ScriptNode callerContext, ScriptArray arguments, ScriptBlockStatement blockStatement)
        {
            return await RenderDialogFunction(context, callerContext, arguments);
        }


        /// <summary>
        /// Returns a list of supported placeholders
        /// </summary>
        /// <returns>List of supported placeholders</returns>
        public static List<ExportTemplatePlaceholder> GetPlaceholders(IStringLocalizerFactory localizerFactory)
        {
            IStringLocalizer localizer = localizerFactory.Create(typeof(DialogFunctionRenderer));
            return new List<ExportTemplatePlaceholder> {
                new ExportTemplatePlaceholder(string.Format("<DIALOG_FUNCTION> | {0}", DialogFunctionName), localizer["PlaceholderDesc_DialogFunction"])
            };
        }
    }
}