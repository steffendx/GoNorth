using System;
using System.Threading.Tasks;
using GoNorth.Config;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.ImplementationSnapshot
{
    /// <summary>
    /// Object implementation snapshot
    /// </summary>
    public class ObjectImplementationSnapshotMongoDbAccess<T> : BaseMongoDbAccess, IObjectImplementationSnapshotDbAccess<T> where T:IImplementationSnapshotable,new()
    {
        /// <summary>
        /// Object Collection
        /// </summary>
        protected IMongoCollection<T> _ObjectCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="collectionName">Name of the object collection</param>
        /// <param name="configuration">Configuration</param>
        public ObjectImplementationSnapshotMongoDbAccess(string collectionName, IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _ObjectCollection = _Database.GetCollection<T>(collectionName);
        }

        /// <summary>
        /// Returns an implementation snapshot of an object
        /// </summary>
        /// <param name="id">Id of the object</param>
        /// <returns>Implementation snapshot</returns>
        public async Task<T> GetSnapshotById(string id)
        {
            T snapshot = await _ObjectCollection.Find(n => n.Id == id).FirstOrDefaultAsync();
            return snapshot;
        }

        /// <summary>
        /// Saves a snapshot
        /// </summary>
        /// <param name="snapshot">Snapshot to save</param>
        /// <returns>Task</returns>
        public async Task SaveSnapshot(T snapshot)
        {
            if(string.IsNullOrEmpty(snapshot.Id))
            {
                throw new ArgumentNullException();
            }

            T existingSnapshot = await GetSnapshotById(snapshot.Id);
            if(existingSnapshot == null)
            {
                await _ObjectCollection.InsertOneAsync(snapshot);
            }
            else
            {
                await _ObjectCollection.ReplaceOneAsync(s => s.Id == snapshot.Id, snapshot);
            }
        }

        /// <summary>
        /// Deletes a snapshot
        /// </summary>
        /// <param name="id">Id of the snapshot</param>
        /// <returns>Task</returns>
        public async Task DeleteSnapshot(string id)
        {
            DeleteResult result = await _ObjectCollection.DeleteOneAsync(n => n.Id == id);
        }

    }
}