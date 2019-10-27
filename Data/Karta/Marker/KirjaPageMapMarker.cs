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

        /// <summary>
        /// Name of the page, used for quick loading of page name for marker label. Kept in sync by backend.
        /// </summary>
        public string PageName { get; set; }
    }
}