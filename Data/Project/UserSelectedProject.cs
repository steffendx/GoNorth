namespace GoNorth.Data.Project
{
    /// <summary>
    /// User selected project
    /// </summary>
    public class UserSelectedProject
    {
        /// <summary>
        /// Id of the entry
        /// </summary>
        public string Id {get; set; }

        /// <summary>
        /// Id of the user
        /// </summary>
        public string UserId { get; set; }

        /// <summary>
        /// Id of the project
        /// </summary>
        public string ProjectId { get; set; }
    }
}
