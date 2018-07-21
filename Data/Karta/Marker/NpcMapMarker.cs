using System;
using System.Collections.Generic;

namespace GoNorth.Data.Karta.Marker
{
    /// <summary>
    /// Npc Map Marker
    /// </summary>
    public class NpcMapMarker : MapMarker
    {
        /// <summary>
        /// Id of the npc to display
        /// </summary>
        public string NpcId { get; set; }

        /// <summary>
        /// Name of the npc, used for quick loading of map name for npc label. Kept in sync by backend.
        /// </summary>
        public string NpcName { get; set; }
    }
}