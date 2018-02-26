using System;
using System.Collections.Generic;

namespace GoNorth.Data.TaskManagement
{
    /// <summary>
    /// Task Board
    /// </summary>
    public class TaskBoard : IHasModifiedData
    {
        /// <summary>
        /// Id of the Board
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Id of the Project the TaskBoard belongs to
        /// </summary>
        public string ProjectId { get; set; }

        /// <summary>
        /// Name of the board
        /// </summary>
        public string Name { get; set; }        

        /// <summary>
        /// Planned start of the board
        /// </summary>
        public DateTimeOffset? PlannedStart { get; set; }

        /// <summary>
        /// Planned end of the board
        /// </summary>
        public DateTimeOffset? PlannedEnd { get; set; }

        /// <summary>
        /// true if the board is closed
        /// </summary>
        public bool IsClosed { get; set; }

        /// <summary>
        /// Task Groups of the board
        /// </summary>
        public List<TaskGroup> TaskGroups { get; set; }

        /// <summary>
        /// Last modify Date
        /// </summary>
        public DateTimeOffset ModifiedOn { get; set; }

        /// <summary>
        /// Id of the user who last modified the page
        /// </summary>
        public string ModifiedBy { get; set; }
    }
}
