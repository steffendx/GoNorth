using System.Threading.Tasks;
using GoNorth.Data.ProjectConfig;

namespace GoNorth.Services.ProjectConfig
{
    /// <summary>
    /// Class to provide project configs
    /// </summary>
    public class ProjectConfigProvider : IProjectConfigProvider
    {
        /// <summary>
        /// Default hours per day
        /// </summary>
        private const int DefaultHoursPerDay = 24;
        
        /// <summary>
        /// Default minutes per hour
        /// </summary>
        private const int DefaultMinutesPerHour = 60;


        /// <summary>
        /// Project Config Db Access
        /// </summary>
        private readonly IProjectConfigDbAccess _projectConfigDbAccess;

        /// <summary>
        /// Project Config provider
        /// </summary>
        /// <param name="projectConfigDbAccess">Project Config Db Access</param>
        public ProjectConfigProvider(IProjectConfigDbAccess projectConfigDbAccess)
        {
            _projectConfigDbAccess = projectConfigDbAccess;
        }

        /// <summary>
        /// Gets the miscellaneous config for a project
        /// </summary>
        /// <param name="projectId">Project id</param>
        /// <returns>Config</returns>
        public async Task<MiscProjectConfig> GetMiscConfig(string projectId)
        {
            MiscProjectConfig configEntry = await _projectConfigDbAccess.GetMiscConfig(projectId);
            if(configEntry != null)
            {
                return configEntry;
            }

            return GetDefaultMiscConfig(projectId);
        }

        /// <summary>
        /// Returns the default miscellaneous config
        /// </summary>
        /// <param name="projectId">Project id</param>
        /// <returns>Miscellaneous config</returns>
        private MiscProjectConfig GetDefaultMiscConfig(string projectId)
        {
            MiscProjectConfig projectConfig = new MiscProjectConfig();
            projectConfig.HoursPerDay = DefaultHoursPerDay;
            projectConfig.MinutesPerHour = DefaultMinutesPerHour;
            projectConfig.ProjectId = projectId;

            return projectConfig;
        }
    }
}