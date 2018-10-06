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
    /// Export Function Id Mongo DB Access
    /// </summary>
    public class ExportFunctionIdMongoDbAccess : BaseMongoDbAccess, IExportFunctionIdDbAccess
    {
        /// <summary>
        /// Collection Name of the export function id counters
        /// </summary>
        public const string ExportFunctionIdCounterCollectionName = "ExportFunctionIdCounter";

        /// <summary>
        /// Collection Name of the export function id counters
        /// </summary>
        public const string ExportFunctionIdCollectionName = "ExportFunctionId";

        /// <summary>
        /// Id Counter Collection
        /// </summary>
        private IMongoCollection<ExportFunctionIdCounter> _IdCounterCollection;
        
        /// <summary>
        /// Export Function Id Collection
        /// </summary>
        private IMongoCollection<ExportFunctionId> _ExportFunctionIdCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public ExportFunctionIdMongoDbAccess(IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _IdCounterCollection = _Database.GetCollection<ExportFunctionIdCounter>(ExportFunctionIdCounterCollectionName);
            _ExportFunctionIdCollection = _Database.GetCollection<ExportFunctionId>(ExportFunctionIdCollectionName);
        }

        /// <summary>
        /// Returns a new export function id for an object
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="objectId">Object Id</param>
        /// <returns>New export function id</returns>
        public async Task<int> GetNewExportFuntionIdForObject(string projectId, string objectId)
        {
            ExportFunctionIdCounter exportFunctionIdCounter = await _IdCounterCollection.Find(t => t.ProjectId == projectId && t.ObjectId == objectId).FirstOrDefaultAsync();
            if(exportFunctionIdCounter == null)
            {
                exportFunctionIdCounter = new ExportFunctionIdCounter();
                exportFunctionIdCounter.ProjectId = projectId;
                exportFunctionIdCounter.ObjectId = objectId;
                exportFunctionIdCounter.CurExportFunctionId = 0;
            }

            ++exportFunctionIdCounter.CurExportFunctionId;

            if(!string.IsNullOrEmpty(exportFunctionIdCounter.Id))
            {
                await _IdCounterCollection.ReplaceOneAsync(t => t.Id == exportFunctionIdCounter.Id, exportFunctionIdCounter);
            }
            else
            {
                exportFunctionIdCounter.Id = Guid.NewGuid().ToString();
                await _IdCounterCollection.InsertOneAsync(exportFunctionIdCounter);
            }

            return exportFunctionIdCounter.CurExportFunctionId;
        }

        /// <summary>
        /// Returns an existing export function id
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="objectId">Object Id</param>
        /// <param name="functionObjectId">Function object id</param>
        /// <returns>Export Function Id</returns>
        public async Task<ExportFunctionId> GetExportFunctionId(string projectId, string objectId, string functionObjectId)
        {
            return await _ExportFunctionIdCollection.Find(f => f.ProjectId == projectId && f.ObjectId == objectId && f.FunctionObjectId == functionObjectId).FirstOrDefaultAsync();
        }

        /// <summary>
        /// Saves a new export function id. The id must be set in the method.
        /// </summary>
        /// <param name="functionId">Function Id</param>
        /// <returns>Export Function Id</returns>
        public async Task<ExportFunctionId> SaveNewExportFunctionId(ExportFunctionId functionId)
        {
            functionId.Id = Guid.NewGuid().ToString();
            await _ExportFunctionIdCollection.InsertOneAsync(functionId);
            return functionId;
        }

        /// <summary>
        /// Deletes all export function ids for an object
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="objectId">Object Id</param>
        /// <returns>Task</returns>
        public async Task DeleteAllExportFunctionIdsForObject(string projectId, string objectId)
        {
            await _ExportFunctionIdCollection.DeleteManyAsync(f => f.ProjectId == projectId && f.ObjectId == objectId);
            await _IdCounterCollection.DeleteOneAsync(f => f.ProjectId == projectId && f.ObjectId == objectId);
        }
    }
}