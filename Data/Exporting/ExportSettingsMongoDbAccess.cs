using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Config;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.Exporting
{
    /// <summary>
    /// Export Settings Mongo DB Access
    /// </summary>
    public class ExportSettingsMongoDbAccess : BaseMongoDbAccess, IExportSettingsDbAccess
    {
        /// <summary>
        /// Collection Name of the export settings
        /// </summary>
        public const string ExportSettingsCollectionName = "ExportSettings";

        /// <summary>
        /// Settings Collection
        /// </summary>
        private IMongoCollection<ExportSettings> _SettingsCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public ExportSettingsMongoDbAccess(IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _SettingsCollection = _Database.GetCollection<ExportSettings>(ExportSettingsCollectionName);
        }


        /// <summary>
        /// Returns the export settings for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Export Settings</returns>
        public async Task<ExportSettings> GetExportSettings(string projectId)
        {
            ExportSettings settings = await _SettingsCollection.Find(s => s.ProjectId == projectId).FirstOrDefaultAsync();
            if(settings == null)
            {
                settings = ExportSettings.CreateDefaultExportSettings(projectId);
            }

            return settings;
        }

        /// <summary>
        /// Saves the export settings
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Task</returns>
        public async Task SaveExportSettings(string projectId, ExportSettings exportSettings)
        {
            bool isNew = true;
            ExportSettings settings = await _SettingsCollection.Find(s => s.ProjectId == projectId).FirstOrDefaultAsync();
            if(settings != null)
            {
                exportSettings.Id = settings.Id;
                isNew = false;
            }
            else
            {
                exportSettings.Id = Guid.NewGuid().ToString();
            }

            if(isNew)
            {
                await _SettingsCollection.InsertOneAsync(exportSettings);
            }
            else
            {
                await _SettingsCollection.ReplaceOneAsync(s => s.Id == exportSettings.Id, exportSettings);
            }
        }

    }
}