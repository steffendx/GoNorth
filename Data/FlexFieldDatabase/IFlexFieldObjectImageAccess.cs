using System.IO;

namespace GoNorth.Data.FlexFieldDatabase
{
    /// <summary>
    /// Interface for Image Access for Flex Field Objects
    /// </summary>
    public interface IFlexFieldObjectImageAccess
    {
        /// <summary>
        /// Creates a new empty Flex Field Object image
        /// </summary>
        /// <param name="originalFilename">Original Filename</param>
        /// <param name="filename">Generated Filename</param>
        /// <returns>Stream to write to</returns>
        Stream CreateFlexFieldObjectImage(string originalFilename, out string filename);

        /// <summary>
        /// Opens a Flex Field Object image
        /// </summary>
        /// <param name="filename">Filename of the image</param>
        /// <returns>Flex Field Object Image stream</returns>
        Stream OpenFlexFieldObjectImage(string filename);

        /// <summary>
        /// Checks and deletes unused image
        /// </summary>
        /// <param name="filename">Filename of the image</param>
        void CheckAndDeleteUnusedImage(string filename);
    }
}