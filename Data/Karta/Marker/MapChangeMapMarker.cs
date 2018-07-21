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

        /// <summary>
        /// Name of the map to switch to, used for quick loading of map name for marker label. Kept in sync by backend.
        /// </summary>
        public string MapName { get; set; }
    }
}