using System.Threading.Tasks;
using GoNorth.Data;
using GoNorth.Services.Karta;
using GoNorth.Services.TaskManagement;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GoNorth.Controllers
{
    /// <summary>
    /// Administration controller
    /// </summary>
    [Authorize(Roles = RoleNames.Administrator)]
    [Route("[controller]/[action]")]
    [ApiExplorerSettings(IgnoreApi = true)]
    public class AdministrationController : Controller
    {
        /// <summary>
        /// Database Setup
        /// </summary>
        private readonly IDbSetup _DbSetup;

        /// <summary>
        /// Karta Marker Label Sync
        /// </summary>
        private readonly IKartaMarkerLabelSync _KartaMarkerLabelSync;

        /// <summary>
        /// Task number fill
        /// </summary>
        private readonly ITaskNumberFill _TaskNumberFill;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="dbSetup">Database Setup</param>
        /// <param name="kartaMarkerLabelSync">Karta Marker Label Sync</param>
        /// <param name="taskNumberFill">Task Number fill</param>
        public AdministrationController(IDbSetup dbSetup, IKartaMarkerLabelSync kartaMarkerLabelSync, ITaskNumberFill taskNumberFill)
        {
            _DbSetup = dbSetup;
            _KartaMarkerLabelSync = kartaMarkerLabelSync;
            _TaskNumberFill = taskNumberFill;
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
            await _TaskNumberFill.FillTasks();
            return View();
        }
    }
}
