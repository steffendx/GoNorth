using System.Collections.Generic;
using System.Threading.Tasks;

namespace GoNorth.Data.Aika
{
    /// <summary>
    /// Interface for Database Access for Aika Chapter Detail
    /// </summary>
    public interface IAikaChapterDetailDbAccess
    {
    
        /// <summary>
        /// Returns the chapter details which are not associated to a chapter with reduced detail
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="start">Start of the page</param>
        /// <param name="pageSize">Page size</param>
        /// <returns>Chapter details which are not associated to a chapter with reduced detail</returns>
        Task<List<AikaChapterDetail>> GetChapterDetailsByProjectId(string projectId, int start, int pageSize);

        /// <summary>
        /// Returns the chapter details which are not associated to a chapter with reduced detail
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Chapter details which are not associated to a chapter with reduced detail</returns>
        Task<int> GetChapterDetailsByProjectIdCount(string projectId);

        /// <summary>
        /// Searches Chapter details with reduced informations
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="searchPattern">Search pattern</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Chapter Details</returns>
        Task<List<AikaChapterDetail>> SearchChapterDetails(string projectId, string searchPattern, int start, int pageSize);

        /// <summary>
        /// Returns the count of a search result
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="searchPattern">Search pattern</param>
        /// <returns>Count of results</returns>
        Task<int> SearchChapterDetailsCount(string projectId, string searchPattern);

        /// <summary>
        /// Returns a chapter detail by the id
        /// </summary>
        /// <param name="id">Id of the chapter detail</param>
        /// <returns>Chapter detail</returns>
        Task<AikaChapterDetail> GetChapterDetailById(string id);

        /// <summary>
        /// Creates a new chapter detail
        /// </summary>
        /// <param name="chapterDetail">Chapter detail</param>
        /// <returns>Chapter detail filled with data</returns>
        Task<AikaChapterDetail> CreateChapterDetail(AikaChapterDetail chapterDetail);

        /// <summary>
        /// Updates a chapter detail
        /// </summary>
        /// <param name="chapterDetail">Chapter detail to update</param>
        /// <returns>Task</returns>
        Task UpdateChapterDetail(AikaChapterDetail chapterDetail);
        
        /// <summary>
        /// Deletes a chapter detail
        /// </summary>
        /// <param name="chapterDetail">Chapter detail to delete</param>
        /// <returns>Task</returns>
        Task DeleteChapterDetail(AikaChapterDetail chapterDetail);

        /// <summary>
        /// Returns whether a chapter detail is used in any other node 
        /// </summary>
        /// <param name="detailViewId">Detail View Id</param>
        /// <param name="excludeNodeId">Node Id to exclude</param>
        /// <returns>true if detail is still used, else false</returns>
        Task<bool> IsDetailUsedInOtherNode(string detailViewId, string excludeNodeId);

        /// <summary>
        /// Returns the chapter details which are using a quest with reduced detail
        /// </summary>
        /// <param name="questId">Quest Id</param>
        /// <returns>Chapter details which are using the quest with reduced detail</returns>
        Task<List<AikaChapterDetail>> GetChapterDetailsByQuestId(string questId);

    }
}