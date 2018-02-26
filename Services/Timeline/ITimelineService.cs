using System.Threading.Tasks;

namespace GoNorth.Services.Timeline
{
    /// <summary>
    /// Interface for Timeline Service
    /// </summary>
    public interface ITimelineService
    {
        /// <summary>
        /// Adds a timeline event
        /// </summary>
        /// <param name="timelineEvent">Timeline Event</param>
        /// <param name="additionalValues">Additional Values</param>
        /// <returns>Task</returns>
        Task AddTimelineEntry(TimelineEvent timelineEvent, params string[] additionalValues);

        /// <summary>
        /// Returns the timeline entries for a paged view
        /// </summary>
        /// <param name="start">Start for the page</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Query result</returns>
        Task<TimelineEntriesQueryResult> GetTimelineEntriesPaged(int start, int pageSize);
    }
}