using System;
using System.Collections.Generic;

namespace GoNorth.Data.Karta.Marker
{
    /// <summary>
    /// Item Map Marker
    /// </summary>
    public class ItemMapMarker : MapMarker
    {
        /// <summary>
        /// Id of the item to display
        /// </summary>
        public string ItemId { get; set; }

        /// <summary>
        /// Name of the item, used for quick loading of item name for marker label. Kept in sync by backend.
        /// </summary>
        public string ItemName { get; set; }
    }
}