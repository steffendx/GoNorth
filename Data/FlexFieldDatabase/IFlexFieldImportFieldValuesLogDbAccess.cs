using System.Collections.Generic;
using System.Threading.Tasks;

namespace GoNorth.Data.FlexFieldDatabase
{
    /// <summary>
    /// Interface for Database Access for an flex field import log
    /// </summary>
    public interface IFlexFieldImportFieldValuesLogDbAccess
    {
        /// <summary>
        /// Creates an export log
        /// </summary>
        /// <param name="importLog">Import log to save</param>
        /// <returns>Created log, with filled id</returns>
        Task<FlexFieldImportFieldValuesResultLog> CreateImportLog(FlexFieldImportFieldValuesResultLog importLog);

        /// <summary>
        /// Returns an import log by id
        /// </summary>
        /// <param name="id">Log id</param>
        /// <returns>Import log</returns>
        Task<FlexFieldImportFieldValuesResultLog> GetImportLogById(string id);

        /// <summary>
        /// Returns the import logs for a project without details
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Import logs</returns>
        Task<List<FlexFieldImportFieldValuesResultLog>> GetImportLogsByProject(string projectId, int start, int pageSize);

        /// <summary>
        /// Returns the count of import logs for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Import logs Count</returns>
        Task<int> GetImportLogsByProjectCount(string projectId);
        
        /// <summary>
        /// Returns all log that were last modified by a given user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Objects</returns>
        Task<List<FlexFieldImportFieldValuesResultLog>> GetImportLogsByModifiedUser(string userId);
        
        /// <summary>
        /// Resets all logs that were modified by a user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Task</returns>
        Task ResetImportLogsByModifiedUser(string userId);
    }
}