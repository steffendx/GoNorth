using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Scriban rendering class for value change actions
    /// </summary>
    public class ScribanValueActionData
    {
        /// <summary>
        /// Object that contains the values
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanFlexFieldObject ValueObject { get; set; }

        /// <summary>
        /// Field that is changed
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanFlexFieldField TargetField { get; set; }

        /// <summary>
        /// Operator
        /// </summary>
        [ScribanExportValueLabel]
        public string Operator { get; set; }

        /// <summary>
        /// Operator that was not resolved using the templates
        /// </summary>
        [ScribanExportValueLabel]
        public string OriginalOperator { get; set; }

        /// <summary>
        /// Change of the value
        /// </summary>
        [ScribanExportValueLabel]
        public object ValueChange { get; set; }
    }
}