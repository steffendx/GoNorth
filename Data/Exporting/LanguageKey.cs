namespace GoNorth.Data.Exporting
{
    /// <summary>
    /// Language Key
    /// </summary>
    public class LanguageKey
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
        /// Id of the group to which the language key belongs. This can be an npc, item or skill id for example
        /// </summary>
        public string GroupId { get; set; }

        /// <summary>
        /// Reference to identify the language key in the group. This can be a string or a field id for example
        /// </summary>
        public string LangKeyRef { get; set; }

        /// <summary>
        /// Language key
        /// </summary>
        public string LangKey { get; set; }

        /// <summary>
        /// Value saved for the language key
        /// </summary>
        public string Value { get; set; }
    };
}