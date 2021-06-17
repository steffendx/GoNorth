using System.Threading.Tasks;
using GoNorth.Config;
using GoNorth.Data.Kirja;
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
        /// Review Db Access
        /// </summary>
        private readonly IKirjaPageReviewDbAccess _reviewDbAccess;

        /// <summary>
        /// Allowed Attachment Mime Types
        /// </summary>
        private readonly string _AllowedAttachmentMimeTypes;

        /// <summary>
        /// true if versioning is used
        /// </summary>
        private readonly bool _IsUsingVersioning;

        /// <summary>
        /// true if external sharing is disabled
        /// </summary>
        private readonly bool _DisableWikiExternalSharing;
        
        /// <summary>
        /// true if auto saving is disabled, else false
        /// </summary>
        private readonly bool _DisableAutoSaving;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="reviewDbAccess">Review Db Access</param>
        /// <param name="configuration">Configuration</param>
        public KirjaController(IKirjaPageReviewDbAccess reviewDbAccess, IOptions<ConfigurationData> configuration)
        {
            _reviewDbAccess = reviewDbAccess;
            _AllowedAttachmentMimeTypes = configuration.Value.Misc.KirjaAllowedAttachmentMimeTypes;
            _IsUsingVersioning = configuration.Value.Misc.KirjaMaxVersionCount != 0;
            _DisableWikiExternalSharing = configuration.Value.Misc.DisableWikiExternalSharing.HasValue ? configuration.Value.Misc.DisableWikiExternalSharing.Value : false;
            _DisableAutoSaving = configuration.Value.Misc.DisableAutoSaving.HasValue ? configuration.Value.Misc.DisableAutoSaving.Value : false;
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
            model.DisableAutoSaving = _DisableAutoSaving;
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
        
        /// <summary>
        /// Page review
        /// </summary>
        /// <returns>View</returns>
        [HttpGet]
        public IActionResult Review()
        {
            KirjaReviewViewModel model = new KirjaReviewViewModel();
            model.DisableWikiExternalSharing = _DisableWikiExternalSharing;
            model.DisableAutoSaving = _DisableAutoSaving;
            return View(model);
        }
        
        /// <summary>
        /// Page review
        /// </summary>
        /// <param name="id">Id of the page</param>
        /// <param name="token">Access token</param>
        /// <returns>View</returns>
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> ExternalReview(string id, string token)
        {
            if(_DisableWikiExternalSharing) 
            {
                return NotFound();
            }

            KirjaPageReview pageReview = await _reviewDbAccess.GetPageReviewById(id);
            if(pageReview == null || string.IsNullOrEmpty(pageReview.ExternalAccessToken) || pageReview.ExternalAccessToken != token)
            {
                return NotFound();
            }

            KirjaReviewViewModel model = new KirjaReviewViewModel();
            model.DisableWikiExternalSharing = _DisableWikiExternalSharing;
            return View("Review", model);
        }
    }
}
