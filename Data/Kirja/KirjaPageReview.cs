using System;

namespace GoNorth.Data.Kirja
{
    /// <summary>
    /// Kirja page review
    /// </summary>
    public class KirjaPageReview : KirjaPage
    {
        /// <summary>
        /// Id of the page that is being reviewed
        /// </summary>
        public string ReviewedPageId { get; set; }

        /// <summary>
        /// Status of the review
        /// </summary>
        public KirjaPageReviewStatus Status { get; set; }

        /// <summary>
        /// Additional comment
        /// </summary>
        public string AdditionalComment { get; set; }

        /// <summary>
        /// External access token
        /// </summary>
        public string ExternalAccessToken { get; set; }

        
        /// <summary>
        /// Creation Date
        /// </summary>
        public DateTimeOffset CreatedOn { get; set; }
    }
}