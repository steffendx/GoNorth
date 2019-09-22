using System.Collections.Generic;
using System.Threading.Tasks;

namespace GoNorth.Data.Exporting
{
    /// <summary>
    /// Interface for Database Access for Object Export Snippet Snapshots
    /// </summary>
    public interface IObjectExportSnippetSnapshotDbAccess
    {
        /// <summary>
        /// Returns the export snippet snapshots for an object
        /// </summary>
        /// <param name="objectId">Object Id</param>
        /// <returns>Export Snippet Snapshots</returns>
        Task<List<ObjectExportSnippet>> GetExportSnippetSnapshots(string objectId);

        /// <summary>
        /// Creates an export snippet snapshot
        /// </summary>
        /// <param name="exportSnippet">Export snippet snapshot to create</param>
        /// <returns>Task</returns>
        Task CreateExportSnippetSnapshot(ObjectExportSnippet exportSnippet);
        
        /// <summary>
        /// Deletes all export snippet snapshots of an object
        /// </summary>
        /// <param name="objectId">Id of the object to delete the snippet snapshots for</param>
        /// <returns>Task</returns>
        Task DeleteExportSnippetSnapshotsByObjectId(string objectId);
    }
}