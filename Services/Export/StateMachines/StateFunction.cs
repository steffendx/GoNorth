namespace GoNorth.Services.Export.StateMachines
{
    /// <summary>
    /// Class to export state machine data to Scriban
    /// </summary>
    public class StateFunction
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