using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;

namespace GoNorth.Services.Export.Placeholder
{
    /// <summary>
    /// Interface for an Export Template Placeholder Rendering Engine
    /// </summary>
    public interface IExportTemplatePlaceholderRenderingEngine
    {
        /// <summary>
        /// Validates a template code
        /// </summary>
        /// <param name="code">Code to validate</param>
        /// <returns>Validated template code</returns>
        ExportTemplateValidationResult ValidateTemplate(string code);

        /// <summary>
        /// Fills the placeholders of a code
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <param name="code">Code to fill</param>
        /// <param name="data">Export Data</param>
        /// <returns>Export Fill Result</returns>
        Task<ExportPlaceholderFillResult> FillPlaceholders(TemplateType templateType, string code, ExportObjectData data);

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType);
    }
}