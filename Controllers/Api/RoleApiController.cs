using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GoNorth.Controllers.Api
{
    /// <summary>
    /// Role Api controller
    /// </summary>
    [ApiController]
    [Authorize(Roles = RoleNames.Administrator)]
    [Route("/api/[controller]/[action]")]
    public class RoleApiController : ControllerBase
    {
        /// <summary>
        /// Returns the available roles
        /// </summary>
        /// <returns>Available Roles</returns>
        [Produces(typeof(List<string>))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [HttpGet]
        public IActionResult AvailableRoles()
        {
            return Ok(RoleNames.GetAllRoleNames());
        }
    }
}