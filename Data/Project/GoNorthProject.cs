namespace GoNorth.Data.Project
{
    /// <summary>
    /// GoNorth Project
    /// </summary>
    public class GoNorthProject
    {
        /// <summary>
        /// Id of the project
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Name of the project
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// true if the project is the default project, else false
        /// </summary>
        public bool IsDefault { get; set; }
    }
}
