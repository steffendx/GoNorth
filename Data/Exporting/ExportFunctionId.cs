namespace GoNorth.Data.Exporting
{
    /// <summary>
    /// Export function Id for an export function
    /// </summary>
    public class ExportFunctionId
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
        /// Id of the function object (Node)
        /// </summary>
        public string FunctionObjectId { get; set; }

        /// <summary>
        /// Export Function Id
        /// </summary>
        public int FunctionId { get; set; }
    };
}