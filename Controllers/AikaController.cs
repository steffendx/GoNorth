using GoNorth.Config;
using GoNorth.Models.AikaViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace GoNorth.Controllers
{
    /// <summary>
    /// Aika controller
    /// </summary>
    [Authorize(Roles = RoleNames.Aika)]
    [ApiExplorerSettings(IgnoreApi = true)]
    public class AikaController : Controller
    {
        /// <summary>
        /// Misc config
        /// </summary>
        private readonly MiscConfig _config;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public AikaController(IOptions<ConfigurationData> configuration)
        {
            _config = configuration.Value.Misc;
        }

        /// <summary>
        /// Chapter Overview view
        /// </summary>
        /// <returns>View</returns>
        [HttpGet]
        public IActionResult Index()
        {
            SharedAikaViewModel viewModel = new SharedAikaViewModel();
            viewModel.DisableAutoSaving = _config.DisableAutoSaving.HasValue ? _config.DisableAutoSaving.Value : false;
            return View(viewModel);
        }

        /// <summary>
        /// Detail view
        /// </summary>
        /// <returns>View</returns>
        [HttpGet]
        public IActionResult Detail()
        {
            SharedAikaViewModel viewModel = new SharedAikaViewModel();
            viewModel.DisableAutoSaving = _config.DisableAutoSaving.HasValue ? _config.DisableAutoSaving.Value : false;
            return View(viewModel);
        }

        /// <summary>
        /// Quest view
        /// </summary>
        /// <returns>View</returns>
        [HttpGet]
        public IActionResult Quest()
        {
            QuestViewModel viewModel = new QuestViewModel();
            viewModel.DisableAutoSaving = _config.DisableAutoSaving.HasValue ? _config.DisableAutoSaving.Value : false;
            viewModel.AllowScriptSettingsForAllFieldTypes = _config.AllowScriptSettingsForAllFieldTypes.HasValue ? _config.AllowScriptSettingsForAllFieldTypes.Value : false;
            return View(viewModel);
        }

        /// <summary>
        /// Quest List view
        /// </summary>
        /// <returns>View</returns>
        [HttpGet]
        public IActionResult QuestList()
        {
            return View();
        }
    }
}
