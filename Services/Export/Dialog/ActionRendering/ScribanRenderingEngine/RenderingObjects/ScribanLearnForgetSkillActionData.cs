using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Scriban rendering class for a learn / forget skill action
    /// </summary>
    public class ScribanLearnForgetSkillActionData
    {
        /// <summary>
        /// Skill that is learned or forgotten
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportSkill Skill { get; set; }
    }
}