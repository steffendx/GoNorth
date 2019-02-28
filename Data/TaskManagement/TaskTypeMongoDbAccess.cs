using GoNorth.Config;
using Microsoft.Extensions.Options;

namespace GoNorth.Data.TaskManagement
{
    /// <summary>
    /// Task Type Mongo DB Access
    /// </summary>
    public class TaskTypeMongoDbAccess : TaskTypeBaseMongoDbAccess, ITaskTypeDbAccess
    {
        /// <summary>
        /// Collection Name of the Task Types
        /// </summary>
        public const string TaskTypeCollectionName = "TaskType";

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public TaskTypeMongoDbAccess(IOptions<ConfigurationData> configuration) : base(TaskTypeCollectionName, configuration)
        {
        }
    }
}