using System.Collections.Generic;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Class to export state machine data to Scriban
    /// </summary>
    public class ScribanExportStateMachine
    {
        /// <summary>
        /// States
        /// </summary>
        [ScribanExportValueLabel]
        public List<ScribanExportState> States { get; set; }
    }
}