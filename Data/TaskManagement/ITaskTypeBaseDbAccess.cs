using System.Collections.Generic;
using System.Threading.Tasks;

namespace GoNorth.Data.TaskManagement
{
    /// <summary>
    /// Interface for Base Database Access for the task / task group types
    /// </summary>
    public interface ITaskTypeBaseDbAccess
    {
        /// <summary>
        /// Creates a task type
        /// </summary>
        /// <param name="taskType">Task type to create</param>
        /// <returns>Task type with filled id</returns>
        Task<GoNorthTaskType> CreateTaskType(GoNorthTaskType taskType);

        /// <summary>
        /// Updates a task type
        /// </summary>
        /// <param name="taskType">Task type to update</param>
        /// <returns>Task</returns>
        Task UpdateTaskType(GoNorthTaskType taskType);

        /// <summary>
        /// Deletes a task type
        /// </summary>
        /// <param name="taskType">Task type to delete</param>
        /// <returns>Task</returns>
        Task DeleteTaskType(GoNorthTaskType taskType);

        /// <summary>
        /// Returns the task types of a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Task types</returns>
        Task<List<GoNorthTaskType>> GetTaskTypes(string projectId);

        /// <summary>
        /// Returns a task type by its id
        /// </summary>
        /// <param name="id">Id of the task type</param>
        /// <returns>Task type</returns>
        Task<GoNorthTaskType> GetTaskTypeById(string id);

        /// <summary>
        /// Returns the default task type of a project
        /// </summary>
        /// <param name="projectId">Project id</param>
        /// <returns>Default Task type of the project</returns>
        Task<GoNorthTaskType> GetDefaultTaskType(string projectId);

        /// <summary>
        /// Returns all task types that were last modified by a user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>List of Task types</returns>
        Task<List<GoNorthTaskType>> GetTaskTypesByModifiedUser(string userId);

    }
}