using GoNorth.Config;
using GoNorth.Models.ProjectConfigViewModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace GoNorth.Controllers
{
    /// <summary>
    /// Project Config controller
    /// </summary>
    [Authorize(Roles = RoleNames.ProjectConfigManager)]
    [ApiExplorerSettings(IgnoreApi = true)]
    public class ProjectConfigController : Controller
    {
        /// <summary>
        /// Misc config
        /// </summary>
        private readonly MiscConfig _config;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public ProjectConfigController(IOptions<ConfigurationData> configuration)
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
            IndexViewModel viewModel = new IndexViewModel();
            viewModel.DisableItemInventory = _config.DisableItemInventory.HasValue ? _config.DisableItemInventory.Value : false;
            return View(viewModel);
        }
    }
}
