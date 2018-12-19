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
        /// Updates a new timeline entry
        /// </summary>
        /// <param name="entry">Timeline Entry</param>
        /// <returns>Timeline Entry with filled id</returns>
        public async Task UpdateTimelineEntry(TimelineEntry entry)
        {
            ReplaceOneResult result = await _TimelineCollection.ReplaceOneAsync(p => p.Id == entry.Id, entry);
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

        /// <summary>
        /// Returns all timeline entries by a user
        /// </summary>
        /// <param name="userName">Username</param>
        /// <returns>Timeline entries</returns>
        public async Task<List<TimelineEntry>> GetTimelineEntriesByUser(string userName)
        {
            return await _TimelineCollection.AsQueryable().Where(e => e.Username == userName).ToListAsync();
        }

        /// <summary>
        /// Returns the timeline entries by a user for a given timespan and project ordered descending by timestamp
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="userName">Username</param>
        /// <param name="timelineEvent">Event to return</param>
        /// <param name="dateLimit">Date from which time onwards the events should be returned</param>
        /// <returns>Timeline entries</returns>
        public async Task<List<TimelineEntry>> GetTimelineEntriesByUserInTimeSpan(string projectId, string userName, TimelineEvent timelineEvent, DateTimeOffset dateLimit)
        {
            long ticks = dateLimit.Ticks;
            return await _TimelineCollection.Find(Builders<TimelineEntry>.Filter.Gt(nameof(TimelineEntry.Timestamp) + ".0", ticks) & 
                                                  Builders<TimelineEntry>.Filter.Eq(e => e.ProjectId, projectId) & 
                                                  Builders<TimelineEntry>.Filter.Eq(e => e.Username, userName) &
                                                  Builders<TimelineEntry>.Filter.Eq(e => e.Event, timelineEvent)).SortByDescending(e => e.Timestamp).ToListAsync();
        }

        /// <summary>
        /// Deletes all timeline entries of a user
        /// </summary>
        /// <param name="userName">Username</param>
        /// <returns>Task</returns>
        public async Task DeleteTimelineEntriesOfUser(string userName)
        {
            await _TimelineCollection.DeleteManyAsync(d => d.Username == userName);
        }


        /// <summary>
        /// Creates the timeline indices
        /// </summary>
        /// <returns>Task</returns>
        public async Task CreateTimelineIndices()
        {
            IndexKeysDefinitionBuilder<TimelineEntry> timelineIndexBuilder = Builders<TimelineEntry>.IndexKeys;
            CreateIndexModel<TimelineEntry> timelineIndex = new CreateIndexModel<TimelineEntry>(timelineIndexBuilder.Descending(x => x.Timestamp));
            await _TimelineCollection.Indexes.CreateOneAsync(timelineIndex);

            CreateIndexModel<TimelineEntry> projectIndex = new CreateIndexModel<TimelineEntry>(timelineIndexBuilder.Ascending(x => x.ProjectId));
            await _TimelineCollection.Indexes.CreateOneAsync(projectIndex);

            CreateIndexModel<TimelineEntry> usernameIndex = new CreateIndexModel<TimelineEntry>(timelineIndexBuilder.Ascending(x => x.Username));
            await _TimelineCollection.Indexes.CreateOneAsync(usernameIndex);
        }
    }
}