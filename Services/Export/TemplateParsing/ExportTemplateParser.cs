using System.Threading.Tasks;
using GoNorth.Data.Exporting;

namespace GoNorth.Services.Export.TemplateParsing
{
    /// <summary>
    /// Class to parse export tempaltes
    /// </summary>
    public class ExportTemplateParser : IExportTemplateParser
    {
        /// <summary>
        /// Export Snippet parser
        /// </summary>
        private readonly IExportSnippetParser _exportSnippetParser;

        /// <summary>
        /// Scriban export snippet parser
        /// </summary>
        private readonly IScribanExportSnippetParser _scribanExportSnippetParser;

        /// <summary>
        /// Template parser to check for referenced include templates
        /// </summary>
        private readonly IScribanIncludeTemplateRefParser _scribanIncludeTemplateRefParser;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="exportSnippetParser">Export snippet parser to use</param>
        /// <param name="scribanExportSnippetParser">Export snippet parser for scriban templates</param>
        /// <param name="scribanIncludeTemplateRefParser">Template parser to check for referenced include templates</param>
        public ExportTemplateParser(IExportSnippetParser exportSnippetParser, IScribanExportSnippetParser scribanExportSnippetParser, IScribanIncludeTemplateRefParser scribanIncludeTemplateRefParser)
        {
            _exportSnippetParser = exportSnippetParser;
            _scribanExportSnippetParser = scribanExportSnippetParser;
            _scribanIncludeTemplateRefParser = scribanIncludeTemplateRefParser;
        }

        /// <summary>
        /// Parses an export template
        /// </summary>
        /// <param name="template">Template to parse</param>
        /// <returns>Task</returns>
        public async Task ParseExportTemplate(ExportTemplate template)
        {
            await _exportSnippetParser.ParseExportTemplate(template);
            await _scribanExportSnippetParser.ParseExportTemplate(template);
            await _scribanIncludeTemplateRefParser.ParseExportTemplate(template);
        }
    }
}