using System.Collections.Generic;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Class to export Daily routine data to Scriban
    /// </summary>
    public class ScribanExportDailyRoutine
    {
        /// <summary>
        /// Events
        /// </summary>
        [ScribanExportValueLabel]
        public List<ScribanExportDailyRoutineEvent> Events { get; set; }

        /// <summary>
        /// Functions of the events
        /// </summary>
        [ScribanExportValueLabel]
        public List<ScribanExportDailyRoutineFunction> EventFunctions { get; set; }
    }
}