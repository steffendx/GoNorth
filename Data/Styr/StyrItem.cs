using System;
using System.Collections.Generic;
using System.Linq;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.Styr
{
    /// <summary>
    /// Styr Item
    /// </summary>
    public class StyrItem : FlexFieldObject, IExportSnippetExportable, ICloneable
    {
        /// <summary>
        /// Inventory Items
        /// </summary>
        [ListCompareAttribute(LabelKey = "InventoryChanged")]
        public List<StyrInventoryItem> Inventory { get; set; }

        /// <summary>
        /// Clones the item
        /// </summary>
        /// <returns>Cloned item</returns>
        public object Clone()
        {
            StyrItem clonedItem = CloneObject<StyrItem>();
            clonedItem.Inventory = Inventory != null ? Inventory.Select(i => i.Clone()).Cast<StyrInventoryItem>().ToList() : null;

            return clonedItem;
        }
    }
}