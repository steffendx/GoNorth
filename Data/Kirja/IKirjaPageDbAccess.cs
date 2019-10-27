using System.Collections.Generic;
using System.Threading.Tasks;

namespace GoNorth.Data.Kirja
{
    /// <summary>
    /// Interface for Database Access for Kirja Pages
    /// </summary>
    public interface IKirjaPageDbAccess
    {
        /// <summary>
        /// Creates a Kirja Page
        /// </summary>
        /// <param name="page">Page to create</param>
        /// <returns>Created page, with filled id</returns>
        Task<KirjaPage> CreatePage(KirjaPage page);

        /// <summary>
        /// Returns a page by its id
        /// </summary>
        /// <param name="id">Id</param>
        /// <returns>Page</returns>
        Task<KirjaPage> GetPageById(string id);

        /// <summary>
        /// Returns an the default page for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Page</returns>
        Task<KirjaPage> GetDefaultPageForProject(string projectId);

        /// <summary>
        /// Searches Pages
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="searchPattern">Search Pattern</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <param name="excludeId">Id to exclude</param>
        /// <returns>Pages</returns>
        Task<List<KirjaPage>> SearchPages(string projectId, string searchPattern, int start, int pageSize, string excludeId);

        /// <summary>
        /// Returns the count of pages for a search
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="searchPattern">Search Pattern</param>
        /// <param name="excludeId">Id to exclude</param>
        /// <returns>Page Count</returns>
        Task<int> SearchPagesCount(string projectId, string searchPattern, string excludeId);

        /// <summary>
        /// Updates a page
        /// </summary>
        /// <param name="page">Page to update</param>
        /// <returns>Task</returns>
        Task UpdatePage(KirjaPage page);

        /// <summary>
        /// Deletes a page
        /// </summary>
        /// <param name="page">Page to delete</param>
        /// <returns>Task</returns>
        Task DeletePage(KirjaPage page);

        /// <summary>
        /// Deletes all pages for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Task</returns>
        Task DeletePagesForProject(string projectId);

        /// <summary>
        /// Returns all pages a page is mentioned in
        /// </summary>
        /// <param name="pageId">Page Id</param>
        /// <returns>List of Kirja page</returns>
        Task<List<KirjaPage>> GetPagesByPage(string pageId);

        /// <summary>
        /// Returns all pages a quest is mentioned in
        /// </summary>
        /// <param name="questId">Quest Id</param>
        /// <returns>List of Kirja page</returns>
        Task<List<KirjaPage>> GetPagesByQuest(string questId);

        /// <summary>
        /// Returns all pages an npc is mentioned in
        /// </summary>
        /// <param name="npcId">Npc Id</param>
        /// <returns>List of Kirja page</returns>
        Task<List<KirjaPage>> GetPagesByNpc(string npcId);

        /// <summary>
        /// Returns all pages an item is mentioned in
        /// </summary>
        /// <param name="itemId">Item Id</param>
        /// <returns>List of Kirja page</returns>
        Task<List<KirjaPage>> GetPagesByItem(string itemId);

        /// <summary>
        /// Returns all pages a skill is mentioned in
        /// </summary>
        /// <param name="skillId">Skill Id</param>
        /// <returns>List of Kirja page</returns>
        Task<List<KirjaPage>> GetPagesBySkill(string skillId);

        /// <summary>
        /// Resolves the names of a list of pages
        /// </summary>
        /// <param name="pageIds">Page ids</param>
        /// <returns>Pages with names</returns>
        Task<List<KirjaPage>> ResolveNames(List<string> pageIds);

        
        /// <summary>
        /// Returns all pages that were last modified by a user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>List of Kirja page</returns>
        Task<List<KirjaPage>> GetPagesByModifiedUser(string userId);
    }
}