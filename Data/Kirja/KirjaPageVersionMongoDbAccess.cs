using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using GoNorth.Config;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.Kirja
{
    /// <summary>
    /// Kirja Page Version Mongo DB Access
    /// </summary>
    public class KirjaPageVersionMongoDbAccess : BaseMongoDbAccess, IKirjaPageVersionDbAccess
    {
        /// <summary>
        /// Collection Name of the kirja pages
        /// </summary>
        public const string KirjaPageVersionCollectionName = "KirjaPageVersion";

        /// <summary>
        /// Page Version Collection
        /// </summary>
        private IMongoCollection<KirjaPageVersion> _PageVersionCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public KirjaPageVersionMongoDbAccess(IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _PageVersionCollection = _Database.GetCollection<KirjaPageVersion>(KirjaPageVersionCollectionName);
        }

        /// <summary>
        /// Creates a Kirja Page Version
        /// </summary>
        /// <param name="pageVersion">Page version to create</param>
        /// <returns>Created page, with filled id</returns>
        public async Task<KirjaPageVersion> CreatePageVersion(KirjaPageVersion pageVersion)
        {
            pageVersion.Id = Guid.NewGuid().ToString();
            await _PageVersionCollection.InsertOneAsync(pageVersion);

            return pageVersion;
        }

        /// <summary>
        /// Returns a page version by its id
        /// </summary>
        /// <param name="id">Id</param>
        /// <returns>Page Version</returns>
        public async Task<KirjaPageVersion> GetPageVersionById(string id)
        {
            KirjaPageVersion pageVersion = await _PageVersionCollection.Find(p => p.Id == id).FirstOrDefaultAsync();
            return pageVersion;
        }

        /// <summary>
        /// Update a page version
        /// </summary>
        /// <param name="pageVersion">Page version to update</param>
        /// <returns>Task</returns>
        public async Task UpdatePageVersion(KirjaPageVersion pageVersion)
        {
            ReplaceOneResult result = await _PageVersionCollection.ReplaceOneAsync(p => p.Id == pageVersion.Id, pageVersion);
        }

        /// <summary>
        /// Deletes a page version
        /// </summary>
        /// <param name="pageVersion">Page version to delete</param>
        /// <returns>Task</returns>
        public async Task DeletePageVersion(KirjaPageVersion pageVersion)
        {
            DeleteResult result = await _PageVersionCollection.DeleteOneAsync(p => p.Id == pageVersion.Id);
        }

        /// <summary>
        /// Deletes all page versions of a page
        /// </summary>
        /// <param name="pageId">Id of the page which versions need to be deleted</param>
        /// <returns>Task</returns>
        public async Task DeletePageVersionsByPage(string pageId)
        {
            DeleteResult result = await _PageVersionCollection.DeleteManyAsync(p => p.OriginalPageId == pageId);
        }

        /// <summary>
        /// Returns the latest version of a page
        /// </summary>
        /// <param name="pageId">Page Id</param>
        /// <returns>Latest version of the page</returns>
        public async Task<KirjaPageVersion> GetLatestVersionOfPage(string pageId)
        {
            return await _PageVersionCollection.AsQueryable().Where(p => p.OriginalPageId == pageId).OrderByDescending(p => p.VersionNumber).Select(p => new KirjaPageVersion {
                Id = p.Id,
                ModifiedOn = p.ModifiedOn,
                ModifiedBy = p.ModifiedBy,
                VersionNumber = p.VersionNumber
            }).FirstOrDefaultAsync();
        }

        /// <summary>
        /// Returns the maximum page version number
        /// </summary>
        /// <param name="pageId">Page Id</param>
        /// <returns>Maximum page version number</returns>
        public async Task<int> GetMaxPageVersionNumber(string pageId)
        {
            if(await _PageVersionCollection.AsQueryable().Where(p => p.OriginalPageId == pageId).AnyAsync())
            {
                return await _PageVersionCollection.AsQueryable().Where(p => p.OriginalPageId == pageId).MaxAsync(p => p.VersionNumber);
            }

            return 0;
        }

        /// <summary>
        /// Returns all versions of a page with just the header data, sorted descending by version number
        /// </summary>
        /// <param name="pageId">Page Id</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>List of Kirja page versions for the page</returns>
        public async Task<List<KirjaPageVersion>> GetVersionsOfPage(string pageId, int start, int pageSize)
        {
            return await _PageVersionCollection.AsQueryable().Where(p => p.OriginalPageId == pageId).OrderByDescending(p => p.VersionNumber).Skip(start).Take(pageSize).Select(p => new KirjaPageVersion() {
                Id = p.Id,
                Name = p.Name,
                VersionNumber = p.VersionNumber,
                ModifiedOn = p.ModifiedOn,
                UplodadedImages = p.UplodadedImages
            }).ToListAsync();
        }

        /// <summary>
        /// Returns the count of versions for a page
        /// </summary>
        /// <param name="pageId">Page Id</param>
        /// <returns>Count of versions for the page</returns>
        public async Task<int> GetVersionsOfPageCount(string pageId)
        {
            return await _PageVersionCollection.AsQueryable().Where(p => p.OriginalPageId == pageId).CountAsync();
        }
        
        /// <summary>
        /// Returns true if any version is using an image
        /// </summary>
        /// <param name="pageId">Page Id</param>
        /// <param name="image">Image to check</param>
        /// <returns>true if any version is using an image</returns>
        public async Task<bool> AnyVersionUsingImage(string pageId, string image)
        {
            return await _PageVersionCollection.AsQueryable().Where(p => p.OriginalPageId == pageId && p.UplodadedImages != null && p.UplodadedImages.Any(i => i == image)).AnyAsync();
        }


        /// <summary>
        /// Returns all page versions that were last modified by a user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>List of Kirja page versions</returns>
        public async Task<List<KirjaPageVersion>> GetPageVersionsByModifiedUser(string userId)
        {
            return await _PageVersionCollection.AsQueryable().Where(p => p.ModifiedBy == userId).ToListAsync();
        }
    }
}