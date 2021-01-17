using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.StepRenderers.RenderingObjects
{
    /// <summary>
    /// Scriban Class for Rendering choice dialog steps
    /// </summary>
    public class ScribanReferenceData : ScribanDialogStepBaseDataWithNextNode
    {
        /// <summary>
        /// Text of the reference
        /// </summary>
        [ScribanExportValueObjectLabel]
        public string ReferenceText { get; set; }

        /// <summary>
        /// Type of the object
        /// </summary>
        [ScribanExportValueObjectLabel]
        public string ObjectType { get; set; }

        /// <summary>
        /// Npc that is exported
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportNpc Npc { get; set; }

        /// <summary>
        /// Item that is exported
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportItem Item { get; set; }

        /// <summary>
        /// Skill that is exported
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportSkill Skill { get; set; }

        /// <summary>
        /// Quest that is exported
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportQuest Quest { get; set; }

        /// <summary>
        /// Wiki page that is exported
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportWikiPage WikiPage { get; set; }

        /// <summary>
        /// Daily Routine Event
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportDailyRoutineEvent DailyRoutineEvent { get; set; }

        /// <summary>
        /// Marker that must be export
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportMapMarker Marker { get; set; }
    }
}