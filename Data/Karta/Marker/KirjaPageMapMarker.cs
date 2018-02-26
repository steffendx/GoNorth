using System;
using System.Collections.Generic;

namespace GoNorth.Data.Karta.Marker
{
    /// <summary>
    /// Karta Kirja Page Map Marker
    /// </summary>
    public class KirjaPageMapMarker : MapMarker
    {
        /// <summary>
        /// Id of the kirja page to display
        /// </summary>
        public string PageId { get; set; }
    }
}