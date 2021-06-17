namespace GoNorth.Data.Kirja
{
    /// <summary>
    /// Kirja page review status
    /// </summary>
    public enum KirjaPageReviewStatus
    {
        /// <summary>
        /// The review is still open
        /// </summary>
        Open = 0,

        /// <summary>
        /// The review is completed
        /// </summary>
        Completed = 1,

        /// <summary>
        /// The review is merged
        /// </summary>
        Merged = 2
    }
}