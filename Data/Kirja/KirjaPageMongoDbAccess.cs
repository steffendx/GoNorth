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
    /// Kirja Page Mongo DB Access
    /// </summary>
    public class KirjaPageMongoDbAccess : BaseMongoDbAccess, IKirjaPageDbAccess
    {
        /// <summary>
        /// Collection Name of the kirja pages
        /// </summary>
        public const string KirjaPageCollectionName = "KirjaPage";

        /// <summary>
        /// Collection Name of the kirja pages recycling bin
        /// </summary>
        public const string KirjaPageRecyclingBinCollectionName = "KirjaPageRecyclingBin";

        /// <summary>
        /// Page Collection
        /// </summary>
        private IMongoCollection<KirjaPage> _PageCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public KirjaPageMongoDbAccess(IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _PageCollection = _Database.GetCollection<KirjaPage>(KirjaPageCollectionName);
        }

        /// <summary>
        /// Creates a Kirja Page
        /// </summary>
        /// <param name="page">page to create</param>
        /// <returns>Created page, with filled id</returns>
        public async Task<KirjaPage> CreatePage(KirjaPage page)
        {
            page.Id = Guid.NewGuid().ToString();
            await _PageCollection.InsertOneAsync(page);

            return page;
        }

        /// <summary>
        /// Returns an a page by its id
        /// </summary>
        /// <param name="id">Id</param>
        /// <returns>Page</returns>
        public async Task<KirjaPage> GetPageById(string id)
        {
            KirjaPage page = await _PageCollection.Find(p => p.Id == id).FirstOrDefaultAsync();
            return page;
        }

        /// <summary>
        /// Returns the default page for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Page</returns>
        public async Task<KirjaPage> GetDefaultPageForProject(string projectId)
        {
            KirjaPage page = await _PageCollection.Find(p => p.ProjectId == projectId && p.IsDefault).FirstOrDefaultAsync();
            return page;
        }

        /// <summary>
        /// Builds an page search queryable
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="searchPattern">Search pattern</param>
        /// <param name="excludeId">Id to exclude</param>
        /// <returns>Page Queryable</returns>
        private IMongoQueryable<KirjaPage> BuildPageSearchQueryable(string projectId, string searchPattern, string excludeId)
        {
            searchPattern = searchPattern.ToLowerInvariant();
            return _PageCollection.AsQueryable().Where(p => p.ProjectId == projectId && p.Name.ToLowerInvariant().Contains(searchPattern) && p.Id != excludeId);
        }

        /// <summary>
        /// Searches Pages
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="searchPattern">Search Pattern</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <param name="excludeId">Id to exclude</param>
        /// <returns>Pages</returns>
        public async Task<List<KirjaPage>> SearchPages(string projectId, string searchPattern, int start, int pageSize, string excludeId)
        {
            List<KirjaPage> pages = await BuildPageSearchQueryable(projectId, searchPattern, excludeId).OrderBy(p => p.Name).Skip(start).Take(pageSize).Select(p => new KirjaPage() {
                Id = p.Id,
                Name = p.Name
            }).ToListAsync();
            return pages;
        }

        /// <summary>
        /// Returns the count of a page search
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="searchPattern">Search Pattern</param>
        /// <param name="excludeId">Id to exclude</param>
        /// <returns>Page Count</returns>
        public async Task<int> SearchPagesCount(string projectId, string searchPattern, string excludeId)
        {
            int count = (int)await BuildPageSearchQueryable(projectId, searchPattern, excludeId).CountAsync();
            return count;
        }

        /// <summary>
        /// Updates a page
        /// </summary>
        /// <param name="page">Page to update</param>
        /// <returns>Task</returns>
        public async Task UpdatePage(KirjaPage page)
        {
            ReplaceOneResult result = await _PageCollection.ReplaceOneAsync(p => p.Id == page.Id, page);
        }

        /// <summary>
        /// Deletes a page
        /// </summary>
        /// <param name="page">Page to delete</param>
        /// <returns>Task</returns>
        public async Task DeletePage(KirjaPage page)
        {
            KirjaPage existingPage = await GetPageById(page.Id);
            if(existingPage == null)
            {
                throw new NullReferenceException();
            }

            IMongoCollection<KirjaPage> recyclingBin = _Database.GetCollection<KirjaPage>(KirjaPageRecyclingBinCollectionName);
            await recyclingBin.InsertOneAsync(existingPage);

            DeleteResult result = await _PageCollection.DeleteOneAsync(p => p.Id == page.Id);
        }

        /// <summary>
        /// Deletes all pages for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Task</returns>
        public async Task DeletePagesForProject(string projectId)
        {
            await _PageCollection.DeleteManyAsync(p => p.ProjectId == projectId);
        }

        /// <summary>
        /// Returns all pages a page is mentioned in
        /// </summary>
        /// <param name="pageId">Page Id</param>
        /// <returns>List of Kirja page</returns>
        public async Task<List<KirjaPage>> GetPagesByPage(string pageId)
        {
            return await _PageCollection.AsQueryable().Where(p => p.MentionedKirjaPages.Any(mp => mp == pageId)).Select(p => new KirjaPage() {
                Id = p.Id,
                Name = p.Name
            }).ToListAsync();
        }

        /// <summary>
        /// Returns all pages a quest is mentioned in
        /// </summary>
        /// <param name="questId">Quest Id</param>
        /// <returns>List of Kirja page</returns>
        public async Task<List<KirjaPage>> GetPagesByQuest(string questId)
        {
            return await _PageCollection.AsQueryable().Where(p => p.MentionedQuests.Any(q => q == questId)).Select(p => new KirjaPage() {
                Id = p.Id,
                Name = p.Name
            }).ToListAsync();
        }

        /// <summary>
        /// Returns all pages an npc is mentioned in
        /// </summary>
        /// <param name="npcId">Npc Id</param>
        /// <returns>List of Kirja page</returns>
        public async Task<List<KirjaPage>> GetPagesByNpc(string npcId)
        {
            return await _PageCollection.AsQueryable().Where(p => p.MentionedNpcs.Any(n => n == npcId)).Select(p => new KirjaPage() {
                Id = p.Id,
                Name = p.Name
            }).ToListAsync();
        }

        /// <summary>
        /// Returns all pages an item is mentioned in
        /// </summary>
        /// <param name="itemId">Item Id</param>
        /// <returns>List of Kirja page</returns>
        public async Task<List<KirjaPage>> GetPagesByItem(string itemId)
        {
            return await _PageCollection.AsQueryable().Where(p => p.MentionedItems.Any(i => i == itemId)).Select(p => new KirjaPage() {
                Id = p.Id,
                Name = p.Name
            }).ToListAsync();
        }

        /// <summary>
        /// Returns all pages a skill is mentioned in
        /// </summary>
        /// <param name="skillId">Skill Id</param>
        /// <returns>List of Kirja page</returns>
        public async Task<List<KirjaPage>> GetPagesBySkill(string skillId)
        {
            return await _PageCollection.AsQueryable().Where(p => p.MentionedSkills.Any(i => i == skillId)).Select(p => new KirjaPage() {
                Id = p.Id,
                Name = p.Name
            }).ToListAsync();
        }

        /// <summary>
        /// Resolves the names of a list of pages
        /// </summary>
        /// <param name="pageIds">Page ids</param>
        /// <returns>Pages with names</returns>
        public async Task<List<KirjaPage>> ResolveNames(List<string> pageIds)
        {
            return await  _PageCollection.AsQueryable().Where(n => pageIds.Contains(n.Id)).Select(c => new KirjaPage() {
                Id = c.Id,
                Name = c.Name,
            }).ToListAsync();
        }


        /// <summary>
        /// Returns all pages that were last modified by a user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>List of Kirja page</returns>
        public async Task<List<KirjaPage>> GetPagesByModifiedUser(string userId)
        {
            return await _PageCollection.AsQueryable().Where(p => p.ModifiedBy == userId).ToListAsync();
        }
    }
}