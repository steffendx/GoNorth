using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.StepRenderers.RenderingObjects
{
    /// <summary>
    /// Class for Rendering choice optoon
    /// </summary>
    public class ScribanChoiceOption
    {
        /// <summary>
        /// Id of the choice
        /// </summary>
        [ScribanExportValueLabel]
        public int Id { get; set; }

        /// <summary>
        /// Condition string
        /// </summary>
        [ScribanExportValueLabel]
        public string Condition { get; set; }

        /// <summary>
        /// Text
        /// </summary>
        [ScribanExportValueLabel]
        public string Text { get; set; }

        /// <summary>
        /// Text without escaping characters
        /// </summary>
        [ScribanExportValueLabel]
        public string UnescapedText { get; set; }

        /// <summary>
        /// Preview of the text
        /// </summary>
        [ScribanExportValueLabel]
        public string TextPreview { get; set; } 

        /// <summary>
        /// true if the choice is repeatable
        /// </summary>
        [ScribanExportValueLabel]
        public bool IsRepeatable { get; set; }
    
        /// <summary>
        /// Child node
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanDialogStepBaseData ChildNode { get; set; }

        /// <summary>
        /// Parent Choice
        /// </summary>
        public ScribanChoice ParentChoice { get; set; }
    }
}