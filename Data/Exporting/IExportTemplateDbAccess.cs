using System.Collections.Generic;
using System.Threading.Tasks;

namespace GoNorth.Data.Exporting
{
    /// <summary>
    /// Interface for Database Access for Export Templates
    /// </summary>
    public interface IExportTemplateDbAccess
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
        /// Returns the customized export template by the object id
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="customizedObjectId">Customized object id</param>
        /// <returns>Export Template, NULL if no template exists</returns>
        Task<ExportTemplate> GetTemplateByCustomizedObjectId(string projectId, string customizedObjectId);

        /// <summary>
        /// Returns all export templates for a template type which are associated to an object
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Customized object export templates</returns>
        Task<List<ExportTemplate>> GetCustomizedObjectTemplatesByType(TemplateType templateType);
        
        /// <summary>
        /// Creates a template
        /// </summary>
        /// <param name="template">Template to create</param>
        /// <returns>Created template, with filled id</returns>
        Task<ExportTemplate> CreateTemplate(ExportTemplate template);

        /// <summary>
        /// Updates a template
        /// </summary>
        /// <param name="template">Template to update</param>
        /// <returns>Task</returns>
        Task UpdateTemplate(ExportTemplate template);

        /// <summary>
        /// Deletes a template
        /// </summary>
        /// <param name="template">Template to delete</param>
        /// <returns>Task</returns>
        Task DeleteTemplate(ExportTemplate template);
        
        /// <summary>
        /// Deletes all templates of a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Task</returns>
        Task DeleteTemplatesForProject(string projectId);

        
        /// <summary>
        /// Returns all objects that were last modified by a given user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Objects</returns>
        Task<List<ExportTemplate>> GetExportTemplatesByModifiedUser(string userId);

        /// <summary>
        /// Returns all recycle bin objects that were last modified by a given user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Objects</returns>
        Task<List<ExportTemplate>> GetRecycleBinExportTemplatesByModifiedUser(string userId);

        /// <summary>
        /// Resets all recycle bin objects that were last modified by a given user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Objects</returns>
        Task ResetRecycleBinExportTemplatesByModifiedUser(string userId);
    }
}