using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Scriban;
using Scriban.Runtime;
using Scriban.Syntax;

namespace GoNorth.Services.Export.TemplateParsing
{
    /// <summary>
    /// Class for parsing scriban export snippets
    /// </summary>
    public class ScribanExportSnippetParser : IScribanExportSnippetParser
    {
        /// <summary>
        /// Parses an export template for export snippets
        /// </summary>
        /// <param name="template">Template to parse</param>
        public Task ParseExportTemplate(ExportTemplate template)
        {
            if(template == null || template.RenderingEngine != ExportTemplateRenderingEngine.Scriban || string.IsNullOrEmpty(template.Code) || (template.TemplateType != TemplateType.ObjectNpc && template.TemplateType != TemplateType.ObjectItem && template.TemplateType != TemplateType.ObjectSkill))
            {
                return Task.CompletedTask;
            }

            template.ExportSnippets = ParseSnippets(template);
            return Task.CompletedTask;
        }

        /// <summary>
        /// Parses the snippets of a template
        /// </summary>
        /// <param name="template">Template to parse</param>
        /// <returns>List of found snippets</returns>
        private List<ExportTemplateSnippet> ParseSnippets(ExportTemplate template)
        {
            string snippetRegexFormat = string.Format("(\\s|^){0}\\.{1}\\.(.*?)\\.({2}|{3}|{4})", ExportConstants.ScribanExportSnippetsObjectKey, StandardMemberRenamer.Rename(nameof(ScribanExportSnippetsData.Snippets)),
                                                        StandardMemberRenamer.Rename(nameof(ScribanExportSnippet.InitialFunction)), StandardMemberRenamer.Rename(nameof(ScribanExportSnippet.AdditionalFunctions)),
                                                        StandardMemberRenamer.Rename(nameof(ScribanExportSnippet.AllFunctions)));
            Regex exportSnippetRegex = new Regex(snippetRegexFormat, RegexOptions.Multiline);

            Template parsedTemplate = Template.Parse(template.Code);
            
            List<ExportTemplateSnippet> snippets = new List<ExportTemplateSnippet>();
            List<ScriptStatement> statementsToCheck = ScribanStatementExtractor.ExtractPlainNonTextStatements(parsedTemplate);
            foreach(ScriptStatement curStatement in statementsToCheck)
            {
                if(curStatement is ScriptRawStatement)
                {
                    continue;
                }

                string statement = curStatement.ToString();
                MatchCollection snippetMatches = exportSnippetRegex.Matches(statement);
                if(!snippetMatches.Any())
                {
                    continue;
                }

                AddNewSnippets(snippets, snippetMatches);
            }

            return snippets;
        }

        /// <summary>
        /// Adds new snippets to a list of export snippets
        /// </summary>
        /// <param name="snippets">Target snippet array</param>
        /// <param name="snippetMatches">Snippet Matches</param>
        private void AddNewSnippets(List<ExportTemplateSnippet> snippets, MatchCollection snippetMatches)
        {
            foreach(Match curMatch in snippetMatches)
            {
                if(!curMatch.Success || curMatch.Groups.Count < 3)
                {
                    continue;
                }

                string snippetName = curMatch.Groups[2].Value;
                if(snippets.Any(s => s.Name.ToLowerInvariant() == snippetName.ToLowerInvariant()))
                {
                    continue;
                }

                ExportTemplateSnippet mappedSnippet = new ExportTemplateSnippet();
                mappedSnippet.Name = snippetName;
                snippets.Add(mappedSnippet);
            }
        }
    }
}