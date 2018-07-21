using GoNorth.Data.Tale;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.Dialog
{
    /// <summary>
    /// Interface for Export Dialog Parser
    /// </summary>
    public interface IExportDialogParser
    {
        /// <summary>
        /// Sets the error collection
        /// </summary>
        /// <param name="errorCollection">Error Collection</param>
        void SetErrorCollection(ExportPlaceholderErrorCollection errorCollection);

        /// <summary>
        /// Parses a dialog for exporting
        /// </summary>
        /// <param name="dialog">Dialog to parse</param>
        /// <returns>Parsed dialog</returns>
        ExportDialogData ParseDialog(TaleDialog dialog);
    }
}