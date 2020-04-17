using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Scriban rendering class for a add quest text action
    /// </summary>
    public class ScribanAddQuestTextActionData
    {
        /// <summary>
        /// Quest that is exported
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportQuest Quest { get; set; }

        /// <summary>
        /// Text to add
        /// </summary>
        [ScribanExportValueLabel]
        public string Text { get; set; }

        /// <summary>
        /// Unesecaped text to add
        /// </summary>
        [ScribanExportValueLabel]
        public string UnescapedText { get; set; }

        /// <summary>
        /// Preview text to add
        /// </summary>
        [ScribanExportValueLabel]
        public string TextPreview { get; set; }

        /// <summary>
        /// Flex field to which the action belongs
        /// </summary>
        public FlexFieldObject FlexFieldObject { get; set; }

        /// <summary>
        /// Node step id
        /// </summary>
        /// <value></value>
        public ExportDialogData NodeStep { get; set; }
    }
}