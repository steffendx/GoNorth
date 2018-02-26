using System.IO;

namespace GoNorth.Data.TaskManagement
{
    /// <summary>
    /// Interface for Access for Task Images
    /// </summary>
    public interface ITaskImageAccess
    {
        /// <summary>
        /// Creates a new empty image
        /// </summary>
        /// <param name="originalFilename">Original Filename</param>
        /// <param name="filename">Generated Filename</param>
        /// <returns>Stream to write to</returns>
        Stream CreateImage(string originalFilename, out string filename);

        /// <summary>
        /// Opens an image
        /// </summary>
        /// <param name="filename">Filename</param>
        /// <returns>File stream</returns>
        Stream OpenImage(string filename);

        /// <summary>
        /// Deletes an image
        /// </summary>
        /// <param name="filename">Filename</param>
        void DeleteImage(string filename);
    }
}