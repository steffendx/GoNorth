using GoNorth.Config;
using Microsoft.Extensions.Options;

namespace GoNorth.Data.TaskManagement
{
    /// <summary>
    /// Task Group Type Mongo DB Access
    /// </summary>
    public class TaskGroupTypeMongoDbAccess : TaskTypeBaseMongoDbAccess, ITaskGroupTypeDbAccess
    {
        /// <summary>
        /// Collection Name of the Task Group Types
        /// </summary>
        public const string TaskGroupTypeCollectionName = "TaskGroupType";

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public TaskGroupTypeMongoDbAccess(IOptions<ConfigurationData> configuration) : base(TaskGroupTypeCollectionName, configuration)
        {
        }
    }
}