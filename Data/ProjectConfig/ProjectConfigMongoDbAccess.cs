using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Config;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.ProjectConfig
{
    /// <summary>
    /// Project Config Mongo DB Access
    /// </summary>
    public class ProjectConfigMongoDbAccess : BaseMongoDbAccess, IProjectConfigDbAccess
    {
        /// <summary>
        /// Collection Name of the JSON config
        /// </summary>
        public const string JsonConfigCollectionName = "ProjectJsonConfig";

        /// <summary>
        /// Collection Name of the project miscellaneous config
        /// </summary>
        public const string MiscConfigCollectionName = "ProjectMiscConfig";

        /// <summary>
        /// Config Collection
        /// </summary>
        private IMongoCollection<JsonConfigEntry> _JsonConfigCollection;

        /// <summary>
        /// Misc config Collection
        /// </summary>
        private IMongoCollection<MiscProjectConfig> _MiscConfigCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public ProjectConfigMongoDbAccess(IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _JsonConfigCollection = _Database.GetCollection<JsonConfigEntry>(JsonConfigCollectionName);
            _MiscConfigCollection = _Database.GetCollection<MiscProjectConfig>(MiscConfigCollectionName);
        }

        /// <summary>
        /// Creates a new JSON config entry
        /// </summary>
        /// <param name="configEntry">Config entry to create</param>
        /// <returns>Created config entry, with filled id</returns>
        public async Task<JsonConfigEntry> CreateJsonConfig(JsonConfigEntry configEntry)
        {
            configEntry.Id = Guid.NewGuid().ToString();
            await _JsonConfigCollection.InsertOneAsync(configEntry);

            return configEntry;
        }

        /// <summary>
        /// Updates a JSON config entry
        /// </summary>
        /// <param name="configEntry">Config entry to update</param>
        /// <returns>Task</returns>
        public async Task UpdateJsonConfig(JsonConfigEntry configEntry)
        {
            ReplaceOneResult result = await _JsonConfigCollection.ReplaceOneAsync(p => p.Id == configEntry.Id, configEntry);
        }

        /// <summary>
        /// Gets a JSON config by key
        /// </summary>
        /// <param name="projectId">Project id</param>
        /// <param name="key">Config key</param>
        /// <returns>Config</returns>
        public async Task<JsonConfigEntry> GetJsonConfigByKey(string projectId, string key)
        {
            JsonConfigEntry configEntry = await _JsonConfigCollection.Find(p => p.ProjectId == projectId && p.Key == key).FirstOrDefaultAsync();
            return configEntry;
        }


        /// <summary>
        /// Creates a new miscellaneous proejct config entry
        /// </summary>
        /// <param name="configEntry">Config entry to create</param>
        /// <returns>Created config entry, with filled id</returns>
        public async Task<MiscProjectConfig> CreateMiscConfig(MiscProjectConfig configEntry)
        {
            configEntry.Id = Guid.NewGuid().ToString();
            await _MiscConfigCollection.InsertOneAsync(configEntry);

            return configEntry;
        }

        /// <summary>
        /// Updates a miscellaneous config entry
        /// </summary>
        /// <param name="configEntry">Config entry to update</param>
        /// <returns>Task</returns>
        public async Task UpdateMiscConfig(MiscProjectConfig configEntry)
        {
            ReplaceOneResult result = await _MiscConfigCollection.ReplaceOneAsync(p => p.Id == configEntry.Id, configEntry);
        }

        /// <summary>
        /// Gets the miscellaneous config for a project
        /// </summary>
        /// <param name="projectId">Project id</param>
        /// <returns>Config</returns>
        public async Task<MiscProjectConfig> GetMiscConfig(string projectId)
        {
            MiscProjectConfig configEntry = await _MiscConfigCollection.Find(p => p.ProjectId == projectId).FirstOrDefaultAsync();
            return configEntry;
        }


        /// <summary>
        /// Deletes all configs for a project
        /// </summary>
        /// <param name="projectId">Project id</param>
        /// <returns>Task</returns>
        public async Task DeleteConfigsForProject(string projectId)
        {
            await _JsonConfigCollection.DeleteManyAsync(p => p.ProjectId == projectId);
        }
        

        /// <summary>
        /// Returns all JSON configs that were last modified by a user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>List of configs</returns>
        public async Task<List<JsonConfigEntry>> GetJsonConfigEntriesByModifiedUser(string userId)
        {
            return await _JsonConfigCollection.AsQueryable().Where(t => t.ModifiedBy == userId).ToListAsync();
        }
        
        /// <summary>
        /// Returns all miscellaneous configs that were last modified by a user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>List of configs</returns>
        public async Task<List<MiscProjectConfig>> GetMiscConfigEntriesByModifiedUser(string userId)
        {
            return await _MiscConfigCollection.AsQueryable().Where(t => t.ModifiedBy == userId).ToListAsync();
        }
    }
}