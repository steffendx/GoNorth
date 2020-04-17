using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.ConditionRendering.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Scriban rendering class for a quest state condition data
    /// </summary>
    public class ScribanQuestStateConditionData
    {
        /// <summary>
        /// Quest that is checked
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportQuest Quest { get; set; }

        /// <summary>
        /// Quest state for the comparison
        /// </summary>
        [ScribanExportValueLabel]
        public string QuestState { get; set; }
    }
}