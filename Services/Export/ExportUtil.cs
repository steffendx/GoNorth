using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export
{
    /// <summary>
    /// Export Constants
    /// </summary>
    public class ExportUtil
    {
        /// <summary>
        /// New Line Character
        /// </summary>
        private const string NewlineChar = "\n";

        /// <summary>
        /// Max Text Length for a preview
        /// </summary>
        private const int TextPreviewMaxLength = 47;


        /// <summary>
        /// Wraps a placeholders with the placeholder brackets
        /// </summary>
        /// <param name="placeholder">Placerholder</param>
        /// <returns>Placeholder wrapped in brackets</returns>
        public static string WrapPlaceholderWithBrackets(string placeholder) 
        {
            return ExportConstants.PlaceholderBracketsStart + placeholder + ExportConstants.PlaceholderBracketsEnd;
        }

        /// <summary>
        /// Builds the placeholder Regex
        /// </summary>
        /// <param name="placeholderNameRegex">Placeholder Name Regex</param>
        /// <param name="preFix">Placeholder prefix</param>
        /// <returns>Placeholder Regex</returns>
        public static Regex BuildPlaceholderRegex(string placeholderNameRegex, string preFix = "")
        {
            return new Regex(preFix + WrapPlaceholderWithBrackets(placeholderNameRegex), RegexOptions.Multiline);
        }

        /// <summary>
        /// Builds the placeholder regex for a range (list or if)
        /// </summary>
        /// <param name="listStartRegex">Regex to find the start of the list</param>
        /// <param name="listEndRegex">Regex to find the end of the list</param>
        /// <returns>Placeholder Regex</returns>
        public static Regex BuildRangePlaceholderRegex(string listStartRegex, string listEndRegex)
        {
            return new Regex(WrapPlaceholderWithBrackets(listStartRegex) + "([\\S\\s]*?)" + WrapPlaceholderWithBrackets(listEndRegex), RegexOptions.Multiline);
        }

        /// <summary>
        /// Renders a placeholder if a condition is true
        /// </summary>
        /// <param name="code">Code</param>
        /// <param name="placeholderStart">Start of the placeholder</param>
        /// <param name="placeholderEnd">End of the placeholder</param>
        /// <param name="render">true if the content should be rendered, else false</param>
        /// <returns>Updated Code</returns>
        public static string RenderPlaceholderIfTrue(string code, string placeholderStart, string placeholderEnd, bool render) 
        {
            return RenderPlaceholderIfFuncTrue(code, placeholderStart, placeholderEnd, m => render);
        }

        /// <summary>
        /// Renders a placeholder if a condition is true
        /// </summary>
        /// <param name="code">Code</param>
        /// <param name="placeholderStart">Start of the placeholder</param>
        /// <param name="placeholderEnd">End of the placeholder</param>
        /// <param name="render">Function to evaluate </param>
        /// <returns>Updated Code</returns>
        public static string RenderPlaceholderIfFuncTrue(string code, string placeholderStart, string placeholderEnd, Func<Match, bool> render) 
        {
            return ExportUtil.BuildRangePlaceholderRegex(placeholderStart, placeholderEnd).Replace(code, m => {
                if(render(m))
                {
                    return m.Groups[m.Groups.Count - 1].Value;
                }

                return string.Empty;
            });
        }

        /// <summary>
        /// Indents a list template
        /// </summary>
        /// <param name="code">Template code</param>
        /// <param name="indent">Indent</param>
        /// <returns>Indented code</returns>
        public static string IndentListTemplate(string code, string indent)
        {
            return indent + code.Replace(Environment.NewLine, Environment.NewLine + indent);
        }

        /// <summary>
        /// Trims empty lines
        /// </summary>
        /// <param name="code">Code to trim</param>
        /// <returns>Code without blank lines in the beginning or end</returns>
        public static string TrimEmptyLines(string code)
        {
            // Do not use Environemnt.NewLine here to support both linux and windows systems and depending on which system the templates were created
            List<string> allLines = code.Split(new string[] { "\r\n", "\n" }, StringSplitOptions.None).ToList();

            while(allLines.Count > 0)
            {
                if(string.IsNullOrWhiteSpace(allLines[0]))
                {
                    allLines.RemoveAt(0);
                }
                else
                {
                    break;
                }
            }

            for(int curLine = allLines.Count - 1; curLine >= 0; --curLine)
            {
                if(string.IsNullOrWhiteSpace(allLines[curLine]))
                {
                    allLines.RemoveAt(curLine);
                }
                else
                {
                    break;
                }
            }

            return string.Join(Environment.NewLine, allLines);
        }

        /// <summary>
        /// Escapes Characters
        /// </summary>
        /// <param name="strValue">Code to escape</param>
        /// <param name="escapeCharacter">Escape character</param>
        /// <param name="charactersNeedingEscaping">Characters needing escaping</param>
        /// <param name="newlineCharacter">Character for a newline</param>
        /// <returns>Escaped code</returns>
        public static string EscapeCharacters(string strValue, string escapeCharacter, string charactersNeedingEscaping, string newlineCharacter)
        {
            string regex = string.Join("|", charactersNeedingEscaping.Select(c => Regex.Escape(c.ToString())));
            Regex characterRegex = new Regex(regex);
            strValue = characterRegex.Replace(strValue, m => {
                return escapeCharacter + m.Groups[0].Value;
            });

            if(!string.IsNullOrEmpty(newlineCharacter))
            {
                strValue = strValue.Replace(NewlineChar, newlineCharacter);
            }

            return strValue;
        }

        /// <summary>
        /// Builds a text preview for a text line
        /// </summary>
        /// <param name="text">Text to generate the preview for</param>
        /// <returns>Text Preview</returns>
        public static string BuildTextPreview(string text)
        {
            text = text.Replace(NewlineChar, "");
            if(text.Length > TextPreviewMaxLength)
            {
                text = text.Substring(0, TextPreviewMaxLength) + "...";
            }
            return text;
        }


        /// <summary>
        /// Creates a new placeholder
        /// </summary>
        /// <param name="placeholderName">Placeholder Name</param>
        /// <param name="localizer">String Localizer</param>
        /// <returns>Export Template Placeholder</returns>
        public static ExportTemplatePlaceholder CreatePlaceHolder(string placeholderName, IStringLocalizer localizer)
        {
            return new ExportTemplatePlaceholder {
                Name = placeholderName,
                Description = localizer["PlaceholderDesc_" + placeholderName].Value
            };
        }
    }
}