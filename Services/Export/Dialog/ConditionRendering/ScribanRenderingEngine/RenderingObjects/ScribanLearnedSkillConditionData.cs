using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.ConditionRendering.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Scriban rendering class for a learned skill condition data
    /// </summary>
    public class ScribanLearnedSkillConditionData
    {
        /// <summary>
        /// Npc that contains the skill
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportNpc Npc { get; set; }

        /// <summary>
        /// Skill that was selected for the condition
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportSkill SelectedSkill { get; set; }
    }
}