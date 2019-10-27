using System;
using System.IO;
using Microsoft.AspNetCore.Hosting;

namespace GoNorth.Data
{
    /// <summary>
    /// Class for File Access on the file system
    /// </summary>
    public class BaseFileSystemAccess
    {
        /// <summary>
        /// Files Folder
        /// </summary>
        private string _FileFolder;

        /// <summary>
        /// Hosting Environment
        /// </summary>
        private IWebHostEnvironment _hostingEnvironment;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="folderName">Foldername</param>
        /// <param name="hostingEnvironment">Hosting Environment</param>
        public BaseFileSystemAccess(string folderName, IWebHostEnvironment hostingEnvironment)
        {
            _FileFolder = folderName;
            _hostingEnvironment = hostingEnvironment;
        }

        /// <summary>
        /// Creates a new empty file
        /// </summary>
        /// <param name="originalFilename">Original Filename</param>
        /// <param name="filename">Generated Filename</param>
        /// <returns>Stream to write to</returns>
        protected Stream BaseCreateFile(string originalFilename, out string filename)
        {
            filename = Guid.NewGuid().ToString() + Path.GetExtension(originalFilename);
            return BaseCreateFileByGivenName(filename);
        }

        /// <summary>
        /// Creates a new empty file with a given name
        /// </summary>
        /// <param name="filename">Generated Filename</param>
        /// <returns>Stream to write to</returns>
        protected Stream BaseCreateFileByGivenName(string filename)
        {
            string imgFolder = GetFolder();
            if(!Directory.Exists(imgFolder))
            {
                Directory.CreateDirectory(imgFolder);
            }

            return new FileStream(Path.Combine(imgFolder, filename), FileMode.Create);
        }

        /// <summary>
        /// Opens a file
        /// </summary>
        /// <param name="filename">Filename</param>
        /// <returns>File stream</returns>
        protected Stream BaseOpenFile(string filename)
        {
            filename = Path.Combine(GetFolder(), filename);
            return File.OpenRead(filename);
        }

        /// <summary>
        /// Returns the file folder
        /// </summary>
        /// <returns>File Folder</returns>
        protected string GetFolder()
        {
            string imgFolder = Path.Combine(_hostingEnvironment.ContentRootPath, _FileFolder);
            return imgFolder;
        }

        /// <summary>
        /// Deletes a file
        /// </summary>
        /// <param name="filename">Filename</param>
        protected void BaseDeleteFile(string filename)
        {
            string fileToDelete = Path.Combine(GetFolder(), filename);
            if(File.Exists(fileToDelete))
            {
                File.Delete(fileToDelete);
            }
        }
    }
}