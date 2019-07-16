using System.Collections.Generic;
using System.Threading.Tasks;

namespace GoNorth.Data.ProjectConfig
{
    /// <summary>
    /// Interface for Database Access for Project config
    /// </summary>
    public interface IProjectConfigDbAccess
    {
        /// <summary>
        /// Creates a new JSON config entry
        /// </summary>
        /// <param name="configEntry">Config entry to create</param>
        /// <returns>Created config entry, with filled id</returns>
        Task<JsonConfigEntry> CreateJsonConfig(JsonConfigEntry configEntry);

        /// <summary>
        /// Updates a JSON config entry
        /// </summary>
        /// <param name="configEntry">Config entry to update</param>
        /// <returns>Task</returns>
        Task UpdateJsonConfig(JsonConfigEntry configEntry);

        /// <summary>
        /// Gets a JSON config by key
        /// </summary>
        /// <param name="projectId">Project id</param>
        /// <param name="key">Config key</param>
        /// <returns>Config</returns>
        Task<JsonConfigEntry> GetJsonConfigByKey(string projectId, string key);


        /// <summary>
        /// Creates a new miscellaneous proejct config entry
        /// </summary>
        /// <param name="configEntry">Config entry to create</param>
        /// <returns>Created config entry, with filled id</returns>
        Task<MiscProjectConfig> CreateMiscConfig(MiscProjectConfig configEntry);

        /// <summary>
        /// Updates a miscellaneous config entry
        /// </summary>
        /// <param name="configEntry">Config entry to update</param>
        /// <returns>Task</returns>
        Task UpdateMiscConfig(MiscProjectConfig configEntry);

        /// <summary>
        /// Gets the miscellaneous config for a project
        /// </summary>
        /// <param name="projectId">Project id</param>
        /// <returns>Config</returns>
        Task<MiscProjectConfig> GetMiscConfig(string projectId);


        /// <summary>
        /// Deletes all configs by project id
        /// </summary>
        /// <param name="projectId">Project id</param>
        /// <returns>Task</returns>
        Task DeleteConfigsForProject(string projectId);

                
        /// <summary>
        /// Returns all JSON configs that were last modified by a user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>List of configs</returns>
        Task<List<JsonConfigEntry>> GetJsonConfigEntriesByModifiedUser(string userId);
        
        /// <summary>
        /// Returns all miscellaneous configs that were last modified by a user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>List of configs</returns>
        Task<List<MiscProjectConfig>> GetMiscConfigEntriesByModifiedUser(string userId);
    }
}