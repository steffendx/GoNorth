namespace GoNorth.Models.KirjaViewModels
{
    /// <summary>
    /// Kirja Review Viewmodel
    /// </summary>
    public class KirjaReviewViewModel
    {
        /// <summary>
        /// true if external sharing is disabled
        /// </summary>
        public bool DisableWikiExternalSharing { get; set; }

        /// <summary>
        /// true if auto save is disabled, else false
        /// </summary>
        public bool DisableAutoSaving { get; set; }
    }
}