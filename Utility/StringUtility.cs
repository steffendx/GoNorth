using System.IO;
using System.Text.RegularExpressions;

namespace GoNorth.Services.User
{
    /// <summary>
    /// Utility class for string manipulation
    /// </summary>
    public static class StringUtility
    {
        /// <summary>
        /// Cleans invalid filename chars
        /// </summary>
        /// <param name="filename">Filename</param>
        /// <returns>Cleaned filename</returns>
        public static string CleanInvalidFilenameChars(string filename)
        {
            string regexSearch = Regex.Escape(new string(Path.GetInvalidFileNameChars()));
            Regex illegalCharRegex = new Regex(string.Format("[{0}]", regexSearch));
            return illegalCharRegex.Replace(filename, string.Empty);
        }
    }
}
