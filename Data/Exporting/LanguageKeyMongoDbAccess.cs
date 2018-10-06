using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Config;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.Exporting
{
    /// <summary>
    /// Language Key Mongo DB Access
    /// </summary>
    public class LanguageKeyMongoDbAccess : BaseMongoDbAccess, ILanguageKeyDbAccess
    {
        /// <summary>
        /// Collection Name of the language key id counters
        /// </summary>
        public const string LanguageKeyIdCounterCollectionName = "LanguageKeyIdCounter";

        /// <summary>
        /// Collection Name of the language keys counters
        /// </summary>
        public const string LanguageKeyCollectionName = "LanguageKey";

        /// <summary>
        /// Id Counter Collection
        /// </summary>
        private IMongoCollection<LanguageKeyIdCounter> _IdCounterCollection;
        
        /// <summary>
        /// Language Key Collection
        /// </summary>
        private IMongoCollection<LanguageKey> _LanguageKeyCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public LanguageKeyMongoDbAccess(IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _IdCounterCollection = _Database.GetCollection<LanguageKeyIdCounter>(LanguageKeyIdCounterCollectionName);
            _LanguageKeyCollection = _Database.GetCollection<LanguageKey>(LanguageKeyCollectionName);
        }

        /// <summary>
        /// Returns a new language key id for a group
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="groupId">Group Id</param>
        /// <returns>New Language Key Id</returns>
        public async Task<int> GetNewLanguageKeyIdForGroup(string projectId, string groupId)
        {
            LanguageKeyIdCounter languageIdCounter = await _IdCounterCollection.Find(t => t.ProjectId == projectId && t.GroupId == groupId).FirstOrDefaultAsync();
            if(languageIdCounter == null)
            {
                languageIdCounter = new LanguageKeyIdCounter();
                languageIdCounter.ProjectId = projectId;
                languageIdCounter.GroupId = groupId;
                languageIdCounter.CurLanguageKeyId = 0;
            }

            ++languageIdCounter.CurLanguageKeyId;

            if(!string.IsNullOrEmpty(languageIdCounter.Id))
            {
                await _IdCounterCollection.ReplaceOneAsync(t => t.Id == languageIdCounter.Id, languageIdCounter);
            }
            else
            {
                languageIdCounter.Id = Guid.NewGuid().ToString();
                await _IdCounterCollection.InsertOneAsync(languageIdCounter);
            }

            return languageIdCounter.CurLanguageKeyId;
        }

        /// <summary>
        /// Returns an existing language key
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="groupId">Group Id</param>
        /// <param name="langKeyRef">Language Key Reference</param>
        /// <returns>Language Key</returns>
        public async Task<LanguageKey> GetLanguageKey(string projectId, string groupId, string langKeyRef)
        {
            return await _LanguageKeyCollection.Find(f => f.ProjectId == projectId && f.GroupId == groupId && f.LangKeyRef == langKeyRef).FirstOrDefaultAsync();
        }

        /// <summary>
        /// Returns an existing language key by key
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="langKey">Language Key</param>
        /// <returns>Language Key</returns>
        public async Task<LanguageKey> GetLanguageKeyByKey(string projectId, string langKey)
        {
            return await _LanguageKeyCollection.Find(f => f.ProjectId == projectId && f.LangKey == langKey).FirstOrDefaultAsync();
        }

        /// <summary>
        /// Returns all language keys for a group
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="groupId">Group Id</param>
        /// <returns>Language keys for groups</returns>
        public async Task<List<LanguageKey>> GetLanguageKeysByGroupId(string projectId, string groupId)
        {
            return await _LanguageKeyCollection.Find(f => f.ProjectId == projectId && f.GroupId == groupId).ToListAsync();
        }

        /// <summary>
        /// Saves a new language key. The Id must be set in the method
        /// </summary>
        /// <param name="languageKey">Language Key</param>
        /// <returns>Language Key with filled id</returns>
        public async Task<LanguageKey> SaveNewLanguageKey(LanguageKey languageKey)
        {
            languageKey.Id = Guid.NewGuid().ToString();
            await _LanguageKeyCollection.InsertOneAsync(languageKey);
            return languageKey;
        }

        /// <summary>
        /// Updates the value of a language key
        /// </summary>
        /// <param name="id">Id of the language key</param>
        /// <param name="newValue">New Value</param>
        /// <returns>Task</returns>
        public async Task UpdateLanguageKeyValue(string id, string newValue)
        {
            await _LanguageKeyCollection.UpdateOneAsync(f => f.Id == id, Builders<LanguageKey>.Update.Set(p => p.Value, newValue));
        }

        /// <summary>
        /// Deletes all language keys in a group
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="groupId">Group Id</param>
        /// <returns>Task</returns>
        public async Task DeleteAllLanguageKeysInGroup(string projectId, string groupId)
        {
            await _LanguageKeyCollection.DeleteManyAsync(f => f.ProjectId == projectId && f.GroupId == groupId);
            await _IdCounterCollection.DeleteOneAsync(f => f.ProjectId == projectId && f.GroupId == groupId);
        }
    }
}