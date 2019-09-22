using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Config;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.Exporting
{
    /// <summary>
    /// Object export snippet Mongo DB Access
    /// </summary>
    public class ObjectExportSnippetMongoDbAccess : BaseMongoDbAccess, IObjectExportSnippetDbAccess
    {
        /// <summary>
        /// Collection Name of the object export snippet
        /// </summary>
        public const string ObjectExportSnippetCollectionName = "ObjectExportSnippet";

        /// <summary>
        /// Object Export Snippet Collection
        /// </summary>
        private IMongoCollection<ObjectExportSnippet> _ObjectExportSnippetCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public ObjectExportSnippetMongoDbAccess(IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _ObjectExportSnippetCollection = _Database.GetCollection<ObjectExportSnippet>(ObjectExportSnippetCollectionName);
        }


        /// <summary>
        /// Returns an export snippet by id
        /// </summary>
        /// <param name="id">Id</param>
        /// <returns>Export Snippet</returns>
        public async Task<ObjectExportSnippet> GetExportSnippetById(string id)
        {
            return await _ObjectExportSnippetCollection.AsQueryable().Where(o => o.Id == id).FirstOrDefaultAsync();
        }

        /// <summary>
        /// Returns the export snippets for an object
        /// </summary>
        /// <param name="objectId">Object Id</param>
        /// <returns>Export Snippets</returns>
        public async Task<List<ObjectExportSnippet>> GetExportSnippets(string objectId)
        {
            return await _ObjectExportSnippetCollection.AsQueryable().Where(o => o.ObjectId == objectId).ToListAsync();
        }

        /// <summary>
        /// Creates an export snippet
        /// </summary>
        /// <param name="exportSnippet">Export snippet to create</param>
        /// <returns>Export Snippet with filled id</returns>
        public async Task<ObjectExportSnippet> CreateExportSnippet(ObjectExportSnippet exportSnippet)
        {
            exportSnippet.Id = Guid.NewGuid().ToString();

            await _ObjectExportSnippetCollection.InsertOneAsync(exportSnippet);

            return exportSnippet;
        }
        
        /// <summary>
        /// Updates an export snippet
        /// </summary>
        /// <param name="exportSnippet">Export snippet to update</param>
        /// <returns>Task</returns>
        public async Task UpdateExportSnippet(ObjectExportSnippet exportSnippet)
        {
            ReplaceOneResult result = await _ObjectExportSnippetCollection.ReplaceOneAsync(t => t.Id == exportSnippet.Id, exportSnippet);
            if(result.MatchedCount == 0)
            {
                throw new KeyNotFoundException();
            }
        }

        /// <summary>
        /// Deletes an export snippet
        /// </summary>
        /// <param name="exportSnippet">Export snippet to delete</param>
        /// <returns>Task</returns>
        public async Task DeleteExportSnippet(ObjectExportSnippet exportSnippet)
        {
            await _ObjectExportSnippetCollection.DeleteOneAsync(t => t.Id == exportSnippet.Id);
        }

        /// <summary>
        /// Deletes all export snippets of an object
        /// </summary>
        /// <param name="objectId">Id of the object to delete the snippets for</param>
        /// <returns>Task</returns>
        public async Task DeleteExportSnippetsByObjectId(string objectId)
        {
            await _ObjectExportSnippetCollection.DeleteManyAsync(t => t.ObjectId == objectId);
        }
        

        /// <summary>
        /// Returns all invalid export snippet objects
        /// </summary>
        /// <param name="objectIds">Object Ids</param>
        /// <param name="validSnippets">Valid snippet names</param>
        /// <returns>Invalid export snippets</returns>
        public async Task<List<ObjectExportSnippet>> GetInvalidExportSnippets(List<string> objectIds, List<string> validSnippets)
        {
            return await _ObjectExportSnippetCollection.AsQueryable().Where(o => objectIds.Contains(o.ObjectId) && !validSnippets.Contains(o.SnippetName)).Select(o => new ObjectExportSnippet {
                Id = o.Id,
                ObjectId = o.ObjectId
            }).ToListAsync();
        }

        /// <summary>
        /// Returns all export snippets that were last modified by a given user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Objects</returns>
        public async Task<List<ObjectExportSnippet>> GetExportSnippetByModifiedUser(string userId)
        {
            return await _ObjectExportSnippetCollection.AsQueryable().Where(o => o.ModifiedBy == userId).ToListAsync();
        }
    }
}