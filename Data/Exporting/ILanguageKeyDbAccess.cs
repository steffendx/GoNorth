using System.Collections.Generic;
using System.Threading.Tasks;

namespace GoNorth.Data.Exporting
{
    /// <summary>
    /// Interface for Database Access for Language Keys
    /// </summary>
    public interface ILanguageKeyDbAccess
    {
        /// <summary>
        /// Returns a new language key id for a group
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="groupId">Group Id</param>
        /// <returns>New Language Key Id</returns>
        Task<int> GetNewLanguageKeyIdForGroup(string projectId, string groupId);

        /// <summary>
        /// Returns an existing language key
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="groupId">Group Id</param>
        /// <param name="langKeyRef">Language Key Reference</param>
        /// <returns>Language Key</returns>
        Task<LanguageKey> GetLanguageKey(string projectId, string groupId, string langKeyRef);

        /// <summary>
        /// Returns an existing language key by key
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="langKey">Language Key</param>
        /// <returns>Language Key</returns>
        Task<LanguageKey> GetLanguageKeyByKey(string projectId, string langKey);

        /// <summary>
        /// Returns all language keys for a group
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="groupId">Group Id</param>
        /// <returns>Language keys for groups</returns>
        Task<List<LanguageKey>> GetLanguageKeysByGroupId(string projectId, string groupId);


        /// <summary>
        /// Saves a new language key. The Id must be set in the method
        /// </summary>
        /// <param name="languageKey">Language Key</param>
        /// <returns>Language Key with filled id</returns>
        Task<LanguageKey> SaveNewLanguageKey(LanguageKey languageKey);

        /// <summary>
        /// Updates the value of a language key
        /// </summary>
        /// <param name="id">Id of the language key</param>
        /// <param name="newValue">New Value</param>
        /// <returns>Task</returns>
        Task UpdateLanguageKeyValue(string id, string newValue);

        /// <summary>
        /// Deletes all language keys in a group
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="groupId">Group Id</param>
        /// <returns>Task</returns>
        Task DeleteAllLanguageKeysInGroup(string projectId, string groupId);
    }
}