using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Scriban rendering class for a use item action
    /// </summary>
    public class ScribanUseItemActionData
    {
        /// <summary>
        /// Npc that uses the item
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportNpc Npc { get; set; }

        /// <summary>
        /// Item that is being used
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportItem SelectedItem { get; set; }
    }
}