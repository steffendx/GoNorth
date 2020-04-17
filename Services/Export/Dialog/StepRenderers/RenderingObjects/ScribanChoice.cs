using System.Collections.Generic;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.StepRenderers.RenderingObjects
{
    /// <summary>
    /// Class for Rendering choice dialog steps
    /// </summary>
    public class ScribanChoice : ScribanDialogStepBaseData
    {
        /// <summary>
        /// Choices
        /// </summary>
        [ScribanKeyCollectionLabel(ExportConstants.ScribanChoiceOptionObjectKey, typeof(ScribanChoiceOption), false)]
        public List<ScribanChoiceOption> Choices { get; set; }
    }
}