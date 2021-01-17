namespace GoNorth.Data.Exporting
{
    /// <summary>
    /// Result of an export snippet reference check
    /// </summary>
    public class ObjectExportSnippetReference
    {
        /// <summary>
        /// Id of the object
        /// </summary>
        public string ObjectId { get; set; }

        /// <summary>
        /// Name of the object
        /// </summary>
        public string ObjectName { get; set; }

        /// <summary>
        /// Type of the object
        /// </summary>
        public string ObjectType { get; set; }

        /// <summary>
        /// Name of the snippet
        /// </summary>
        public string ExportSnippet { get; set; }
    }
}