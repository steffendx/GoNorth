using System;
using System.Collections.Generic;

namespace GoNorth.Data.Karta.Marker
{
    /// <summary>
    /// Karta Map Change Map Marker
    /// </summary>
    public class MapChangeMapMarker : MapMarker
    {
        /// <summary>
        /// Id of the map to switch to
        /// </summary>
        public string MapId { get; set; }
    }
}