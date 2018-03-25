using System;
using System.Collections.Generic;
using GoNorth.Data.ImplementationSnapshot;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.Karta.Marker
{
    /// <summary>
    /// Karta Map Marker
    /// </summary>
    public class MapMarker : IImplementationComparable, IImplementationSnapshotable, IImplementationStatusTrackingObject
    {
        /// <summary>
        /// Id
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// X-Position on the map
        /// </summary>
        [ValueCompareAttribute]
        public float X { get; set; }

        /// <summary>
        /// Y-Position on the map
        /// </summary>
        [ValueCompareAttribute]
        public float Y { get; set; }

        /// <summary>
        /// Chapter in which the marker was added to the map
        /// </summary>
        [ValueCompareAttribute]
        public int AddedInChapter { get; set; }

        /// <summary>
        /// Chapter Pixel Coords
        /// </summary>
        [ListCompareAttribute(LabelKey = "ChapterPixelCoordsChanged")]
        public List<MapMarkerChapterPixelCoords> ChapterPixelCoords { get; set; }   
        
        /// <summary>
        /// Chapter in which the marker was deleted from the map
        /// </summary>
        [ValueCompareAttribute]
        public int DeletedInChapter { get; set; }

        /// <summary>
        /// Geometry associated to the marker
        /// </summary>
        [ListCompareAttribute(LabelKey = "MarkerGeometryChanged")]
        public List<MarkerGeometry> Geometry { get; set; }


        /// <summary>
        /// true if the object is implemented, else false
        /// </summary>
        public bool IsImplemented { get; set; }
    }
}