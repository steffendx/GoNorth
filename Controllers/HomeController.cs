using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using GoNorth.Models;
using Microsoft.AspNetCore.Authorization;
using GoNorth.Data.Project;
using GoNorth.Models.HomeViewModels;

namespace GoNorth.Controllers
{
    /// <summary>
    /// Home Controller
    /// </summary>
    [Authorize]
    [ApiExplorerSettings(IgnoreApi = true)]
    public class HomeController : Controller
    {
        /// <summary>
        /// Project Db Access
        /// </summary>
        private IProjectDbAccess _projectDbAccess;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="projectDbAccess">Project Db Access</param>
        public HomeController(IProjectDbAccess projectDbAccess)
        {
            _projectDbAccess = projectDbAccess;
        }

        /// <summary>
        /// Index view
        /// </summary>
        /// <returns>View</returns>
        public async Task<IActionResult> Index()
        {
            GoNorthProject defaultProject = await _projectDbAccess.GetDefaultProject();

            IndexViewModel viewModel = new IndexViewModel();
            viewModel.ProjectName = defaultProject != null ? defaultProject.Name : "";

            return View(viewModel);
        }

        /// <summary>
        /// Error view
        /// </summary>
        /// <returns>View</returns>
        [AllowAnonymous]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
