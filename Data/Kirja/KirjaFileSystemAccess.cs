using System.IO;
using Microsoft.AspNetCore.Hosting;

namespace GoNorth.Data.Kirja
{
    /// <summary>
    /// Filesystem Access for Kirja Files
    /// </summary>
    public class KirjaFileSystemAccess : BaseFileSystemAccess, IKirjaFileAccess
    {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="hostingEnvironment">Hosting Environment</param>
        public KirjaFileSystemAccess(IWebHostEnvironment hostingEnvironment) : base("KirjaFiles", hostingEnvironment)
        {
        }

        /// <summary>
        /// Creates a new empty file
        /// </summary>
        /// <param name="originalFilename">Original Filename</param>
        /// <param name="filename">Generated Filename</param>
        /// <returns>Stream to write to</returns>
        public Stream CreateFile(string originalFilename, out string filename) { return BaseCreateFile(originalFilename, out filename); }

        /// <summary>
        /// Opens a file
        /// </summary>
        /// <param name="filename">Filename</param>
        /// <returns>File stream</returns>
        public Stream OpenFile(string filename) { return BaseOpenFile(filename); }

        /// <summary>
        /// Deletes a file
        /// </summary>
        /// <param name="filename">Filename</param>
        public void DeleteFile(string filename) { BaseDeleteFile(filename); }
    }
}