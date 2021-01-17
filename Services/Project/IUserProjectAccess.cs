using System.Threading.Tasks;
using GoNorth.Data.Project;

namespace GoNorth.Services.Project
{
    /// <summary>
    /// Interface for project access
    /// </summary>
    public interface IUserProjectAccess
    {
        /// <summary>
        /// Returns the current user project
        /// </summary>
        /// <returns>Current user project</returns>
        Task<GoNorthProject> GetUserProject();
    }
}