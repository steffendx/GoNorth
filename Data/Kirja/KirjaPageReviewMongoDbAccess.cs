using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Config;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.Kirja
{
    /// <summary>
    /// Kirja Page review Mongo DB Access
    /// </summary>
    public class KirjaPageReviewMongoDbAccess : BaseMongoDbAccess, IKirjaPageReviewDbAccess
    {
        /// <summary>
        /// Collection Name of the kirja pages
        /// </summary>
        public const string KirjaPageReviewCollectionName = "KirjaPageReview";

        /// <summary>
        /// Page Review Collection
        /// </summary>
        private IMongoCollection<KirjaPageReview> _PageReviewCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public KirjaPageReviewMongoDbAccess(IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _PageReviewCollection = _Database.GetCollection<KirjaPageReview>(KirjaPageReviewCollectionName);
        }

        /// <summary>
        /// Returns a page review by id
        /// </summary>
        /// <param name="reviewId">Id of the page review</param>
        /// <returns>Page review</returns>
        public async Task<KirjaPageReview> GetPageReviewById(string reviewId)
        {
            KirjaPageReview review = await _PageReviewCollection.Find(p => p.Id == reviewId).FirstOrDefaultAsync();
            return review;
        }
        
        /// <summary>
        /// Returns a page review by external access token
        /// </summary>
        /// <param name="externalAccessToken">External access token</param>
        /// <returns>Page review</returns>
        public async Task<KirjaPageReview> GetPageReviewByExternalAccessToken(string externalAccessToken)
        {
            KirjaPageReview review = await _PageReviewCollection.Find(p => p.ExternalAccessToken == externalAccessToken).FirstOrDefaultAsync();
            return review;
        }

        /// <summary>
        /// Creates a Kirja page review
        /// </summary>
        /// <param name="pageReview">Page review to create</param>
        /// <returns>Created page, with filled id</returns>
        public async Task<KirjaPageReview> CreatePageReview(KirjaPageReview pageReview)
        {
            pageReview.Id = Guid.NewGuid().ToString();
            await _PageReviewCollection.InsertOneAsync(pageReview);

            return pageReview;
        }

        /// <summary>
        /// Update a Kirja page review
        /// </summary>
        /// <param name="pageReview">Page review to update</param>
        /// <returns>Task</returns>
        public async Task UpdatePageReview(KirjaPageReview pageReview)
        {
            ReplaceOneResult result = await _PageReviewCollection.ReplaceOneAsync(p => p.Id == pageReview.Id, pageReview);
        }

        /// <summary>
        /// Deletes all reviews of a page
        /// </summary>
        /// <param name="pageId">Id of the page which reviews need to be deleted</param>
        /// <returns>Task</returns>
        public async Task DeletePageReviewsByPage(string pageId)
        {
            DeleteResult result = await _PageReviewCollection.DeleteManyAsync(p => p.ReviewedPageId == pageId);
        }

        /// <summary>
        /// Deletes a page review
        /// </summary>
        /// <param name="pageReview">Page review to delete</param>
        /// <returns>Task</returns>
        public async Task DeletePageReview(KirjaPageReview pageReview)
        {
            DeleteResult result = await _PageReviewCollection.DeleteOneAsync(p => p.Id == pageReview.Id);
        }
        
        /// <summary>
        /// Deletes all page reviews for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Task</returns>
        public async Task DeletePagesForProject(string projectId)
        {
            await _PageReviewCollection.DeleteManyAsync(p => p.ProjectId == projectId);
        }

        /// <summary>
        /// Returns all reviews of a page with just the header data, sorted descending by creation date
        /// </summary>
        /// <param name="pageId">Page Id</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>List of Kirja page review for the page</returns>
        public async Task<List<KirjaPageReview>> GetReviewsOfPage(string pageId, int start, int pageSize)
        {
            return await _PageReviewCollection.AsQueryable().Where(p => p.ReviewedPageId == pageId).OrderByDescending(p => p.CreatedOn).Skip(start).Take(pageSize).Select(p => new KirjaPageReview() {
                Id = p.Id,
                Name = p.Name,
                Status = p.Status,
                CreatedOn = p.CreatedOn,
                ModifiedOn = p.ModifiedOn,
                UplodadedImages = p.UplodadedImages
            }).ToListAsync();
        }

        /// <summary>
        /// Returns the count of reviews for a page
        /// </summary>
        /// <param name="pageId">Page Id</param>
        /// <returns>Count of reviews for the page</returns>
        public async Task<int> GetReviewsOfPageCount(string pageId)
        {
            return await _PageReviewCollection.AsQueryable().Where(p => p.ReviewedPageId == pageId).CountAsync();
        }

        /// <summary>
        /// Returns the count of reviews that are waiting to get merged
        /// </summary>
        /// <param name="pageId">Page Id</param>
        /// <returns>Count of reviews that are waiting to get merged</returns>
        public async Task<int> GetPageReviewCountWaitingForMerge(string pageId)
        {
            return await _PageReviewCollection.AsQueryable().Where(p => p.ReviewedPageId == pageId && p.Status == KirjaPageReviewStatus.Completed).CountAsync();
        }
        
        /// <summary>
        /// Returns all reviews that were last modified by a user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>List of page reviews</returns>
        public async Task<List<KirjaPageReview>> GetReviewsByModifiedUser(string userId)
        {
            return await _PageReviewCollection.AsQueryable().Where(p => p.ModifiedBy == userId).ToListAsync();
        }
    }
}