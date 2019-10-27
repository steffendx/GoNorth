using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Config;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.Aika
{
    /// <summary>
    /// Aika Chapter Overview Mongo DB Access
    /// </summary>
    public class AikaChapterOverviewMongoDbAccess : BaseMongoDbAccess, IAikaChapterOverviewDbAccess
    {
        /// <summary>
        /// Collection Name of the aika chapters
        /// </summary>
        public const string AikaChapterOverviewCollectionName = "AikaChapterOverview";

        /// <summary>
        /// Collection Name of the aika chapter recycling bin
        /// </summary>
        public const string AikaChapterOverviewRecyclingBinCollectionName = "AikaChapterOverviewRecyclingBin";

        /// <summary>
        /// Chapter Collection
        /// </summary>
        private IMongoCollection<AikaChapterOverview> _ChapterOverviewCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public AikaChapterOverviewMongoDbAccess(IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _ChapterOverviewCollection = _Database.GetCollection<AikaChapterOverview>(AikaChapterOverviewCollectionName);
        }

        /// <summary>
        /// Returns a chapter overview by the project id
        /// </summary>
        /// <param name="projectId">Project Id of the chapter</param>
        /// <returns>Chapter overview</returns>
        public async Task<AikaChapterOverview> GetChapterOverviewByProjectId(string projectId)
        {
            AikaChapterOverview chapterOverview = await _ChapterOverviewCollection.Find(c => c.ProjectId == projectId).FirstOrDefaultAsync();
            return chapterOverview;
        }

        /// <summary>
        /// Returns a chapter overview by the id
        /// </summary>
        /// <param name="id">Id of the chapter overview</param>
        /// <returns>Chapter overview</returns>
        public async Task<AikaChapterOverview> GetChapterOverviewById(string id)
        {
            AikaChapterOverview chapterOverview = await _ChapterOverviewCollection.Find(c => c.Id == id).FirstOrDefaultAsync();
            return chapterOverview;
        }

        /// <summary>
        /// Creates a new chapter overview
        /// </summary>
        /// <param name="chapterOverview">Chapter overview</param>
        /// <returns>Chapter Overview filled with data</returns>
        public async Task<AikaChapterOverview> CreateChapterOverview(AikaChapterOverview chapterOverview)
        {
            chapterOverview.Id = Guid.NewGuid().ToString();
            await _ChapterOverviewCollection.InsertOneAsync(chapterOverview);

            return chapterOverview;
        }

        /// <summary>
        /// Updates a chapter overview
        /// </summary>
        /// <param name="chapterOverview">Chapter overview to update</param>
        /// <returns>Task</returns>
        public async Task UpdateChapterOverview(AikaChapterOverview chapterOverview)
        {
            ReplaceOneResult result = await _ChapterOverviewCollection.ReplaceOneAsync(c => c.Id == chapterOverview.Id, chapterOverview);
        }

        /// <summary>
        /// Deletes a chapter overview
        /// </summary>
        /// <param name="chapterOverview">Chapter overview to delete</param>
        /// <returns>Task</returns>
        public async Task DeleteChapterOverview(AikaChapterOverview chapterOverview)
        {
            AikaChapterOverview existingChapterOverview = await GetChapterOverviewById(chapterOverview.Id);
            if(existingChapterOverview == null)
            {
                throw new NullReferenceException();
            }

            IMongoCollection<AikaChapterOverview> recyclingBin = _Database.GetCollection<AikaChapterOverview>(AikaChapterOverviewRecyclingBinCollectionName);
            await recyclingBin.InsertOneAsync(existingChapterOverview);

            DeleteResult result = await _ChapterOverviewCollection.DeleteOneAsync(c => c.Id == chapterOverview.Id);
        }


        /// <summary>
        /// Returns all chapter overviews that were last modified by a given user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Chapter overviews</returns>
        public async Task<List<AikaChapterOverview>> GetChapterOverviewByModifiedUser(string userId)
        {
            return await _ChapterOverviewCollection.AsQueryable().Where(q => q.ModifiedBy == userId).ToListAsync();
        }
        
        /// <summary>
        /// Returns all chapter overviews in the recycle bin that were last modified by a given user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Chapter overviews</returns>
        public async Task<List<AikaChapterOverview>> GetRecycleBinChapterOverviewByModifiedUser(string userId)
        {
            IMongoCollection<AikaChapterOverview> recyclingBin = _Database.GetCollection<AikaChapterOverview>(AikaChapterOverviewRecyclingBinCollectionName);
            return await recyclingBin.AsQueryable().Where(q => q.ModifiedBy == userId).ToListAsync();
        }
        
        /// <summary>
        /// Returns all chapter overviews in the recycle bin that were last modified by a given user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Task</returns>
        public async Task ResetRecycleBinChapterOverviewByModifiedUser(string userId)
        {
            IMongoCollection<AikaChapterOverview> recyclingBin = _Database.GetCollection<AikaChapterOverview>(AikaChapterOverviewRecyclingBinCollectionName);
            await recyclingBin.UpdateManyAsync(n => n.ModifiedBy == userId, Builders<AikaChapterOverview>.Update.Set(n => n.ModifiedBy, Guid.Empty.ToString()).Set(n => n.ModifiedOn, DateTimeOffset.UtcNow));
        }
    }
}