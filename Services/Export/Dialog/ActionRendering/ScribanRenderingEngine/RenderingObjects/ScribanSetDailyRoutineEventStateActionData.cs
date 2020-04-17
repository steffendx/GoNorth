using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Scriban rendering class for a set daily routine event state
    /// </summary>
    public class ScribanSetDailyRoutineEventStateActionData
    {
        /// <summary>
        /// Npc for which the state is changed
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportNpc Npc { get; set; }

        /// <summary>
        /// Daily routine event
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportDailyRoutineEvent DailyRoutineEvent { get; set; }
    }
}