using System.Collections.Generic;

namespace GoNorth.Services.Export.Dialog
{
    /// <summary>
    /// Export Dialog Function
    /// </summary>
    public class ExportDialogFunction
    {
        /// <summary>
        /// Root node of the function
        /// </summary>
        public ExportDialogData RootNode { get; set; }

        /// <summary>
        /// Steps of the function
        /// </summary>
        public List<ExportDialogData> FunctionSteps { get; set; }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="rootNode">Root node of the function</param>
        public ExportDialogFunction(ExportDialogData rootNode)
        {
            RootNode = rootNode;
            FunctionSteps = new List<ExportDialogData>();
        }
    }
}