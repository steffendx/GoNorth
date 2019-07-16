using System.Collections.Generic;
using System.Threading.Tasks;

namespace GoNorth.Data.Exporting
{
    /// <summary>
    /// Interface for Database Access for export function ids
    /// </summary>
    public interface IExportFunctionIdDbAccess
    {
        /// <summary>
        /// Returns a new export function id for an object
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="objectId">Object Id</param>
        /// <returns>New export function id</returns>
        Task<int> GetNewExportFuntionIdForObject(string projectId, string objectId);
        
        /// <summary>
        /// Returns a new export function id for an object
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="objectId">Object Id</param>
        /// <param name="subCategory">Sub Category for the object</param>
        /// <returns>New export function id</returns>
        Task<int> GetNewExportFuntionIdForObjectAndSubCategory(string projectId, string objectId, string subCategory);


        /// <summary>
        /// Returns an existing export function id
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="objectId">Object Id</param>
        /// <param name="functionObjectId">Function object id</param>
        /// <returns>Export Function Id</returns>
        Task<ExportFunctionId> GetExportFunctionId(string projectId, string objectId, string functionObjectId);
        
        /// <summary>
        /// Saves a new export function id. The id must be set in the method.
        /// </summary>
        /// <param name="functionId">Function Id</param>
        /// <returns>Export Function Id</returns>
        Task<ExportFunctionId> SaveNewExportFunctionId(ExportFunctionId functionId);
        
        /// <summary>
        /// Deletes all export function ids for an object
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="objectId">Object Id</param>
        /// <returns>Task</returns>
        Task DeleteAllExportFunctionIdsForObject(string projectId, string objectId);
    }
}