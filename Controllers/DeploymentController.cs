using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using GoNorth.Config;
using System.Net;
using GoNorth.Models.DeploymentViewModels;
using GoNorth.Data.User;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Identity;
using GoNorth.Services.User;

namespace GoNorth.Controllers
{
    /// <summary>
    /// Deployment Controller
    /// </summary>
    [AllowAnonymous]
    [ApiExplorerSettings(IgnoreApi = true)]
    public class DeploymentController : Controller
    {
        /// <summary>
        /// User DB Access
        /// </summary>
        private readonly IUserDbAccess _userDbAccess; 

        /// <summary>
        /// User Creator
        /// </summary>
        private readonly IUserCreator _userCreator;

        /// <summary>
        /// First Time Deployment Password
        /// </summary>
        private readonly string _firstTimeDeploymentPassword;

        /// <summary>
        /// Logger
        /// </summary>
        private readonly ILogger<DeploymentController> _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="userDbAccess">User Db Access</param>
        /// <param name="userCreator">User Creator</param>
        /// <param name="configuration">Configuration</param>
        /// <param name="logger">Logger</param>
        public DeploymentController(IUserDbAccess userDbAccess, IUserCreator userCreator, IOptions<ConfigurationData> configuration, ILogger<DeploymentController> logger)
        {
            _userDbAccess = userDbAccess;
            _userCreator = userCreator;
            _firstTimeDeploymentPassword = configuration.Value.Misc.FirstTimeDeploymentPassword;
            _logger = logger;
        }

        /// <summary>
        /// Index view
        /// </summary>
        /// <returns>View</returns>
        [HttpGet]
        public async Task<IActionResult> Index()
        {
            // Check Data
            bool displayPage = await DisplayPage();
            if(!displayPage)
            {
                _logger.LogWarning("User tried to access first time deployment page while not valid.");
                return StatusCode((int)HttpStatusCode.NotFound);
            }
            
            FirstTimeDeploymentViewModel viewModel = new FirstTimeDeploymentViewModel();
            return View(viewModel);
        }

        /// <summary>
        /// Creates the admin user if valid
        /// </summary>
        /// <param name="viewModel">View Model</param>
        /// <returns>View</returns>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Index(FirstTimeDeploymentViewModel viewModel)
        {
            // Check Data
            bool displayPage = await DisplayPage();
            if(!displayPage)
            {
                _logger.LogWarning("User tried to post to first time deployment page while not valid.");
                return StatusCode((int)HttpStatusCode.NotFound);
            }

            // Check Password
            if (ModelState.IsValid)
            {
                if(viewModel.FirstTimeDeploymentPassword != _firstTimeDeploymentPassword)
                {
                    // Dont give feedback to not help attackers
                    _logger.LogWarning("User tried to create new admin user in first time deployment page with wrong password.");
                    return RedirectToAction("Login", "Account");
                }

                try
                {
                    IdentityResult result = await _userCreator.CreateUser(Url, Request.Scheme, viewModel.Name, viewModel.Email, viewModel.Password, RoleNames.Administrator);
                    if(!result.Succeeded)
                    {
                        _logger.LogInformation("Error while creating user");
                    }
                }
                catch(Exception ex)
                {
                    _logger.LogError(ex, "Error while creating user");
                }

                return RedirectToAction("Login", "Account");
            }
            
            return View(viewModel);
        }

        /// <summary>
        /// Checks if the deployment page can be displayed
        /// </summary>
        /// <returns>true if the page can be displayed, else false</returns>
        private async Task<bool> DisplayPage()
        {
            if(string.IsNullOrEmpty(_firstTimeDeploymentPassword))
            {
                return false;
            }

            // Check if an Admin already exists
            try
            {
                bool adminUserExists = await _userDbAccess.DoesAdminUserExist();
                if(adminUserExists)
                {
                    return false;
                }
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Error while checking if first time deployment page should be displayed");
                return false;
            }

            return true;
        }
    }
}
