using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.StepRenderers.RenderingObjects
{
    /// <summary>
    /// Class for Rendering choice dialog steps
    /// </summary>
    public class ScribanAction : ScribanDialogStepBaseDataWithNextNode
    {
        /// <summary>
        /// Content of the action
        /// </summary>
        [ScribanExportValueLabel]
        public string Content { get; set; }
    }
}