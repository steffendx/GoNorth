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
        /// <returns>All available tags</returns>
        Task<List<string>> GetAllTags();

        /// <summary>
        /// Adds a tag
        /// </summary>
        /// <param name="tag">Tag to add</param>
        /// <returns>Task</returns>
        Task AddTag(string tag);

        /// <summary>
        /// Removes a tag
        /// </summary>
        /// <param name="tag">Tag to remove</param>
        /// <returns>Task</returns>
        Task DeleteTag(string tag);
    }
}