using System.Collections.Generic;

namespace GoNorth.Models.TaskManagementViewModels
{
    /// <summary>
    /// Task Board Viewmodel
    /// </summary>
    public class TaskBoardViewModel
    {
        /// <summary>
        /// Allowed Task Status
        /// </summary>
        public List<MappedTaskStatus> TaskStatus { get; set; }
    }
}