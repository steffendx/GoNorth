using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;

namespace GoNorth.Services.Export.Placeholder
{
    /// <summary>
    /// Interface for Export Template Topic Placeholder Resolver
    /// </summary>
    public interface IExportTemplateTopicPlaceholderResolver
    {
        /// <summary>
        /// Sets the error message collection
        /// </summary>
        /// <param name="errorCollection">Error Collection</param>
        void SetErrorMessageCollection(ExportPlaceholderErrorCollection errorCollection);

        /// <summary>
        /// Fills the placeholders of a code
        /// </summary>
        /// <param name="code">Code to fill</param>
        /// <param name="data">Export Data</param>
        /// <returns>Filled Code</returns>
        Task<string> FillPlaceholders(string code, ExportObjectData data);

        /// <summary>
        /// Returns if the placeholder resolver is valid for a template type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>true if the template type is valid for the template type</returns>
        bool IsValidForTemplateType(TemplateType templateType);

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType);
    }
}