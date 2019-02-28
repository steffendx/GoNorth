using System.Collections.Generic;
using GoNorth.Data.TaskManagement;

namespace GoNorth.Services.TaskManagement
{
    /// <summary>
    /// Interface for returning default task types if no task types exist in the database
    /// </summary>
    public interface ITaskTypeDefaultProvider
    {
        /// <summary>
        /// Returns the default task types for task groups
        /// </summary>
        /// <returns>Default Task types for task groups</returns>
        List<GoNorthTaskType> GetDefaultTaskGroupTypes();

        /// <summary>
        /// Returns the default task types for tasks
        /// </summary>
        /// <returns>Default Task types for tasks</returns>
        List<GoNorthTaskType> GetDefaultTaskTypes();
    }
}