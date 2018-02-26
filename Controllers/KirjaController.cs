using GoNorth.Config;
using GoNorth.Models.KirjaViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace GoNorth.Controllers
{
    /// <summary>
    /// Kirja controller
    /// </summary>
    [Authorize(Roles = RoleNames.Kirja)]
    public class KirjaController : Controller
    {
        /// <summary>
        /// Allowed Attachment Mime Types
        /// </summary>
        private readonly string _AllowedAttachmentMimeTypes;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public KirjaController(IOptions<ConfigurationData> configuration)
        {
            _AllowedAttachmentMimeTypes = configuration.Value.Misc.KirjaAllowedAttachmentMimeTypes;
        }

        /// <summary>
        /// Index view
        /// </summary>
        /// <returns>View</returns>
        [HttpGet]
        public IActionResult Index()
        {
            KirjaPageViewModel model = new KirjaPageViewModel();
            model.AllowedAttachmentMimeTypes = _AllowedAttachmentMimeTypes;
            return View(model);
        }

        /// <summary>
        /// Pages view
        /// </summary>
        /// <returns>View</returns>
        [HttpGet]
        public IActionResult Pages()
        {
            return View();
        }
    }
}
