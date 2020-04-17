using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Scriban rendering class for a change target npc state action
    /// </summary>
    public class ScribanChangeTargetNpcStateActionData
    {
        /// <summary>
        /// Skill which is triggered
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportSkill Skill { get; set; }

        /// <summary>
        /// Target state of the npc
        /// </summary>
        [ScribanExportValueLabel]
        public string TargetState { get; set; }
        
        /// <summary>
        /// Unescaped target state of the npc
        /// </summary>
        [ScribanExportValueLabel]
        public string UnescapedTargetState { get; set; }
    }
}