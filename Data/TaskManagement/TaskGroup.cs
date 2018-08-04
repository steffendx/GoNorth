using System;
using System.Collections.Generic;

namespace GoNorth.Data.TaskManagement
{
    /// <summary>
    /// Task Group
    /// </summary>
    public class TaskGroup : IHasModifiedData
    {
        /// <summary>
        /// Id of the Group
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Task number
        /// </summary>
        public int TaskNumber { get; set; }

        /// <summary>
        /// Name of the group
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Description of the group
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Status of the group
        /// </summary>
        public TaskStatus Status { get; set; }

        /// <summary>
        /// Id of the user the task group is assigned to
        /// </summary>
        /// <returns></returns>
        public string AssignedTo { get; set; }

        /// <summary>
        /// Tasks of the group
        /// </summary>
        public List<GoNorthTask> Tasks { get; set; }

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
