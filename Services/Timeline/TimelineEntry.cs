using System;

namespace GoNorth.Services.Timeline
{
    /// <summary>
    /// Timeline Entry
    /// </summary>
    public class TimelineEntry
    {
        /// <summary>
        /// Id of the entry
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Project Id
        /// </summary>
        public string ProjectId { get; set; }

        /// <summary>
        /// Event that occured
        /// </summary>
        public TimelineEvent Event { get; set; }

        /// <summary>
        /// Timestamp at which the event occured
        /// </summary>
        public DateTimeOffset Timestamp { get; set; }

        /// <summary>
        /// Username of the user that triggered the event
        /// </summary>
        public string Username { get; set; }

        /// <summary>
        /// Display Name of the user that triggered the event
        /// </summary>
        public string UserDisplayName { get; set; }

        /// <summary>
        /// Additional values to display
        /// </summary>
        public string[] AdditionalValues { get; set; }
    }
}