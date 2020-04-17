using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.ConditionRendering.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Scriban rendering class for a value condition data
    /// </summary>
    public class ScribanValueConditionData
    {
        /// <summary>
        /// Object that contains the value
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanFlexFieldObject ValueObject { get; set; }

        /// <summary>
        /// Field that was selected for the condition
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanFlexFieldField SelectedField { get; set; }

        /// <summary>
        /// true if the operator is a primitive operator, else false
        /// </summary>
        [ScribanExportValueLabel]
        public bool IsOperatorPrimitive { get; set; }

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
        /// Compare value
        /// </summary>
        [ScribanExportValueLabel]
        public object CompareValue { get; set; }
    }
}