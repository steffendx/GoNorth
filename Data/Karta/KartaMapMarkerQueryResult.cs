using System;
using System.Collections.Generic;
using GoNorth.Data.Karta.Marker;

namespace GoNorth.Data.Karta
{
    /// <summary>
    /// Karta Map Marker Query Result
    /// </summary>
    public class KartaMapMarkerQueryResult
    {
        /// <summary>
        /// Map Id
        /// </summary>
        public string MapId { get; set; }

        /// <summary>
        /// Name of the map
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Type of the markers
        /// </summary>
        public string MapMarkerType { get; set; }

        /// <summary>
        /// Found Markers for the map
        /// </summary>
        public List<string> MarkerIds { get; set; }


        /// <summary>
        /// Constructor
        /// </summary>
        public KartaMapMarkerQueryResult()
        {
            MarkerIds = new List<string>();
        }
    }
}