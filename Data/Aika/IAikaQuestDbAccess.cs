using System.Collections.Generic;
using System.Threading.Tasks;

namespace GoNorth.Data.Aika
{
    /// <summary>
    /// Interface for Database Access for Aika Quest
    /// </summary>
    public interface IAikaQuestDbAccess
    {
        /// <summary>
        /// Returns a quest by the id
        /// </summary>
        /// <param name="id">Id of the quest</param>
        /// <returns>Quest</returns>
        Task<AikaQuest> GetQuestById(string id);

        /// <summary>
        /// Returns the quests for a project with reduced informations
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Quests</returns>
        Task<List<AikaQuest>> GetQuestsByProjectId(string projectId, int start, int pageSize);

        /// <summary>
        /// Returns the count of quests for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Quest Count</returns>
        Task<int> GetQuestsByProjectIdCount(string projectId);

        /// <summary>
        /// Searches Quests with reduced informations
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="searchPattern">Search pattern</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Quests</returns>
        Task<List<AikaQuest>> SearchQuests(string projectId, string searchPattern, int start, int pageSize);

        /// <summary>
        /// Returns the count of a search result
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="searchPattern">Search pattern</param>
        /// <returns>Count of results</returns>
        Task<int> SearchQuestsCount(string projectId, string searchPattern);

        /// <summary>
        /// Returns all quests that are not yet implemented
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Quest Objects</returns>
        Task<List<AikaQuest>> GetNotImplementedQuests(string projectId, int start, int pageSize);

        /// <summary>
        /// Returns the count of all quests that are not yet implemented
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Quest Count</returns>
        Task<int> GetNotImplementedQuestsCount(string projectId);

        /// <summary>
        /// Returns all quests an object is referenced in
        /// </summary>
        /// <param name="objectId">Object Id</param>
        /// <returns>All Quests object is referenced in without detail information</returns>
        Task<List<AikaQuest>> GetQuestsObjectIsReferenced(string objectId);
        
        /// <summary>
        /// Resolves the names for a list of Quests
        /// </summary>
        /// <param name="questIds">Quest Ids</param>
        /// <returns>Resolved Quests with names</returns>
        Task<List<AikaQuest>> ResolveQuestNames(List<string> questIds);

        /// <summary>
        /// Creates a new quest
        /// </summary>
        /// <param name="quest">Quest</param>
        /// <returns>Quest filled with data</returns>
        Task<AikaQuest> CreateQuest(AikaQuest quest);

        /// <summary>
        /// Updates a quest
        /// </summary>
        /// <param name="quest">Quest to update</param>
        /// <returns>Task</returns>
        Task UpdateQuest(AikaQuest quest);
        
        /// <summary>
        /// Deletes a quest
        /// </summary>
        /// <param name="quest">Quest to delete</param>
        /// <returns>Task</returns>
        Task DeleteQuest(AikaQuest quest);


        /// <summary>
        /// Returns all quests that were last modified by a given user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Quests</returns>
        Task<List<AikaQuest>> GetQuestsByModifiedUser(string userId);

        /// <summary>
        /// Returns all quests in the recycle bin that were last modified by a given user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Quest</returns>
        Task<List<AikaQuest>> GetRecycleBinQuestsByModifiedUser(string userId);

        /// <summary>
        /// Returns all quests in the recycle bin that were last modified by a given user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Task</returns>
        Task ResetRecycleBinQuestByModifiedUser(string userId);
    }
}