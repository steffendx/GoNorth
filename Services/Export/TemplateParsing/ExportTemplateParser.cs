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
        /// Constructor
        /// </summary>
        /// <param name="exportSnippetParser">Export snippet parser to use</param>
        public ExportTemplateParser(IExportSnippetParser exportSnippetParser)
        {
            _exportSnippetParser = exportSnippetParser;
        }

        /// <summary>
        /// Parses an export template
        /// </summary>
        /// <param name="template">Template to parse</param>
        public void ParseExportTemplate(ExportTemplate template)
        {
            _exportSnippetParser.ParseExportTemplate(template);
        }
    }
}