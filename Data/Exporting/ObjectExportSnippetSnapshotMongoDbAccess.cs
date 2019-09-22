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
    /// Object export snippet snapshot Mongo DB Access
    /// </summary>
    public class ObjectExportSnippetSnapshotMongoDbAccess : BaseMongoDbAccess, IObjectExportSnippetSnapshotDbAccess
    {
        /// <summary>
        /// Collection Name of the object export snippet snapshots
        /// </summary>
        public const string ObjectExportSnippetSnapshotCollectionName = "ObjectExportSnippetSnapshot";

        /// <summary>
        /// Object Export Snippet snapshot Collection
        /// </summary>
        private IMongoCollection<ObjectExportSnippet> _ObjectExportSnippetSnapshotCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public ObjectExportSnippetSnapshotMongoDbAccess(IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _ObjectExportSnippetSnapshotCollection = _Database.GetCollection<ObjectExportSnippet>(ObjectExportSnippetSnapshotCollectionName);
        }


        /// <summary>
        /// Returns the export snippet snapshots for an object
        /// </summary>
        /// <param name="objectId">Object Id</param>
        /// <returns>Export Snippet Snapshots</returns>
        public async Task<List<ObjectExportSnippet>> GetExportSnippetSnapshots(string objectId)
        {
            return await _ObjectExportSnippetSnapshotCollection.AsQueryable().Where(o => o.ObjectId == objectId).ToListAsync();
        }

        /// <summary>
        /// Creates an export snippet snapshot
        /// </summary>
        /// <param name="exportSnippet">Export snippet snapshot to create</param>
        /// <returns>Task</returns>
        public async Task CreateExportSnippetSnapshot(ObjectExportSnippet exportSnippet)
        {
            await _ObjectExportSnippetSnapshotCollection.InsertOneAsync(exportSnippet);
        }
        
        /// <summary>
        /// Deletes all export snippet snapshots of an object
        /// </summary>
        /// <param name="objectId">Id of the object to delete the snippet snapshots for</param>
        /// <returns>Task</returns>
        public async Task DeleteExportSnippetSnapshotsByObjectId(string objectId)
        {
            await _ObjectExportSnippetSnapshotCollection.DeleteManyAsync(t => t.ObjectId == objectId);
        }
    }
}