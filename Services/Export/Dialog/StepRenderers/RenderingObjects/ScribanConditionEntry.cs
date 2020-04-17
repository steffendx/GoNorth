using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.StepRenderers.RenderingObjects
{
    /// <summary>
    /// Class for Rendering condition entries of condition dialog steps
    /// </summary>
    public class ScribanConditionEntry
    {
        /// <summary>
        /// Id of the condition
        /// </summary>
        [ScribanExportValueLabel]
        public int Id { get; set; }

        /// <summary>
        /// Condition string
        /// </summary>
        [ScribanExportValueLabel]
        public string Condition { get; set; }

        /// <summary>
        /// Child node
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanDialogStepBaseData ChildNode { get; set; }
    }
}