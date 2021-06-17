using GoNorth.Config;
using GoNorth.Models.TaleViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace GoNorth.Controllers
{
    /// <summary>
    /// Tale controller
    /// </summary>
    [Authorize(Roles = RoleNames.Tale)]
    [ApiExplorerSettings(IgnoreApi = true)]
    public class TaleController : Controller
    {
        /// <summary>
        /// Misc config
        /// </summary>
        private readonly MiscConfig _config;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public TaleController(IOptions<ConfigurationData> configuration)
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
            TaleIndexViewModel viewModel = new TaleIndexViewModel();
            viewModel.DisableAutoSaving = _config.DisableAutoSaving.HasValue ? _config.DisableAutoSaving.Value : false;
            return View(viewModel);
        }
    }
}
