using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
