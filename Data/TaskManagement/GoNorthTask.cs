using System;

namespace GoNorth.Data.TaskManagement
{
    /// <summary>
    /// Task
    /// </summary>
    public class GoNorthTask : IHasModifiedData
    {
        /// <summary>
        /// Id of the Task
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Name of the Task
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Description of the Task
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Status of the task
        /// </summary>
        public TaskStatus Status { get; set; }

        /// <summary>
        /// Id of the user the task is assigned to
        /// </summary>
        /// <returns></returns>
        public string AssignedTo { get; set; }

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
