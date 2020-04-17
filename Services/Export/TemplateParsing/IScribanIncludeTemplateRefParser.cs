using System.Threading.Tasks;
using GoNorth.Data.Exporting;

namespace GoNorth.Services.Export.TemplateParsing
{
    /// <summary>
    /// Interface for template parser that check scriban include references
    /// </summary>
    public interface IScribanIncludeTemplateRefParser
    {
        /// <summary>
        /// Parses an export template for export snippets
        /// </summary>
        /// <param name="template">Template to parse</param>
        /// <returns>Task</returns>
        Task ParseExportTemplate(ExportTemplate template);
    }
}