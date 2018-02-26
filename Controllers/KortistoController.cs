using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GoNorth.Controllers
{
    /// <summary>
    /// Kortisto controller
    /// </summary>
    [Authorize(Roles = RoleNames.Kortisto)]
    public class KortistoController : Controller
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
        /// Npc view
        /// </summary>
        /// <returns>View</returns>
        [HttpGet]
        public IActionResult Npc()
        {
            return View();
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
