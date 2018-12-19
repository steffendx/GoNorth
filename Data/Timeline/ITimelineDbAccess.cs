using System;
using System.Collections.Generic;
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
        /// Updates a new timeline entry
        /// </summary>
        /// <param name="entry">Timeline Entry</param>
        /// <returns>Task</returns>
        Task UpdateTimelineEntry(TimelineEntry entry);

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

        /// <summary>
        /// Returns all timeline entries by a user
        /// </summary>
        /// <param name="userName">Username</param>
        /// <returns>Timeline entries</returns>
        Task<List<TimelineEntry>> GetTimelineEntriesByUser(string userName);

        /// <summary>
        /// Returns the timeline entries by a user for a given timespan and project ordered descending by timestamp
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="userName">Username</param>
        /// <param name="timelineEvent">Event to return</param>
        /// <param name="dateLimit">Date from which time onwards the events should be returned</param>
        /// <returns>Timeline entries</returns>
        Task<List<TimelineEntry>> GetTimelineEntriesByUserInTimeSpan(string projectId, string userName, TimelineEvent timelineEvent, DateTimeOffset dateLimit);

        /// <summary>
        /// Deletes all timeline entries of a user
        /// </summary>
        /// <param name="userName">Username</param>
        /// <returns>Task</returns>
        Task DeleteTimelineEntriesOfUser(string userName);


        /// <summary>
        /// Creates the timeline indices
        /// </summary>
        /// <returns>Task</returns>
        Task CreateTimelineIndices();
    }
}