

using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Persist dialog state action data
    /// </summary>
    public class ScribanPersistDialogStateData
    {
        /// <summary>
        /// True if the dialog must be ended else false
        /// </summary>
        [ScribanExportValueLabel]
        public bool EndDialog { get; set; }
    }
}