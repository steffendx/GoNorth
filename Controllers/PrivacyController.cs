using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GoNorth.Config;
using Microsoft.Extensions.Options;

namespace GoNorth.Controllers
{
    /// <summary>
    /// Privacy Controller
    /// </summary>
    [AllowAnonymous]
    [ApiExplorerSettings(IgnoreApi = true)]
    public class PrivacyController : Controller
    {
        /// <summary>
        /// Config Data
        /// </summary>
        private readonly ConfigurationData _configData;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public PrivacyController(IOptions<ConfigurationData> configuration)
        {
            _configData = configuration.Value;
        }

        /// <summary>
        /// Index view
        /// </summary>
        /// <returns>View</returns>
        public IActionResult Index()
        {
            if(!_configData.Misc.UseGdpr)
            {
                return NotFound();
            }

            return View();
        }
    }
}
