using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;

namespace GoNorth.Services.Export.Placeholder
{
    /// <summary>
    /// Interface for Export Template Placeholder Resolver
    /// </summary>
    public interface IExportTemplatePlaceholderResolver
    {
        /// <summary>
        /// Validates if a template is valid
        /// </summary>
        /// <param name="code">Code to validate</param>
        /// <param name="renderingEngine">Rendering engine that is used</param>
        /// <returns>Validated template</returns>
        ExportTemplateValidationResult ValidateTemplate(string code, ExportTemplateRenderingEngine renderingEngine);

        /// <summary>
        /// Fills the placeholders of a code
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <param name="code">Code to fill</param>
        /// <param name="data">Export Data</param>
        /// <param name="renderingEngine">Rendering Engine</param>
        /// <returns>Export Fill Result</returns>
        Task<ExportPlaceholderFillResult> FillPlaceholders(TemplateType templateType, string code, ExportObjectData data, ExportTemplateRenderingEngine renderingEngine);

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <param name="renderingEngine">Rendering Engine</param>
        /// <returns>Export Template Placeholder</returns>
        List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType, ExportTemplateRenderingEngine renderingEngine);
    }
}