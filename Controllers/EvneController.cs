using GoNorth.Config;
using GoNorth.Models.FlexFieldDatabaseModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace GoNorth.Controllers
{
    /// <summary>
    /// Evne controller
    /// </summary>
    [Authorize(Roles = RoleNames.Evne)]
    [ApiExplorerSettings(IgnoreApi = true)]
    public class EvneController : Controller
    {
        /// <summary>
        /// Misc config
        /// </summary>
        private readonly MiscConfig _config;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public EvneController(IOptions<ConfigurationData> configuration)
        {
            _config = configuration.Value.Misc;
        }

        /// <summary>
        /// Index view
        /// </summary>
        /// <returns>View</returns>
        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }

        /// <summary>
        /// Skill view
        /// </summary>
        /// <returns>View</returns>
        [HttpGet]
        public IActionResult Skill()
        {
            DetailFormViewModel viewModel = new DetailFormViewModel();
            viewModel.DisableAutoSaving = _config.DisableAutoSaving.HasValue ? _config.DisableAutoSaving.Value : false;
            viewModel.AllowScriptSettingsForAllFieldTypes = _config.AllowScriptSettingsForAllFieldTypes.HasValue ? _config.AllowScriptSettingsForAllFieldTypes.Value : false;
            return View(viewModel);
        }

        /// <summary>
        /// Manage Templates view
        /// </summary>
        /// <returns>View</returns>
        [Authorize(Roles = RoleNames.EvneTemplateManager)]
        [HttpGet]
        public IActionResult ManageTemplates()
        {
            return View();
        }
    }
}
