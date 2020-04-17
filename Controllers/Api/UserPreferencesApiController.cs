using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Project;
using GoNorth.Data.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace GoNorth.Controllers.Api
{
    /// <summary>
    /// User Preferences Api controller
    /// </summary>
    [ApiController]
    [Authorize]
    [Route("/api/[controller]/[action]")]
    public class UserPreferencesApiController : ControllerBase
    {
        /// <summary>
        /// User Code Editor preferences
        /// </summary>
        public class UserCodeEditorPreferences
        {
            /// <summary>
            /// Code Editor Theme
            /// </summary>
            public string CodeEditorTheme { get; set; }

            /// <summary>
            /// Script Language
            /// </summary>
            public string ScriptLanguage { get; set; }
        };

        /// <summary>
        /// User Preferences Db Service
        /// </summary>
        private readonly IUserPreferencesDbAccess _userPreferencesDbAccess;

        /// <summary>
        /// Export Settings Db Access
        /// </summary>
        private readonly IExportSettingsDbAccess _exportSettingsDbAccess;
        
        /// <summary>
        /// Project Db Access
        /// </summary>
        private readonly IProjectDbAccess _projectDbAccess;

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
        /// <param name="exportSettingsDbAccess">Export settings Db Access</param>
        /// <param name="projectDbAccess">Project Db Access</param>
        /// <param name="userManager">User Manager</param>
        /// <param name="logger">Logger</param>
        public UserPreferencesApiController(IUserPreferencesDbAccess userPreferencesDbAccess, IExportSettingsDbAccess exportSettingsDbAccess, IProjectDbAccess projectDbAccess, UserManager<GoNorthUser> userManager, 
                                            ILogger<UtilApiController> logger)
        {
            _userPreferencesDbAccess = userPreferencesDbAccess;
            _exportSettingsDbAccess = exportSettingsDbAccess;
            _projectDbAccess = projectDbAccess;
            _userManager = userManager;
            _logger = logger;
        }

        /// <summary>
        /// Returns the User Preferences
        /// </summary>
        /// <returns>User Preferences</returns>
        [ProducesResponseType(typeof(UserPreferences), StatusCodes.Status200OK)]
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
        [ProducesResponseType(StatusCodes.Status200OK)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> SaveUserPreferences([FromBody]UserPreferences preferences)
        {
            GoNorthUser currentUser = await _userManager.GetUserAsync(this.User);
            await _userPreferencesDbAccess.SetUserCodeEditorTheme(currentUser.Id, preferences.CodeEditorTheme);

            return Ok();
        }


        /// <summary>
        /// Returns the code editor preferences
        /// </summary>
        /// <returns>Code editor Preferences</returns>
        [ProducesResponseType(typeof(UserCodeEditorPreferences), StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> GetCodeEditorPreferences()
        {
            GoNorthUser currentUser = await _userManager.GetUserAsync(this.User);
            UserPreferences userPreferences = await _userPreferencesDbAccess.GetUserPreferences(currentUser.Id);

            GoNorthProject defaultProject = await _projectDbAccess.GetDefaultProject();
            ExportSettings settings = await _exportSettingsDbAccess.GetExportSettings(defaultProject.Id);

            UserCodeEditorPreferences codeEditorPreferences = new UserCodeEditorPreferences();
            codeEditorPreferences.CodeEditorTheme = userPreferences.CodeEditorTheme;
            codeEditorPreferences.ScriptLanguage = settings.ScriptLanguage;

            return Ok(codeEditorPreferences);
        }

    }
}