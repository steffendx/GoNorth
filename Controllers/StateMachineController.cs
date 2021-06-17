using GoNorth.Config;
using GoNorth.Models.StateMachineViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace GoNorth.Controllers
{
    /// <summary>
    /// State Machine controller
    /// </summary>
    [Authorize(Roles = RoleNames.Kortisto)]
    [ApiExplorerSettings(IgnoreApi = true)]
    public class StateMachineController : Controller
    {
        /// <summary>
        /// Misc config
        /// </summary>
        private readonly MiscConfig _config;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public StateMachineController(IOptions<ConfigurationData> configuration)
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
            StateMachineIndexViewModel viewModel = new StateMachineIndexViewModel();
            viewModel.DisableAutoSaving = _config.DisableAutoSaving.HasValue ? _config.DisableAutoSaving.Value : false;
            return View(viewModel);
        }
    }
}
