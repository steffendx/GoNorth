using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;

namespace GoNorth.Services.Export.ExportSnippets
{
    /// <summary>
    /// Interface for Services that update the related object of an export snippet
    /// </summary>
    public interface IExportSnippetRelatedObjectUpdater
    {
        /// <summary>
        /// Checks the related object of an export snippet on updates
        /// </summary>
        /// <param name="exportSnippet">Export Snippet</param>
        /// <param name="objectType">Object Type</param>
        /// <param name="objectId">Object Id</param>
        /// <returns>Result of the update</returns>
        Task<FlexFieldObject> CheckExportSnippetRelatedObjectOnUpdate(ObjectExportSnippet exportSnippet, string objectType, string objectId);

        /// <summary>
        /// Checks the related object of an export snippet on deletion
        /// </summary>
        /// <param name="exportSnippet">Export Snippet</param>
        /// <param name="objectType">Object Type</param>
        /// <param name="objectId">Object Id</param>
        /// <returns>Result of the deletion check</returns>
        Task<FlexFieldObject> CheckExportSnippetRelatedObjectOnDelete(ObjectExportSnippet exportSnippet, string objectType, string objectId);
    }
}