using GoNorth.Services.Export.Dialog;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Class to export Dialog functions to Scriban
    /// </summary>
    public class ScribanExportDialogFunction
    {
        /// <summary>
        /// Name of the function
        /// </summary>
        [ScribanExportValueLabel]
        public string FunctionName { get; set; }

        /// <summary>
        /// Code
        /// </summary>
        [ScribanExportValueLabel]
        public string Code { get; set; }

        /// <summary>
        /// Preview text of the parent node
        /// </summary>
        [ScribanExportValueLabel]
        public string ParentPreviewText { get; set; }

        /// <summary>
        /// Constructor
        /// </summary>
        public ScribanExportDialogFunction()
        {
        }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="dialogFunctionCode">Dialog function code</param>
        public ScribanExportDialogFunction(ExportDialogFunctionCode dialogFunctionCode)
        {
            if(dialogFunctionCode != null)
            {
                FunctionName = dialogFunctionCode.FunctionName;
                Code = dialogFunctionCode.Code;
                ParentPreviewText = dialogFunctionCode.ParentPreviewText;
            }
        }
    }
}