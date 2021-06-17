using GoNorth.Config;
using GoNorth.Models.FlexFieldDatabaseModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace GoNorth.Controllers
{
    /// <summary>
    /// Kortisto controller
    /// </summary>
    [Authorize(Roles = RoleNames.Kortisto)]
    [ApiExplorerSettings(IgnoreApi = true)]
    public class KortistoController : Controller
    {
        /// <summary>
        /// Misc config
        /// </summary>
        private readonly MiscConfig _config;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public KortistoController(IOptions<ConfigurationData> configuration)
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
        /// Npc view
        /// </summary>
        /// <returns>View</returns>
        [HttpGet]
        public IActionResult Npc()
        {
            DetailFormViewModel viewModel = new DetailFormViewModel();
            viewModel.DisableAutoSaving = _config.DisableAutoSaving.HasValue ? _config.DisableAutoSaving.Value : false;
            return View(viewModel);
        }

        /// <summary>
        /// Manage Templates view
        /// </summary>
        /// <returns>View</returns>
        [Authorize(Roles = RoleNames.KortistoTemplateManager)]
        [HttpGet]
        public IActionResult ManageTemplates()
        {
            return View();
        }
    }
}
