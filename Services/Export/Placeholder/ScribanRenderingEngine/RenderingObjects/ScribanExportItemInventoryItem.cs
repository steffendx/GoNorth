using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Class to export Items in an inventory to Scriban
    /// </summary>
    public class ScribanExportItemInventoryItem : ScribanExportItem
    {
        /// <summary>
        /// Quantity in the inventory
        /// </summary>
        [ScribanExportValueLabel]
        public int Quantity { get; set; }

        /// <summary>
        /// Role of the item
        /// </summary>
        [ScribanExportValueLabel]
        public string Role { get; set;}
    }
}