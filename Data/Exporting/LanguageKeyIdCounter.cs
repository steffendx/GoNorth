namespace GoNorth.Data.Exporting
{
    /// <summary>
    /// Language Key Id Counter for a Language Group
    /// </summary>
    public class LanguageKeyIdCounter
    {
        /// <summary>
        /// Id
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Project Id
        /// </summary>
        public string ProjectId { get; set; }

        /// <summary>
        /// Id of the group to which the counter belongs
        /// </summary>
        public string GroupId { get; set; }

        /// <summary>
        /// Current Language Key Id
        /// </summary>
        public int CurLanguageKeyId { get; set; }
    };
}