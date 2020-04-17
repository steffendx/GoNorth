using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Scriban rendering class for a set quest state action
    /// </summary>
    public class ScribanSetQuestStateActionData
    {
        /// <summary>
        /// Quest that is exported
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportQuest Quest { get; set; }

        /// <summary>
        /// Target state of the quest
        /// </summary>
        [ScribanExportValueLabel]
        public string TargetState { get; set; }
    }
}