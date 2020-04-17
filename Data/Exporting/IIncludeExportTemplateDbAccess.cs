using System.Collections.Generic;
using System.Threading.Tasks;

namespace GoNorth.Data.Exporting
{
    /// <summary>
    /// Interface for Database Access for include export templates
    /// </summary>
    public interface IIncludeExportTemplateDbAccess
    {
        /// <summary>
        /// Checks if an include template with a given name already exists
        /// </summary>
        /// <param name="projectId">Id of the project to search</param>
        /// <param name="existingId">Id of the existing template</param>
        /// <param name="name">Name to search</param>
        /// <returns>true if a different template with the same name exists, else false</returns>
        Task<bool> DoesIncludeTemplateExist(string projectId, string existingId, string name);

        /// <summary>
        /// Returns an include template by its Id
        /// </summary>
        /// <param name="id">Id of the template</param>
        /// <returns>Export Template</returns>
        Task<IncludeExportTemplate> GetIncludeTemplateById(string id);

        /// <summary>
        /// Returns a template by name
        /// </summary>
        /// <param name="projectId">Id of the project</param>
        /// <param name="templateName">Template name</param>
        /// <returns>Export Template</returns>
        Task<IncludeExportTemplate> GetIncludeTemplateByName(string projectId, string templateName);

        /// <summary>
        /// Returns the include templates for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="start">Start of the page</param>
        /// <param name="pageSize">Page size to load</param>
        /// <param name="locale">Locale used for the collation</param>
        /// <returns>List of include export templates</returns>
        Task<List<IncludeExportTemplate>> GetIncludeTemplates(string projectId, int start, int pageSize, string locale);

        /// <summary>
        /// Returns the count of include templates for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Count of include templates</returns>
        Task<int> GetIncludeTemplatesCount(string projectId);

        /// <summary>
        /// Creates an include template
        /// </summary>
        /// <param name="template">Template to create</param>
        /// <returns>Created template, with filled id</returns>
        Task<IncludeExportTemplate> CreateIncludeTemplate(IncludeExportTemplate template);

        /// <summary>
        /// Updates an include template
        /// </summary>
        /// <param name="template">Template to update</param>
        /// <returns>Task</returns>
        Task UpdateIncludeTemplate(IncludeExportTemplate template);

        /// <summary>
        /// Deletes an include template
        /// </summary>
        /// <param name="template">Template to delete</param>
        /// <returns>Task</returns>
        Task DeleteIncludeTemplate(IncludeExportTemplate template);
        
        /// <summary>
        /// Deletes all include templates of a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Task</returns>
        Task DeleteIncludeTemplatesForProject(string projectId);

        
        /// <summary>
        /// Returns all objects that were last modified by a given user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Objects</returns>
        Task<List<IncludeExportTemplate>> GetIncludeTemplatesByModifiedUser(string userId);

        /// <summary>
        /// Returns all recycle bin objects that were last modified by a given user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Objects</returns>
        Task<List<IncludeExportTemplate>> GetRecycleBinIncludeTemplatesByModifiedUser(string userId);

        /// <summary>
        /// Resets all recycle bin objects that were last modified by a given user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Objects</returns>
        Task ResetIncludeRecycleBinExportTemplatesByModifiedUser(string userId);
    }
}