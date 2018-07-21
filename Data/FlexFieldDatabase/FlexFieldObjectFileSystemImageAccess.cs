using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;

namespace GoNorth.Data.FlexFieldDatabase
{
    /// <summary>
    /// Class for Image Access on the file system for Flex Field Objects
    /// </summary>
    public class FlexFieldObjectFileSystemImageAccess<T, DbAccess, TemplateDbAccess> : BaseFileSystemAccess, IFlexFieldObjectImageAccess where T:FlexFieldObject where DbAccess:IFlexFieldObjectDbAccess<T> where TemplateDbAccess:IFlexFieldObjectDbAccess<T>
    {
        /// <summary>
        /// Object Db Access
        /// </summary>
        private DbAccess _objectDbAccess;

        /// <summary>
        /// Template Db Access
        /// </summary>
        private TemplateDbAccess _templateDbAccess;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="folderName">Folder Name</param>
        /// <param name="hostingEnvironment">Hosting Environment</param>
        /// <param name="objectDbAccess">Object Db Access</param>
        /// <param name="templateDbAccess">Template Db Access</param>
        public FlexFieldObjectFileSystemImageAccess(string folderName, IHostingEnvironment hostingEnvironment, DbAccess objectDbAccess, TemplateDbAccess templateDbAccess) : base(folderName, hostingEnvironment)
        {
            _objectDbAccess = objectDbAccess;
            _templateDbAccess = templateDbAccess;
        }

        /// <summary>
        /// Creates a new empty Flex Field Object image
        /// </summary>
        /// <param name="originalFilename">Original Filename</param>
        /// <param name="filename">Generated Filename</param>
        /// <returns>Stream to write to</returns>
        public Stream CreateFlexFieldObjectImage(string originalFilename, out string filename)
        {
            return BaseCreateFile(originalFilename, out filename);
        }

        /// <summary>
        /// Creates a new empty Flex Field Object Thumbnail image
        /// </summary>
        /// <param name="thumbnailImage">Generated Filename</param>
        /// <returns>Stream to write to</returns>
        public Stream CreateFlexFieldThumbnailImage(string thumbnailImage)
        {
            return BaseCreateFileByGivenName(thumbnailImage);
        }

        /// <summary>
        /// Opens a Flex Field Object image
        /// </summary>
        /// <param name="filename">Filename of the image</param>
        /// <returns>Flex Field Object Image stream</returns>
        public Stream OpenFlexFieldObjectImage(string filename)
        {
            return BaseOpenFile(filename);
        }

        /// <summary>
        /// Checks and deletes unused image
        /// </summary>
        /// <param name="filename">Filename of the image</param>
        public void CheckAndDeleteUnusedImage(string filename)
        {
            Task<bool> npcUsingImageTask = _objectDbAccess.AnyFlexFieldObjectUsingImage(filename);
            Task<bool> templateUsingImageTask = _templateDbAccess.AnyFlexFieldObjectUsingImage(filename);
            Task.WaitAll(npcUsingImageTask, templateUsingImageTask);

            if(npcUsingImageTask.Result || templateUsingImageTask.Result)
            {
                return;
            }

            BaseDeleteFile(filename);
        }
    }
}