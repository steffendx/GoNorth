using System.Threading.Tasks;
using GoNorth.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GoNorth.Controllers
{
    /// <summary>
    /// Administration controller
    /// </summary>
    [Authorize(Roles = RoleNames.Administrator)]
    [Route("[controller]/[action]")]
    public class AdministrationController : Controller
    {
        /// <summary>
        /// Database Setup
        /// </summary>
        public readonly IDbSetup _DbSetup;

        /// <summary>
        /// Constructor
        /// </summary>
        public AdministrationController(IDbSetup dbSetup)
        {
            _DbSetup = dbSetup;
        }

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
        /// Project view
        /// </summary>
        /// <returns>View</returns>
        [HttpGet]
        public IActionResult Project()
        {
            return View();
        }

        /// <summary>
        /// Config Encryption View
        /// </summary>
        /// <returns>Views</returns>
        [HttpGet]
        public IActionResult ConfigEncryption()
        {
            return View();
        }
        
        /// <summary>
        /// Db Setup view
        /// </summary>
        /// <returns>View</returns>
        [HttpGet]
        public async Task<IActionResult> DbSetup()
        {
            await _DbSetup.SetupDatabaseAsync();
            return View();
        }
    }
}
