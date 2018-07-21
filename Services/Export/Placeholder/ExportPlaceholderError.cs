namespace GoNorth.Services.Export.Placeholder
{
    /// <summary>
    /// Export Placeholder Error
    /// </summary>
    public class ExportPlaceholderError
    {
        /// <summary>
        /// Error Type
        /// </summary>
        public ExportPlaceholderErrorType ErrorType { get; set; }

        /// <summary>
        /// Message
        /// </summary>
        public string Message { get; set; }

        /// <summary>
        /// Times that the error was found
        /// </summary>
        public int Count { get; set; }
    }
}