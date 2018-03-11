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
    /// Task Board Mongo DB Access
    /// </summary>
    public class TaskBoardMongoDbAccess : BaseMongoDbAccess, ITaskBoardDbAccess
    {
        /// <summary>
        /// Collection Name of the Task Boards
        /// </summary>
        public const string TaskBoardCollectionName = "TaskBoard";

        /// <summary>
        /// Task Board Collection
        /// </summary>
        private IMongoCollection<TaskBoard> _TaskBoardCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public TaskBoardMongoDbAccess(IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _TaskBoardCollection = _Database.GetCollection<TaskBoard>(TaskBoardCollectionName);
        }

        /// <summary>
        /// Creates a new task board
        /// </summary>
        /// <param name="board">Board to create</param>
        /// <returns>Created board, with filled id</returns>
        public async Task<TaskBoard> CreateTaskBoard(TaskBoard board)
        {
            board.Id = Guid.NewGuid().ToString();
            await _TaskBoardCollection.InsertOneAsync(board);

            return board;
        }

        /// <summary>
        /// Gets a task board by the id
        /// </summary>
        /// <param name="id">Board Id</param>
        /// <returns>Board</returns>
        public async Task<TaskBoard> GetTaskBoardById(string id)
        {
            TaskBoard board = await _TaskBoardCollection.Find(p => p.Id == id).FirstOrDefaultAsync();
            return board;
        }

        /// <summary>
        /// Returns task boards
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <param name="searchClosed">true if closed task boards should be returned, else false</param>
        /// <returns>Task Boards</returns>
        private async Task<List<TaskBoard>> GetTaskBoards(string projectId, int start, int pageSize, bool searchClosed)
        {
            List<TaskBoard> taskBoards = await _TaskBoardCollection.AsQueryable().Where(b => b.ProjectId == projectId && b.IsClosed == searchClosed).OrderBy(b => b.PlannedStart).ThenBy(b => b.Name).Skip(start).Take(pageSize).Select(b => new TaskBoard {
                Id = b.Id,
                Name = b.Name,
                PlannedStart = b.PlannedStart,
                PlannedEnd = b.PlannedEnd,
                IsClosed = b.IsClosed
            }).ToListAsync();
            return taskBoards;
        }

        /// <summary>
        /// Returns task board counts
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="searchClosed">true if closed task boards should be returned, else false</param>
        /// <returns>Task Boards</returns>
        private async Task<int> GetTaskBoardCount(string projectId, bool searchClosed)
        {
            int count = await _TaskBoardCollection.AsQueryable().Where(b => b.ProjectId == projectId && b.IsClosed == searchClosed).CountAsync();
            return count;
        }

        /// <summary>
        /// Returns the open Task Boards for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Task Boards</returns>
        public async Task<List<TaskBoard>> GetOpenTaskBoards(string projectId, int start, int pageSize)
        {
            return await GetTaskBoards(projectId, start, pageSize, false);
        }

        /// <summary>
        /// Returns the count of open Task Boards for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Task Board Count</returns>
        public async Task<int> GetOpenTaskBoardCount(string projectId)
        {
            return await GetTaskBoardCount(projectId, false);
        }

        /// <summary>
        /// Returns the closed Task Boards for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Task Boards</returns>
        public async Task<List<TaskBoard>> GetClosedTaskBoards(string projectId, int start, int pageSize)
        {
            return await GetTaskBoards(projectId, start, pageSize, true);
        }

        /// <summary>
        /// Returns the count of closed Task Boards for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Task Board Count</returns>
        public async Task<int> GetClosedTaskBoardCount(string projectId)
        {
            return await GetTaskBoardCount(projectId, true);
        }

        /// <summary>
        /// Updates a task board
        /// </summary>
        /// <param name="board">Task Board</param>
        /// <returns>Task</returns>
        public async Task UpdateTaskBoard(TaskBoard board)
        {
            ReplaceOneResult result = await _TaskBoardCollection.ReplaceOneAsync(b => b.Id == board.Id, board);
        }

        /// <summary>
        /// Deletes a task board
        /// </summary>
        /// <param name="board">Board</param>
        /// <returns>Task</returns>
        public async Task DeleteTaskBoard(TaskBoard board)
        {
            DeleteResult result = await _TaskBoardCollection.DeleteOneAsync(b => b.Id == board.Id);
        }
        
    }
}