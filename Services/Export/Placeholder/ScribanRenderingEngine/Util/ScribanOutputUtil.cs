using System;
using Scriban;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util
{
    /// <summary>
    /// Utility class to for Scriban output
    /// </summary>
    public static class ScribanOutputUtil
    {
        /// <summary>
        /// Indents a multiline code
        /// </summary>
        /// <param name="context">Template context</param>
        /// <param name="code">Code to indent</param>
        /// <returns>Indented code</returns>
        public static string IndentMultilineCode(TemplateContext context, string code)
        {
            string indentTemplate = context.Output.ToString();
            string[] allLines = indentTemplate.Split(Environment.NewLine);
            if(allLines.Length > 0)
            {
                string indentLine = allLines[allLines.Length - 1].Trim('\n', '\r');
                if(string.IsNullOrWhiteSpace(indentLine))
                {
                    return ExportUtil.IndentListTemplate(code, indentLine).Trim();
                }
            }

            return code;
        }
    }
}