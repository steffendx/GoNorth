using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Scriban rendering class for a wait action
    /// </summary>
    public class ScribanWaitActionData
    {
        /// <summary>
        /// Amount of time that is waited
        /// </summary>
        [ScribanExportValueLabel]
        public int WaitAmount { get; set; }
        
        /// <summary>
        /// Type to wait
        /// </summary>
        [ScribanExportValueLabel]
        public string WaitType { get; set; }
                
        /// <summary>
        /// Wait unit
        /// </summary>
        [ScribanExportValueLabel]
        public string WaitUnit { get; set; }

        /// <summary>
        /// Direct continue function
        /// </summary>
        [ScribanExportValueLabel]
        public string DirectContinueFunction { get; set; }
    }
}