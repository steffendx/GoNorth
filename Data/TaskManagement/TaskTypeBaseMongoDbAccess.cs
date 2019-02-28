using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Config;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.TaskManagement
{
    /// <summary>
    /// Task Type Base Mongo DB Access
    /// </summary>
    public class TaskTypeBaseMongoDbAccess : BaseMongoDbAccess
    {
        /// <summary>
        /// Task Type Collection
        /// </summary>
        private IMongoCollection<GoNorthTaskType> _TaskTypeCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="collectionName">Collection Name</param>
        /// <param name="configuration">Configuration</param>
        public TaskTypeBaseMongoDbAccess(string collectionName, IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _TaskTypeCollection = _Database.GetCollection<GoNorthTaskType>(collectionName);
        }

        /// <summary>
        /// Creates a task type
        /// </summary>
        /// <param name="taskType">Task type to create</param>
        /// <returns>Task type with filled id</returns>
        public async Task<GoNorthTaskType> CreateTaskType(GoNorthTaskType taskType)
        {
            taskType.Id = Guid.NewGuid().ToString();
            await _TaskTypeCollection.InsertOneAsync(taskType);

            return taskType;
        }

        /// <summary>
        /// Updates a task type
        /// </summary>
        /// <param name="taskType">Task type to update</param>
        /// <returns>Task</returns>
        public async Task UpdateTaskType(GoNorthTaskType taskType)
        {
            ReplaceOneResult result = await _TaskTypeCollection.ReplaceOneAsync(t => t.Id == taskType.Id, taskType);
        }

        /// <summary>
        /// Deletes a task type
        /// </summary>
        /// <param name="taskType">Task type to delete</param>
        /// <returns>Task</returns>
        public async Task DeleteTaskType(GoNorthTaskType taskType)
        {
            DeleteResult result = await _TaskTypeCollection.DeleteOneAsync(t => t.Id == taskType.Id);
        }

        /// <summary>
        /// Returns the task types of a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Task types</returns>
        public async Task<List<GoNorthTaskType>> GetTaskTypes(string projectId)
        {
            return await _TaskTypeCollection.AsQueryable().Where(t => t.ProjectId == projectId).ToListAsync();
        }

        /// <summary>
        /// Returns a task type by its id
        /// </summary>
        /// <param name="id">Id of the task type</param>
        /// <returns>Task type</returns>
        public async Task<GoNorthTaskType> GetTaskTypeById(string id)
        {
            return await _TaskTypeCollection.AsQueryable().Where(t => t.Id == id).FirstOrDefaultAsync();
        }

        /// <summary>
        /// Returns the default task type of a project
        /// </summary>
        /// <param name="projectId">Project id</param>
        /// <returns>Default Task type of the project</returns>
        public async Task<GoNorthTaskType> GetDefaultTaskType(string projectId)
        {
            return await _TaskTypeCollection.AsQueryable().Where(t => t.ProjectId == projectId && t.IsDefault).FirstOrDefaultAsync();
        }

        /// <summary>
        /// Returns all task types that were last modified by a user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>List of Task types</returns>
        public async Task<List<GoNorthTaskType>> GetTaskTypesByModifiedUser(string userId)
        {
            return await _TaskTypeCollection.AsQueryable().Where(t => t.ModifiedBy == userId).ToListAsync();
        }
    }
}