using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Scriban rendering class for a code action
    /// </summary>
    public class ScribanCodeActionData
    {
        /// <summary>
        /// Name of the script
        /// </summary>
        [ScribanExportValueLabel]
        public string ScriptName { get; set; }
        
        /// <summary>
        /// Unesecaped name of the script
        /// </summary>
        [ScribanExportValueLabel]
        public string UnescapedScriptName { get; set; }

        /// <summary>
        /// Code of the script
        /// </summary>
        [ScribanExportValueLabel]
        public string ScriptCode { get; set; }
    }
}