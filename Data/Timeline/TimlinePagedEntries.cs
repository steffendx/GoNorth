using System.Collections.Generic;
using GoNorth.Services.Timeline;

namespace GoNorth.Data.Timeline
{
    /// <summary>
    /// Paged entries for the timeline
    /// </summary>
    public class TimelinePagedEntries
    {
        /// <summary>
        /// Start Index
        /// </summary>
        public int StartIndex { get; set; }

        /// <summary>
        /// Page Size
        /// </summary>
        public int PageSize { get; set; }

        /// <summary>
        /// Entries
        /// </summary>
        public List<TimelineEntry> Entries { get; set; }
    }
}