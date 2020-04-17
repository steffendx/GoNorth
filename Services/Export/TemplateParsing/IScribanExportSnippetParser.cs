using System.Threading.Tasks;
using GoNorth.Data.Exporting;

namespace GoNorth.Services.Export.TemplateParsing
{
    /// <summary>
    /// Interface for Scriban Export Snippet Parser
    /// </summary>
    public interface IScribanExportSnippetParser
    {
        /// <summary>
        /// Parses an export template for export snippets
        /// </summary>
        /// <param name="template">Template to parse</param>
        /// <returns>Task</returns>
        Task ParseExportTemplate(ExportTemplate template);
    }
}