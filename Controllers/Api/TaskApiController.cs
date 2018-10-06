using System.Threading.Tasks;
using GoNorth.Data.Kortisto;
using GoNorth.Services.Timeline;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Identity;
using GoNorth.Data.User;
using GoNorth.Data.Tale;
using System.Collections.Generic;
using System.Net;
using GoNorth.Data.NodeGraph;
using GoNorth.Extensions;
using GoNorth.Data.TaskManagement;
using GoNorth.Data.Project;
using System;
using Microsoft.Extensions.Localization;
using System.Linq;
using Microsoft.AspNetCore.Http;
using System.IO;
using GoNorth.Services.TaskManagement;
using GoNorth.Services.Security;

namespace GoNorth.Controllers.Api
{
    /// <summary>
    /// Task Api controller
    /// </summary>
    [Authorize(Roles = RoleNames.Task)]
    [Route("/api/[controller]/[action]")]
    public class TaskApiController : Controller
    {
        /// <summary>
        /// Task Board Query Result
        /// </summary>
        public class TaskBoardQueryResult
        {
            /// <summary>
            /// true if there are more boards to query, else false
            /// </summary>
            public bool HasMore { get; set; }

            /// <summary>
            /// Boards
            /// </summary>
            public IList<TaskBoard> Boards { get; set; }
        }


        /// <summary>
        /// Task Board Db Access
        /// </summary>
        private readonly ITaskBoardDbAccess _taskBoardDbAccess;

        /// <summary>
        /// Task Number Db Access
        /// </summary>
        private readonly ITaskNumberDbAccess _taskNumberDbAccess;

        /// <summary>
        /// User Task Board History Db Access
        /// </summary>
        private readonly IUserTaskBoardHistoryDbAccess _userTaskBoardHistoryDbAccess;

        /// <summary>
        /// Project Db Access
        /// </summary>
        private readonly IProjectDbAccess _projectDbAccess;

        /// <summary>
        /// Task Image Access
        /// </summary>
        private readonly ITaskImageAccess _taskImageAccess;

        /// <summary>
        /// Task Image Parser
        /// </summary>
        private readonly ITaskImageParser _taskImageParser;

        /// <summary>
        /// Timeline Service
        /// </summary>
        private readonly ITimelineService _timelineService;

        /// <summary>
        /// User Manager
        /// </summary>
        private readonly UserManager<GoNorthUser> _userManager;

        /// <summary>
        /// Xss Checker
        /// </summary>
        private readonly IXssChecker _xssChecker;

        /// <summary>
        /// Logger
        /// </summary>
        private readonly ILogger _logger;

        /// <summary>
        /// Localizer
        /// </summary>
        protected readonly IStringLocalizer _localizer;
        
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="taskBoardDbAccess">Task Board Db Access</param>
        /// <param name="taskNumberDbAccess">Task Number Db Access</param>
        /// <param name="userTaskBoardHistoryDbAccess">User Task Board History Db Access</param>
        /// <param name="projectDbAccess">Project Db Access</param>
        /// <param name="taskImageAccess">Task Image Access</param>
        /// <param name="taskImageParser">Task Image Parser</param>
        /// <param name="userManager">User Manager</param>
        /// <param name="timelineService">Timeline Service</param>
        /// <param name="xssChecker">Xss Checker</param>
        /// <param name="logger">Logger</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public TaskApiController(ITaskBoardDbAccess taskBoardDbAccess, ITaskNumberDbAccess taskNumberDbAccess, IUserTaskBoardHistoryDbAccess userTaskBoardHistoryDbAccess, IProjectDbAccess projectDbAccess, ITaskImageAccess taskImageAccess, ITaskImageParser taskImageParser, 
                                 UserManager<GoNorthUser> userManager, ITimelineService timelineService, IXssChecker xssChecker, ILogger<TaskApiController> logger, IStringLocalizerFactory localizerFactory)
        {
            _taskBoardDbAccess = taskBoardDbAccess;
            _taskNumberDbAccess = taskNumberDbAccess;
            _userTaskBoardHistoryDbAccess = userTaskBoardHistoryDbAccess;
            _projectDbAccess = projectDbAccess;
            _taskImageAccess = taskImageAccess;
            _taskImageParser = taskImageParser;
            _userManager = userManager;
            _timelineService = timelineService;
            _xssChecker = xssChecker;
            _logger = logger;
            _localizer = localizerFactory.Create(typeof(TaskApiController));
        }

        /// <summary>
        /// Returns a taskboard by its id
        /// </summary>
        /// <param name="id">Board id</param>
        /// <returns>Task Board</returns>
        [HttpGet]
        public async Task<IActionResult> GetTaskBoard(string id)
        {
            TaskBoard board = await _taskBoardDbAccess.GetTaskBoardById(id);
            return Ok(board);
        }

        /// <summary>
        /// Returns open task boards
        /// </summary>
        /// <param name="start">Start of the page</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Task Boards</returns>
        [HttpGet]
        public async Task<IActionResult> GetOpenTaskBoards(int start, int pageSize)
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();
            Task<List<TaskBoard>> queryTask;
            Task<int> countTask;
            queryTask = _taskBoardDbAccess.GetOpenTaskBoards(project.Id, start, pageSize);
            countTask = _taskBoardDbAccess.GetOpenTaskBoardCount(project.Id);
            Task.WaitAll(queryTask, countTask);

            TaskBoardQueryResult queryResult = new TaskBoardQueryResult();
            queryResult.Boards = queryTask.Result;
            queryResult.HasMore = start + queryResult.Boards.Count < countTask.Result;
            return Ok(queryResult);
        }

        /// <summary>
        /// Returns closed task boards
        /// </summary>
        /// <param name="start">Start of the page</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Task Boards</returns>
        [HttpGet]
        public async Task<IActionResult> GetClosedTaskBoards(int start, int pageSize)
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();
            Task<List<TaskBoard>> queryTask;
            Task<int> countTask;
            queryTask = _taskBoardDbAccess.GetClosedTaskBoards(project.Id, start, pageSize);
            countTask = _taskBoardDbAccess.GetClosedTaskBoardCount(project.Id);
            Task.WaitAll(queryTask, countTask);

            TaskBoardQueryResult queryResult = new TaskBoardQueryResult();
            queryResult.Boards = queryTask.Result;
            queryResult.HasMore = start + queryResult.Boards.Count < countTask.Result;
            return Ok(queryResult);
        }

        /// <summary>
        /// Creates a new task board
        /// </summary>
        /// <param name="board">Board to create</param>
        /// <returns>Id of the board</returns>
        [Authorize(Roles = RoleNames.TaskBoardManager)]
        [ValidateAntiForgeryToken]
        [HttpPost]
        public async Task<IActionResult> CreateTaskBoard([FromBody]TaskBoard board)
        {
            // Validate Data
            if(string.IsNullOrEmpty(board.Name))
            {
                return StatusCode((int)HttpStatusCode.BadRequest); 
            }

            // Create Task Board
            TaskBoard newBoard = new TaskBoard();
            newBoard.IsClosed = false;

            newBoard.Name = board.Name;
            newBoard.PlannedStart = board.PlannedStart;
            newBoard.PlannedEnd = board.PlannedEnd;
            newBoard.TaskGroups = new List<TaskGroup>();

            await this.SetModifiedData(_userManager, newBoard);

            GoNorthProject project = await _projectDbAccess.GetDefaultProject();
            newBoard.ProjectId = project.Id;

            try
            {
                newBoard = await _taskBoardDbAccess.CreateTaskBoard(newBoard);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not create task board.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            // Add Timeline entry
            try
            {
                await _timelineService.AddTimelineEntry(TimelineEvent.TaskBoardCreated, newBoard.Id, newBoard.Name);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not create task board create timeline entry.");
                await _taskBoardDbAccess.DeleteTaskBoard(newBoard);
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            return Ok(newBoard.Id);
        }

        /// <summary>
        /// Updates a task board
        /// </summary>
        /// <param name="id">Id of the board</param>
        /// <param name="board">Board to update</param>
        /// <returns>Id of the board</returns>
        [Authorize(Roles = RoleNames.TaskBoardManager)]
        [ValidateAntiForgeryToken]
        [HttpPost]
        public async Task<IActionResult> UpdateTaskBoard(string id, [FromBody]TaskBoard board)
        {
            // Validate Data
            if(string.IsNullOrEmpty(id) || string.IsNullOrEmpty(board.Name))
            {
                return StatusCode((int)HttpStatusCode.BadRequest); 
            }

            // Updates a Task Board
            TaskBoard updatedTaskBoard = await _taskBoardDbAccess.GetTaskBoardById(id);
            if(updatedTaskBoard == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound);
            }

            updatedTaskBoard.Name = board.Name;
            updatedTaskBoard.PlannedStart = board.PlannedStart;
            updatedTaskBoard.PlannedEnd = board.PlannedEnd;

            await this.SetModifiedData(_userManager, updatedTaskBoard);

            try
            {
                await _taskBoardDbAccess.UpdateTaskBoard(updatedTaskBoard);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not update task board.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            // Add Timeline entry
            await _timelineService.AddTimelineEntry(TimelineEvent.TaskBoardUpdated, updatedTaskBoard.Id, updatedTaskBoard.Name);

            return Ok(updatedTaskBoard.Id);
        }

        /// <summary>
        /// Sets the task board status
        /// </summary>
        /// <param name="id">Id of the board</param>
        /// <param name="closed">true if the board must be closed, else false</param>
        /// <returns>Id of the board</returns>
        [Authorize(Roles = RoleNames.TaskBoardManager)]
        [ValidateAntiForgeryToken]
        [HttpPost]
        public async Task<IActionResult> SetTaskBoardStatus(string id, bool closed)
        {
            // Validate Data
            if(string.IsNullOrEmpty(id))
            {
                return StatusCode((int)HttpStatusCode.BadRequest); 
            }

            // Updates a Task Board
            TaskBoard updatedTaskBoard = await _taskBoardDbAccess.GetTaskBoardById(id);
            if(updatedTaskBoard == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound);
            }
            
            updatedTaskBoard.IsClosed = closed;

            await this.SetModifiedData(_userManager, updatedTaskBoard);

            try
            {
                await _taskBoardDbAccess.UpdateTaskBoard(updatedTaskBoard);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not set task board status.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            // Add Timeline entry
            TimelineEvent timelineEvent = TimelineEvent.TaskBoardClosed;
            if(!closed)
            {
                timelineEvent = TimelineEvent.TaskBoardReopened;
            }
            await _timelineService.AddTimelineEntry(timelineEvent, updatedTaskBoard.Id, updatedTaskBoard.Name);

            return Ok(updatedTaskBoard.Id);
        }

        /// <summary>
        /// Deletes a task board
        /// </summary>
        /// <param name="id">Id of the board</param>
        /// <returns>Id of the board</returns>
        [Authorize(Roles = RoleNames.TaskBoardManager)]
        [ValidateAntiForgeryToken]
        [HttpDelete]
        public async Task<IActionResult> DeleteTaskBoard(string id)
        {
            // Validate Data
            if(string.IsNullOrEmpty(id))
            {
                return StatusCode((int)HttpStatusCode.BadRequest); 
            }

            // Updates a Task Board
            TaskBoard updatedTaskBoard = await _taskBoardDbAccess.GetTaskBoardById(id);
            if(updatedTaskBoard == null)
            {
                return Ok(id);
            }

            // Check if no tasks are associated
            if(updatedTaskBoard.TaskGroups != null && updatedTaskBoard.TaskGroups.Count > 0)
            {
                return StatusCode((int)HttpStatusCode.BadRequest, _localizer["CanNotDeleteNonEmptyTaskBoard"].Value);
            }

            // Delete board
            try
            {
                await _taskBoardDbAccess.DeleteTaskBoard(updatedTaskBoard);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not delete task board.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            // Add Timeline entry
            await _timelineService.AddTimelineEntry(TimelineEvent.TaskBoardDeleted, updatedTaskBoard.Name);

            return Ok(id);
        }


        /// <summary>
        /// Creates a new task group
        /// </summary>
        /// <param name="boardId">Id of the board</param>
        /// <param name="group">Group to create</param>
        /// <returns>Created Task Group</returns>
        [ValidateAntiForgeryToken]
        [HttpPost]
        public async Task<IActionResult> CreateTaskGroup(string boardId, [FromBody]TaskGroup group)
        {
            // Validate Data
            if(string.IsNullOrEmpty(boardId) || string.IsNullOrEmpty(group.Name))
            {
                return StatusCode((int)HttpStatusCode.BadRequest); 
            }

            _xssChecker.CheckXss(group.Name);
            _xssChecker.CheckXss(group.Description);

            // Get Task Board
            TaskBoard updatedTaskBoard = await _taskBoardDbAccess.GetTaskBoardById(boardId);
            if(updatedTaskBoard == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound); 
            }

            // Create Task Group
            TaskGroup newGroup = new TaskGroup();
            newGroup.Id = Guid.NewGuid().ToString();
            newGroup.TaskNumber = await _taskNumberDbAccess.GetNextTaskNumber(updatedTaskBoard.ProjectId);
            newGroup.Name = group.Name;
            newGroup.Description = group.Description;
            newGroup.Status = group.Status;
            newGroup.AssignedTo = group.AssignedTo;
            newGroup.Tasks = new List<GoNorthTask>();

            await this.SetModifiedData(_userManager, newGroup);

            if(updatedTaskBoard.TaskGroups == null)
            {
                updatedTaskBoard.TaskGroups = new List<TaskGroup>();
            }
            updatedTaskBoard.TaskGroups.Add(newGroup);

            try
            {
                await _taskBoardDbAccess.UpdateTaskBoard(updatedTaskBoard);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not updated task board for creating task group.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            // Add Timeline entry
            try
            {
                await _timelineService.AddTimelineEntry(TimelineEvent.TaskGroupCreated, updatedTaskBoard.Id, updatedTaskBoard.Name, newGroup.Name);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not create task group created timeline entry.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            return Ok(newGroup);
        }

        /// <summary>
        /// Updates a task group
        /// </summary>
        /// <param name="boardId">Id of the board</param>
        /// <param name="groupId">Id of the group</param>
        /// <param name="group">Group to create</param>
        /// <returns>Updated Task Group</returns>
        [ValidateAntiForgeryToken]
        [HttpPost]
        public async Task<IActionResult> UpdateTaskGroup(string boardId, string groupId, [FromBody]TaskGroup group)
        {
            // Validate Data
            if(string.IsNullOrEmpty(boardId) || string.IsNullOrEmpty(groupId) || string.IsNullOrEmpty(group.Name))
            {
                return StatusCode((int)HttpStatusCode.BadRequest); 
            }
            
            _xssChecker.CheckXss(group.Name);
            _xssChecker.CheckXss(group.Description);

            // Get Task Board
            TaskBoard updatedTaskBoard = await _taskBoardDbAccess.GetTaskBoardById(boardId);
            if(updatedTaskBoard == null || updatedTaskBoard.TaskGroups == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound); 
            }

            // Update Task Group
            TaskGroup updatedGroup = updatedTaskBoard.TaskGroups.Where(t => t.Id == groupId).FirstOrDefault();
            if(updatedGroup == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound); 
            }

            List<string> oldImages = _taskImageParser.ParseDescription(updatedGroup.Description);

            updatedGroup.Name = group.Name;
            updatedGroup.Description = group.Description;
            updatedGroup.Status = group.Status;
            updatedGroup.AssignedTo = group.AssignedTo;

            await this.SetModifiedData(_userManager, updatedGroup);

            try
            {
                await _taskBoardDbAccess.UpdateTaskBoard(updatedTaskBoard);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not updated task board for updating task group.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            // Delete Unused iamges
            try
            {
                List<string> newImages = _taskImageParser.ParseDescription(updatedGroup.Description);
                DeleteUnusedImages(newImages, oldImages);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not delete unused task group images.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            // Add Timeline entry
            try
            {
                await _timelineService.AddTimelineEntry(TimelineEvent.TaskGroupUpdated, updatedTaskBoard.Id, updatedTaskBoard.Name, updatedGroup.Name);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not create task group updated timeline entry.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            return Ok(updatedGroup);
        }

        /// <summary>
        /// Deletes a task group
        /// </summary>
        /// <param name="boardId">Id of the board</param>
        /// <param name="groupId">Id of the group</param>
        /// <returns>Deletes Task Group</returns>
        [ValidateAntiForgeryToken]
        [HttpDelete]
        public async Task<IActionResult> DeleteTaskGroup(string boardId, string groupId)
        {
            // Validate Data
            if(string.IsNullOrEmpty(boardId) || string.IsNullOrEmpty(groupId))
            {
                return StatusCode((int)HttpStatusCode.BadRequest); 
            }

            // Get Task Board
            TaskBoard taskBoard = await _taskBoardDbAccess.GetTaskBoardById(boardId);
            if(taskBoard == null || taskBoard.TaskGroups == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound); 
            }

            // Delete Task Group
            TaskGroup deletedGroup = taskBoard.TaskGroups.Where(t => t.Id == groupId).FirstOrDefault();
            if(deletedGroup == null)
            {
                return Ok(groupId); 
            }

            // Check task group is empty
            if(deletedGroup.Tasks != null && deletedGroup.Tasks.Count > 0)
            {
                return StatusCode((int)HttpStatusCode.BadRequest, _localizer["CanNotDeleteNonEmptyTaskGroup"].Value); 
            }

            List<string> images = _taskImageParser.ParseDescription(deletedGroup.Description);

            taskBoard.TaskGroups.Remove(deletedGroup);

            try
            {
                await _taskBoardDbAccess.UpdateTaskBoard(taskBoard);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not updated task board for deleting task group.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            // Delete images
            try
            {
                DeleteUnusedImages(null, images);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not delete task group images.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            // Add Timeline entry
            try
            {
                await _timelineService.AddTimelineEntry(TimelineEvent.TaskGroupDeleted, taskBoard.Id, taskBoard.Name, deletedGroup.Name);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not create task group deleted timeline entry.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            return Ok(groupId);
        }


        /// <summary>
        /// Creates a new task
        /// </summary>
        /// <param name="boardId">Id of the board</param>
        /// <param name="groupId">Id of the group</param>
        /// <param name="task">Task to create</param>
        /// <returns>Created Task</returns>
        [ValidateAntiForgeryToken]
        [HttpPost]
        public async Task<IActionResult> CreateTask(string boardId, string groupId, [FromBody]GoNorthTask task)
        {
            // Validate Data
            if(string.IsNullOrEmpty(boardId) || string.IsNullOrEmpty(groupId) || string.IsNullOrEmpty(task.Name))
            {
                return StatusCode((int)HttpStatusCode.BadRequest); 
            }

            _xssChecker.CheckXss(task.Name);
            _xssChecker.CheckXss(task.Description);

            // Get Task Board
            TaskBoard updatedTaskBoard = await _taskBoardDbAccess.GetTaskBoardById(boardId);
            if(updatedTaskBoard == null || updatedTaskBoard.TaskGroups == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound); 
            }

            // Get Task Group
            TaskGroup updatedGroup = updatedTaskBoard.TaskGroups.Where(g => g.Id == groupId).FirstOrDefault();
            if(updatedGroup == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound); 
            }

            // Create Task
            GoNorthTask newTask = new GoNorthTask();
            newTask.Id = Guid.NewGuid().ToString();
            newTask.TaskNumber = await _taskNumberDbAccess.GetNextTaskNumber(updatedTaskBoard.ProjectId);
            newTask.Name = task.Name;
            newTask.Description = task.Description;
            newTask.Status = task.Status;
            newTask.AssignedTo = task.AssignedTo;

            await this.SetModifiedData(_userManager, newTask);

            if(updatedGroup.Tasks == null)
            {
                updatedGroup.Tasks = new List<GoNorthTask>();
            }
            updatedGroup.Tasks.Add(newTask);

            try
            {
                await _taskBoardDbAccess.UpdateTaskBoard(updatedTaskBoard);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not updated task board for creating task.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            // Add Timeline entry
            try
            {
                await _timelineService.AddTimelineEntry(TimelineEvent.TaskCreated, updatedTaskBoard.Id, updatedTaskBoard.Name, updatedGroup.Name, newTask.Name);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not create task created timeline entry.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            return Ok(newTask);
        }

        /// <summary>
        /// Updates a task
        /// </summary>
        /// <param name="boardId">Id of the board</param>
        /// <param name="groupId">Id of the group</param>
        /// <param name="taskId">Id of the task</param>
        /// <param name="task">Task to update</param>
        /// <returns>Updated Task</returns>
        [ValidateAntiForgeryToken]
        [HttpPost]
        public async Task<IActionResult> UpdateTask(string boardId, string groupId, string taskId, [FromBody]GoNorthTask task)
        {
            // Validate Data
            if(string.IsNullOrEmpty(boardId) || string.IsNullOrEmpty(groupId) || string.IsNullOrEmpty(taskId) || string.IsNullOrEmpty(task.Name))
            {
                return StatusCode((int)HttpStatusCode.BadRequest); 
            }

            _xssChecker.CheckXss(task.Name);
            _xssChecker.CheckXss(task.Description);

            // Get Task Board
            TaskBoard updatedTaskBoard = await _taskBoardDbAccess.GetTaskBoardById(boardId);
            if(updatedTaskBoard == null || updatedTaskBoard.TaskGroups == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound); 
            }

            // Get Task Group
            TaskGroup updatedGroup = updatedTaskBoard.TaskGroups.Where(g => g.Id == groupId).FirstOrDefault();
            if(updatedGroup == null || updatedGroup.Tasks == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound); 
            }

            // Update Task
            GoNorthTask updatedTask = updatedGroup.Tasks.Where(t => t.Id == taskId).FirstOrDefault();
            if(updatedTask == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound); 
            }

            List<string> oldImages = _taskImageParser.ParseDescription(updatedTask.Description);

            updatedTask.Name = task.Name;
            updatedTask.Description = task.Description;
            updatedTask.Status = task.Status;
            updatedTask.AssignedTo = task.AssignedTo;

            await this.SetModifiedData(_userManager, updatedTask);

            try
            {
                await _taskBoardDbAccess.UpdateTaskBoard(updatedTaskBoard);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not updated task board for updating task.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            // Delete Unused iamges
            try
            {
                List<string> newImages = _taskImageParser.ParseDescription(updatedTask.Description);
                DeleteUnusedImages(newImages, oldImages);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not delete unused task images.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            // Add Timeline entry
            try
            {
                await _timelineService.AddTimelineEntry(TimelineEvent.TaskUpdated, updatedTaskBoard.Id, updatedTaskBoard.Name, updatedGroup.Name, updatedTask.Name);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not create task updated timeline entry.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            return Ok(updatedTask);
        }

        /// <summary>
        /// Deletes a task
        /// </summary>
        /// <param name="boardId">Id of the board</param>
        /// <param name="groupId">Id of the group</param>
        /// <param name="taskId">Id of the task</param>
        /// <returns>Task Id</returns>
        [ValidateAntiForgeryToken]
        [HttpDelete]
        public async Task<IActionResult> DeleteTask(string boardId, string groupId, string taskId)
        {
            // Validate Data
            if(string.IsNullOrEmpty(boardId) || string.IsNullOrEmpty(groupId) || string.IsNullOrEmpty(taskId))
            {
                return StatusCode((int)HttpStatusCode.BadRequest); 
            }

            // Get Task Board
            TaskBoard taskBoard = await _taskBoardDbAccess.GetTaskBoardById(boardId);
            if(taskBoard == null || taskBoard.TaskGroups == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound); 
            }

            // Get Task Group
            TaskGroup taskGroup = taskBoard.TaskGroups.Where(g => g.Id == groupId).FirstOrDefault();
            if(taskGroup == null || taskGroup.Tasks == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound); 
            }

            // Delete Task
            GoNorthTask deleteTask = taskGroup.Tasks.Where(t => t.Id == taskId).FirstOrDefault();
            if(deleteTask == null)
            {
                return Ok(taskId); 
            }

            List<string> images = _taskImageParser.ParseDescription(deleteTask.Description);

            taskGroup.Tasks.Remove(deleteTask);

            try
            {
                await _taskBoardDbAccess.UpdateTaskBoard(taskBoard);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not updated task board for updating task.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
            
            // Delete images
            try
            {
                DeleteUnusedImages(null, images);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not delete task images.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            // Add Timeline entry
            try
            {
                await _timelineService.AddTimelineEntry(TimelineEvent.TaskDeleted, taskBoard.Id, taskBoard.Name, taskGroup.Name, deleteTask.Name);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not create task deleted timeline entry.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            return Ok(taskId);
        }


        /// <summary>
        /// Uploads an image
        /// </summary>
        /// <returns>Image Name</returns>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult ImageUpload()
        {
            // Validate Date
            string validateResult = this.ValidateImageUploadData();
            if(validateResult != null)
            {
                return StatusCode((int)HttpStatusCode.BadRequest, _localizer[validateResult]);
            }

            // Save Image
            IFormFile uploadFile = Request.Form.Files[0];
            string imageFile = string.Empty;
            try
            {
                using(Stream imageStream = _taskImageAccess.CreateImage(uploadFile.FileName, out imageFile))
                {
                    uploadFile.CopyTo(imageStream);
                }
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not upload image");
                return StatusCode((int)HttpStatusCode.InternalServerError, _localizer["CouldNotUploadImage"]);
            }

            return Ok(imageFile);
        }

        /// <summary>
        /// Returns a task image
        /// </summary>
        /// <param name="imageFile">Image File</param>
        /// <returns>Task Image</returns>
        [HttpGet]
        public IActionResult TaskImage(string imageFile)
        {
            if(string.IsNullOrEmpty(imageFile))
            {
                return StatusCode((int)HttpStatusCode.BadRequest);
            }

            string fileExtension = Path.GetExtension(imageFile);
            string mimeType = this.GetImageMimeTypeForExtension(fileExtension);
            if(string.IsNullOrEmpty(mimeType))
            {
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            Stream imageStream = _taskImageAccess.OpenImage(imageFile);
            return File(imageStream, mimeType);
        }

        /// <summary>
        /// Deletes unused images
        /// </summary>
        /// <param name="newImages">New Images</param>
        /// <param name="oldImages">Old Images</param>
        private void DeleteUnusedImages(List<string> newImages, List<string> oldImages)
        {
            List<string> deletedImages = oldImages;
            if(newImages != null)
            {
                deletedImages = oldImages.Except(newImages).ToList();
            }
            foreach(string curDeletedImage in deletedImages)
            {
                _taskImageAccess.DeleteImage(curDeletedImage);
            }
        }


        /// <summary>
        /// Returns the last opened task board id for the current user
        /// </summary>
        /// <returns>Id of the last opened task board, "" if no task board was opened before</returns>
        [HttpGet]
        public async Task<IActionResult> GetLastOpenedTaskBoard()
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();
            string userId = _userManager.GetUserId(this.User);

            string boardId = await _userTaskBoardHistoryDbAccess.GetLastOpenBoardForUser(project.Id, userId);
            return Ok(boardId);
        }

        /// <summary>
        /// Returns the last opened task board id for the current user
        /// </summary>
        /// <param name="boardId">Id of the board</param>
        /// <returns>Task</returns>
        [ValidateAntiForgeryToken]
        [HttpPost]
        public async Task<IActionResult> SetLastOpenedTaskBoard(string boardId)
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();
            string userId = _userManager.GetUserId(this.User);

            await _userTaskBoardHistoryDbAccess.SetLastOpenBoardForUser(project.Id, userId, boardId);
            
            return Ok(userId);
        }
        
    }
}