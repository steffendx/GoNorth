using System.IO;
using Microsoft.AspNetCore.Hosting;

namespace GoNorth.Data.TaskManagement
{
    /// <summary>
    /// Filesystem Access for Task Images
    /// </summary>
    public class TaskImageFileSystemAccess : BaseFileSystemAccess, ITaskImageAccess
    {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="hostingEnvironment">Hosting Environment</param>
        public TaskImageFileSystemAccess(IHostingEnvironment hostingEnvironment) : base("TaskImages", hostingEnvironment)
        {
        }

        /// <summary>
        /// Creates a new empty image
        /// </summary>
        /// <param name="originalFilename">Original Filename</param>
        /// <param name="filename">Generated Filename</param>
        /// <returns>Stream to write to</returns>
        public Stream CreateImage(string originalFilename, out string filename) { return BaseCreateFile(originalFilename, out filename); }

        /// <summary>
        /// Opens an image
        /// </summary>
        /// <param name="filename">Filename</param>
        /// <returns>File stream</returns>
        public Stream OpenImage(string filename) { return BaseOpenFile(filename); }

        /// <summary>
        /// Deletes an image
        /// </summary>
        /// <param name="filename">Filename</param>
        public void DeleteImage(string filename) { BaseDeleteFile(filename); }
    }
}