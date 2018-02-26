using System.IO;

namespace GoNorth.Data.Kirja
{
    /// <summary>
    /// Interface for Access for Kirja Files
    /// </summary>
    public interface IKirjaFileAccess
    {
        /// <summary>
        /// Creates a new empty file
        /// </summary>
        /// <param name="originalFilename">Original Filename</param>
        /// <param name="filename">Generated Filename</param>
        /// <returns>Stream to write to</returns>
        Stream CreateFile(string originalFilename, out string filename);

        /// <summary>
        /// Opens a file
        /// </summary>
        /// <param name="filename">Filename</param>
        /// <returns>File stream</returns>
        Stream OpenFile(string filename);

        /// <summary>
        /// Deletes a file
        /// </summary>
        /// <param name="filename">Filename</param>
        void DeleteFile(string filename);
    }
}