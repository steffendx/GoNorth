using System;
using System.Collections.Generic;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.Karta.Marker
{
    /// <summary>
    /// Note Map Marker
    /// </summary>
    public class NoteMapMarker : MapMarker
    {
        /// <summary>
        /// Name of the marker
        /// </summary>
        [ValueCompareAttribute]
        public string Name { get; set; }

        /// <summary>
        /// Description of the marker
        /// </summary>
        [ValueCompareAttribute]
        public string Description { get; set; }
    }
}