using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Scriban rendering class for an inventory action with choosing an npc
    /// </summary>
    public class ScribanInventoryChooseNpcActionData
    {
        /// <summary>
        /// Npc
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportNpc Npc { get; set; }

        /// <summary>
        /// Selected item
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportItem SelectedItem { get; set; }
        
        /// <summary>
        /// Quantity that was selected
        /// </summary>
        [ScribanExportValueLabel]
        public int Quantity { get; set; }
    }
}