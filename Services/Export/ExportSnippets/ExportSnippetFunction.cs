namespace GoNorth.Services.Export.ExportSnippets
{
    /// <summary>
    /// Class to export export snippet function data to Scriban
    /// </summary>
    public class ExportSnippetFunction
    {
        /// <summary>
        /// Name of the function
        /// </summary>
        public string FunctionName { get; set; }

        /// <summary>
        /// Code
        /// </summary>
        public string Code { get; set; }

        /// <summary>
        /// Preview text of the parent node
        /// </summary>
        public string ParentPreviewText { get; set; }
    }
}