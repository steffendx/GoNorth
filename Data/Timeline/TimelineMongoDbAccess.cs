using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Config;
using GoNorth.Models;
using GoNorth.Services.Timeline;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.Timeline
{
    /// <summary>
    /// Timeline Mongo DB Access
    /// </summary>
    public class  TimelineMongoDbAccess : BaseMongoDbAccess, ITimelineDbAccess
    {
        /// <summary>
        /// Collection Name of the timeline
        /// </summary>
        public const string TimelineCollectionName = "Timeline";

        /// <summary>
        /// Timeline Collection
        /// </summary>
        private IMongoCollection<TimelineEntry> _TimelineCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public TimelineMongoDbAccess(IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _TimelineCollection = _Database.GetCollection<TimelineEntry>(TimelineCollectionName);
        }

        /// <summary>
        /// Creates a new timeline entry
        /// </summary>
        /// <param name="entry">Timeline Entry</param>
        /// <returns>Timeline Entry with filled id</returns>
        public async Task<TimelineEntry> CreateTimelineEntry(TimelineEntry entry)
        {
            entry.Id = Guid.NewGuid().ToString();
            await _TimelineCollection.InsertOneAsync(entry);

            return entry;
        }

        /// <summary>
        /// Returns a paged list of timeline entries
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="start">Start Index</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Paged Entries</returns>
        public async Task<TimelinePagedEntries> GetTimelineEntriesPaged(string projectId, int start, int pageSize)
        {
            List<TimelineEntry> pagedEntries = await _TimelineCollection.AsQueryable().Where(e => e.ProjectId == projectId).OrderByDescending(e => e.Timestamp).Skip(start).Take(pageSize).ToListAsync();

            TimelinePagedEntries result = new TimelinePagedEntries();
            result.StartIndex = start;
            result.PageSize = pageSize;
            result.Entries = pagedEntries;

            return result;
        }

        /// <summary>
        /// Returns the count of timeline entries
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Count of timeline entries</returns>
        public async Task<int> GetTimelineEntriesCount(string projectId)
        {
            return await _TimelineCollection.AsQueryable().Where(e => e.ProjectId == projectId).CountAsync();
        }

    }
}