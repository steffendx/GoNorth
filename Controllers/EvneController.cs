using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
            return View();
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
