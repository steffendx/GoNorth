namespace GoNorth.Data.Exporting
{
    /// <summary>
    /// Export function Id Counter for an export function
    /// </summary>
    public class ExportFunctionIdCounter
    {
        /// <summary>
        /// Id
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Project Id
        /// </summary>
        public string ProjectId { get; set; }

        /// <summary>
        /// Id of the group to which the counter belongs
        /// </summary>
        public string ObjectId { get; set; }

        /// <summary>
        /// Current Function Id
        /// </summary>
        public int CurExportFunctionId { get; set; }
    };
}