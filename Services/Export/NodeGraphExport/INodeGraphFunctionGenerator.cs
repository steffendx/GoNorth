using System.Threading.Tasks;
using GoNorth.Services.Export.Dialog;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.NodeGraphExport
{
    /// <summary>
    /// Interface for Node Graph Function generator
    /// </summary>
    public interface INodeGraphFunctionGenerator
    {
        /// <summary>
        /// Generates the functions for a dialog/node graph data for exporting
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="objectId">Object Id</param>
        /// <param name="dialog">Dialog/Node Graph to generate functiosn for</param>
        /// <param name="errorCollection">Error Collection to send errors to</param>
        /// <returns>Parsed dialog</returns>
        Task<ExportDialogData> GenerateFunctions(string projectId, string objectId, ExportDialogData dialog, ExportPlaceholderErrorCollection errorCollection);
    }
}