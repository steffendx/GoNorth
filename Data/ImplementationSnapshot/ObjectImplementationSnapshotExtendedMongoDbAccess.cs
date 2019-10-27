using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Config;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.ImplementationSnapshot
{
    /// <summary>
    /// Object implementation snapshot MongoDB access with extended functionality
    /// </summary>
    public class ObjectImplementationSnapshotExtendedMongoDbAccess<T> : ObjectImplementationSnapshotMongoDbAccess<T>, IObjectImplementationSnapshotExtendedDbAccess<T> where T:IImplementationSnapshotable,IHasModifiedData,new()
    {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="collectionName">Name of the object collection</param>
        /// <param name="configuration">Configuration</param>
        public ObjectImplementationSnapshotExtendedMongoDbAccess(string collectionName, IOptions<ConfigurationData> configuration) : base(collectionName, configuration)
        {
        }

        /// <summary>
        /// Returns all snapshots that were modified by a user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>Snapshots modified by the user</returns>
        public async Task<List<T>> GetSnapshotsModifiedByUsers(string userId)
        {
            return await _ObjectCollection.AsQueryable().Where(n => n.ModifiedBy == userId).ToListAsync();
        }

        /// <summary>
        /// Resets all snapshots that were last modified by a user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>Task</returns>
        public async Task ResetSnapshotsByModifiedUser(string userId)
        {
            await _ObjectCollection.UpdateManyAsync(n => n.ModifiedBy == userId, Builders<T>.Update.Set(n => n.ModifiedBy, Guid.Empty.ToString()).Set(n => n.ModifiedOn, DateTimeOffset.UtcNow));
        }

    }
}