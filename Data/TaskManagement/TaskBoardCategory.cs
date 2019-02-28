using System;

namespace GoNorth.Data.TaskManagement
{
    /// <summary>
    /// Task Board category
    /// </summary>
    public class TaskBoardCategory : IHasModifiedData
    {
        /// <summary>
        /// Id of the category
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Id of the Project the category belongs to
        /// </summary>
        public string ProjectId { get; set; }

        /// <summary>
        /// Name of the category
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// true if the category is expanded by default
        /// </summary>
        public bool IsExpandedByDefault { get; set; }        

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
