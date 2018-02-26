using System.Collections.Generic;

namespace GoNorth.Services.Timeline
{
    /// <summary>
    /// Result of a timeline entries query
    /// </summary>
    public class TimelineEntriesQueryResult
    {
        /// <summary>
        /// Entries to display
        /// </summary>
        public List<FormattedTimelineEntry> Entries { get; set;}

        /// <summary>
        /// true if more can be requested, else false
        /// </summary>
        public bool HasMore { get; set; }

        /// <summary>
        /// Index at which the next values can be requested
        /// </summary>
        /// <returns></returns>
        public int ContinueStart { get; set; }
    }
}