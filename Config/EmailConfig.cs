namespace GoNorth.Config
{
    /// <summary>
    /// Mongo Db Config
    /// </summary>
    public class EmailConfig
    {
        /// <summary>
        /// Smtp Server
        /// </summary>
        public string SmtpServer { get; set; }

        /// <summary>
        /// Smtp Port
        /// </summary>
        public int SmtpPort { get; set; }

        /// <summary>
        /// Smtp Username
        /// </summary>
        public string SmtpUsername { get; set; }

        /// <summary>
        /// Smtp Password
        /// </summary>
        public string SmtpPassword { get; set; }

        /// <summary>
        /// true if SSL is used for Smtp, else false
        /// </summary>
        public bool SmtpUseSSL { get; set; }
    }
}