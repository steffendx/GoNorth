using System.Threading.Tasks;
using GoNorth.Models;
using GoNorth.Services.Timeline;

namespace GoNorth.Data.Timeline
{
    /// <summary>
    /// Interface for Database Access for Timeline
    /// </summary>
    public interface ITimelineDbAccess
    {
        /// <summary>
        /// Creates a new timeline entry
        /// </summary>
        /// <param name="entry">Timeline Entry</param>
        /// <returns>Timeline Entry with filled id</returns>
        Task<TimelineEntry> CreateTimelineEntry(TimelineEntry entry);

        /// <summary>
        /// Returns a paged list of timeline entries
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="start">Start Index</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Paged Entries</returns>
        Task<TimelinePagedEntries> GetTimelineEntriesPaged(string projectId, int start, int pageSize);

        /// <summary>
        /// Returns the count of timeline entries
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Count of timeline entries</returns>
        Task<int> GetTimelineEntriesCount(string projectId);
    }
}