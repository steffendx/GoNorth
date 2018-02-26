using System.Collections.Generic;
using System.Threading.Tasks;

namespace GoNorth.Data.FlexFieldDatabase
{
    /// <summary>
    /// Interface for Database Access for Flex Field Objects
    /// </summary>
    public interface IFlexFieldObjectDbAccess<T> where T: FlexFieldObject
    {
        /// <summary>
        /// Creates a Flex Field Object
        /// </summary>
        /// <param name="flexFieldObject">Flex Field object to create</param>
        /// <returns>Created flex field object, with filled id</returns>
        Task<T> CreateFlexFieldObject(T flexFieldObject);

        /// <summary>
        /// Returns an Flex Field Object by id
        /// </summary>
        /// <param name="id">Id</param>
        /// <returns>Flex Field Object</returns>
        Task<T> GetFlexFieldObjectById(string id);

        /// <summary>
        /// Returns the Flex Field Objects in the root folder
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Flex Field Objects</returns>
        Task<List<T>> GetFlexFieldObjectsInRootFolderForProject(string projectId, int start, int pageSize);

        /// <summary>
        /// Returns the count of Flex Field Objects in the root folder
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Flex Field Object Count</returns>
        Task<int> GetFlexFieldObjectsInRootFolderCount(string projectId);

        /// <summary>
        /// Returns all Flex Field Objects in a folder
        /// </summary>
        /// <param name="folderId">Folder Id</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Flex Field Objects</returns>
        Task<List<T>> GetFlexFieldObjectsInFolder(string folderId, int start, int pageSize);

        /// <summary>
        /// Returns the count of Flex Field Objects in a folder folder
        /// </summary>
        /// <param name="folderId">Folder Id</param>
        /// <returns>Flex Field Object Count</returns>
        Task<int> GetFlexFieldObjectsInFolderCount(string folderId);

        /// <summary>
        /// Searches Flex Field Objects
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="searchPattern">Search pattern</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Flex Field Objects</returns>
        Task<List<T>> SearchFlexFieldObjects(string projectId, string searchPattern, int start, int pageSize);

        /// <summary>
        /// Returns the count of a search result
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="searchPattern">Search pattern</param>
        /// <returns>Count of results</returns>
        Task<int> SearchFlexFieldObjectsCount(string projectId, string searchPattern);

        /// <summary>
        /// Returns all Flex Field Objects that are not yet implemented
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Flex Field Objects</returns>
        Task<List<T>> GetNotImplementedFlexFieldObjects(string projectId, int start, int pageSize);

        /// <summary>
        /// Returns the count of all Flex Field Objects that are not yet implemented
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Flex Field Object Count</returns>
        Task<int> GetNotImplementedFlexFieldObjectsCount(string projectId);

        /// <summary>
        /// Returns the Flex Field Objects which are based on a certain template
        /// </summary>
        /// <param name="templateId">Template Id</param>
        /// <returns>Flex Field Objects</returns>
        Task<List<T>> GetFlexFieldObjectsByTemplate(string templateId);

        /// <summary>
        /// Resolves the names for a list of Flex Field Objects
        /// </summary>
        /// <param name="flexFieldObjectIds">Flex Field Object Ids</param>
        /// <returns>Resolved Flex Field Objects with names</returns>
        Task<List<T>> ResolveFlexFieldObjectNames(List<string> flexFieldObjectIds);

        /// <summary>
        /// Updates an Flex Field Object
        /// </summary>
        /// <param name="flexFieldObject">Flex Field Object to update</param>
        /// <returns>Task</returns>
        Task UpdateFlexFieldObject(T flexFieldObject);

        /// <summary>
        /// Deletes an Flex Field Object
        /// </summary>
        /// <param name="flexFieldObject">Flex Field Object to delete</param>
        /// <returns>Task</returns>
        Task DeleteFlexFieldObject(T flexFieldObject);

        /// <summary>
        /// Checks if any Flex Field Object use an image file
        /// </summary>
        /// <param name="imageFile">Image file</param>
        /// <returns>true if image file is used, else false</returns>
        Task<bool> AnyFlexFieldObjectUsingImage(string imageFile);

        /// <summary>
        /// Checks if any Flex Field Object use a tag
        /// </summary>
        /// <param name="tag">Tag</param>
        /// <returns>true if tag is used, else false</returns>
        Task<bool> AnyFlexFieldObjectUsingTag(string tag);
    }
}