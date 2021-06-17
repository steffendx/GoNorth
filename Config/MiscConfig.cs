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
        /// Timespan in minutes for a kirja version to be merged if it was edited by the same user
        /// </summary>
        public float KirjaVersionMergeTimeSpan { get; set; }

        /// <summary>
        /// Max version count for kirja pages before old versions are getting deleted
        /// </summary>
        public int KirjaMaxVersionCount { get; set; }

        /// <summary>
        /// Timespan in minutes for timeline events to be merged if made for the same event for the same user
        /// </summary>
        public float TimelineMergeTimeSpan { get; set; }

        /// <summary>
        /// Password used for first time deployment
        /// </summary>
        public string FirstTimeDeploymentPassword { get; set; }
        
        /// <summary>
        /// true if GDPR Support should be active
        /// </summary>
        public bool UseGdpr { get; set; }

        /// <summary>
        /// true if Legal Notice Support should be active
        /// </summary>
        public bool UseLegalNotice { get; set; }

        /// <summary>
        /// CSV Delimiter
        /// </summary>
        public string CsvDelimiter { get; set; }

        /// <summary>
        /// Timeout for locks
        /// </summary>
        public int? ResourceLockTimespan { get; set;}

        /// <summary>
        /// True if external wiki sharing must be disabled, else false
        /// </summary>
        public bool? DisableWikiExternalSharing { get; set; }

        /// <summary>
        /// True if auto saving must be disabled
        /// </summary>
        public bool? DisableAutoSaving { get; set; }
    }
}