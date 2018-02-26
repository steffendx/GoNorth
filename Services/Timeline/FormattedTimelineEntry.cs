using System;

namespace GoNorth.Services.Timeline
{
    /// <summary>
    /// Formatted timeline entry
    /// </summary>
    public class FormattedTimelineEntry
    {
        /// <summary>
        /// Timestamp
        /// </summary>
        public DateTimeOffset Timestamp { get; set; }

        /// <summary>
        /// User Displayname
        /// </summary>
        public string UserDisplayName { get; set; }

        /// <summary>
        /// Content to display
        /// </summary>
        public string Content { get; set; }
    }
}