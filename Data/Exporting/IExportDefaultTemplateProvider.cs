using System.Collections.Generic;
using System.Threading.Tasks;

namespace GoNorth.Data.Exporting
{
    /// <summary>
    /// Interface for Reading Default Templates for Export Templates
    /// </summary>
    public interface IExportDefaultTemplateProvider
    {
        /// <summary>
        /// Returns all export templates by the category
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="category">Template Category</param>
        /// <returns>List of export templates</returns>
        Task<List<ExportTemplate>> GetDefaultTemplatesByCategory(string projectId, TemplateCategory category);

        /// <summary>
        /// Returns the default export template by its type
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template, NULL if no saved template exists</returns>
        Task<ExportTemplate> GetDefaultTemplateByType(string projectId, TemplateType templateType);

        /// <summary>
        /// Returns true if a template type is for a language file, else true
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>true if the template type is for a language file, else false</returns>
        bool IsTemplateTypeLanguage(TemplateType templateType);
    }
}