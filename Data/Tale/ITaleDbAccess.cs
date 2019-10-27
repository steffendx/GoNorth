using System.Collections.Generic;
using System.Threading.Tasks;

namespace GoNorth.Data.Tale
{
    /// <summary>
    /// Interface for Database Access for Tale
    /// </summary>
    public interface ITaleDbAccess
    {
        /// <summary>
        /// Creates a new dialog
        /// </summary>
        /// <param name="dialog">Dialog to create</param>
        /// <returns>Created dialog, with filled id</returns>
        Task<TaleDialog> CreateDialog(TaleDialog dialog);

        /// <summary>
        /// Gets a dialog by the id
        /// </summary>
        /// <param name="id">Dialog Id</param>
        /// <returns>Dialog</returns>
        Task<TaleDialog> GetDialogById(string id);

        /// <summary>
        /// Gets a dialog by the related object
        /// </summary>
        /// <param name="relatedObjectId">Related object Id</param>
        /// <returns>Dialog</returns>
        Task<TaleDialog> GetDialogByRelatedObjectId(string relatedObjectId);

        /// <summary>
        /// Returns all dialogs an object is referenced in (not including the relatedobjectid itself)
        /// </summary>
        /// <param name="objectId">Object Id</param>
        /// <returns>All Dialogs object is referenced in without detail information and the entrie with relatedobjectid = itself</returns>
        Task<List<TaleDialog>> GetDialogsObjectIsReferenced(string objectId);

        /// <summary>
        /// Returns all Dialogs that are not yet implemented
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Dialogs</returns>
        Task<List<TaleDialog>> GetNotImplementedDialogs(string projectId, int start, int pageSize);

        /// <summary>
        /// Returns the count of all Dialogs that are not yet implemented
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Dialogs Count</returns>
        Task<int> GetNotImplementedDialogsCount(string projectId);

        /// <summary>
        /// Updates a dialog
        /// </summary>
        /// <param name="dialog">Dialog</param>
        /// <returns>Task</returns>
        Task UpdateDialog(TaleDialog dialog);

        /// <summary>
        /// Deletes a dialog
        /// </summary>
        /// <param name="dialog">Dialog</param>
        /// <returns>Task</returns>
        Task DeleteDialog(TaleDialog dialog);

                
        /// <summary>
        /// Returns all dialogs that were last modified by a user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>List of Dialogs</returns>
        Task<List<TaleDialog>> GetDialogsByModifiedUser(string userId);

        /// <summary>
        /// Returns all recyle bin dialogs that were last modified by a user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>List of Dialogs</returns>
        Task<List<TaleDialog>> GetRecycleBinDialogsByModifiedUser(string userId);

        /// <summary>
        /// Resets all dialogs in the Recycle bin that were modified by a user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Task</returns>
        Task ResetRecycleBinFlexFieldObjectsByModifiedUser(string userId);
    }
}