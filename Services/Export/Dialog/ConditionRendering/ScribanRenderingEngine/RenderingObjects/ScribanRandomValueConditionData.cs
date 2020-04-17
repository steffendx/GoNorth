using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.ConditionRendering.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Scriban rendering class for a random value condition
    /// </summary>
    public class ScribanRandomValueConditionData
    {
        /// <summary>
        /// Operator loaded from the templates
        /// </summary>
        [ScribanExportValueLabel]
        public string Operator { get; set; }
        
        /// <summary>
        /// Original Operator loaded from the templates
        /// </summary>
        [ScribanExportValueLabel]
        public string OriginalOperator { get; set; }

        /// <summary>
        /// Minimal random value
        /// </summary>
        [ScribanExportValueLabel]
        public float MinValue { get; set; }
        
        /// <summary>
        /// Maximum random value
        /// </summary>
        [ScribanExportValueLabel]
        public float MaxValue { get; set; }

        /// <summary>
        /// Compare value
        /// </summary>
        [ScribanExportValueLabel]
        public float CompareValue { get; set; }
    }
}