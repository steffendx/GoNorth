using System.Collections.Generic;
using System.Threading.Tasks;

namespace GoNorth.Data.Exporting
{
    /// <summary>
    /// Interface for Database Access for Object Export Snippets
    /// </summary>
    public interface IObjectExportSnippetDbAccess
    {
        /// <summary>
        /// Returns an export snippet by id
        /// </summary>
        /// <param name="id">Id</param>
        /// <returns>Export Snippet</returns>
        Task<ObjectExportSnippet> GetExportSnippetById(string id);

        /// <summary>
        /// Returns the export snippets for an object
        /// </summary>
        /// <param name="objectId">Object Id</param>
        /// <returns>Export Snippets</returns>
        Task<List<ObjectExportSnippet>> GetExportSnippets(string objectId);

        /// <summary>
        /// Creates an export snippet
        /// </summary>
        /// <param name="exportSnippet">Export snippet to create</param>
        /// <returns>Export Snippet with filled id</returns>
        Task<ObjectExportSnippet> CreateExportSnippet(ObjectExportSnippet exportSnippet);
        
        /// <summary>
        /// Updates an export snippet
        /// </summary>
        /// <param name="exportSnippet">Export snippet to update</param>
        /// <returns>Task</returns>
        Task UpdateExportSnippet(ObjectExportSnippet exportSnippet);
                
        /// <summary>
        /// Deletes an export snippet
        /// </summary>
        /// <param name="exportSnippet">Export snippet to delete</param>
        /// <returns>Task</returns>
        Task DeleteExportSnippet(ObjectExportSnippet exportSnippet);

        /// <summary>
        /// Deletes all export snippets of an object
        /// </summary>
        /// <param name="objectId">Id of the object to delete the snippets for</param>
        /// <returns>Task</returns>
        Task DeleteExportSnippetsByObjectId(string objectId);

        /// <summary>
        /// Returns all snippets an object is referenced
        /// </summary>
        /// <param name="objectId">Object Id</param>
        /// <returns>All snippets the object is referenced in without details</returns>
        Task<List<ObjectExportSnippet>> GetExportSnippetsObjectIsReferenced(string objectId);


        /// <summary>
        /// Returns all invalid export snippet objects
        /// </summary>
        /// <param name="objectIds">Object Ids</param>
        /// <param name="validSnippets">Valid snippets</param>
        /// <returns>Invalid export snippets</returns>
        Task<List<ObjectExportSnippet>> GetInvalidExportSnippets(List<string> objectIds, List<string> validSnippets);

        /// <summary>
        /// Returns all export snippets that were last modified by a given user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Objects</returns>
        Task<List<ObjectExportSnippet>> GetExportSnippetByModifiedUser(string userId);

    }
}