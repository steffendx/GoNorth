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
    [ApiExplorerSettings(IgnoreApi = true)]
    public class KirjaController : Controller
    {
        /// <summary>
        /// Allowed Attachment Mime Types
        /// </summary>
        private readonly string _AllowedAttachmentMimeTypes;

        /// <summary>
        /// true if versioning is used
        /// </summary>
        private readonly bool _IsUsingVersioning;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public KirjaController(IOptions<ConfigurationData> configuration)
        {
            _AllowedAttachmentMimeTypes = configuration.Value.Misc.KirjaAllowedAttachmentMimeTypes;
            _IsUsingVersioning = configuration.Value.Misc.KirjaMaxVersionCount != 0;
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
            model.IsUsingVersioning = _IsUsingVersioning;
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
