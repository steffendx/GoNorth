using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
        /// Index view
        /// </summary>
        /// <returns>View</returns>
        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }
    }
}
