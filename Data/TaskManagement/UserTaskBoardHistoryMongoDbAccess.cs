using System;
using System.Threading.Tasks;
using GoNorth.Config;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.TaskManagement
{
    /// <summary>
    /// Database access for the history of opened task boards of a user
    /// </summary>
    public class UserTaskBoardHistoryMongoDbAccess : BaseMongoDbAccess, IUserTaskBoardHistoryDbAccess
    {
        /// <summary>
        /// Collection Name of the Task board user history
        /// </summary>
        public const string TaskBoardUserHistoryCollectionName = "TaskBoardUserHistory";

        /// <summary>
        /// Task board user history Collection
        /// </summary>
        private IMongoCollection<UserTaskBoardHistory> _UserTaskBoardHistoryCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public UserTaskBoardHistoryMongoDbAccess(IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _UserTaskBoardHistoryCollection = _Database.GetCollection<UserTaskBoardHistory>(TaskBoardUserHistoryCollectionName);
        }

        /// <summary>
        /// Returns the last open board for a user
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="userId">User Id</param>
        /// <returns>Id of the last board the user opened</returns>
        public async Task<string> GetLastOpenBoardForUser(string projectId, string userId)
        {
            UserTaskBoardHistory userTaskBoardHistory = await _UserTaskBoardHistoryCollection.Find(u => u.ProjectId == projectId && u.UserId == userId).FirstOrDefaultAsync();
            if(userTaskBoardHistory == null)
            {
                return string.Empty;
            }

            return userTaskBoardHistory.LastOpenBoardId;
        }

        /// <summary>
        /// Returns the last open board for a user
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="userId">User Id</param>
        /// <param name="boardId">Board Id</param>
        /// <returns>Id of the last board the user opened</returns>
        public async Task SetLastOpenBoardForUser(string projectId, string userId, string boardId)
        {
            UserTaskBoardHistory userTaskBoardHistory = await _UserTaskBoardHistoryCollection.Find(u => u.ProjectId == projectId && u.UserId == userId).FirstOrDefaultAsync();
            if(userTaskBoardHistory == null)
            {
                userTaskBoardHistory = new UserTaskBoardHistory();
                userTaskBoardHistory.Id = Guid.NewGuid().ToString();
                userTaskBoardHistory.UserId = userId;
                userTaskBoardHistory.ProjectId = projectId;
                userTaskBoardHistory.LastOpenBoardId = boardId;

                await _UserTaskBoardHistoryCollection.InsertOneAsync(userTaskBoardHistory);
            }
            else
            {
                userTaskBoardHistory.LastOpenBoardId = boardId;

                await _UserTaskBoardHistoryCollection.ReplaceOneAsync(u => u.Id == userTaskBoardHistory.Id, userTaskBoardHistory);
            }
        }

        /// <summary>
        /// Deletes the taskboard history for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Task</returns>
        public async Task DeleteUserTaskBoardHistoryForProject(string projectId)
        {
            await _UserTaskBoardHistoryCollection.DeleteManyAsync(u => u.ProjectId == projectId);
        }
    }
}