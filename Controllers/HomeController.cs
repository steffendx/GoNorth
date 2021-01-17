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
using GoNorth.Services.Project;

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
        private IUserProjectAccess _projectUserAccess;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="projectUserAccess">Project User Access</param>
        public HomeController(IUserProjectAccess projectUserAccess)
        {
            _projectUserAccess = projectUserAccess;
        }

        /// <summary>
        /// Index view
        /// </summary>
        /// <returns>View</returns>
        public async Task<IActionResult> Index()
        {
            GoNorthProject defaultProject = await _projectUserAccess.GetUserProject();

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
