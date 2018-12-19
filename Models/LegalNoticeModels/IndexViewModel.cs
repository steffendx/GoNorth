namespace GoNorth.Models.LegalNoticeModels
{
    /// <summary>
    /// Index view model
    /// </summary>
    public class IndexViewModel
    {
        /// <summary>
        /// Contact Person
        /// </summary>
        public string ContactPerson { get; set; }
        
        /// <summary>
        /// Contact Street
        /// </summary>
        public string ContactStreet { get; set; }
        
        /// <summary>
        /// Contact City
        /// </summary>
        public string ContactCity { get; set; }

        /// <summary>
        /// Represented by person
        /// </summary>
        public string RepresentedByPerson { get; set; }

        /// <summary>
        /// Contact Email
        /// </summary>
        public string ContactEmail { get; set; }
    }
}
