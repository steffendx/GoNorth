using System;
using System.Collections.Generic;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Services.Export.Json;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.Kortisto
{
    /// <summary>
    /// Kortisto Inventory Item
    /// </summary>
    public class KortistoInventoryItem : IImplementationListComparable
    {
        /// <summary>
        /// Item Id
        /// </summary>
        public string ItemId { get; set; }

        /// <summary>
        /// Quantity
        /// </summary>
        [ValueCompareAttribute]
        public int Quantity { get; set; }

        /// <summary>
        /// true if the item is equipped
        /// </summary>
        [ValueCompareAttribute]
        public bool IsEquipped { get; set; }


        /// <summary>
        /// Id which is used in a list compare to detect deleted or new objects
        /// </summary>
        [JsonExportIgnoreAttribute]
        public string ListComparableId { get { return ItemId; } }

        /// <summary>
        /// Value which is used in a list compare for display
        /// </summary>
        [JsonExportIgnoreAttribute]
        public CompareDifferenceValue ListComparableValue { get { return new CompareDifferenceValue(ItemId, CompareDifferenceValue.ValueResolveType.ResolveItemName); } }
    }
}