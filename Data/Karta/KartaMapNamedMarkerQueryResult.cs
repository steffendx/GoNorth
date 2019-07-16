namespace GoNorth.Data.Karta
{
    /// <summary>
    /// Karta Map Named Marker Query Result
    /// </summary>
    public class KartaMapNamedMarkerQueryResult
    {
        /// <summary>
        /// Map Id
        /// </summary>
        public string MapId { get; set; }

        /// <summary>
        /// Name of the map
        /// </summary>
        public string MapName { get; set; }

        /// <summary>
        /// Type of the marker
        /// </summary>
        public string MarkerType { get; set; }

        /// <summary>
        /// Marker Id
        /// </summary>
        public string MarkerId { get; set; }

        /// <summary>
        /// Name of the marker
        /// </summary>
        public string MarkerName { get; set; }

    }
}