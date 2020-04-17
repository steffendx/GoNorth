using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Microsoft.Extensions.Localization;
using Scriban;
using Scriban.Runtime;
using Scriban.Syntax;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingFunctions
{
    /// <summary>
    /// Function to indent multiple lines of text to match the same indentation
    /// </summary>
    public class IndentMultiLineRenderer : IScriptCustomFunction
    {
        /// <summary>
        /// Name of the function
        /// </summary>
        public const string IndentMUltilineFunctionName = "indent_multiline";

        /// <summary>
        /// Indents a text value
        /// </summary>
        /// <param name="context">Template context</param>
        /// <param name="callerContext">Caller context</param>
        /// <param name="arguments">Arguments to render the list with</param>
        /// <returns>Indented text value</returns>
        private ValueTask<object> IndentValue(TemplateContext context, ScriptNode callerContext, ScriptArray arguments)
        {
            if(arguments.Count != 1 || arguments[0] == null)
            {
                return new ValueTask<object>("<<NO VALID INDENTATION TEXT PROVIDED>>");
            }

            string indentCode = arguments[0].ToString();
            return new ValueTask<object>(ScribanOutputUtil.IndentMultilineCode(context, indentCode));
        }

        /// <summary>
        /// Invokes the indent text
        /// </summary>
        /// <param name="context">Template context</param>
        /// <param name="callerContext">Caller context</param>
        /// <param name="arguments">Arguments</param>
        /// <param name="blockStatement">Block Statement</param>
        /// <returns>Indented text value</returns>
        public object Invoke(TemplateContext context, ScriptNode callerContext, ScriptArray arguments, ScriptBlockStatement blockStatement)
        {
            return IndentValue(context, callerContext, arguments).Result;
        }

        /// <summary>
        /// Indents a text value
        /// </summary>
        /// <param name="context">Template context</param>
        /// <param name="callerContext">Caller context</param>
        /// <param name="arguments">Arguments</param>
        /// <param name="blockStatement">Block Statement</param>
        /// <returns>Indented text value</returns>
        public async ValueTask<object> InvokeAsync(TemplateContext context, ScriptNode callerContext, ScriptArray arguments, ScriptBlockStatement blockStatement)
        {
            return await IndentValue(context, callerContext, arguments);
        }


        /// <summary>
        /// Returns a list of supported placeholders
        /// </summary>
        /// <returns>List of supported placeholders</returns>
        public static List<ExportTemplatePlaceholder> GetPlaceholders(IStringLocalizerFactory localizerFactory)
        {
            IStringLocalizer localizer = localizerFactory.Create(typeof(IndentMultiLineRenderer));
            return new List<ExportTemplatePlaceholder> {
                new ExportTemplatePlaceholder(string.Format("<STRING_VALUE> | {0}", IndentMUltilineFunctionName), localizer["PlaceholderDesc_IndentMultiLine"])
            };
        }
    }
}