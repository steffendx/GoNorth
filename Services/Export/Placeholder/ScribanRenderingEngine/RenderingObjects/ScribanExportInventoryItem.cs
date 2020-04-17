using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Class to export Items in an inventory to Scriban
    /// </summary>
    public class ScribanExportInventoryItem : ScribanExportItem
    {
        /// <summary>
        /// Quantity in the inventory
        /// </summary>
        [ScribanExportValueLabel]
        public int Quantity { get; set; }

        /// <summary>
        /// true if the item is equipped
        /// </summary>
        [ScribanExportValueLabel]
        public bool IsEquipped { get; set;}
    }
}