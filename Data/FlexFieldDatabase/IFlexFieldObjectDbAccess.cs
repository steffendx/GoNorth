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
        /// Returns a list Flex Field Objects by id with full data
        /// </summary>
        /// <param name="id">Id</param>
        /// <returns>Flex Field Objects</returns>
        Task<List<T>> GetFlexFieldObjectsByIds(List<string> id);

        /// <summary>
        /// Returns the Flex Field Objects in the root folder
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <param name="locale">Locale used for the collation</param>
        /// <returns>Flex Field Objects</returns>
        Task<List<T>> GetFlexFieldObjectsInRootFolderForProject(string projectId, int start, int pageSize, string locale);

        /// <summary>
        /// Returns the count of Flex Field Objects in the root folder
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="locale">Locale used for the collation</param>
        /// <returns>Flex Field Object Count</returns>
        Task<int> GetFlexFieldObjectsInRootFolderCount(string projectId, string locale);

        /// <summary>
        /// Returns all Flex Field Objects in a folder
        /// </summary>
        /// <param name="folderId">Folder Id</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <param name="locale">Locale used for the collation</param>
        /// <returns>Flex Field Objects</returns>
        Task<List<T>> GetFlexFieldObjectsInFolder(string folderId, int start, int pageSize, string locale);

        /// <summary>
        /// Returns the count of Flex Field Objects in a folder folder
        /// </summary>
        /// <param name="folderId">Folder Id</param>
        /// <param name="locale">Locale used for the collation</param>
        /// <returns>Flex Field Object Count</returns>
        Task<int> GetFlexFieldObjectsInFolderCount(string folderId, string locale);

        /// <summary>
        /// Searches Flex Field Objects
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="searchPattern">Search pattern</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <param name="locale">Locale used for the collation</param>
        /// <returns>Flex Field Objects</returns>
        Task<List<T>> SearchFlexFieldObjects(string projectId, string searchPattern, int start, int pageSize, string locale);

        /// <summary>
        /// Returns the count of a search result
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="searchPattern">Search pattern</param>
        /// <param name="locale">Locale used for the collation</param>
        /// <returns>Count of results</returns>
        Task<int> SearchFlexFieldObjectsCount(string projectId, string searchPattern, string locale);

        /// <summary>
        /// Returns all Flex Field Objects that are not yet implemented
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <param name="locale">Locale used for the collation</param>
        /// <returns>Flex Field Objects</returns>
        Task<List<T>> GetNotImplementedFlexFieldObjects(string projectId, int start, int pageSize, string locale);

        /// <summary>
        /// Returns the count of all Flex Field Objects that are not yet implemented
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="locale">Locale used for the collation</param>
        /// <returns>Flex Field Object Count</returns>
        Task<int> GetNotImplementedFlexFieldObjectsCount(string projectId, string locale);

        /// <summary>
        /// Returns the Flex Field Objects which are based on a certain template
        /// </summary>
        /// <param name="templateId">Template Id</param>
        /// <returns>Flex Field Objects</returns>
        Task<List<T>> GetFlexFieldObjectsByTemplate(string templateId);

        /// <summary>
        /// Returns all flex field objects that are not part of an id list. This means that they are not part of the list themselfs and or their template
        /// </summary>
        /// <param name="idList">List of ids</param>
        /// <returns>Flex field objects</returns>
        Task<List<T>> GetFlexFieldObjectsNotPartOfIdList(IEnumerable<string> idList);
        
        /// <summary>
        /// Returns all flex field objects that are part of an id list. This means that they are not part of the list themselfs and or their template
        /// </summary>
        /// <param name="idList">List of ids</param>
        /// <returns>Flex field objects</returns>
        Task<List<T>> GetFlexFieldObjectsPartOfIdList(IEnumerable<string> idList);

        /// <summary>
        /// Resolves the names for a list of Flex Field Objects
        /// </summary>
        /// <param name="flexFieldObjectIds">Flex Field Object Ids</param>
        /// <returns>Resolved Flex Field Objects with names</returns>
        Task<List<T>> ResolveFlexFieldObjectNames(List<string> flexFieldObjectIds);

        /// <summary>
        /// Returns a list of objects by id
        /// </summary>
        /// <param name="idsToLoad">Ids of the objects to load</param>
        /// <returns>List of loaded objects</returns>
        Task<List<T>> GetObjectsById(List<string> idsToLoad);

        /// <summary>
        /// Updates an Flex Field Object
        /// </summary>
        /// <param name="flexFieldObject">Flex Field Object to update</param>
        /// <returns>Task</returns>
        Task UpdateFlexFieldObject(T flexFieldObject);

        /// <summary>
        /// Moves an object to a folder
        /// </summary>
        /// <param name="objectId">Object to move</param>
        /// <param name="targetFolderId">Id of the folder to move the object to</param>
        /// <returns>Task</returns>
        Task MoveToFolder(string objectId, string targetFolderId);

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


        /// <summary>
        /// Returns all objects that were last modified by a given user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Objects</returns>
        Task<List<T>> GetFlexFieldObjectsByModifiedUser(string userId);
        
        /// <summary>
        /// Returns all objects in Recycle bin that were last modified by a given user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Objects</returns>
        Task<List<T>> GetRecycleBinFlexFieldObjectsByModifiedUser(string userId);
        
        /// <summary>
        /// Resets all objects in the Recycle bin that were modified by a user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Task</returns>
        Task ResetRecycleBinFlexFieldObjectsByModifiedUser(string userId);
        
        /// <summary>
        /// Resolves the names for a list of Flex Field Objects in the Recycle bin
        /// </summary>
        /// <param name="flexFieldObjectIds">Flex Field Object Ids</param>
        /// <returns>Resolved Flex Field Objects with names</returns>
        Task<List<T>> ResolveRecycleBinFlexFieldObjectNames(List<string> flexFieldObjectIds);
    }
}