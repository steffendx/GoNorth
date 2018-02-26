using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GoNorth.Controllers
{
    /// <summary>
    /// Karta controller
    /// </summary>
    [Authorize(Roles = RoleNames.Karta)]
    public class KartaController : Controller
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
        /// Manage Maps view
        /// </summary>
        /// <returns>View</returns>
        [Authorize(Roles = RoleNames.KartaMapManager)]
        [HttpGet]
        public IActionResult ManageMaps()
        {
            return View();
        }
    }
}
