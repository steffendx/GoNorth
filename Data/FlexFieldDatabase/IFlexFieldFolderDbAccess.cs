using System.Collections.Generic;
using System.Threading.Tasks;

namespace GoNorth.Data.FlexFieldDatabase
{
    /// <summary>
    /// Interface for Database Access for Flex Field Folders
    /// </summary>
    public interface IFlexFieldFolderDbAccess
    {
        /// <summary>
        /// Creates a Flex Field folder
        /// </summary>
        /// <param name="folder">Folder to create</param>
        /// <returns>Created folder, with filled id</returns>
        Task<FlexFieldFolder> CreateFolder(FlexFieldFolder folder);

        /// <summary>
        /// Returns a folder by its Id
        /// </summary>
        /// <param name="folderId">Folder id</param>
        /// <returns>Folder</returns>
        Task<FlexFieldFolder> GetFolderById(string folderId);

        /// <summary>
        /// Returns all root folders for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Root Folders</returns>
        Task<List<FlexFieldFolder>> GetRootFoldersForProject(string projectId, int start, int pageSize);

        /// <summary>
        /// Returns the root folder count
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Root Folder Count</returns>
        Task<int> GetRootFolderCount(string projectId);

        /// <summary>
        /// Returns all Child folders for a folder
        /// </summary>
        /// <param name="folderId">Folder id which the children should be requested</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Child Folders</returns>
        Task<List<FlexFieldFolder>> GetChildFolders(string folderId, int start, int pageSize);

        /// <summary>
        /// Returns the child folder count
        /// </summary>
        /// <param name="folderId">Folder id which the children should be requested</param>
        /// <returns>Count of child folders</returns>
        Task<int> GetChildFolderCount(string folderId);

        /// <summary>
        /// Updates a folder
        /// </summary>
        /// <param name="folder">Folder</param>
        /// <returns>Task</returns>
        Task UpdateFolder(FlexFieldFolder folder);

        /// <summary>
        /// Deletes a folder
        /// </summary>
        /// <param name="folder">Folder to delete</param>
        /// <returns>Task</returns>
        Task DeleteFolder(FlexFieldFolder folder);
    }
}