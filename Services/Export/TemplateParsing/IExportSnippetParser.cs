using System.Threading.Tasks;
using GoNorth.Data.Exporting;

namespace GoNorth.Services.Export.TemplateParsing
{
    /// <summary>
    /// Interface for Export Snippet Parser
    /// </summary>
    public interface IExportSnippetParser
    {
        /// <summary>
        /// Parses an export template for export snippets
        /// </summary>
        /// <param name="template">Template to parse</param>
        Task ParseExportTemplate(ExportTemplate template);
    }
}