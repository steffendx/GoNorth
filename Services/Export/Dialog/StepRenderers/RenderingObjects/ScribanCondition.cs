using System.Collections.Generic;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.StepRenderers.RenderingObjects
{
    /// <summary>
    /// Class for Rendering condition dialog steps
    /// </summary>
    public class ScribanCondition : ScribanDialogStepBaseData
    {
        /// <summary>
        /// Conditions with child nodes
        /// </summary>
        [ScribanKeyCollectionLabel(ExportConstants.ScribanConditionEntryObjectKey, typeof(ScribanConditionEntry), false)]
        public List<ScribanConditionEntry> Conditions { get; set; }

        /// <summary>
        /// All Conditions
        /// </summary>
        [ScribanExportValueLabel]
        public List<ScribanConditionEntry> AllConditions { get; set; }

        /// <summary>
        /// Else part of the condition
        /// </summary>
        [ScribanExportValueLabel]
        public ScribanDialogStepBaseData Else { get; set; }
    }
}