using GoNorth.Data.Karta;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Scriban Export Map Marker
    /// </summary>
    public class ScribanExportMapMarker
    {
        /// <summary>
        /// Map Id
        /// </summary>
        [ScribanExportValueLabel]
        public string MapId { get; set; }

        /// <summary>
        /// Name of the map
        /// </summary>
        [ScribanExportValueLabel]
        public string MapName { get; set; }

        /// <summary>
        /// Type of the marker
        /// </summary>
        [ScribanExportValueLabel]
        public string MarkerType { get; set; }

        /// <summary>
        /// Marker Id
        /// </summary>
        [ScribanExportValueLabel]
        public string MarkerId { get; set; }

        /// <summary>
        /// Name of the marker
        /// </summary>
        [ScribanExportValueLabel]
        public string MarkerName { get; set; }

        /// <summary>
        /// Creates a scriban export map marker based on a marker query result
        /// </summary>
        /// <param name="marker">Marker</param>
        public ScribanExportMapMarker(KartaMapNamedMarkerQueryResult marker)
        {
            MapId = marker.MapId;
            MapName = marker.MapName;
            MarkerType = marker.MarkerType;
            MarkerId = marker.MarkerId;
            MarkerName = marker.MarkerName;
        }
    }
}