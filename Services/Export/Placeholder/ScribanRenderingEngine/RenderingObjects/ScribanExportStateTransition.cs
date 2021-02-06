using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Class to export states to Scriban
    /// </summary>
    public class ScribanExportStateTransition
    {
        /// <summary>
        /// Label of the transition
        /// </summary>
        [ScribanExportValueLabel]
        public string Label { get; set; }

        /// <summary>
        /// True if the transition is connected to an end state
        /// </summary>
        [ScribanExportValueLabel]
        public bool IsConnectedToEnd { get; set; }

        /// <summary>
        /// State to which the transition is connected
        /// </summary>
        [ScribanExportValueLabel]
        public ScribanExportState TargetState { get; set; }
    }
}