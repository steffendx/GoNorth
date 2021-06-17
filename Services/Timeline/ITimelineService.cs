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
        /// <param name="projectId">Id of the project to associate, if null the project will be loaded</param>
        /// <param name="timelineEvent">Timeline Event</param>
        /// <param name="additionalValues">Additional Values</param>
        /// <returns>Task</returns>
        Task AddTimelineEntry(string projectId, TimelineEvent timelineEvent, params string[] additionalValues);

        /// <summary>
        /// Adds a timeline event for an external user
        /// </summary>
        /// <param name="projectId">Id of the project to associate, if null the project will be loaded</param>
        /// <param name="timelineEvent">Timeline Event</param>
        /// <param name="additionalValues">Additional Values</param>
        /// <returns>Task</returns>
        Task AddExternalTimelineEntry(string projectId, TimelineEvent timelineEvent, params string[] additionalValues);

        /// <summary>
        /// Returns the timeline entries for a paged view
        /// </summary>
        /// <param name="start">Start for the page</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Query result</returns>
        Task<TimelineEntriesQueryResult> GetTimelineEntriesPaged(int start, int pageSize);
    }
}