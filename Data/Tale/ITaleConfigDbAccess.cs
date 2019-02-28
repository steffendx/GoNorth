using System.Collections.Generic;
using System.Threading.Tasks;

namespace GoNorth.Data.Tale
{
    /// <summary>
    /// Interface for Database Access for Tale config
    /// </summary>
    public interface ITaleConfigDbAccess
    {
        /// <summary>
        /// Creates a new config entry
        /// </summary>
        /// <param name="configEntry">Config entry to create</param>
        /// <returns>Created config entry, with filled id</returns>
        Task<TaleConfigEntry> CreateConfig(TaleConfigEntry configEntry);

        /// <summary>
        /// Updates a config entry
        /// </summary>
        /// <param name="configEntry">Config entry to update</param>
        /// <returns>Task</returns>
        Task UpdateConfig(TaleConfigEntry configEntry);

        /// <summary>
        /// Gets a config by key
        /// </summary>
        /// <param name="projectId">Project id</param>
        /// <param name="key">Config key</param>
        /// <returns>Config</returns>
        Task<TaleConfigEntry> GetConfigByKey(string projectId, string key);

        /// <summary>
        /// Deletes all configs by project id
        /// </summary>
        /// <param name="projectId">Project id</param>
        /// <returns>Task</returns>
        Task DeleteConfigsForProject(string projectId);

                
        /// <summary>
        /// Returns all configs that were last modified by a user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>List of configs</returns>
        Task<List<TaleConfigEntry>> GetConfigEntriesByModifiedUser(string userId);
    }
}