using System.Collections.Generic;
using System.Threading.Tasks;

namespace GoNorth.Data.Aika
{
    /// <summary>
    /// Interface for Database Access for Aika Chapter Overview
    /// </summary>
    public interface IAikaChapterOverviewDbAccess
    {
        /// <summary>
        /// Returns a chapter overview by the project id
        /// </summary>
        /// <param name="projectId">Project Id of the chapter</param>
        /// <returns>Chapter overview</returns>
        Task<AikaChapterOverview> GetChapterOverviewByProjectId(string projectId);

        /// <summary>
        /// Returns a chapter overview by the id
        /// </summary>
        /// <param name="id">Id of the chapter overview</param>
        /// <returns>Chapter overview</returns>
        Task<AikaChapterOverview> GetChapterOverviewById(string id);

        /// <summary>
        /// Creates a new chapter overview
        /// </summary>
        /// <param name="chapterOverview">Chapter overview</param>
        /// <returns>Chapter Overview filled with data</returns>
        Task<AikaChapterOverview> CreateChapterOverview(AikaChapterOverview chapterOverview);

        /// <summary>
        /// Updates a chapter overview
        /// </summary>
        /// <param name="chapterOverview">Chapter overview to update</param>
        /// <returns>Task</returns>
        Task UpdateChapterOverview(AikaChapterOverview chapterOverview);
        
        /// <summary>
        /// Deletes a chapter overview
        /// </summary>
        /// <param name="chapterOverview">Chapter overview to delete</param>
        /// <returns>Task</returns>
        Task DeleteChapterOverview(AikaChapterOverview chapterOverview);

        
        /// <summary>
        /// Returns all chapter overviews that were last modified by a given user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Chapter overviews</returns>
        Task<List<AikaChapterOverview>> GetChapterOverviewByModifiedUser(string userId);
    }
}