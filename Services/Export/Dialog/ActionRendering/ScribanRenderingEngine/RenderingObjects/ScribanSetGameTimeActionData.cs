using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Scriban rendering class for a set game time action
    /// </summary>
    public class ScribanSetGameTimeActionData
    {
        /// <summary>
        /// Hours of the time to set
        /// </summary>
        [ScribanExportValueLabel]
        public int Hours { get; set; }
        
        /// <summary>
        /// Minutes of the time to set
        /// </summary>
        [ScribanExportValueLabel]
        public int Minutes { get; set; }
        
        /// <summary>
        /// Total Minutes of the time to set
        /// </summary>
        [ScribanExportValueLabel]
        public int TotalMinutes { get; set; }
    }
}