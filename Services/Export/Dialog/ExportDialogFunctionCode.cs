namespace GoNorth.Services.Export.Dialog
{
    /// <summary>
    /// Export Dialog Function code
    /// </summary>
    public class ExportDialogFunctionCode
    {
        /// <summary>
        /// Name of the function
        /// </summary>
        public string FunctionName { get; set; }

        /// <summary>
        /// Code of the function
        /// </summary>
        public string Code { get; set; }

        /// <summary>
        /// Parent preview text
        /// </summary>
        public string ParentPreviewText { get; set; }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="functionName">Name of the function</param>
        /// <param name="code">Code of the function</param>
        /// <param name="parentPreviewText">Parent preview text</param>
        public ExportDialogFunctionCode(string functionName, string code, string parentPreviewText)
        {
            FunctionName = functionName;
            Code = code;
            ParentPreviewText = parentPreviewText;
        }
    }
}