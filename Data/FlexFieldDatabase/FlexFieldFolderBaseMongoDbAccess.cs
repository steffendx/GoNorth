using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Config;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace GoNorth.Data.FlexFieldDatabase
{
    /// <summary>
    /// Flex Field Folder Mongo Db  Base Access
    /// </summary>
    public class FlexFieldFolderBaseMongoDbAccess : BaseMongoDbAccess, IFlexFieldFolderDbAccess
    {
        /// <summary>
        /// Folder Collection
        /// </summary>
        protected IMongoCollection<FlexFieldFolder> _FolderCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="collectionName">Name of the collection</param>
        /// <param name="configuration">Configuration</param>
        public FlexFieldFolderBaseMongoDbAccess(string collectionName, IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _FolderCollection = _Database.GetCollection<FlexFieldFolder>(collectionName);
        }

        /// <summary>
        /// Creates a Flex Field folder
        /// </summary>
        /// <param name="folder">Folder to create</param>
        /// <returns>Created folder, with filled id</returns>
        public async Task<FlexFieldFolder> CreateFolder(FlexFieldFolder folder)
        {
            folder.Id = Guid.NewGuid().ToString();
            await _FolderCollection.InsertOneAsync(folder);

            return folder;
        }

        /// <summary>
        /// Returns a folder by its Id
        /// </summary>
        /// <param name="folderId">Folder id</param>
        /// <returns>Folder</returns>
        public async Task<FlexFieldFolder> GetFolderById(string folderId)
        {
            FlexFieldFolder folder = await _FolderCollection.Find(f => f.Id == folderId).FirstOrDefaultAsync();
            return folder;
        }

        /// <summary>
        /// Returns all root folders for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Root Folders</returns>
        public async Task<List<FlexFieldFolder>> GetRootFoldersForProject(string projectId, int start, int pageSize)
        {
            List<FlexFieldFolder> folders = await _FolderCollection.Find(f => f.ProjectId == projectId && string.IsNullOrEmpty(f.ParentFolderId)).SortBy(f => f.Name).Skip(start).Limit(pageSize).ToListAsync();
            return folders;
        }

        /// <summary>
        /// Returns the root folder count
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Root Folder Count</returns>
        public async Task<int> GetRootFolderCount(string projectId)
        {
            int count = (int)await _FolderCollection.Find(f => f.ProjectId == projectId && string.IsNullOrEmpty(f.ParentFolderId)).CountDocumentsAsync();
            return count;
        }

        /// <summary>
        /// Returns all Child folders for a folder
        /// </summary>
        /// <param name="folderId">Folder id which the children should be requested</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Child Folders</returns>
        public async Task<List<FlexFieldFolder>> GetChildFolders(string folderId, int start, int pageSize)
        {
            List<FlexFieldFolder> folders = await _FolderCollection.Find(f => f.ParentFolderId == folderId).SortBy(f => f.Name).Skip(start).Limit(pageSize).ToListAsync();
            return folders;
        }

        /// <summary>
        /// Returns the child folder count
        /// </summary>
        /// <param name="folderId">Folder id which the children should be requested</param>
        /// <returns>Count of child folders</returns>
        public async Task<int> GetChildFolderCount(string folderId)
        {
            int count = (int)await _FolderCollection.Find(f => f.ParentFolderId == folderId).CountDocumentsAsync();
            return count;
        }

        /// <summary>
        /// Updates a folder 
        /// </summary>
        /// <param name="folder">Folder</param>
        /// <returns>Task</returns>
        public async Task UpdateFolder(FlexFieldFolder folder)
        {
            await _FolderCollection.UpdateOneAsync(Builders<FlexFieldFolder>.Filter.Eq(f => f.Id, folder.Id), 
                                                   Builders<FlexFieldFolder>.Update.Set(p => p.Name, folder.Name).Set(p => p.Description, folder.Description).
                                                                                    Set(p => p.ImageFile, folder.ImageFile).Set(p => p.ThumbnailImageFile, folder.ThumbnailImageFile));
        }

        /// <summary>
        /// Deletes a folder
        /// </summary>
        /// <param name="folder">Folder to delete</param>
        /// <returns>Task</returns>
        public async Task DeleteFolder(FlexFieldFolder folder)
        {
            DeleteResult result = await _FolderCollection.DeleteOneAsync(f => f.Id == folder.Id);
        }
    }
}