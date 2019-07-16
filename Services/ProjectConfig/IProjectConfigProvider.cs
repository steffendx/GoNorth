using System.Threading.Tasks;
using GoNorth.Data.ProjectConfig;

namespace GoNorth.Services.ProjectConfig
{
    /// <summary>
    /// Interface for project config provider
    /// </summary>
    public interface IProjectConfigProvider
    {
        /// <summary>
        /// Gets the miscellaneous config for a project
        /// </summary>
        /// <param name="projectId">Project id</param>
        /// <returns>Config</returns>
        Task<MiscProjectConfig> GetMiscConfig(string projectId);
    }
}