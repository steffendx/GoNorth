namespace GoNorth.Config
{
    /// <summary>
    /// Miscellaneous Config Data
    /// </summary>
    public class MiscConfig
    {
        /// <summary>
        /// External Url
        /// </summary>
        public string ExternalUrl { get; set; }

        /// <summary>
        /// Allowed Kirja Attachment Mime Types
        /// </summary>
        public string KirjaAllowedAttachmentMimeTypes { get; set; }

        /// <summary>
        /// Password used for first time deployment
        /// </summary>
        public string FirstTimeDeploymentPassword { get; set; }
    }
}