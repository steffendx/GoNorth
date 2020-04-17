using System.Threading.Tasks;
using GoNorth.Data.Exporting;

namespace GoNorth.Services.Export.TemplateParsing
{
    /// <summary>
    /// Interface for Export Template Parser
    /// </summary>
    public interface IExportTemplateParser
    {
        /// <summary>
        /// Parses an export template
        /// </summary>
        /// <param name="template">Template to parse</param>
        /// <returns>Task</returns>
        Task ParseExportTemplate(ExportTemplate template);
    }
}