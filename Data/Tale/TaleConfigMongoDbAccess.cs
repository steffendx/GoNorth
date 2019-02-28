using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Config;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.Tale
{
    /// <summary>
    /// Tale Config Mongo DB Access
    /// </summary>
    public class TaleConfigMongoDbAccess : BaseMongoDbAccess, ITaleConfigDbAccess
    {
        /// <summary>
        /// Collection Name of the config
        /// </summary>
        public const string TaleConfigCollectionName = "TaleConfig";

        /// <summary>
        /// Config Collection
        /// </summary>
        private IMongoCollection<TaleConfigEntry> _ConfigCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public TaleConfigMongoDbAccess(IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _ConfigCollection = _Database.GetCollection<TaleConfigEntry>(TaleConfigCollectionName);
        }

        /// <summary>
        /// Creates a new config entry
        /// </summary>
        /// <param name="configEntry">Config entry to create</param>
        /// <returns>Created config entry, with filled id</returns>
        public async Task<TaleConfigEntry> CreateConfig(TaleConfigEntry configEntry)
        {
            configEntry.Id = Guid.NewGuid().ToString();
            await _ConfigCollection.InsertOneAsync(configEntry);

            return configEntry;
        }

        /// <summary>
        /// Updates a config entry
        /// </summary>
        /// <param name="configEntry">Config entry to update</param>
        /// <returns>Task</returns>
        public async Task UpdateConfig(TaleConfigEntry configEntry)
        {
            ReplaceOneResult result = await _ConfigCollection.ReplaceOneAsync(p => p.Id == configEntry.Id, configEntry);
        }

        /// <summary>
        /// Gets a config by key
        /// </summary>
        /// <param name="projectId">Project id</param>
        /// <param name="key">Config key</param>
        /// <returns>Config</returns>
        public async Task<TaleConfigEntry> GetConfigByKey(string projectId, string key)
        {
            TaleConfigEntry configEntry = await _ConfigCollection.Find(p => p.ProjectId == projectId && p.Key == key).FirstOrDefaultAsync();
            return configEntry;
        }

        /// <summary>
        /// Deletes all configs for a project
        /// </summary>
        /// <param name="projectId">Project id</param>
        /// <returns>Task</returns>
        public async Task DeleteConfigsForProject(string projectId)
        {
            await _ConfigCollection.DeleteManyAsync(p => p.ProjectId == projectId);
        }
        

        /// <summary>
        /// Returns all configs that were last modified by a user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>List of configs</returns>
        public async Task<List<TaleConfigEntry>> GetConfigEntriesByModifiedUser(string userId)
        {
            return await _ConfigCollection.AsQueryable().Where(t => t.ModifiedBy == userId).ToListAsync();
        }
    }
}