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
        /// <returns>All available tags</returns>
        public async Task<List<string>> GetAllTags()
        {
            return await _TagCollection.AsQueryable().Select(t => t.Tag).ToListAsync();
        }

        /// <summary>
        /// Adds a tag
        /// </summary>
        /// <param name="tag">Tag to add </param>
        /// <returns>Task</returns>
        public async Task AddTag(string tag)
        {
            FlexFieldObjectTag newTag = new FlexFieldObjectTag();
            newTag.Id = Guid.NewGuid().ToString();
            newTag.Tag = tag;
            await _TagCollection.InsertOneAsync(newTag);
        }

        /// <summary>
        /// Removes a tag
        /// </summary>
        /// <param name="tag">Tag to remove</param>
        /// <returns>Task</returns>
        public async Task DeleteTag(string tag)
        {
            string searchTag = tag.ToLowerInvariant();
            await _TagCollection.DeleteOneAsync(t => t.Tag.ToLowerInvariant() == searchTag);
        }
    }
}