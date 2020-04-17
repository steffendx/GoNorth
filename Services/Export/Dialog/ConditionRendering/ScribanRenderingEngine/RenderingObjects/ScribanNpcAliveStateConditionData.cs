using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.ConditionRendering.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Scriban rendering class for a npc alive state condition data
    /// </summary>
    public class ScribanNpcAliveStateConditionData
    {
        /// <summary>
        /// Npc that is checked
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportNpc Npc { get; set; }

        /// <summary>
        /// Npc alive state for the comparison
        /// </summary>
        [ScribanExportValueLabel]
        public string NpcAliveState { get; set; }
    }
}