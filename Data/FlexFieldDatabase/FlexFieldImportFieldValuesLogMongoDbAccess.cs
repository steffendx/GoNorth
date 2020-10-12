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
    /// Flex Field field value log Mongo DB Access
    /// </summary>
    public class FlexFieldImportFieldValuesLogMongoDbAccess : BaseMongoDbAccess, IFlexFieldImportFieldValuesLogDbAccess
    {
        /// <summary>
        /// Object Collection
        /// </summary>
        protected IMongoCollection<FlexFieldImportFieldValuesResultLog> _LogCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="collectionName">Name of the object collection</param>
        /// <param name="configuration">Configuration</param>
        public FlexFieldImportFieldValuesLogMongoDbAccess(string collectionName, IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _LogCollection = _Database.GetCollection<FlexFieldImportFieldValuesResultLog>(collectionName);
        }

        /// <summary>
        /// Creates an export log
        /// </summary>
        /// <param name="importLog">Import log to save</param>
        /// <returns>Created log, with filled id</returns>
        public async Task<FlexFieldImportFieldValuesResultLog> CreateImportLog(FlexFieldImportFieldValuesResultLog importLog)
        {
            importLog.Id = Guid.NewGuid().ToString();
            await _LogCollection.InsertOneAsync(importLog);

            return importLog;
        }

        /// <summary>
        /// Returns an import log by id
        /// </summary>
        /// <param name="id">Log id</param>
        /// <returns>Import log</returns>
        public async Task<FlexFieldImportFieldValuesResultLog> GetImportLogById(string id)
        {
            FlexFieldImportFieldValuesResultLog importLog = await _LogCollection.Find(n => n.Id == id).FirstOrDefaultAsync();
            return importLog;
        }

        /// <summary>
        /// Returns the import logs for a project without details
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Import logs</returns>
        public async Task<List<FlexFieldImportFieldValuesResultLog>> GetImportLogsByProject(string projectId, int start, int pageSize)
        {
            List<FlexFieldImportFieldValuesResultLog> logs = await _LogCollection.Find(n => n.ProjectId == projectId).SortByDescending(n => n.ModifiedOn).Skip(start).Limit(pageSize).Project(l => new FlexFieldImportFieldValuesResultLog{
                Id = l.Id,
                ProjectId = l.ProjectId,
                ModifiedOn = l.ModifiedOn,
                FileName = l.FileName
            }).ToListAsync();
            return logs;
        }

        /// <summary>
        /// Returns the count of import logs for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Import logs Count</returns>
        public async Task<int> GetImportLogsByProjectCount(string projectId)
        {
            return (int)(await _LogCollection.Find(n => n.ProjectId == projectId).CountDocumentsAsync());
        }

                
        /// <summary>
        /// Returns all log that were last modified by a given user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Objects</returns>
        public async Task<List<FlexFieldImportFieldValuesResultLog>> GetImportLogsByModifiedUser(string userId)
        {
            return await _LogCollection.AsQueryable().Where(n => n.ModifiedBy == userId).ToListAsync();
        }
        
        /// <summary>
        /// Resets all logs that were modified by a user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Task</returns>
        public async Task ResetImportLogsByModifiedUser(string userId)
        {
            await _LogCollection.UpdateManyAsync(n => n.ModifiedBy == userId, Builders<FlexFieldImportFieldValuesResultLog>.Update.Set(n => n.ModifiedBy, Guid.Empty.ToString()).Set(n => n.ModifiedOn, DateTimeOffset.UtcNow));
        }
    }
}