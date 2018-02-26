using System;
using System.Collections.Generic;

namespace GoNorth.Data.Karta.Marker
{
    /// <summary>
    /// Karta Map Marker Query Result
    /// </summary>
    public class MapMarkerQueryResult
    {
        /// <summary>
        /// Id
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Name of the marker
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Name of the Map
        /// </summary>
        public string MapName { get; set; }
    }
}