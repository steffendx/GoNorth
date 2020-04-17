using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Scriban rendering class for showing a floating text above an object
    /// </summary>
    public class ScribanShowFloatingTextActionData
    {
        /// <summary>
        /// Npc over which the text should be shown
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportNpc TargetNpc { get; set; }

        /// <summary>
        /// Text to show
        /// </summary>
        [ScribanExportValueLabel]
        public string Text { get; set; }

        /// <summary>
        /// Unesecaped text to show
        /// </summary>
        [ScribanExportValueLabel]
        public string UnescapedText { get; set; }

        /// <summary>
        /// Preview text to show
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