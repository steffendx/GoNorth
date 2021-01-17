using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Config;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.FlexFieldDatabase
{
    /// <summary>
    /// Flex Field Object Tag Mongo DB Access
    /// </summary>
    public class FlexFieldObjectTagBaseMongoDbAccess : BaseMongoDbAccess, IFlexFieldObjectTagDbAccess
    {
        /// <summary>
        /// Tag Collection
        /// </summary>
        protected IMongoCollection<FlexFieldObjectTag> _TagCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="collectionName">Mongo Db Collection Name</param>
        /// <param name="configuration">Configuration</param>
        public FlexFieldObjectTagBaseMongoDbAccess(string collectionName, IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _TagCollection = _Database.GetCollection<FlexFieldObjectTag>(collectionName);
        }

        /// <summary>
        /// Returns all available tags
        /// </summary>
        /// <param name="projectId">Id of the project</param>
        /// <returns>All available tags</returns>
        public async Task<List<string>> GetAllTags(string projectId)
        {
            return await _TagCollection.AsQueryable().Where(p => p.ProjectId == projectId).Select(t => t.Tag).ToListAsync();
        }

        /// <summary>
        /// Adds a tag
        /// </summary>
        /// <param name="projectId">Id of the project</param>
        /// <param name="tag">Tag to add </param>
        /// <returns>Task</returns>
        public async Task AddTag(string projectId, string tag)
        {
            FlexFieldObjectTag newTag = new FlexFieldObjectTag();
            newTag.Id = Guid.NewGuid().ToString();
            newTag.ProjectId = projectId;
            newTag.Tag = tag;
            await _TagCollection.InsertOneAsync(newTag);
        }

        /// <summary>
        /// Removes a tag
        /// </summary>
        /// <param name="projectId">Id of the project</param>
        /// <param name="tag">Tag to remove</param>
        /// <returns>Task</returns>
        public async Task DeleteTag(string projectId, string tag)
        {
            string searchTag = tag.ToLowerInvariant();
            await _TagCollection.DeleteOneAsync(t => t.ProjectId == projectId && t.Tag.ToLowerInvariant() == searchTag);
        }
        
        /// <summary>
        /// Sets the project id for legacy tags
        /// </summary>
        /// <param name="defaultProjectId">Id of the default project</param>
        /// <returns>Task</returns>
        public async Task SetProjectIdForLegacyTags(string defaultProjectId)
        {
            await _TagCollection.UpdateManyAsync(t => string.IsNullOrEmpty(t.ProjectId), Builders<FlexFieldObjectTag>.Update.Set(n => n.ProjectId, defaultProjectId));
        }
    }
}