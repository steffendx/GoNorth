using System.Threading.Tasks;
using GoNorth.Data;
using GoNorth.Services.Karta;
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
        /// Karta Marker Label Sync
        /// </summary>
        public readonly IKartaMarkerLabelSync _KartaMarkerLabelSync;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="dbSetup">Database Setup</param>
        /// <param name="kartaMarkerLabelSync">Karta Marker Label Sync</param>
        public AdministrationController(IDbSetup dbSetup, IKartaMarkerLabelSync kartaMarkerLabelSync)
        {
            _DbSetup = dbSetup;
            _KartaMarkerLabelSync = kartaMarkerLabelSync;
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
            await _KartaMarkerLabelSync.SyncMarkerLabels();
            return View();
        }
    }
}
