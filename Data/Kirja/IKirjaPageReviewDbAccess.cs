using System.Collections.Generic;
using System.Threading.Tasks;

namespace GoNorth.Data.Kirja
{
    /// <summary>
    /// Interface for Database Access for Kirja Page reviews
    /// </summary>
    public interface IKirjaPageReviewDbAccess
    {
        /// <summary>
        /// Returns a page review by id
        /// </summary>
        /// <param name="reviewId">Id of the page review</param>
        /// <returns>Page review</returns>
        Task<KirjaPageReview> GetPageReviewById(string reviewId);

        /// <summary>
        /// Returns a page review by external access token
        /// </summary>
        /// <param name="externalAccessToken">External access token</param>
        /// <returns>Page review</returns>
        Task<KirjaPageReview> GetPageReviewByExternalAccessToken(string externalAccessToken);

        /// <summary>
        /// Creates a Kirja page review
        /// </summary>
        /// <param name="pageReview">Page review to create</param>
        /// <returns>Created page, with filled id</returns>
        Task<KirjaPageReview> CreatePageReview(KirjaPageReview pageReview);

        /// <summary>
        /// Update a Kirja page review
        /// </summary>
        /// <param name="pageReview">Page review to update</param>
        /// <returns>Task</returns>
        Task UpdatePageReview(KirjaPageReview pageReview);

        /// <summary>
        /// Deletes all reviews of a page
        /// </summary>
        /// <param name="pageId">Id of the page which reviews need to be deleted</param>
        /// <returns>Task</returns>
        Task DeletePageReviewsByPage(string pageId);
        
        /// <summary>
        /// Deletes a page review
        /// </summary>
        /// <param name="pageReview">Page review to delete</param>
        /// <returns>Task</returns>
        Task DeletePageReview(KirjaPageReview pageReview);

        
        /// <summary>
        /// Returns all reviews of a page with just the header data, sorted descending by creation date
        /// </summary>
        /// <param name="pageId">Page Id</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>List of Kirja page review for the page</returns>
        Task<List<KirjaPageReview>> GetReviewsOfPage(string pageId, int start, int pageSize);

        /// <summary>
        /// Returns the count of reviews for a page
        /// </summary>
        /// <param name="pageId">Page Id</param>
        /// <returns>Count of reviews for the page</returns>
        Task<int> GetReviewsOfPageCount(string pageId);

        /// <summary>
        /// Returns the count of reviews that are waiting to get merged
        /// </summary>
        /// <param name="pageId">Page Id</param>
        /// <returns>Count of reviews that are waiting to get merged</returns>
        Task<int> GetPageReviewCountWaitingForMerge(string pageId);


        /// <summary>
        /// Returns all reviews that were last modified by a user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>List of page reviews</returns>
        Task<List<KirjaPageReview>> GetReviewsByModifiedUser(string userId);
    }
}