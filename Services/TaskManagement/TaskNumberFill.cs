using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.TaskManagement;

namespace GoNorth.Services.TaskManagement
{
    /// <summary>
    /// Class for generating task numbers
    /// </summary>
    public class TaskNumberFill : ITaskNumberFill
    {
        /// <summary>
        /// Task Board Db Access
        /// </summary>
        private readonly ITaskBoardDbAccess _taskBoardDbAccess;

        /// <summary>
        /// Task Number Db Access
        /// </summary>
        private readonly ITaskNumberDbAccess _taskNumberDbAccess;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="taskBoardDbAccess">Task Board Db Access</param>
        /// <param name="taskNumberDbAccess">Task Number Db Access</param>
        public TaskNumberFill(ITaskBoardDbAccess taskBoardDbAccess, ITaskNumberDbAccess taskNumberDbAccess)
        {
            _taskBoardDbAccess = taskBoardDbAccess;
            _taskNumberDbAccess = taskNumberDbAccess;
        }

        /// <summary>
        /// Generates task numbers for all tasks that are missing a number
        /// </summary>
        /// <returns>Task</returns>
        public async Task FillTasks()
        {
            List<TaskBoard> allTaskBoards = await _taskBoardDbAccess.GetAllTaskBoards();
            
            foreach(TaskBoard curTaskBoard in allTaskBoards)
            {
                await FillTaskNumbersForBoard(curTaskBoard);
            }
        }

        /// <summary>
        /// Fills the task numbers for a board
        /// </summary>
        /// <param name="taskBoard">Task board to fill</param>
        /// <returns>Task</returns>
        private async Task FillTaskNumbersForBoard(TaskBoard taskBoard)
        {
            if(taskBoard.TaskGroups == null)
            {
                return;
            }

            foreach(TaskGroup curGroup in taskBoard.TaskGroups)
            {
                await FillTaskNumbersForTaskGroup(taskBoard.ProjectId, curGroup);
            }

            await _taskBoardDbAccess.UpdateTaskBoard(taskBoard);
        }

        /// <summary>
        /// Fills the task numbers for a task group
        /// </summary>
        /// <param name="taskGroup">Task group</param>
        /// <param name="projectId">Project Id</param>
        /// <returns>Task</returns>
        private async Task FillTaskNumbersForTaskGroup(string projectId, TaskGroup taskGroup)
        {
            taskGroup.TaskNumber = await EnsureTaskNumber(projectId, taskGroup.TaskNumber);
            
            if(taskGroup.Tasks == null)
            {
                return;
            }

            foreach(GoNorthTask curTask in taskGroup.Tasks)
            {
                curTask.TaskNumber = await EnsureTaskNumber(projectId, curTask.TaskNumber);
            }
        }

        /// <summary>
        /// Ensures a valid task number exists
        /// </summary>
        /// <param name="taskNumber">Task number</param>
        /// <param name="projectId">Project Id</param>
        /// <returns>Task Number</returns>
        private async Task<int> EnsureTaskNumber(string projectId, int taskNumber)
        {
            if(taskNumber > 0)
            {
                return taskNumber;
            }

            return await _taskNumberDbAccess.GetNextTaskNumber(projectId);
        }
    }
}