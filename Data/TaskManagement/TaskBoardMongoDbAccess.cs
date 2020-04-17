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
        /// Builds an page search queryable
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="searchClosed">true if closed task boards should be returned, else false</param>
        /// <param name="locale">Locale used for the collation</param>
        /// <returns>Page Queryable</returns>
        private IFindFluent<TaskBoard, TaskBoard> BuildTaskBoardQueryable(string projectId, bool searchClosed, string locale)
        {
            return _TaskBoardCollection.Find(b => b.ProjectId == projectId && b.IsClosed == searchClosed, new FindOptions {
                Collation = new Collation(locale, null, CollationCaseFirst.Off, CollationStrength.Primary)
            });
        }

        /// <summary>
        /// Returns task boards
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <param name="searchClosed">true if closed task boards should be returned, else false</param>
        /// <param name="locale">Locale used for the collation</param>
        /// <returns>Task Boards</returns>
        private async Task<List<TaskBoard>> GetTaskBoards(string projectId, int start, int pageSize, bool searchClosed, string locale)
        {
            List<TaskBoard> taskBoards = await BuildTaskBoardQueryable(projectId, searchClosed, locale).SortBy(b => b.PlannedStart).ThenBy(b => b.Name).Skip(start).Limit(pageSize).Project(b => new TaskBoard {
                Id = b.Id,
                Name = b.Name,
                CategoryId = b.CategoryId,
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
        /// <param name="locale">Locale used for the collation</param>
        /// <returns>Task Boards</returns>
        private async Task<int> GetTaskBoardCount(string projectId, bool searchClosed, string locale)
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
        /// <param name="locale">Locale used for the collation</param>
        /// <returns>Task Boards</returns>
        public async Task<List<TaskBoard>> GetOpenTaskBoards(string projectId, int start, int pageSize, string locale)
        {
            return await GetTaskBoards(projectId, start, pageSize, false, locale);
        }

        /// <summary>
        /// Returns the count of open Task Boards for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="locale">Locale used for the collation</param>
        /// <returns>Task Board Count</returns>
        public async Task<int> GetOpenTaskBoardCount(string projectId, string locale)
        {
            return await GetTaskBoardCount(projectId, false, locale);
        }

        /// <summary>
        /// Returns the closed Task Boards for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <param name="locale">Locale used for the collation</param>
        /// <returns>Task Boards</returns>
        public async Task<List<TaskBoard>> GetClosedTaskBoards(string projectId, int start, int pageSize, string locale)
        {
            return await GetTaskBoards(projectId, start, pageSize, true, locale);
        }

        /// <summary>
        /// Returns the count of closed Task Boards for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="locale">Locale used for the collation</param>
        /// <returns>Task Board Count</returns>
        public async Task<int> GetClosedTaskBoardCount(string projectId, string locale)
        {
            return await GetTaskBoardCount(projectId, true, locale);
        }

        /// <summary>
        /// Returns all task boards
        /// </summary>
        /// <returns>All task boards</returns>
        public async Task<List<TaskBoard>> GetAllTaskBoards()
        {
            return await _TaskBoardCollection.AsQueryable().ToListAsync();
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
        

        /// <summary>
        /// Returns all taskboards that were last modified by a user or contain a task modified by the user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>List of Task Boards</returns>
        public async Task<List<TaskBoard>> GetTaskBoardsByModifiedUser(string userId)
        {
            return await _TaskBoardCollection.AsQueryable().Where(b => b.ModifiedBy == userId || b.TaskGroups.Any(t => t.ModifiedBy == userId || t.Tasks.Any(ta => ta.ModifiedBy == userId))).ToListAsync();
        }

        /// <summary>
        /// Returns all taskboards that have a task or task group assigned to a user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>List of Taskboards</returns>
        public async Task<List<TaskBoard>> GetAllTaskBoardsByAssignedUser(string userId)
        {
            return await _TaskBoardCollection.AsQueryable().Where(b => b.TaskGroups.Any(t => t.AssignedTo == userId || t.Tasks.Any(ta => ta.AssignedTo == userId))).ToListAsync();
        }

        /// <summary>
        /// Returns all taskboards that are using a task type
        /// </summary>
        /// <param name="taskTypeId">Task type Id</param>
        /// <returns>List of Taskboards</returns>
        public async Task<List<TaskBoard>> GetAllTaskBoardsUsingTaskType(string taskTypeId)
        {
            return await _TaskBoardCollection.AsQueryable().Where(b => b.TaskGroups.Any(t => t.TaskTypeId == taskTypeId || t.Tasks.Any(ta => ta.TaskTypeId == taskTypeId))).ToListAsync();
        }

        /// <summary>
        /// Returns ture if any task board uses a task board category
        /// </summary>
        /// <param name="categoryId">Id of the category</param>
        /// <returns>True if any task board uses the category</returns>
        public async Task<bool> AnyTaskBoardUsingCategory(string categoryId)
        {
            return await _TaskBoardCollection.AsQueryable().Where(b => b.CategoryId == categoryId).AnyAsync();
        }

        /// <summary>
        /// Returns true if any task board has a task group without a task type
        /// </summary>
        /// <param name="projectId">Id of the project</param>
        /// <returns>true if any task board has a task group without a task type</returns>
        public async Task<bool> AnyTaskBoardHasTaskGroupsWithoutType(string projectId)
        {
            return await _TaskBoardCollection.AsQueryable().Where(b => b.ProjectId == projectId && b.TaskGroups.Any(t => string.IsNullOrEmpty(t.TaskTypeId))).AnyAsync();
        }

        /// <summary>
        /// Returns true if any task board has a task group or task without a task type
        /// </summary>
        /// <param name="projectId">Id of the project</param>
        /// <returns>true if any task board has a task group or task without a task type</returns>
        public async Task<bool> AnyTaskBoardHasTasksWithoutType(string projectId)
        {
            return await _TaskBoardCollection.AsQueryable().Where(b => b.ProjectId == projectId && b.TaskGroups.Any(t => t.Tasks.Any(ta => string.IsNullOrEmpty(ta.TaskTypeId)))).AnyAsync();
        }

        /// <summary>
        /// Resets the reference to a category on all boards
        /// </summary>
        /// <param name="categoryId">Id of the category</param>
        /// <returns>Task</returns>
        public async Task ResetCategoryReference(string categoryId)
        {
            await _TaskBoardCollection.UpdateManyAsync(Builders<TaskBoard>.Filter.Eq(b => b.CategoryId, categoryId), Builders<TaskBoard>.Update.Set(p => p.CategoryId, null));
        }
    }
}