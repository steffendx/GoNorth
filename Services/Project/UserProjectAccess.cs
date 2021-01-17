using System.Threading.Tasks;
using GoNorth.Data.Project;
using GoNorth.Data.User;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;

namespace GoNorth.Services.Project
{
    /// <summary>
    /// Class for project access
    /// </summary>
    public class UserProjectAccess : IUserProjectAccess
    {
        /// <summary>
        /// Project Db Access
        /// </summary>
        private readonly IProjectDbAccess _projectDbAccess;

        /// <summary>
        /// User Manager
        /// </summary>
        private readonly UserManager<GoNorthUser> _userManager;

        /// <summary>
        /// Http Context accessor
        /// </summary>
        private readonly IHttpContextAccessor _httpContext;

        /// <summary>
        /// User project access
        /// </summary>
        /// <param name="projectDbAccess">Project Db Access</param>
        /// <param name="userManager">User Manager</param>
        /// <param name="httpContextAccessor">Http Context Accessor</param>
        public UserProjectAccess(IProjectDbAccess projectDbAccess, UserManager<GoNorthUser> userManager, IHttpContextAccessor httpContextAccessor)
        {
            _projectDbAccess = projectDbAccess;
            _userManager = userManager;
            _httpContext = httpContextAccessor;
        }

        /// <summary>
        /// Returns the current user project
        /// </summary>
        /// <returns>Current user project</returns>
        public async Task<GoNorthProject> GetUserProject()
        {
            string userId = _userManager.GetUserId(_httpContext.HttpContext.User);
            UserSelectedProject selectedProject = await _projectDbAccess.GetUserSelectedProject(userId);
            
            GoNorthProject project = null;
            if(selectedProject != null)
            {
                project = await _projectDbAccess.GetProjectById(selectedProject.ProjectId);
            }

            if(project == null)
            {
                project = await _projectDbAccess.GetDefaultProject();
            }

            return project;
        }
    }
}