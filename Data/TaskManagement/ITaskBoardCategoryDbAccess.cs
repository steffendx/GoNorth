using System.Collections.Generic;
using System.Threading.Tasks;

namespace GoNorth.Data.TaskManagement
{
    /// <summary>
    /// Interface for Database Access for Task Board Categories
    /// </summary>
    public interface ITaskBoardCategoryDbAccess
    {
        /// <summary>
        /// Creates a new task board category
        /// </summary>
        /// <param name="category">Category to create</param>
        /// <returns>Created category, with filled id</returns>
        Task<TaskBoardCategory> CreateTaskBoardCategory(TaskBoardCategory category);

        /// <summary>
        /// Gets a task board category by the id
        /// </summary>
        /// <param name="id">Board category Id</param>
        /// <returns>Board category</returns>
        Task<TaskBoardCategory> GetTaskBoardCategoryById(string id);

        /// <summary>
        /// Returns the task board categories
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>All task board categories</returns>
        Task<List<TaskBoardCategory>> GetTaskBoardCategories(string projectId);

        /// <summary>
        /// Updates a task board category
        /// </summary>
        /// <param name="category">Task Board category</param>
        /// <returns>Task</returns>
        Task UpdateTaskBoardCategory(TaskBoardCategory category);

        /// <summary>
        /// Deletes a task board category
        /// </summary>
        /// <param name="category">Task Board category</param>
        /// <returns>Task</returns>
        Task DeleteTaskBoardCategory(TaskBoardCategory category);
                        

        /// <summary>
        /// Returns all taskboard categories that were last modified by a user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>List of Task Boards categories</returns>
        Task<List<TaskBoardCategory>> GetTaskBoardCategoriesByModifiedUser(string userId);
    }
}