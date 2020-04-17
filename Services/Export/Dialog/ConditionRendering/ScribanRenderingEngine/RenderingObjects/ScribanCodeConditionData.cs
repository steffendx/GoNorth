using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.ConditionRendering.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Scriban rendering class for code conditions
    /// </summary>
    public class ScribanCodeConditionData
    {
        /// <summary>
        /// Name of the script
        /// </summary>
        [ScribanExportValueLabel]
        public string ScriptName { get; set; }
        
        /// <summary>
        /// Code of the script
        /// </summary>
        [ScribanExportValueLabel]
        public string ScriptCode { get; set; }
    }
}