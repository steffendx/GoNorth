using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace GoNorth.Controllers.Api
{
    /// <summary>
    /// Util Api controller
    /// </summary>
    [Authorize]
    [Route("/api/[controller]/[action]")]
    public class UtilApiController : Controller
    {
        /// <summary>
        /// Trimmed user for response
        /// </summary>
        public class TrimmedUtilResponseUser
        {
            /// <summary>
            /// Id
            /// </summary>
            public string Id { get; set; }

            /// <summary>
            /// Display Name
            /// </summary>
            public string DisplayName { get; set; }
        }

        /// <summary>
        /// User Db Service
        /// </summary>
        private readonly IUserDbAccess _userDbAccess;

        /// <summary>
        /// Logger
        /// </summary>
        private readonly ILogger _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="userDbAccess">User Db Access</param>
        /// <param name="logger">Logger</param>
        public UtilApiController(IUserDbAccess userDbAccess, ILogger<UtilApiController> logger)
        {
            _userDbAccess = userDbAccess;
            _logger = logger;
        }

        /// <summary>
        /// Returns all users
        /// </summary>
        /// <returns>Users</returns>
        [Produces(typeof(IList<TrimmedUtilResponseUser>))]
        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            IList<GoNorthUser> users = await _userDbAccess.GetUsers(0, 10000);
            IList<TrimmedUtilResponseUser> userResponse = users.Select(u => new TrimmedUtilResponseUser {
                Id = u.Id,
                DisplayName = u.DisplayName
            }).ToList();
            return Ok(userResponse);
        }

    }
}