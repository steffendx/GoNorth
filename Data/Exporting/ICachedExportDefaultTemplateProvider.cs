using System.Collections.Generic;
using System.Threading.Tasks;

namespace GoNorth.Data.Exporting
{
    /// <summary>
    /// Interface for Reading Default Templates for Export Templates and caching them for the request
    /// </summary>
    public interface ICachedExportDefaultTemplateProvider
    {
        /// <summary>
        /// Returns the default export template by its type
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template, NULL if no saved template exists</returns>
        Task<ExportTemplate> GetDefaultTemplateByType(string projectId, TemplateType templateType);
    }
}