using System;
using System.Collections.Generic;
using GoNorth.Data.Karta.Marker;

namespace GoNorth.Data.Karta
{
    /// <summary>
    /// Karta Map
    /// </summary>
    public class KartaMap : IHasModifiedData
    {
        /// <summary>
        /// Id
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Project Id of the Map
        /// </summary>
        public string ProjectId { get; set; }

        /// <summary>
        /// Name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// MaxZoom of the map
        /// </summary>
        public int MaxZoom { get; set; }

        /// <summary>
        /// Width of the original image of the map
        /// </summary>
        public int Width { get; set; }

        /// <summary>
        /// Height of the original image of the map
        /// </summary>
        public int Height { get; set; } 


        /// <summary>
        /// Npc Marker
        /// </summary>
        public List<NpcMapMarker> NpcMarker { get; set; }

        /// <summary>
        /// Item Marker
        /// </summary>
        public List<ItemMapMarker> ItemMarker { get; set; }

        /// <summary>
        /// Kirja Page Marker
        /// </summary>
        public List<KirjaPageMapMarker> KirjaPageMarker { get; set; }

        /// <summary>
        /// Quest Marker
        /// </summary>
        public List<QuestMapMarker> QuestMarker { get; set; }

        /// <summary>
        /// Map Change Marker
        /// </summary>
        public List<MapChangeMapMarker> MapChangeMarker { get; set; }

        /// <summary>
        /// Note Marker
        /// </summary>
        public List<NoteMapMarker> NoteMarker { get; set; }


        /// <summary>
        /// Last modify Date
        /// </summary>
        public DateTimeOffset ModifiedOn { get; set; }

        /// <summary>
        /// Id of the user who last modified the map
        /// </summary>
        public string ModifiedBy { get; set; }
    }
}