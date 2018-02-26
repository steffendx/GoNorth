using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using GoNorth.Models;
using Microsoft.AspNetCore.Authorization;
using GoNorth.Data.Project;
using GoNorth.Models.HomeViewModels;
using GoNorth.Models.ImplementationStatusViewModels;
using GoNorth.Data.Karta.Marker;

namespace GoNorth.Controllers
{
    /// <summary>
    /// Implementation Status Controller
    /// </summary>
    [Authorize(Roles = RoleNames.ImplementationStatusTracker)]
    public class ImplementationStatusController : Controller
    {
        /// <summary>
        /// Index view
        /// </summary>
        /// <returns>View</returns>
        [HttpGet]
        public IActionResult Index()
        {
            OverviewViewModel viewModel = new OverviewViewModel();
            viewModel.MarkerTypes = Enum.GetValues(typeof(MarkerType)).Cast<MarkerType>().Select(s => new MappedMarkerType {
                Value = (int)s,
                Name = s.ToString()
            }).ToList();
            return View(viewModel);
        }
    }
}
