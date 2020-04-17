using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Scriban rendering class for an inventory action
    /// </summary>
    public class ScribanInventoryActionData
    {
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