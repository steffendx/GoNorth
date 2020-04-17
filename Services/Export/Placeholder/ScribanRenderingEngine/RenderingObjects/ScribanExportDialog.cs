using System.Collections.Generic;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Class to export Dialogs to scriban
    /// </summary>
    public class ScribanExportDialog
    {
        /// <summary>
        /// Initial Dialog Function
        /// </summary>
        [ScribanExportValueLabel]
        public ScribanExportDialogFunction InitialFunction { get; set; }

        /// <summary>
        /// Additional functions besides the initial dialog
        /// </summary>
        [ScribanExportValueLabel]
        public List<ScribanExportDialogFunction> AdditionalFunctions { get; set; }

        /// <summary>
        /// All dialog functions
        /// </summary>
        [ScribanExportValueLabel]
        public List<ScribanExportDialogFunction> AllFunctions { get; set; }
    }
}