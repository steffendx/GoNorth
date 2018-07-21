using System.Collections.Generic;
using System.Threading.Tasks;

namespace GoNorth.Data.Exporting
{
    /// <summary>
    /// Interface for Database Access for Export Settings
    /// </summary>
    public interface IExportSettingsDbAccess
    {
        /// <summary>
        /// Returns the export settings for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Export Settings</returns>
        Task<ExportSettings> GetExportSettings(string projectId);

        /// <summary>
        /// Saves the export settings
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Task</returns>
        Task SaveExportSettings(string projectId, ExportSettings exportSettings);
    }
}