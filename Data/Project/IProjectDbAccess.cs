using System.Collections.Generic;
using System.Threading.Tasks;

namespace GoNorth.Data.Project
{
    /// <summary>
    /// Interface for Database Access for Projects
    /// </summary>
    public interface IProjectDbAccess
    {
        /// <summary>
        /// Creates a new project
        /// </summary>
        /// <param name="project">Project to create</param>
        /// <returns>Created project, with filled id</returns>
        Task<GoNorthProject> CreateProject(GoNorthProject project);

        /// <summary>
        /// Gets a project by it Id
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Project</returns>
        Task<GoNorthProject> GetProjectById(string projectId);

        /// <summary>
        /// Returns all projects
        /// </summary>
        /// <returns>Projects</returns>
        Task<List<GoNorthProject>> GetProjects();

        /// <summary>
        /// Gets the default project
        /// </summary>
        /// <returns>Default project</returns>
        Task<GoNorthProject> GetDefaultProject();

        /// <summary>
        /// Updates a project
        /// </summary>
        /// <param name="project">Project</param>
        /// <returns>Task</returns>
        Task UpdateProject(GoNorthProject project);

        /// <summary>
        /// Deletes a project
        /// </summary>
        /// <param name="project">Project</param>
        /// <returns>Task</returns>
        Task DeleteProject(GoNorthProject project);
    }
}