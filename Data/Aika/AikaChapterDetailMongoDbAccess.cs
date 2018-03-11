using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using GoNorth.Config;
using GoNorth.Data.FlexFieldDatabase;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.Aika
{
    /// <summary>
    /// Aika Chapter Detail Mongo DB Access
    /// </summary>
    public class AikaChapterDetailMongoDbAccess : BaseMongoDbAccess, IAikaChapterDetailDbAccess
    {
        /// <summary>
        /// Collection Name of the aika chapters
        /// </summary>
        public const string AikaChapterDetailCollectionName = "AikaChapterDetail";

        /// <summary>
        /// Collection Name of the aika chapter recycling bin
        /// </summary>
        public const string AikaChapterDetailRecyclingBinCollectionName = "AikaChapterDetailRecyclingBin";

        /// <summary>
        /// Chapter Collection
        /// </summary>
        private IMongoCollection<AikaChapterDetail> _ChapterDetailCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public AikaChapterDetailMongoDbAccess(IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _ChapterDetailCollection = _Database.GetCollection<AikaChapterDetail>(AikaChapterDetailCollectionName);
        }

        /// <summary>
        /// Returns the chapter details which are not associated to a chapter with reduced detail
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="start">Start of the page</param>
        /// <param name="pageSize">Page size</param>
        /// <returns>Chapter details which are not associated to a chapter with reduced detail</returns>
        public async Task<List<AikaChapterDetail>> GetChapterDetailsByProjectId(string projectId, int start, int pageSize)
        {
            List<AikaChapterDetail> chapterDetails = await _ChapterDetailCollection.AsQueryable().Where(c => string.IsNullOrEmpty(c.ChapterId) && c.ProjectId == projectId).Skip(start).Take(pageSize).Select(c => new AikaChapterDetail {
                Id = c.Id,
                Name = c.Name
            }).ToListAsync();
            return chapterDetails;
        }

        /// <summary>
        /// Returns the chapter details which are not associated to a chapter with reduced detail
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Chapter details which are not associated to a chapter with reduced detail</returns>
        public async Task<int> GetChapterDetailsByProjectIdCount(string projectId)
        {
            int count = (int)await _ChapterDetailCollection.AsQueryable().Where(c => string.IsNullOrEmpty(c.ChapterId) && c.ProjectId == projectId).CountAsync();
            return count;
        }

        /// <summary>
        /// Builds a chapter detail search queryable
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="searchPattern">Search pattern</param>
        /// <returns>Chapter Detail Queryable</returns>
        private IMongoQueryable<AikaChapterDetail> BuildChapterDetailSearchQueryable(string projectId, string searchPattern)
        {
            string regexPattern = ".";
            if(!string.IsNullOrEmpty(searchPattern))
            {
                string[] searchPatternParts = searchPattern.Split(" ");
                regexPattern = "(" + string.Join("|", searchPatternParts) + ")";
            }
            return _ChapterDetailCollection.AsQueryable().Where(c => string.IsNullOrEmpty(c.ChapterId) && c.ProjectId == projectId && Regex.IsMatch(c.Name, regexPattern, RegexOptions.IgnoreCase));
        }

        /// <summary>
        /// Searches Chapter details with reduced informations
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="searchPattern">Search pattern</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Chapter Details</returns>
        public async Task<List<AikaChapterDetail>> SearchChapterDetails(string projectId, string searchPattern, int start, int pageSize)
        {
            List<AikaChapterDetail> chapterDetails = await this.BuildChapterDetailSearchQueryable(projectId, searchPattern).Skip(start).Take(pageSize).Select(c => new AikaChapterDetail {
                Id = c.Id,
                Name = c.Name
            }).ToListAsync();
            return chapterDetails;
        }

        /// <summary>
        /// Returns the count of a search result
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="searchPattern">Search pattern</param>
        /// <returns>Count of results</returns>
        public async Task<int> SearchChapterDetailsCount(string projectId, string searchPattern)
        {
            int count = (int)await this.BuildChapterDetailSearchQueryable(projectId, searchPattern).CountAsync();
            return count;
        }

        /// <summary>
        /// Returns a chapter detail by the id
        /// </summary>
        /// <param name="id">Id of the chapter detail</param>
        /// <returns>Chapter detail</returns>
        public async Task<AikaChapterDetail> GetChapterDetailById(string id)
        {
            AikaChapterDetail chapterDetail = await _ChapterDetailCollection.Find(c => c.Id == id).FirstOrDefaultAsync();
            return chapterDetail;
        }

        /// <summary>
        /// Creates a new chapter detail
        /// </summary>
        /// <param name="chapterDetail">Chapter detail</param>
        /// <returns>Chapter detail filled with data</returns>
        public async Task<AikaChapterDetail> CreateChapterDetail(AikaChapterDetail chapterDetail)
        {
            chapterDetail.Id = Guid.NewGuid().ToString();
            await _ChapterDetailCollection.InsertOneAsync(chapterDetail);

            return chapterDetail;
        }

        /// <summary>
        /// Updates a chapter detail
        /// </summary>
        /// <param name="chapterDetail">Chapter detail to update</param>
        /// <returns>Task</returns>
        public async Task UpdateChapterDetail(AikaChapterDetail chapterDetail)
        {
            ReplaceOneResult result = await _ChapterDetailCollection.ReplaceOneAsync(c => c.Id == chapterDetail.Id, chapterDetail);
        }

        /// <summary>
        /// Deletes a chapter detail
        /// </summary>
        /// <param name="chapterDetail">Chapter detail to delete</param>
        /// <returns>Task</returns>
        public async Task DeleteChapterDetail(AikaChapterDetail chapterDetail)
        {
            AikaChapterDetail existingChapterDetail = await GetChapterDetailById(chapterDetail.Id);
            if(existingChapterDetail == null)
            {
                throw new NullReferenceException();
            }

            IMongoCollection<AikaChapterDetail> recyclingBin = _Database.GetCollection<AikaChapterDetail>(AikaChapterDetailRecyclingBinCollectionName);
            await recyclingBin.InsertOneAsync(existingChapterDetail);

            DeleteResult result = await _ChapterDetailCollection.DeleteOneAsync(c => c.Id == chapterDetail.Id);
        }

        /// <summary>
        /// Returns the count of nodes in which a node is used
        /// </summary>
        /// <param name="detailViewId">Detail View Id</param>
        /// <param name="excludeNodeId">Node Id to exclude, "" to use all</param>
        /// <returns>Count of usage</returns>
        public async Task<int> DetailUsedInNodesCount(string detailViewId, string excludeNodeId)
        {
            int useCount = await _ChapterDetailCollection.AsQueryable().Where(d => d.Detail.Any(n => n.Id != excludeNodeId && n.DetailViewId == detailViewId)).CountAsync();
            return useCount;
        }

        /// <summary>
        /// Returns the chapter details which are using a quest with reduced detail
        /// </summary>
        /// <param name="questId">Quest Id</param>
        /// <returns>Chapter details which are using the quest with reduced detail</returns>
        public async Task<List<AikaChapterDetail>> GetChapterDetailsByQuestId(string questId)
        {
            List<AikaChapterDetail> chapterDetails = await _ChapterDetailCollection.AsQueryable().Where(c => c.Quest.Any(q => q.QuestId == questId)).Select(c => new AikaChapterDetail {
                Id = c.Id,
                Name = c.Name
            }).ToListAsync();
            return chapterDetails;
        }

    }
}