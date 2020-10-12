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
        /// <param name="locale">Locale used for the collation</param>
        /// <returns>Root Folders</returns>
        Task<List<FlexFieldFolder>> GetRootFoldersForProject(string projectId, int start, int pageSize, string locale);

        /// <summary>
        /// Returns the root folder count
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="locale">Locale used for the collation</param>
        /// <returns>Root Folder Count</returns>
        Task<int> GetRootFolderCount(string projectId, string locale);

        /// <summary>
        /// Returns all Child folders for a folder
        /// </summary>
        /// <param name="folderId">Folder id for which the children should be requested</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <param name="locale">Locale used for the collation</param>
        /// <returns>Child Folders</returns>
        Task<List<FlexFieldFolder>> GetChildFolders(string folderId, int start, int pageSize, string locale);

        /// <summary>
        /// Returns the child folder count
        /// </summary>
        /// <param name="folderId">Folder id for which the children should be requested</param>
        /// <param name="locale">Locale used for the collation</param>
        /// <returns>Count of child folders</returns>
        Task<int> GetChildFolderCount(string folderId, string locale);

        /// <summary>
        /// Returns all folders to build a hierarchy of folders
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Folders with simple information</returns>
        Task<List<FlexFieldFolder>> GetFoldersForHierarchy(string projectId);

        /// <summary>
        /// Updates a folder
        /// </summary>
        /// <param name="folder">Folder</param>
        /// <returns>Task</returns>
        Task UpdateFolder(FlexFieldFolder folder);

        /// <summary>
        /// Moves a folder to a folder
        /// </summary>
        /// <param name="folderId">Folder to move</param>
        /// <param name="targetFolderId">Id of the folder to move the object to</param>
        /// <returns>Task</returns>
        Task MoveToFolder(string folderId, string targetFolderId);

        /// <summary>
        /// Deletes a folder
        /// </summary>
        /// <param name="folder">Folder to delete</param>
        /// <returns>Task</returns>
        Task DeleteFolder(FlexFieldFolder folder);
    }
}