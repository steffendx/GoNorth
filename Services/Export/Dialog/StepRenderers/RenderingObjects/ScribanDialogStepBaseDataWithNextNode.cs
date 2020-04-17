using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.StepRenderers.RenderingObjects
{
    /// <summary>
    /// Base Class for Rendering dialog steps with next step data
    /// </summary>
    public class ScribanDialogStepBaseDataWithNextNode : ScribanDialogStepBaseData
    {
        /// <summary>
        /// Child node
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanDialogStepBaseData ChildNode { get; set; }
    }
}