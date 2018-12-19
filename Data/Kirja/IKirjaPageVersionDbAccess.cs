using System.Collections.Generic;
using System.Threading.Tasks;

namespace GoNorth.Data.Kirja
{
    /// <summary>
    /// Interface for Database Access for Kirja Page Versions
    /// </summary>
    public interface IKirjaPageVersionDbAccess
    {
        /// <summary>
        /// Creates a Kirja Page Version
        /// </summary>
        /// <param name="pageVersion">Page version to create</param>
        /// <returns>Created page, with filled id</returns>
        Task<KirjaPageVersion> CreatePageVersion(KirjaPageVersion pageVersion);

        /// <summary>
        /// Returns a page version by its id
        /// </summary>
        /// <param name="id">Id</param>
        /// <returns>Page Version</returns>
        Task<KirjaPageVersion> GetPageVersionById(string id);

        /// <summary>
        /// Update a page version
        /// </summary>
        /// <param name="pageVersion">Page version to update</param>
        /// <returns>Task</returns>
        Task UpdatePageVersion(KirjaPageVersion pageVersion);

        /// <summary>
        /// Deletes a page version
        /// </summary>
        /// <param name="pageVersion">Page version to delete</param>
        /// <returns>Task</returns>
        Task DeletePageVersion(KirjaPageVersion pageVersion);
        
        /// <summary>
        /// Deletes all page versions of a page
        /// </summary>
        /// <param name="pageId">Id of the page which versions need to be deleted</param>
        /// <returns>Task</returns>
        Task DeletePageVersionsByPage(string pageId);

        /// <summary>
        /// Returns the latest version of a page
        /// </summary>
        /// <param name="pageId">Page Id</param>
        /// <returns>Latest version of the page</returns>
        Task<KirjaPageVersion> GetLatestVersionOfPage(string pageId);

        /// <summary>
        /// Returns the maximum page version number
        /// </summary>
        /// <param name="pageId">Page Id</param>
        /// <returns>Maximum page version number</returns>
        Task<int> GetMaxPageVersionNumber(string pageId);

        /// <summary>
        /// Returns all versions of a page with just the header data, sorted descending by version number
        /// </summary>
        /// <param name="pageId">Page Id</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>List of Kirja page versions for the page</returns>
        Task<List<KirjaPageVersion>> GetVersionsOfPage(string pageId, int start, int pageSize);

        /// <summary>
        /// Returns the count of versions for a page
        /// </summary>
        /// <param name="pageId">Page Id</param>
        /// <returns>Count of versions for the page</returns>
        Task<int> GetVersionsOfPageCount(string pageId);

        /// <summary>
        /// Returns true if any version is using an image
        /// </summary>
        /// <param name="pageId">Page Id</param>
        /// <param name="image">Image to check</param>
        /// <returns>true if any version is using an image</returns>
        Task<bool> AnyVersionUsingImage(string pageId, string image);


        /// <summary>
        /// Returns all page versions that were last modified by a user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>List of Kirja page versions</returns>
        Task<List<KirjaPageVersion>> GetPageVersionsByModifiedUser(string userId);
    }
}