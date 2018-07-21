using System.Threading.Tasks;
using GoNorth.Data.Tale;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.Dialog
{
    /// <summary>
    /// Interface for Export Dialog Function generator
    /// </summary>
    public interface IExportDialogFunctionGenerator
    {
        /// <summary>
        /// Parses a dialog for exporting
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="dialog">Dialog to parse</param>
        /// <param name="errorCollection">Error Collection to send errors to</param>
        /// <returns>Parsed dialog</returns>
        Task<ExportDialogData> GenerateFunctions(string projectId, ExportDialogData dialog, ExportPlaceholderErrorCollection errorCollection);
    }
}