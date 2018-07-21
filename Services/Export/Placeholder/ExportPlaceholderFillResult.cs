namespace GoNorth.Services.Export.Placeholder
{
    /// <summary>
    /// Result of an export placeholder fill operation
    /// </summary>
    public class ExportPlaceholderFillResult
    {
        /// <summary>
        /// Filled Code
        /// </summary>
        public string Code { get; set; }

        /// <summary>
        /// Errors
        /// </summary>
        public ExportPlaceholderErrorCollection Errors { get; set; }
    }
}