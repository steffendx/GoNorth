namespace GoNorth.Data.Karta.Marker
{
    /// <summary>
    /// Karta Map Marker
    /// </summary>
    public class MarkerImplementationQueryResultObject
    {
        /// <summary>
        /// Id
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Id of the map
        /// </summary>
        public string MapId { get; set; }

        /// <summary>
        /// Map Name to which the marker belongs
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Type of the marker
        /// </summary>
        public MarkerType Type { get; set; }
    }
}