using System.Threading.Tasks;
using GoNorth.Services.Timeline;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Identity;
using GoNorth.Data.User;
using System.Collections.Generic;
using System.Net;
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
    [ApiController]
    [Authorize(Roles = RoleNames.Task)]
    [Route("/api/[controller]/[action]")]
    public class TaskApiController : ControllerBase
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
        /// Task group type Db access
        /// </summary>
        private readonly ITaskGroupTypeDbAccess _taskGroupTypeDbAccess;

        /// <summary>
        /// Task type Db access
        /// </summary>
        private readonly ITaskTypeDbAccess _taskTypeDbAccess;

        /// <summary>
        /// Task Board Category Db Access
        /// </summary>
        private readonly ITaskBoardCategoryDbAccess _taskBoardCategoryDbAccess;

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
        /// Task type default provider
        /// </summary>
        private readonly ITaskTypeDefaultProvider _taskTypeDefaultProvider;

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
        /// <param name="taskGroupTypeDbAccess">Task group type Db Access</param>
        /// <param name="taskTypeDbAccess">Task type Db Access</param>
        /// <param name="taskBoardCategoryDbAccess">Task Board category Db Access</param>
        /// <param name="taskNumberDbAccess">Task Number Db Access</param>
        /// <param name="userTaskBoardHistoryDbAccess">User Task Board History Db Access</param>
        /// <param name="projectDbAccess">Project Db Access</param>
        /// <param name="taskImageAccess">Task Image Access</param>
        /// <param name="taskImageParser">Task Image Parser</param>
        /// <param name="taskTypeDefaultProvider">Task type default provider</param>
        /// <param name="userManager">User Manager</param>
        /// <param name="timelineService">Timeline Service</param>
        /// <param name="xssChecker">Xss Checker</param>
        /// <param name="logger">Logger</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public TaskApiController(ITaskBoardDbAccess taskBoardDbAccess, ITaskGroupTypeDbAccess taskGroupTypeDbAccess, ITaskTypeDbAccess taskTypeDbAccess, ITaskBoardCategoryDbAccess taskBoardCategoryDbAccess, ITaskNumberDbAccess taskNumberDbAccess, 
                                 IUserTaskBoardHistoryDbAccess userTaskBoardHistoryDbAccess, IProjectDbAccess projectDbAccess, ITaskImageAccess taskImageAccess, ITaskImageParser taskImageParser,  ITaskTypeDefaultProvider taskTypeDefaultProvider, 
                                 UserManager<GoNorthUser> userManager, ITimelineService timelineService, IXssChecker xssChecker, ILogger<TaskApiController> logger, IStringLocalizerFactory localizerFactory)
        {
            _taskBoardDbAccess = taskBoardDbAccess;
            _taskGroupTypeDbAccess = taskGroupTypeDbAccess;
            _taskTypeDbAccess = taskTypeDbAccess;
            _taskBoardCategoryDbAccess = taskBoardCategoryDbAccess;
            _taskNumberDbAccess = taskNumberDbAccess;
            _userTaskBoardHistoryDbAccess = userTaskBoardHistoryDbAccess;
            _projectDbAccess = projectDbAccess;
            _taskImageAccess = taskImageAccess;
            _taskImageParser = taskImageParser;
            _taskTypeDefaultProvider = taskTypeDefaultProvider;
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
        [Produces(typeof(TaskBoard))]
        [ProducesResponseType(StatusCodes.Status200OK)]
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
        [Produces(typeof(TaskBoardQueryResult))]
        [ProducesResponseType(StatusCodes.Status200OK)]
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
        [Produces(typeof(TaskBoardQueryResult))]
        [ProducesResponseType(StatusCodes.Status200OK)]
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
        [Produces(typeof(string))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [Authorize(Roles = RoleNames.TaskBoardManager)]
        [ValidateAntiForgeryToken]
        [HttpPost]
        public async Task<IActionResult> CreateTaskBoard([FromBody]TaskBoard board)
        {
            // Validate Data
            if(string.IsNullOrEmpty(board.Name))
            {
                return BadRequest(); 
            }

            // Create Task Board
            TaskBoard newBoard = new TaskBoard();
            newBoard.IsClosed = false;

            newBoard.Name = board.Name;
            newBoard.CategoryId = board.CategoryId;
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
        [Produces(typeof(string))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [Authorize(Roles = RoleNames.TaskBoardManager)]
        [ValidateAntiForgeryToken]
        [HttpPost]
        public async Task<IActionResult> UpdateTaskBoard(string id, [FromBody]TaskBoard board)
        {
            // Validate Data
            if(string.IsNullOrEmpty(id) || string.IsNullOrEmpty(board.Name))
            {
                return BadRequest(); 
            }

            // Updates a Task Board
            TaskBoard updatedTaskBoard = await _taskBoardDbAccess.GetTaskBoardById(id);
            if(updatedTaskBoard == null)
            {
                return NotFound();
            }

            updatedTaskBoard.Name = board.Name;
            updatedTaskBoard.CategoryId = board.CategoryId;
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
        [Produces(typeof(string))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [Authorize(Roles = RoleNames.TaskBoardManager)]
        [ValidateAntiForgeryToken]
        [HttpPost]
        public async Task<IActionResult> SetTaskBoardStatus(string id, bool closed)
        {
            // Validate Data
            if(string.IsNullOrEmpty(id))
            {
                return BadRequest(); 
            }

            // Updates a Task Board
            TaskBoard updatedTaskBoard = await _taskBoardDbAccess.GetTaskBoardById(id);
            if(updatedTaskBoard == null)
            {
                return NotFound();
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
        [Produces(typeof(string))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [Authorize(Roles = RoleNames.TaskBoardManager)]
        [ValidateAntiForgeryToken]
        [HttpDelete]
        public async Task<IActionResult> DeleteTaskBoard(string id)
        {
            // Validate Data
            if(string.IsNullOrEmpty(id))
            {
                return BadRequest(); 
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
                return BadRequest(_localizer["CanNotDeleteNonEmptyTaskBoard"].Value);
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
        [Produces(typeof(TaskGroup))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ValidateAntiForgeryToken]
        [HttpPost]
        public async Task<IActionResult> CreateTaskGroup(string boardId, [FromBody]TaskGroup group)
        {
            // Validate Data
            if(string.IsNullOrEmpty(boardId) || string.IsNullOrEmpty(group.Name))
            {
                return BadRequest(); 
            }

            _xssChecker.CheckXss(group.Name);
            _xssChecker.CheckXss(group.Description);

            // Get Task Board
            TaskBoard updatedTaskBoard = await _taskBoardDbAccess.GetTaskBoardById(boardId);
            if(updatedTaskBoard == null)
            {
                return NotFound(); 
            }

            // Create Task Group
            TaskGroup newGroup = new TaskGroup();
            newGroup.Id = Guid.NewGuid().ToString();
            newGroup.TaskTypeId = group.TaskTypeId;
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
        [Produces(typeof(TaskGroup))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ValidateAntiForgeryToken]
        [HttpPost]
        public async Task<IActionResult> UpdateTaskGroup(string boardId, string groupId, [FromBody]TaskGroup group)
        {
            // Validate Data
            if(string.IsNullOrEmpty(boardId) || string.IsNullOrEmpty(groupId) || string.IsNullOrEmpty(group.Name))
            {
                return BadRequest(); 
            }
            
            _xssChecker.CheckXss(group.Name);
            _xssChecker.CheckXss(group.Description);

            // Get Task Board
            TaskBoard updatedTaskBoard = await _taskBoardDbAccess.GetTaskBoardById(boardId);
            if(updatedTaskBoard == null || updatedTaskBoard.TaskGroups == null)
            {
                return NotFound(); 
            }

            // Update Task Group
            TaskGroup updatedGroup = updatedTaskBoard.TaskGroups.Where(t => t.Id == groupId).FirstOrDefault();
            if(updatedGroup == null)
            {
                return NotFound(); 
            }

            List<string> oldImages = _taskImageParser.ParseDescription(updatedGroup.Description);
            
            updatedGroup.TaskTypeId = group.TaskTypeId;
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
        /// Moves a task group to a different task board
        /// </summary>
        /// <param name="sourceBoardId">Id of the source board</param>
        /// <param name="groupId">Id of the task group</param>
        /// <param name="targetBoardId">Id of the target board</param>
        /// <returns>Updated Task group</returns>
        [Produces(typeof(TaskGroup))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ValidateAntiForgeryToken]
        [HttpPost]
        public async Task<IActionResult> MoveTaskGroupToBoard(string sourceBoardId, string groupId, string targetBoardId)
        {
            // Validate Data
            if(string.IsNullOrEmpty(sourceBoardId) || string.IsNullOrEmpty(groupId) || string.IsNullOrEmpty(targetBoardId))
            {
                return BadRequest(); 
            }

            // Get Source
            TaskBoard sourceBoard = await _taskBoardDbAccess.GetTaskBoardById(sourceBoardId);
            if(sourceBoard == null || sourceBoard.TaskGroups == null)
            {
                return NotFound(); 
            }

            TaskGroup moveGroup = sourceBoard.TaskGroups.Where(g => g.Id == groupId).FirstOrDefault();
            if(moveGroup == null)
            {
                return NotFound(); 
            }

            // Get Target
            TaskBoard targetBoard = await _taskBoardDbAccess.GetTaskBoardById(targetBoardId);
            if(targetBoard == null || targetBoard.TaskGroups == null)
            {
                return NotFound(); 
            }

            await this.SetModifiedData(_userManager, moveGroup);

            sourceBoard.TaskGroups.Remove(moveGroup);
            targetBoard.TaskGroups.Add(moveGroup);

            try
            {
                await _taskBoardDbAccess.UpdateTaskBoard(targetBoard);
                await _taskBoardDbAccess.UpdateTaskBoard(sourceBoard);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not updated task board for moving task group.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            // Add Timeline entry
            try
            {
                await _timelineService.AddTimelineEntry(TimelineEvent.TaskGroupMoved, targetBoard.Id, targetBoard.Name, moveGroup.Name);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not create task group moved timeline entry.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            return Ok(moveGroup);
        }

        /// <summary>
        /// Reorders a task group
        /// </summary>
        /// <param name="boardId">Id of the board</param>
        /// <param name="groupId">Id of the group</param>
        /// <param name="targetIndex">Target index of the group</param>
        /// <returns>Updated Task Group</returns>
        [Produces(typeof(TaskGroup))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ValidateAntiForgeryToken]
        [HttpPost]
        public async Task<IActionResult> ReorderTaskGroup(string boardId, string groupId, int targetIndex)
        {
            // Validate Data
            if(string.IsNullOrEmpty(boardId) || string.IsNullOrEmpty(groupId))
            {
                return BadRequest(); 
            }

            // Get Task Board
            TaskBoard updatedTaskBoard = await _taskBoardDbAccess.GetTaskBoardById(boardId);
            if(updatedTaskBoard == null || updatedTaskBoard.TaskGroups == null)
            {
                return NotFound(); 
            }

            // Get Task Group
            TaskGroup updatedGroup = updatedTaskBoard.TaskGroups.Where(t => t.Id == groupId).FirstOrDefault();
            if(updatedGroup == null)
            {
                return NotFound(); 
            }

            updatedTaskBoard.TaskGroups.Remove(updatedGroup);
            updatedTaskBoard.TaskGroups.Insert(targetIndex, updatedGroup);
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
        [Produces(typeof(string))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ValidateAntiForgeryToken]
        [HttpDelete]
        public async Task<IActionResult> DeleteTaskGroup(string boardId, string groupId)
        {
            // Validate Data
            if(string.IsNullOrEmpty(boardId) || string.IsNullOrEmpty(groupId))
            {
                return BadRequest(); 
            }

            // Get Task Board
            TaskBoard taskBoard = await _taskBoardDbAccess.GetTaskBoardById(boardId);
            if(taskBoard == null || taskBoard.TaskGroups == null)
            {
                return NotFound(); 
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
                return BadRequest(_localizer["CanNotDeleteNonEmptyTaskGroup"].Value); 
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
        [Produces(typeof(GoNorthTask))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ValidateAntiForgeryToken]
        [HttpPost]
        public async Task<IActionResult> CreateTask(string boardId, string groupId, [FromBody]GoNorthTask task)
        {
            // Validate Data
            if(string.IsNullOrEmpty(boardId) || string.IsNullOrEmpty(groupId) || string.IsNullOrEmpty(task.Name))
            {
                return BadRequest(); 
            }

            _xssChecker.CheckXss(task.Name);
            _xssChecker.CheckXss(task.Description);

            // Get Task Board
            TaskBoard updatedTaskBoard = await _taskBoardDbAccess.GetTaskBoardById(boardId);
            if(updatedTaskBoard == null || updatedTaskBoard.TaskGroups == null)
            {
                return NotFound(); 
            }

            // Get Task Group
            TaskGroup updatedGroup = updatedTaskBoard.TaskGroups.Where(g => g.Id == groupId).FirstOrDefault();
            if(updatedGroup == null)
            {
                return NotFound(); 
            }

            // Create Task
            GoNorthTask newTask = new GoNorthTask();
            newTask.Id = Guid.NewGuid().ToString();
            newTask.TaskTypeId = task.TaskTypeId;
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
        /// Inserts a task in a task group for a given index. This index is based on the same status as the task (i.e. if the Task Status is InProgress and the target index is 1, the task will be inserted as the second InProgress task)
        /// </summary>
        /// <param name="taskGroup">Task group to insert the task to</param>
        /// <param name="task">Task</param>
        /// <param name="targetIndex">Target index</param>
        private void InsertTaskAtIndex(TaskGroup taskGroup, GoNorthTask task, int targetIndex)
        {
            if(targetIndex == 0)
            {
                taskGroup.Tasks.Insert(0, task);
                return;
            }

            int curStatusIndex = 0;
            int curTotalIndex = 0;
            foreach(GoNorthTask curTask in taskGroup.Tasks)
            {
                ++curTotalIndex;
                if(curTask.Status == task.Status)
                {
                    ++curStatusIndex;
                }

                if(curStatusIndex >= targetIndex)
                {
                    taskGroup.Tasks.Insert(curTotalIndex, task);
                    return;
                }
            }

            taskGroup.Tasks.Add(task);
        }

        /// <summary>
        /// Updates a task
        /// </summary>
        /// <param name="boardId">Id of the board</param>
        /// <param name="groupId">Id of the group</param>
        /// <param name="taskId">Id of the task</param>
        /// <param name="oldGroupId">Id of the old group of the task</param>
        /// <param name="targetIndex">Target index of the task</param>
        /// <param name="task">Task to update</param>
        /// <returns>Updated Task</returns>
        [Produces(typeof(GoNorthTask))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ValidateAntiForgeryToken]
        [HttpPost]
        public async Task<IActionResult> UpdateTask(string boardId, string groupId, string taskId, string oldGroupId, int targetIndex, [FromBody]GoNorthTask task)
        {
            // Validate Data
            if(string.IsNullOrEmpty(boardId) || string.IsNullOrEmpty(groupId) || string.IsNullOrEmpty(taskId) || string.IsNullOrEmpty(task.Name))
            {
                return BadRequest(); 
            }

            _xssChecker.CheckXss(task.Name);
            _xssChecker.CheckXss(task.Description);

            // Get Task Board
            TaskBoard updatedTaskBoard = await _taskBoardDbAccess.GetTaskBoardById(boardId);
            if(updatedTaskBoard == null || updatedTaskBoard.TaskGroups == null)
            {
                return NotFound(); 
            }

            // Get Task Group
            string groupIdToSearch = groupId;
            if(!string.IsNullOrEmpty(oldGroupId))
            {
                groupIdToSearch = oldGroupId;
            }
            TaskGroup updatedGroup = updatedTaskBoard.TaskGroups.Where(g => g.Id == groupIdToSearch).FirstOrDefault();
            if(updatedGroup == null || updatedGroup.Tasks == null)
            {
                return NotFound(); 
            }

            // Update Task
            GoNorthTask updatedTask = updatedGroup.Tasks.Where(t => t.Id == taskId).FirstOrDefault();
            if(updatedTask == null)
            {
                return NotFound(); 
            }

            List<string> oldImages = _taskImageParser.ParseDescription(updatedTask.Description);

            updatedTask.TaskTypeId = task.TaskTypeId;
            updatedTask.Name = task.Name;
            updatedTask.Description = task.Description;
            updatedTask.Status = task.Status;
            updatedTask.AssignedTo = task.AssignedTo;

            await this.SetModifiedData(_userManager, updatedTask);

            if(!string.IsNullOrEmpty(oldGroupId))
            {
                // Move task to new group if group is passed
                TaskGroup newGroup = updatedTaskBoard.TaskGroups.Where(g => g.Id == groupId).FirstOrDefault();
                if(newGroup == null || newGroup.Tasks == null)
                {
                    return NotFound(); 
                }

                updatedGroup.Tasks.Remove(updatedTask);
                if(targetIndex < 0)
                {
                    newGroup.Tasks.Add(updatedTask);
                }
                else
                {
                    InsertTaskAtIndex(newGroup, updatedTask, targetIndex);
                }
            }
            else if(targetIndex >= 0)
            {
                updatedGroup.Tasks.Remove(updatedTask);
                InsertTaskAtIndex(updatedGroup, updatedTask, targetIndex);
            }

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
        /// Moves a task to a different task board
        /// </summary>
        /// <param name="sourceBoardId">Id of the source board</param>
        /// <param name="sourceGroupId">Id of the source task group</param>
        /// <param name="taskId">Id of the task</param>
        /// <param name="targetBoardId">Id of the target board</param>
        /// <param name="targetGroupId">If ot the target task group</param>
        /// <returns>Updated Task</returns>
        [Produces(typeof(GoNorthTask))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ValidateAntiForgeryToken]
        [HttpPost]
        public async Task<IActionResult> MoveTaskToBoard(string sourceBoardId, string sourceGroupId, string taskId, string targetBoardId, string targetGroupId)
        {
            // Validate Data
            if(string.IsNullOrEmpty(sourceBoardId) || string.IsNullOrEmpty(sourceGroupId) || string.IsNullOrEmpty(taskId) || string.IsNullOrEmpty(targetBoardId) || string.IsNullOrEmpty(targetGroupId))
            {
                return BadRequest(); 
            }

            // Get Source
            TaskBoard sourceBoard = await _taskBoardDbAccess.GetTaskBoardById(sourceBoardId);
            if(sourceBoard == null || sourceBoard.TaskGroups == null)
            {
                return NotFound(); 
            }

            TaskGroup sourceGroup = sourceBoard.TaskGroups.Where(g => g.Id == sourceGroupId).FirstOrDefault();
            if(sourceGroup == null || sourceGroup.Tasks == null)
            {
                return NotFound(); 
            }

            GoNorthTask moveTask = sourceGroup.Tasks.Where(t => t.Id == taskId).FirstOrDefault();
            if(moveTask == null)
            {
                return NotFound(); 
            }

            // Get Target
            TaskBoard targetBoard = await _taskBoardDbAccess.GetTaskBoardById(targetBoardId);
            if(targetBoard == null || targetBoard.TaskGroups == null)
            {
                return NotFound(); 
            }

            TaskGroup targetGroup = targetBoard.TaskGroups.Where(g => g.Id == targetGroupId).FirstOrDefault();
            if(targetGroup == null || targetGroup.Tasks == null)
            {
                return NotFound(); 
            }

            await this.SetModifiedData(_userManager, moveTask);

            sourceGroup.Tasks.Remove(moveTask);
            targetGroup.Tasks.Add(moveTask);

            try
            {
                await _taskBoardDbAccess.UpdateTaskBoard(targetBoard);
                await _taskBoardDbAccess.UpdateTaskBoard(sourceBoard);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not updated task board for moving task.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            // Add Timeline entry
            try
            {
                await _timelineService.AddTimelineEntry(TimelineEvent.TaskMoved, targetBoard.Id, targetBoard.Name, targetGroup.Name, moveTask.Name);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not create task moved timeline entry.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            return Ok(moveTask);
        }

        /// <summary>
        /// Deletes a task
        /// </summary>
        /// <param name="boardId">Id of the board</param>
        /// <param name="groupId">Id of the group</param>
        /// <param name="taskId">Id of the task</param>
        /// <returns>Task Id</returns>
        [Produces(typeof(string))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ValidateAntiForgeryToken]
        [HttpDelete]
        public async Task<IActionResult> DeleteTask(string boardId, string groupId, string taskId)
        {
            // Validate Data
            if(string.IsNullOrEmpty(boardId) || string.IsNullOrEmpty(groupId) || string.IsNullOrEmpty(taskId))
            {
                return BadRequest(); 
            }

            // Get Task Board
            TaskBoard taskBoard = await _taskBoardDbAccess.GetTaskBoardById(boardId);
            if(taskBoard == null || taskBoard.TaskGroups == null)
            {
                return NotFound(); 
            }

            // Get Task Group
            TaskGroup taskGroup = taskBoard.TaskGroups.Where(g => g.Id == groupId).FirstOrDefault();
            if(taskGroup == null || taskGroup.Tasks == null)
            {
                return NotFound(); 
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
        [Produces(typeof(string))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult ImageUpload()
        {
            // Validate Date
            string validateResult = this.ValidateImageUploadData();
            if(validateResult != null)
            {
                return BadRequest(_localizer[validateResult]);
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
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [HttpGet]
        public IActionResult TaskImage(string imageFile)
        {
            if(string.IsNullOrEmpty(imageFile))
            {
                return BadRequest();
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
        [Produces(typeof(string))]
        [ProducesResponseType(StatusCodes.Status200OK)]
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
        [Produces(typeof(string))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ValidateAntiForgeryToken]
        [HttpPost]
        public async Task<IActionResult> SetLastOpenedTaskBoard(string boardId)
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();
            string userId = _userManager.GetUserId(this.User);

            await _userTaskBoardHistoryDbAccess.SetLastOpenBoardForUser(project.Id, userId, boardId);
            
            return Ok(userId);
        }
        

        /// <summary>
        /// Returns all task board categories
        /// </summary>
        /// <returns>Task board categories</returns>
        [Produces(typeof(List<TaskBoardCategory>))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> GetTaskBoardCategories()
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();
            List<TaskBoardCategory> categoeries = await _taskBoardCategoryDbAccess.GetTaskBoardCategories(project.Id);
            return Ok(categoeries);
        }

        /// <summary>
        /// Creates a new task board category
        /// </summary>
        /// <param name="category">Category to create</param>
        /// <returns>Id of the board category</returns>
        [Produces(typeof(string))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [Authorize(Roles = RoleNames.TaskBoardCategoryManager)]
        [ValidateAntiForgeryToken]
        [HttpPost]
        public async Task<IActionResult> CreateTaskBoardCategory([FromBody]TaskBoardCategory category)
        {
            // Validate Data
            if(string.IsNullOrEmpty(category.Name))
            {
                return BadRequest(); 
            }

            // Create Task Board category
            TaskBoardCategory newCategory = new TaskBoardCategory();
            newCategory.Name = category.Name;
            newCategory.IsExpandedByDefault = category.IsExpandedByDefault;

            await this.SetModifiedData(_userManager, newCategory);

            GoNorthProject project = await _projectDbAccess.GetDefaultProject();
            newCategory.ProjectId = project.Id;

            try
            {
                newCategory = await _taskBoardCategoryDbAccess.CreateTaskBoardCategory(newCategory);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not create task board category.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            // Add Timeline entry
            try
            {
                await _timelineService.AddTimelineEntry(TimelineEvent.TaskBoardCategoryCreated, newCategory.Id, newCategory.Name);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not create task board category create timeline entry.");
                await _taskBoardCategoryDbAccess.DeleteTaskBoardCategory(newCategory);
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            return Ok(newCategory.Id);
        }

        /// <summary>
        /// Updates a task board category
        /// </summary>
        /// <param name="id">Id of the board category</param>
        /// <param name="category">Board category to update</param>
        /// <returns>Id of the board category</returns>
        [Produces(typeof(string))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [Authorize(Roles = RoleNames.TaskBoardCategoryManager)]
        [ValidateAntiForgeryToken]
        [HttpPost]
        public async Task<IActionResult> UpdateTaskBoardCategory(string id, [FromBody]TaskBoardCategory category)
        {
            // Validate Data
            if(string.IsNullOrEmpty(id) || string.IsNullOrEmpty(category.Name))
            {
                return BadRequest(); 
            }

            // Updates a Task Board category
            TaskBoardCategory updatedTaskBoardCategory = await _taskBoardCategoryDbAccess.GetTaskBoardCategoryById(id);
            if(updatedTaskBoardCategory == null)
            {
                return NotFound();
            }

            updatedTaskBoardCategory.Name = category.Name;
            updatedTaskBoardCategory.IsExpandedByDefault = category.IsExpandedByDefault;

            await this.SetModifiedData(_userManager, updatedTaskBoardCategory);

            try
            {
                await _taskBoardCategoryDbAccess.UpdateTaskBoardCategory(updatedTaskBoardCategory);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not update task board category.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            // Add Timeline entry
            await _timelineService.AddTimelineEntry(TimelineEvent.TaskBoardCategoryUpdated, updatedTaskBoardCategory.Id, updatedTaskBoardCategory.Name);

            return Ok(updatedTaskBoardCategory.Id);
        }

        /// <summary>
        /// Checks if an task board is using a category
        /// </summary>
        /// <param name="id">Id of the board category</param>
        /// <returns>true if any task board is using the category</returns>
        [Produces(typeof(bool))]
        [Authorize(Roles = RoleNames.TaskBoardCategoryManager)]
        [HttpGet]
        public async Task<bool> IsTaskBoardCategoryUsedByBoard(string id)
        {
            return await _taskBoardDbAccess.AnyTaskBoardUsingCategory(id);
        }

        /// <summary>
        /// Deletes a task board category
        /// </summary>
        /// <param name="id">Id of the board category</param>
        /// <returns>Id of the board category</returns>
        [Produces(typeof(string))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [Authorize(Roles = RoleNames.TaskBoardCategoryManager)]
        [ValidateAntiForgeryToken]
        [HttpDelete]
        public async Task<IActionResult> DeleteTaskBoardCategory(string id)
        {
            // Validate Data
            if(string.IsNullOrEmpty(id))
            {
                return BadRequest(); 
            }

            // Updates a Task Board category
            TaskBoardCategory updatedTaskBoardCategory = await _taskBoardCategoryDbAccess.GetTaskBoardCategoryById(id);
            if(updatedTaskBoardCategory == null)
            {
                return Ok(id);
            }

            // Delete board category
            try
            {
                await _taskBoardCategoryDbAccess.DeleteTaskBoardCategory(updatedTaskBoardCategory);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not delete task board category.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
            
            // Reset references to category
            try
            {
                await _taskBoardDbAccess.ResetCategoryReference(updatedTaskBoardCategory.Id);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not reset reference to category.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            // Add Timeline entry
            await _timelineService.AddTimelineEntry(TimelineEvent.TaskBoardCategoryDeleted, updatedTaskBoardCategory.Name);

            return Ok(id);
        }


        /// <summary>
        /// Returns the task group types from a database source
        /// </summary>
        /// <param name="dbSource">Database source</param>
        /// <param name="defaultTaskTypeFunction">Default task types function</param>
        /// <returns>Task Types</returns>
        private async Task<IActionResult> GetTaskTypesFromDb(ITaskTypeBaseDbAccess dbSource, Func<List<GoNorthTaskType>> defaultTaskTypeFunction)
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();
            List<GoNorthTaskType> taskTypes = await dbSource.GetTaskTypes(project.Id);
            if(taskTypes == null || !taskTypes.Any())
            {
                taskTypes = defaultTaskTypeFunction();
            }

            return Ok(taskTypes);
        }

        /// <summary>
        /// Returns the task group types
        /// </summary>
        /// <returns>Task group Types</returns>
        [Produces(typeof(List<GoNorthTaskType>))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> GetTaskGroupTypes()
        {
            return await GetTaskTypesFromDb(_taskGroupTypeDbAccess, () => _taskTypeDefaultProvider.GetDefaultTaskGroupTypes());
        }

        /// <summary>
        /// Returns the task types
        /// </summary>
        /// <returns>Task Types</returns>
        [Produces(typeof(List<GoNorthTaskType>))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> GetTaskTypes()
        {
            return await GetTaskTypesFromDb(_taskTypeDbAccess, () => _taskTypeDefaultProvider.GetDefaultTaskTypes());
        }


        /// <summary>
        /// Resets the default task type for a database target if a new default task type was provided
        /// </summary>
        /// <param name="dbTarget">Database target</param>
        /// <param name="updatedTaskType">Updated task type</param>
        /// <param name="project">Project, if null it will be loaded</param>
        /// <returns></returns>
        private async Task ResetDefaultTaskTypeIfChanged(ITaskTypeBaseDbAccess dbTarget, GoNorthTaskType updatedTaskType, GoNorthProject project)
        {
            if(!updatedTaskType.IsDefault)
            {
                return;
            }

            if(project == null)
            {
                project = await _projectDbAccess.GetDefaultProject();
            }

            GoNorthTaskType defaultTaskType = await dbTarget.GetDefaultTaskType(project.Id);
            if(defaultTaskType != null && defaultTaskType.Id != updatedTaskType.Id)
            {
                defaultTaskType.IsDefault = false;
                await dbTarget.UpdateTaskType(defaultTaskType);
            }
        }

        /// <summary>
        /// Creates a task type in a target database
        /// </summary>
        /// <param name="dbTarget">Target database</param>
        /// <param name="taskType">Task type</param>
        /// <param name="timelineEvent">Timeline event</param>
        /// <returns>Action result</returns>
        private async Task<IActionResult> CreateTaskTypeInDb(ITaskTypeBaseDbAccess dbTarget, GoNorthTaskType taskType, TimelineEvent timelineEvent)
        {
            // Validate Data
            if(string.IsNullOrEmpty(taskType.Name) || string.IsNullOrEmpty(taskType.Color))
            {
                return BadRequest(); 
            }

            // Create Task Type
            GoNorthTaskType newTaskType = new GoNorthTaskType();

            newTaskType.Name = taskType.Name;
            newTaskType.IsDefault = taskType.IsDefault;
            newTaskType.Color = taskType.Color;

            await this.SetModifiedData(_userManager, newTaskType);

            GoNorthProject project = await _projectDbAccess.GetDefaultProject();
            newTaskType.ProjectId = project.Id;

            try
            {
                await ResetDefaultTaskTypeIfChanged(dbTarget, newTaskType, project);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not reset default task type.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            try
            {
                newTaskType = await dbTarget.CreateTaskType(newTaskType);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not create task type.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            // Add Timeline entry
            try
            {
                await _timelineService.AddTimelineEntry(timelineEvent, newTaskType.Id, newTaskType.Name);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not create task type create timeline entry.");
                await dbTarget.DeleteTaskType(newTaskType);
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            return Ok(newTaskType.Id);
        }

        /// <summary>
        /// Creates a new task group type
        /// </summary>
        /// <param name="taskType">Task group type to create</param>
        /// <returns>Id of the task group type</returns>
        [Produces(typeof(string))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [Authorize(Roles = RoleNames.TaskTypeManager)]
        [ValidateAntiForgeryToken]
        [HttpPost]
        public async Task<IActionResult> CreateTaskGroupType([FromBody]GoNorthTaskType taskType)
        {
            return await CreateTaskTypeInDb(_taskGroupTypeDbAccess, taskType, TimelineEvent.TaskGroupTypeCreated);
        }

        /// <summary>
        /// Creates a new task type
        /// </summary>
        /// <param name="taskType">Task type to create</param>
        /// <returns>Id of the task type</returns>
        [Produces(typeof(string))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [Authorize(Roles = RoleNames.TaskTypeManager)]
        [ValidateAntiForgeryToken]
        [HttpPost]
        public async Task<IActionResult> CreateTaskType([FromBody]GoNorthTaskType taskType)
        {
            return await CreateTaskTypeInDb(_taskTypeDbAccess, taskType, TimelineEvent.TaskTypeCreated);
        }


        /// <summary>
        /// updates a task type in a target database
        /// </summary>
        /// <param name="dbTarget">Target database</param>
        /// <param name="id">Id of the task type</param>
        /// <param name="taskType">Task type</param>
        /// <param name="timelineEvent">Timeline event</param>
        /// <returns>Action result</returns>
        private async Task<IActionResult> UpdateTaskTypeInDb(ITaskTypeBaseDbAccess dbTarget, string id, GoNorthTaskType taskType, TimelineEvent timelineEvent)
        {
            // Validate Data
            if(string.IsNullOrEmpty(id) || string.IsNullOrEmpty(taskType.Name) || string.IsNullOrEmpty(taskType.Color))
            {
                return BadRequest(); 
            }

            // Updates a Task type
            GoNorthTaskType updatedTaskType = await dbTarget.GetTaskTypeById(id);
            if(updatedTaskType == null)
            {
                return NotFound();
            }

            updatedTaskType.Name = taskType.Name;
            updatedTaskType.IsDefault = taskType.IsDefault;
            updatedTaskType.Color = taskType.Color;

            await this.SetModifiedData(_userManager, updatedTaskType);

            try
            {
                await ResetDefaultTaskTypeIfChanged(dbTarget, updatedTaskType, null);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not reset default task type.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            try
            {
                await dbTarget.UpdateTaskType(updatedTaskType);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not update task type.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            // Add Timeline entry
            await _timelineService.AddTimelineEntry(timelineEvent, updatedTaskType.Id, updatedTaskType.Name);

            return Ok(updatedTaskType.Id);
        }

        /// <summary>
        /// Updates a task group type
        /// </summary>
        /// <param name="id">Id of the task group type</param>
        /// <param name="taskType">Task group type to update</param>
        /// <returns>Id of the task group type</returns>
        [Produces(typeof(string))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [Authorize(Roles = RoleNames.TaskTypeManager)]
        [ValidateAntiForgeryToken]
        [HttpPost]
        public async Task<IActionResult> UpdateTaskGroupType(string id, [FromBody]GoNorthTaskType taskType)
        {
            return await UpdateTaskTypeInDb(_taskGroupTypeDbAccess, id, taskType, TimelineEvent.TaskGroupTypeUpdated);
        }

        /// <summary>
        /// Updates a task type
        /// </summary>
        /// <param name="id">Id of the task type</param>
        /// <param name="taskType">Task type to update</param>
        /// <returns>Id of the task type</returns>
        [Produces(typeof(string))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [Authorize(Roles = RoleNames.TaskTypeManager)]
        [ValidateAntiForgeryToken]
        [HttpPost]
        public async Task<IActionResult> UpdateTaskType(string id, [FromBody]GoNorthTaskType taskType)
        {
            return await UpdateTaskTypeInDb(_taskTypeDbAccess, id, taskType, TimelineEvent.TaskTypeUpdated);
        }

        /// <summary>
        /// Deletes a task type from a database
        /// </summary>
        /// <param name="dbTarget">Target database</param>
        /// <param name="id">Id of the task type to delete</param>
        /// <param name="newTaskTypeId">Id of the task type to which the old tasks using this type must be changed</param>
        /// <param name="timelineEvent">Timeline event</param>
        /// <returns></returns>
        private async Task<IActionResult> DeleteTaskTypeFromDb(ITaskTypeBaseDbAccess dbTarget, string id, string newTaskTypeId, TimelineEvent timelineEvent)
        {
            // Validate Data
            if(string.IsNullOrEmpty(id))
            {
                return BadRequest(); 
            }

            // Delete task type
            GoNorthTaskType deleteTaskType = await dbTarget.GetTaskTypeById(id);
            if(deleteTaskType == null)
            {
                return Ok(id);
            }

            // Change references
            if(string.IsNullOrEmpty(newTaskTypeId))
            {
                newTaskTypeId = null;
            }

            try
            {
                List<TaskBoard> boardsUsingType = await _taskBoardDbAccess.GetAllTaskBoardsUsingTaskType(id);
                foreach(TaskBoard curBoard in boardsUsingType)
                {
                    if(curBoard.TaskGroups == null)
                    {
                        continue;
                    }

                    foreach(TaskGroup curGroup in curBoard.TaskGroups)
                    {
                        if(curGroup.TaskTypeId == id)
                        {
                            curGroup.TaskTypeId = newTaskTypeId;
                        }

                        if(curGroup.Tasks == null)
                        {
                            continue;
                        }
                        
                        foreach(GoNorthTask curTask in curGroup.Tasks)
                        {
                            if(curTask.TaskTypeId == id)
                            {
                                curTask.TaskTypeId = newTaskTypeId;
                            }
                        }
                    }

                    await _taskBoardDbAccess.UpdateTaskBoard(curBoard);
                }
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not reset references to task type.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            // Delete task type
            try
            {
                await dbTarget.DeleteTaskType(deleteTaskType);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not delete task type.");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            // Add Timeline entry
            await _timelineService.AddTimelineEntry(timelineEvent, deleteTaskType.Name);

            return Ok(id);
        }

        /// <summary>
        /// Deletes a task group type
        /// </summary>
        /// <param name="id">Id of the type</param>
        /// <param name="newTaskTypeId">Id of the task type to which the old task groups using this type must be changed</param>
        /// <returns>Id of the type</returns>
        [Produces(typeof(string))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [Authorize(Roles = RoleNames.TaskTypeManager)]
        [ValidateAntiForgeryToken]
        [HttpDelete]
        public async Task<IActionResult> DeleteTaskGroupType(string id, string newTaskTypeId)
        {
            return await DeleteTaskTypeFromDb(_taskGroupTypeDbAccess, id, newTaskTypeId, TimelineEvent.TaskGroupTypeDeleted);
        }

        /// <summary>
        /// Deletes a task type
        /// </summary>
        /// <param name="id">Id of the type</param>
        /// <param name="newTaskTypeId">Id of the task type to which the old tasks using this type must be changed</param>
        /// <returns>Id of the type</returns>
        [Produces(typeof(string))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [Authorize(Roles = RoleNames.TaskTypeManager)]
        [ValidateAntiForgeryToken]
        [HttpDelete]
        public async Task<IActionResult> DeleteTaskType(string id, string newTaskTypeId)
        {
            return await DeleteTaskTypeFromDb(_taskTypeDbAccess, id, newTaskTypeId, TimelineEvent.TaskTypeDeleted);
        }

        /// <summary>
        /// Returns true if any task board has a task group without a task type
        /// </summary>
        /// <returns>true if any task board has a task group without a task type</returns>
        [Produces(typeof(bool))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [Authorize(Roles = RoleNames.TaskTypeManager)]
        [HttpGet]
        public async Task<IActionResult> AnyTaskBoardHasTaskGroupsWithoutType()
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();
            bool anyWithoutType = await _taskBoardDbAccess.AnyTaskBoardHasTaskGroupsWithoutType(project.Id);
            return Ok(anyWithoutType);
        }

        /// <summary>
        /// Returns true if any task board has a task without a task type
        /// </summary>
        /// <returns>true if any task board has a task without a task type</returns>
        [Produces(typeof(bool))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [Authorize(Roles = RoleNames.TaskTypeManager)]
        [HttpGet]
        public async Task<IActionResult> AnyTaskBoardHasTasksWithoutType()
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();
            bool anyWithoutType = await _taskBoardDbAccess.AnyTaskBoardHasTasksWithoutType(project.Id);
            return Ok(anyWithoutType);
        }
    }
}