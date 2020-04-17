using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Scriban rendering class for a move npc base action data
    /// </summary>
    public class ScribanMoveNpcToNpcActionBaseData
    {
        /// <summary>
        /// Npc that is moved
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportNpc Npc { get; set; }
        
        /// <summary>
        /// Npc to which the npc is moved
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportNpc TargetNpc { get; set; }
    }
}