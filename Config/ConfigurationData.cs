namespace GoNorth.Config
{
    /// <summary>
    /// Configuration Data
    /// </summary>
    public class ConfigurationData
    {
        /// <summary>
        /// Misc Config
        /// </summary>
        public MiscConfig Misc { get; set; }

        /// <summary>
        /// Mongo Db Config
        /// </summary>
        public MongoDbConfig MongoDb { get; set; }

        /// <summary>
        /// Email Configuration
        /// </summary>
        public EmailConfig Email { get; set; }

        /// <summary>
        /// Legal Notice Configuration
        /// </summary>
        public LegalNoticeConfig LegalNotice { get; set; }
    }
}