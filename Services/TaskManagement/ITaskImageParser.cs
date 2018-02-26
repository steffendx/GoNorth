using System.Collections.Generic;

namespace GoNorth.Services.TaskManagement
{
    /// <summary>
    /// Interface for parsing task images
    /// </summary>
    public interface ITaskImageParser
    {
        /// <summary>
        /// Parses a task description for images
        /// </summary>
        /// <param name="description">Description to parse</param>
        /// <returns>List with all images in the description</returns>
        List<string> ParseDescription(string description);
    }
}