namespace GoNorth.Services.Export.DailyRoutine
{
    /// <summary>
    /// Class to export Daily routine data to Scriban
    /// </summary>
    public class DailyRoutineFunction
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