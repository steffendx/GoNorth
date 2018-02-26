using System;
using System.Collections.Generic;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.Karta.Marker
{
    /// <summary>
    /// Quest Map Marker
    /// </summary>
    public class QuestMapMarker : MapMarker
    {
        /// <summary>
        /// Id of the quest to which the marker belongs
        /// </summary>
        public string QuestId { get; set; }

        /// <summary>
        /// Name of the marker
        /// </summary>
        [ValueCompareAttribute]
        public string Name { get; set; }
    }
}