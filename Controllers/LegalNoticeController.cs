using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GoNorth.Config;
using Microsoft.Extensions.Options;
using GoNorth.Models.LegalNoticeModels;

namespace GoNorth.Controllers
{
    /// <summary>
    /// Legal Notice Controller
    /// </summary>
    [AllowAnonymous]
    [ApiExplorerSettings(IgnoreApi = true)]
    public class LegalNoticeController : Controller
    {
        /// <summary>
        /// Config Data
        /// </summary>
        private readonly ConfigurationData _configData;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public LegalNoticeController(IOptions<ConfigurationData> configuration)
        {
            _configData = configuration.Value;
        }

        /// <summary>
        /// Index view
        /// </summary>
        /// <returns>View</returns>
        public IActionResult Index()
        {
            if(!_configData.Misc.UseLegalNotice)
            {
                return NotFound();
            }

            IndexViewModel viewModel = new IndexViewModel();
            viewModel.ContactPerson = _configData.LegalNotice.ContactPerson;
            viewModel.ContactStreet = _configData.LegalNotice.ContactStreet;
            viewModel.ContactCity = _configData.LegalNotice.ContactCity;
            viewModel.RepresentedByPerson = _configData.LegalNotice.RepresentedByPerson;
            viewModel.ContactEmail = _configData.LegalNotice.ContactEmail;
            return View(viewModel);
        }
    }
}
