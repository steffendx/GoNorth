using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Class to export Daily routine event times to Scriban
    /// </summary>
    public class ScribanExportDailyRoutineEventTime
    {
        /// <summary>
        /// Hours of the time
        /// </summary>
        [ScribanExportValueLabel]
        public int Hours { get; set; }
        
        /// <summary>
        /// Minutes of the time
        /// </summary>
        [ScribanExportValueLabel]
        public int Minutes { get; set; }
        
        /// <summary>
        /// Total minutes of the time
        /// </summary>
        [ScribanExportValueLabel]
        public int TotalMinutes { get; set; }
    }
}