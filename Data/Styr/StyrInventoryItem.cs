using System;
using System.Text.Json.Serialization;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.Styr
{
    /// <summary>
    /// Inventory Item
    /// </summary>
    public class StyrInventoryItem : IImplementationListComparable, ICloneable
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
        /// Role of the item
        /// </summary>
        [ValueCompareAttribute]
        public string Role { get; set; }


        /// <summary>
        /// Id which is used in a list compare to detect deleted or new objects
        /// </summary>
        [JsonIgnore]
        public string ListComparableId { get { return ItemId; } }

        /// <summary>
        /// Value which is used in a list compare for display
        /// </summary>
        [JsonIgnore]
        public CompareDifferenceValue ListComparableValue { get { return new CompareDifferenceValue(ItemId, CompareDifferenceValue.ValueResolveType.ResolveItemName); } }

        /// <summary>
        /// Clones the object
        /// </summary>
        /// <returns>Cloned object</returns>
        public object Clone()
        {
            return new StyrInventoryItem {
                ItemId = this.ItemId,
                Quantity = this.Quantity,
                Role = this.Role
            };
        }
    }
}