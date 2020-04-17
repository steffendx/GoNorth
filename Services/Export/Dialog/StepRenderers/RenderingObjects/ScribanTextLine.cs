using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.StepRenderers.RenderingObjects
{
    /// <summary>
    /// Class for Rendering Text Line dialog steps
    /// </summary>
    public class ScribanTextLine : ScribanDialogStepBaseDataWithNextNode
    {
        /// <summary>
        /// Text line
        /// </summary>
        [ScribanExportValueLabel]
        public string TextLine { get; set; }

        /// <summary>
        /// Text line without escaping characters
        /// </summary>
        [ScribanExportValueLabel]
        public string UnescapedTextLine { get; set; }

        /// <summary>
        /// Preview of the textline
        /// </summary>
        /// <value></value>
        [ScribanExportValueLabel]
        public string TextLinePreview { get; set; }

        /// <summary>
        /// true if its a player line, else false
        /// </summary>
        public bool IsPlayerLine { get; set; }

    }
}