namespace GoNorth.Data.TaskManagement
{
    /// <summary>
    /// User task board history
    /// </summary>
    public class UserTaskBoardHistory
    {
        /// <summary>
        /// Id of the history
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Id of the Project the history belongs to
        /// </summary>
        public string ProjectId { get; set; }

        /// <summary>
        /// Id of the user for which the history is valid
        /// </summary>
        public string UserId { get; set; }

        /// <summary>
        /// Id of the board that was last opened
        /// </summary>
        public string LastOpenBoardId { get; set; }        
    }
}
