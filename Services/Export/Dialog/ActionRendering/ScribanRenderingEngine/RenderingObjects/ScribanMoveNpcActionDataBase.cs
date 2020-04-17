using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Scriban rendering class for a move npc base action
    /// </summary>
    public class ScribanMoveNpcActionDataBase
    {
        /// <summary>
        /// Npc that is moved
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportNpc Npc { get; set; }
        
        /// <summary>
        /// Name of the target marker
        /// </summary>
        [ScribanExportValueLabel]
        public string TargetMarkerName { get; set; }
        
        /// <summary>
        /// Name of the target marker without using escape setting
        /// </summary>
        [ScribanExportValueLabel]
        public string UnescapedTargetMarkerName { get; set; }
    }
}