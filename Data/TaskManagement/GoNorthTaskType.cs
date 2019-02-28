using System;

namespace GoNorth.Data.TaskManagement
{
    /// <summary>
    /// Task Type
    /// </summary>
    public class GoNorthTaskType : IHasModifiedData
    {
        /// <summary>
        /// Id of the Type
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Id of the Project the Type belongs to
        /// </summary>
        public string ProjectId { get; set; }

        /// <summary>
        /// Name of the Type
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Color of the task type, used for borders and so on
        /// </summary>
        public string Color { get; set; }

        /// <summary>
        /// true if the task type is the default task type, else false
        /// </summary>
        public bool IsDefault { get; set; }

        /// <summary>
        /// Last modify Date
        /// </summary>
        public DateTimeOffset ModifiedOn { get; set; }

        /// <summary>
        /// Id of the user who last modified the task type
        /// </summary>
        public string ModifiedBy { get; set; }
    }
}
