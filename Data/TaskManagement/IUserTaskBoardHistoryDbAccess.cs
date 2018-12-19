using System.Collections.Generic;
using System.Threading.Tasks;

namespace GoNorth.Data.TaskManagement
{
    /// <summary>
    /// Interface for Database Access for the history of opened task boards of a user
    /// </summary>
    public interface IUserTaskBoardHistoryDbAccess
    {
        /// <summary>
        /// Returns the last open board for a user
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="userId">User Id</param>
        /// <returns>Id of the last board the user opened</returns>
        Task<string> GetLastOpenBoardForUser(string projectId, string userId);

        /// <summary>
        /// Saves the last open board for a user
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="userId">User Id</param>
        /// <param name="boardId">Board Id</param>
        /// <returns>Task</returns>
        Task SetLastOpenBoardForUser(string projectId, string userId, string boardId);
        
        /// <summary>
        /// Deletes the taskboard history for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Task</returns>
        Task DeleteUserTaskBoardHistoryForProject(string projectId);

        /// <summary>
        /// Deletes the taskboard history for a user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>Task</returns>
        Task DeleteUserTaskBoardHistoryForUser(string userId);


        /// <summary>
        /// Returns all opened boards of a user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>Opened boards of the user</returns>
        Task<List<UserTaskBoardHistory>> GetAllOpenedBoardsOfUser(string userId);
    }
}