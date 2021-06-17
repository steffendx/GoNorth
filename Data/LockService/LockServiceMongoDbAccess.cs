using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Config;
using GoNorth.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.LockService
{
    /// <summary>
    /// Role Mongo DB Access
    /// </summary>
    public class LockServiceMongoDbAccess : BaseMongoDbAccess, ILockServiceDbAccess
    {
        /// <summary>
        /// Collection Name of the locks
        /// </summary>
        public const string LockCollectionName = "Lock";

        /// <summary>
        /// Lock Collection
        /// </summary>
        private IMongoCollection<LockEntry> _LockCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public LockServiceMongoDbAccess(IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _LockCollection = _Database.GetCollection<LockEntry>(LockCollectionName);
        }

        /// <summary>
        /// Returns the person who has a lock on a resource, "" if no valid lock exists
        /// </summary>
        /// <param name="category">Category</param>
        /// <param name="id">Id of the resource</param>
        /// <returns>Id of the user who has a lock, "" if no lock exists</returns>
        public async Task<LockEntry> GetResourceLockEntry(string category, string id)
        {
            LockEntry existingLock = await _LockCollection.AsQueryable().Where(l => l.Category == category && l.ResourceId == id).FirstOrDefaultAsync();
            return existingLock;
        }

        /// <summary>
        /// Locks a resource
        /// </summary>
        /// <param name="category">Category</param>
        /// <param name="id">Id of the resource</param>
        /// <param name="userId">Id of the user who acquires the lock</param>
        /// <param name="externalUserId">Optional Id for an external user id</param>
        /// <param name="expireDate">Date at which  the lock expires</param>
        /// <returns>Task</returns>
        public async Task LockResource(string category, string id, string userId, string externalUserId, DateTimeOffset expireDate)
        {
            LockEntry existingLock = await GetResourceLockEntry(category, id);
            LockEntry lockEntry = new LockEntry
            {
                Category = category,
                ResourceId = id,
                UserId = userId,
                ExternalUserId = externalUserId,
                ExpireDate = expireDate
            };

            if(existingLock != null)
            {
                lockEntry.Id = existingLock.Id;
                await _LockCollection.ReplaceOneAsync(l => l.Id == existingLock.Id, lockEntry);
            }
            else
            {
                lockEntry.Id = Guid.NewGuid().ToString();
                await _LockCollection.InsertOneAsync(lockEntry);
            }
        }

        /// <summary>
        /// Deletes a lock by its id
        /// </summary>
        /// <param name="id">Id</param>
        /// <returns>Task</returns>
        public async Task DeleteLockById(string id)
        {
            await _LockCollection.DeleteOneAsync(l => l.Id == id);
        }

        /// <summary>
        /// Deletes all locks for a user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Task</returns>
        public async Task DeleteAllLocksOfUser(string userId)
        {
            await _LockCollection.DeleteManyAsync(l => l.UserId == userId);
        }

        /// <summary>
        /// Deletes all expired locks
        /// </summary>
        /// <returns>Task</returns>
        public async Task DeleteExpiredLocks()
        {
            DateTimeOffset refDate = DateTimeOffset.UtcNow.AddMinutes(-1);
            await _LockCollection.DeleteManyAsync(l => l.ExpireDate < refDate);
        }

        /// <summary>
        /// Returns all locks of a user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>Lock Entry</returns>
        public async Task<List<LockEntry>> GetAllLocksOfUser(string userId)
        {
            return await _LockCollection.AsQueryable().Where(l => l.UserId == userId).ToListAsync();
        }


        /// <summary>
        /// Creates the lock indices
        /// </summary>
        /// <returns>Task</returns>
        public async Task CreateLockIndices()
        {
            IndexKeysDefinitionBuilder<LockEntry> lockIndexBuilder = Builders<LockEntry>.IndexKeys;
            CreateIndexModel<LockEntry> categoryIndex = new CreateIndexModel<LockEntry>(lockIndexBuilder.Ascending(x => x.Category));
            await _LockCollection.Indexes.CreateOneAsync(categoryIndex);

            CreateIndexModel<LockEntry> resourceIndex = new CreateIndexModel<LockEntry>(lockIndexBuilder.Ascending(x => x.ResourceId));
            await _LockCollection.Indexes.CreateOneAsync(resourceIndex);
        }
    }
}