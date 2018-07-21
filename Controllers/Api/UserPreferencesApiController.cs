using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace GoNorth.Controllers.Api
{
    /// <summary>
    /// User Preferences Api controller
    /// </summary>
    [Authorize]
    [Route("/api/[controller]/[action]")]
    public class UserPreferencesApiController : Controller
    {
        /// <summary>
        /// User Preferences Db Service
        /// </summary>
        private readonly IUserPreferencesDbAccess _userPreferencesDbAccess;

        /// <summary>
        /// User Manager
        /// </summary>
        private readonly UserManager<GoNorthUser> _userManager;

        /// <summary>
        /// Logger
        /// </summary>
        private readonly ILogger _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="userPreferencesDbAccess">User Preferences Db Access</param>
        /// <param name="userManager">User Manager</param>
        /// <param name="logger">Logger</param>
        public UserPreferencesApiController(IUserPreferencesDbAccess userPreferencesDbAccess, UserManager<GoNorthUser> userManager, ILogger<UtilApiController> logger)
        {
            _userPreferencesDbAccess = userPreferencesDbAccess;
            _userManager = userManager;
            _logger = logger;
        }

        /// <summary>
        /// Returns the User Preferences
        /// </summary>
        /// <returns>User Preferences</returns>
        [HttpGet]
        public async Task<IActionResult> GetUserPreferences()
        {
            GoNorthUser currentUser = await _userManager.GetUserAsync(this.User);
            UserPreferences userPreferences = await _userPreferencesDbAccess.GetUserPreferences(currentUser.Id);

            return Ok(userPreferences);
        }

        /// <summary>
        /// Saves the User Preferences
        /// </summary>
        /// <param name="preferences">Preferences to save</param>
        /// <returns>User Preferences</returns>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> SaveUserPreferences([FromBody]UserPreferences preferences)
        {
            GoNorthUser currentUser = await _userManager.GetUserAsync(this.User);
            await _userPreferencesDbAccess.SetUserCodeEditorTheme(currentUser.Id, preferences.CodeEditorTheme);

            return Ok();
        }

    }
}