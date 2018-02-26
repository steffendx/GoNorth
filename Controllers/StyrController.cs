using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GoNorth.Controllers
{
    /// <summary>
    /// Styr controller
    /// </summary>
    [Authorize(Roles = RoleNames.Styr)]
    public class StyrController : Controller
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
        /// Item view
        /// </summary>
        /// <returns>View</returns>
        [HttpGet]
        public IActionResult Item()
        {
            return View();
        }

        /// <summary>
        /// Manage Templates view
        /// </summary>
        /// <returns>View</returns>
        [Authorize(Roles = RoleNames.StyrTemplateManager)]
        [HttpGet]
        public IActionResult ManageTemplates()
        {
            return View();
        }
    }
}
