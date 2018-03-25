namespace GoNorth.Data.FlexFieldDatabase
{
    /// <summary>
    /// Flex Field Folder
    /// </summary>
    public class FlexFieldFolder
    {
        /// <summary>
        /// Id of the folder
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Id of the project
        /// </summary>
        public string ProjectId { get; set; }

        /// <summary>
        /// Parent Folder Id
        /// </summary>
        public string ParentFolderId { get; set; }

        /// <summary>
        /// Name of the folder
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Description of the folder
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Image File
        /// </summary>
        public string ImageFile { get; set; }
    }
}
