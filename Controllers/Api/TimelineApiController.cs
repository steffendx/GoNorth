using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Services.Timeline;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GoNorth.Controllers.Api
{
    /// <summary>
    /// Timeline controller
    /// </summary>
    [Authorize]
    [Route("/api/[controller]/[action]")]
    public class TimelineApiController : Controller
    {
        /// <summary>
        /// Timeline Service
        /// </summary>
        private ITimelineService _timelineService;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="timelineService">Timeline Service</param>
        public TimelineApiController(ITimelineService timelineService)
        {
            _timelineService = timelineService;
        }

        /// <summary>
        /// Returns the time line Entries
        /// </summary>
        /// <returns>Timeline Entries</returns>
        [Produces(typeof(TimelineEntriesQueryResult))]
        [HttpGet]
        public async Task<IActionResult> Entries(int start, int pageSize)
        {
            TimelineEntriesQueryResult queryResult = await _timelineService.GetTimelineEntriesPaged(start, pageSize);

            return Ok(queryResult);
        }
    }
}