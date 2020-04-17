using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.ConditionRendering.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Scriban rendering class for game time condition data
    /// </summary>
    public class ScribanGameTimeConditionData
    {
        /// <summary>
        /// Hours to compare
        /// </summary>
        [ScribanExportValueLabel]
        public int Hours { get; set; }
        
        /// <summary>
        /// Minutes to compare
        /// </summary>
        [ScribanExportValueLabel]
        public int Minutes { get; set; }
                
        /// <summary>
        /// Total Minutes to compare
        /// </summary>
        [ScribanExportValueLabel]
        public int TotalMinutes { get; set; }
                        
        /// <summary>
        /// Loaded operator
        /// </summary>
        [ScribanExportValueLabel]
        public string Operator { get; set; }
                                
        /// <summary>
        /// Original operator
        /// </summary>
        [ScribanExportValueLabel]
        public string OriginalOperator { get; set; }
    }
}