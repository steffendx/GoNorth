using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Config;
using Microsoft.Extensions.Options;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.TaskManagement
{
    /// <summary>
    /// Task Number Mongo Db Access
    /// </summary>
    public class TaskNumberMongoDbAccess : BaseMongoDbAccess, ITaskNumberDbAccess
    {
        /// <summary>
        /// Collection Name of the Task numbers
        /// </summary>
        public const string TaskNumberCollectionName = "TaskNumber";

        /// <summary>
        /// Task Number Collection
        /// </summary>
        private IMongoCollection<TaskNumberCounter> _TaskNumberCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public TaskNumberMongoDbAccess(IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _TaskNumberCollection = _Database.GetCollection<TaskNumberCounter>(TaskNumberCollectionName);
        }

        /// <summary>
        /// Returns the next task number for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Next task number</returns>
        public async Task<int> GetNextTaskNumber(string projectId)
        {
            int nextTaskNumber;
            TaskNumberCounter counter = await _TaskNumberCollection.Find(n => n.ProjectId == projectId).FirstOrDefaultAsync();
            if(counter != null)
            {
                nextTaskNumber = counter.NextTaskNumber;
                ++counter.NextTaskNumber;
                await _TaskNumberCollection.ReplaceOneAsync(n => n.Id == counter.Id, counter);
            }
            else
            {
                counter = new TaskNumberCounter();
                counter.Id = Guid.NewGuid().ToString();
                counter.ProjectId = projectId;
                counter.NextTaskNumber = 2;

                await _TaskNumberCollection.InsertOneAsync(counter);

                nextTaskNumber = 1;
            }

            return nextTaskNumber;
        }

        /// <summary>
        /// Deletes the counter for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Task</returns>
        public async Task DeleteCounterForProject(string projectId)
        {
            await _TaskNumberCollection.DeleteOneAsync(n => n.ProjectId == projectId);
        }
    }
}