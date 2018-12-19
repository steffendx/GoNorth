using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
        /// Chapter Overview view
        /// </summary>
        /// <returns>View</returns>
        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }

        /// <summary>
        /// Detail view
        /// </summary>
        /// <returns>View</returns>
        [HttpGet]
        public IActionResult Detail()
        {
            return View();
        }

        /// <summary>
        /// Quest view
        /// </summary>
        /// <returns>View</returns>
        [HttpGet]
        public IActionResult Quest()
        {
            return View();
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
