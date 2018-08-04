namespace GoNorth.Data.TaskManagement
{
    /// <summary>
    /// Task Number Counter
    /// </summary>
    public class TaskNumberCounter
    {
        /// <summary>
        /// Id of the counter
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Id of the project
        /// </summary>
        public string ProjectId { get; set; }

        /// <summary>
        /// Next Task number
        /// </summary>
        public int NextTaskNumber { get; set; }
    }
}
