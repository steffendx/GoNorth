using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;

namespace GoNorth.Services.Export.TemplateParsing
{
    /// <summary>
    /// Class for parsing export snippets
    /// </summary>
    public class ExportSnippetParser : IExportSnippetParser
    {

        /// <summary>
        /// Parses an export template for export snippets
        /// </summary>
        /// <param name="template">Template to parse</param>
        public Task ParseExportTemplate(ExportTemplate template)
        {
            if(template == null || template.RenderingEngine != ExportTemplateRenderingEngine.Legacy || string.IsNullOrEmpty(template.Code) || (template.TemplateType != TemplateType.ObjectNpc && template.TemplateType != TemplateType.ObjectItem && template.TemplateType != TemplateType.ObjectSkill))
            {
                return Task.CompletedTask;
            }

            MatchCollection foundSnippets = ExportUtil.BuildPlaceholderRegex(ExportConstants.ExportSnippetRegex).Matches(template.Code);
            template.ExportSnippets = MapSnippets(foundSnippets);

            return Task.CompletedTask;
        }

        /// <summary>
        /// Maps a list of found snippets to a list of export snippets
        /// </summary>
        /// <param name="foundSnippets">Found snippets</param>
        /// <returns>List of found snippets</returns>
        private List<ExportTemplateSnippet> MapSnippets(MatchCollection foundSnippets)
        {
            if(foundSnippets == null || foundSnippets.Count == 0)
            {
                return new List<ExportTemplateSnippet>();
            }

            List<ExportTemplateSnippet> mappedSnippets = new List<ExportTemplateSnippet>();
            foreach(Match curMatch in foundSnippets)
            {
                if(!curMatch.Success || curMatch.Groups.Count < 2)
                {
                    continue;
                }

                string snippetName = curMatch.Groups[1].Value;
                if(mappedSnippets.Any(s => s.Name.ToLowerInvariant() == snippetName.ToLowerInvariant()))
                {
                    continue;
                }

                ExportTemplateSnippet mappedSnippet = new ExportTemplateSnippet();
                mappedSnippet.Name = snippetName;
                mappedSnippets.Add(mappedSnippet);
            }

            return mappedSnippets;
        }
    }
}