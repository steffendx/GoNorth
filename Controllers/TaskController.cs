using System;
using System.Linq;
using GoNorth.Data.TaskManagement;
using GoNorth.Models.TaskManagementViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GoNorth.Controllers
{
    /// <summary>
    /// Task controller
    /// </summary>
    [Authorize(Roles = RoleNames.Task)]
    public class TaskController : Controller
    {
        /// <summary>
        /// Index view
        /// </summary>
        /// <returns>View</returns>
        [HttpGet]
        public IActionResult Index()
        {
            TaskBoardViewModel viewModel = new TaskBoardViewModel();
            viewModel.TaskStatus = Enum.GetValues(typeof(TaskStatus)).Cast<TaskStatus>().Select(s => new MappedTaskStatus {
                Value = (int)s,
                Name = s.ToString()
            }).ToList();
            return View(viewModel);
        }

        /// <summary>
        /// Manage Boards view
        /// </summary>
        /// <returns>View</returns>
        [Authorize(Roles = RoleNames.TaskBoardManager)]
        [HttpGet]
        public IActionResult ManageBoards()
        {
            return View();
        }
    }
}
