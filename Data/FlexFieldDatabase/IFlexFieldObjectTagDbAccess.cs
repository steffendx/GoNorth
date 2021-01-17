using System.Collections.Generic;
using System.Threading.Tasks;

namespace GoNorth.Data.FlexFieldDatabase
{
    /// <summary>
    /// Interface for Database Access for Flex Field Object Tags
    /// </summary>
    public interface IFlexFieldObjectTagDbAccess
    {
        /// <summary>
        /// Returns all available tags
        /// </summary>
        /// <param name="projectId">Id of the project</param>
        /// <returns>All available tags</returns>
        Task<List<string>> GetAllTags(string projectId);

        /// <summary>
        /// Adds a tag
        /// </summary>
        /// <param name="projectId">Id of the project</param>
        /// <param name="tag">Tag to add</param>
        /// <returns>Task</returns>
        Task AddTag(string projectId, string tag);

        /// <summary>
        /// Removes a tag
        /// </summary>
        /// <param name="projectId">Id of the project</param>
        /// <param name="tag">Tag to remove</param>
        /// <returns>Task</returns>
        Task DeleteTag(string projectId, string tag);
        
        /// <summary>
        /// Sets the project id for legacy tags
        /// </summary>
        /// <param name="defaultProjectId">Id of the default project</param>
        /// <returns>Task</returns>
        Task SetProjectIdForLegacyTags(string defaultProjectId);
    }
}