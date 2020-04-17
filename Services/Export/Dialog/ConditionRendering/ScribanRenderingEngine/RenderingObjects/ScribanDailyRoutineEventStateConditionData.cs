
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.ConditionRendering.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Scriban rendering class to check a daily routine event state
    /// </summary>
    public class ScribanDailyRoutineEventStateConditionData
    {
        /// <summary>
        /// Daily routine event
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportDailyRoutineEvent DailyRoutineEvent { get; set; }
        
        /// <summary>
        /// Npc to which the daily routine belongs
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportNpc Npc { get; set; }
    }
}