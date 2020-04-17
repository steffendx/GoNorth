using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using GoNorth.Data.User;
using GoNorth.Services.Timeline;
using GoNorth.Services.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;

namespace GoNorth.Controllers.Api
{
    /// <summary>
    /// User Api controller
    /// </summary>
    [ApiController]
    [Authorize(Roles = RoleNames.Administrator)]
    [Route("/api/[controller]/[action]")]
    public class UserApiController : ControllerBase
    {
        /// <summary>
        /// Trimmed user for response
        /// </summary>
        public class TrimmedResponseUser
        {
            /// <summary>
            /// Id
            /// </summary>
            public string Id { get; set; }

            /// <summary>
            /// UserName
            /// </summary>
            public string UserName { get; set; }

            /// <summary>
            /// Email
            /// </summary>
            public string Email { get; set; }

            /// <summary>
            /// Display Name
            /// </summary>
            public string DisplayName { get; set; }

            /// <summary>
            /// true if the email of the user is confirmed, else false
            /// </summary>
            public bool IsEmailConfirmed { get; set; }

            /// <summary>
            /// Roles
            /// </summary>
            public IList<string> Roles { get; set; }
        }

        /// <summary>
        /// User Query Result
        /// </summary>
        public class UserQueryResult
        {
            /// <summary>
            /// true if there are more users to query, else false
            /// </summary>
            public bool HasMore { get; set; }

            /// <summary>
            /// Users
            /// </summary>
            public IList<TrimmedResponseUser> Users { get; set; }
        }

        /// <summary>
        /// User Create Request
        /// </summary>
        public class UserCreateRequest
        {
            /// <summary>
            /// Email
            /// </summary>
            public string Email { get; set; }

            /// <summary>
            /// Password
            /// </summary>
            public string Password { get; set; }

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
        /// User Creator
        /// </summary>
        private readonly IUserCreator _userCreator;

        /// <summary>
        /// User Deleter
        /// </summary>
        private readonly IUserDeleter _userDeleter;

        /// <summary>
        /// User Manager
        /// </summary>
        private readonly UserManager<GoNorthUser> _userManager;

        /// <summary>
        /// Timeline Service
        /// </summary>
        private readonly ITimelineService _timelineService;

        /// <summary>
        /// Logger
        /// </summary>
        private readonly ILogger _logger;

        /// <summary>
        /// Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="userDbAccess">User Db Access</param>
        /// <param name="userCreator">User Creator</param>
        /// <param name="userDeleter">User Deleter</param>
        /// <param name="userManager">User Manager</param>
        /// <param name="timelineService">Timeline Service</param>
        /// <param name="logger">Logger</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public UserApiController(IUserDbAccess userDbAccess, IUserCreator userCreator, IUserDeleter userDeleter, UserManager<GoNorthUser> userManager, ITimelineService timelineService, 
                                 ILogger<UserApiController> logger, IStringLocalizerFactory localizerFactory)
        {
            _userDbAccess = userDbAccess;
            _userCreator = userCreator;
            _userDeleter = userDeleter;
            _userManager = userManager;
            _timelineService = timelineService;
            _logger = logger;
            _localizer = localizerFactory.Create(typeof(UserApiController));
        }

        /// <summary>
        /// Returns the user Entries
        /// </summary>
        /// <param name="start">Start Index</param>
        /// <param name="pageSize">Page size</param>
        /// <returns>User Entries</returns>
        [ProducesResponseType(typeof(UserQueryResult), StatusCodes.Status200OK)]
        [HttpGet]
        public IActionResult Entries(int start, int pageSize)
        {
            Task<IList<GoNorthUser>> queryTask = _userDbAccess.GetUsers(start, pageSize);
            Task<int> countTask = _userDbAccess.GetUserCount();
            Task.WaitAll(queryTask, countTask);

            UserQueryResult queryResult = new UserQueryResult();
            queryResult.Users = queryTask.Result.Select(u => MapUserToResponse(u)).ToList();
            queryResult.HasMore = start + queryResult.Users.Count < countTask.Result;

            return Ok(queryResult);
        }

        /// <summary>
        /// Creates a user
        /// </summary>
        /// <param name="userRequest">User request data</param>
        /// <returns>Result</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CreateUser([FromBody]UserCreateRequest userRequest)
        {
            if(string.IsNullOrEmpty(userRequest.Email) || string.IsNullOrEmpty(userRequest.DisplayName) || string.IsNullOrEmpty(userRequest.Password))
            {
                return BadRequest();
            }

            GoNorthUser user = new GoNorthUser { UserName = userRequest.Email, Email = userRequest.Email, DisplayName = userRequest.DisplayName };

            IdentityResult result = await _userCreator.CreateUser(Url, Request.Scheme, userRequest.DisplayName, userRequest.Email, userRequest.Password, string.Empty);
            if (result.Succeeded)
            {
                _logger.LogInformation("User created a new account with password.");

                await _timelineService.AddTimelineEntry(TimelineEvent.NewUser, user.Email);

                return Ok(user.Email);
            }
            else
            {
                return ReturnErrorResultFromIdentityResult(result);
            }
        }

        /// <summary>
        /// Deletes a user
        /// </summary>
        /// <param name="id">Id of the user</param>
        /// <returns>Result Status Code</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [HttpDelete]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteUser(string id)
        {
            string currentUserId = _userManager.GetUserId(User);
            if(currentUserId == id)
            {
                return BadRequest(_localizer["YouCanNotDeleteYourself"].Value);
            }

            GoNorthUser user = await _userDbAccess.GetUserById(id);
            IdentityResult result = await _userDeleter.DeleteUser(user);

            if(result.Succeeded)
            {
                _logger.LogInformation("User was deleted.");

                await _timelineService.AddTimelineEntry(TimelineEvent.UserDeleted, user.Email);
                return Ok(id);
            }
            else
            {
                return ReturnErrorResultFromIdentityResult(result);
            }
        }

        /// <summary>
        /// Assigns or removes roles to/from a user
        /// </summary>
        /// <param name="id">User Id</param>
        /// <param name="roles">Roles to assign (all other roles will be removed)</param>
        /// <returns>Result Status Code</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> SetUserRoles(string id, [FromBody]List<string> roles)
        {
            GoNorthUser user = await _userDbAccess.GetUserById(id);
            List<string> rolesToRemove = user.Roles.Except(roles).ToList();
            IdentityResult result = await _userManager.RemoveFromRolesAsync(user, rolesToRemove);
            if(!result.Succeeded)
            {
                return ReturnErrorResultFromIdentityResult(result);
            }

            List<string> rolesToAdd = roles.Except(user.Roles).ToList();
            result = await _userManager.AddToRolesAsync(user, rolesToAdd);
            if(!result.Succeeded)
            {
                return ReturnErrorResultFromIdentityResult(result);
            }

            _logger.LogInformation("User roles were set.");
            await _timelineService.AddTimelineEntry(TimelineEvent.UserRolesSet, user.Email, string.Join(", ", roles));

            return Ok(id);
        }

        /// <summary>
        /// Confirms the email for a user
        /// </summary>
        /// <param name="id">Id of the user</param>
        /// <returns>Result Status Code</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ConfirmEmailForUser(string id)
        {
            GoNorthUser user = await _userDbAccess.GetUserById(id);
            string code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            IdentityResult result = await _userManager.ConfirmEmailAsync(user, code);
            
            if(result.Succeeded)
            {
                _logger.LogInformation("User email was confirmed.");
                return Ok(id);
            }
            else
            {
                return ReturnErrorResultFromIdentityResult(result);
            }
        }

        /// <summary>
        /// Refreshes the security token for a user
        /// </summary>
        /// <param name="id">Id of the user</param>
        /// <returns>Result Status Code</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateSecurityStampForUser(string id)
        {
            GoNorthUser user = await _userDbAccess.GetUserById(id);
            IdentityResult result = await _userManager.UpdateSecurityStampAsync(user);
            
            if(result.Succeeded)
            {
                _logger.LogInformation("User security stamp was updated.");
                return Ok(id);
            }
            else
            {
                return ReturnErrorResultFromIdentityResult(result);
            }
        }

        /// <summary>
        /// Returns an internal server error from an identity result
        /// </summary>
        /// <param name="result">Identity result</param>
        /// <returns>Error result</returns>
        private IActionResult ReturnErrorResultFromIdentityResult(IdentityResult result) 
        {
            List<string> resultList = new List<string>();
            foreach (IdentityError error in result.Errors)
            {
                resultList.Add(error.Description);
            }
            return StatusCode((int)HttpStatusCode.InternalServerError, resultList);
        }

        /// <summary>
        /// Maps a user to a response user
        /// </summary>
        /// <param name="user">User to map</param>
        /// <returns>User Response</returns>
        private TrimmedResponseUser MapUserToResponse(GoNorthUser user)
        {
            return new TrimmedResponseUser
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                DisplayName = user.DisplayName,
                IsEmailConfirmed = user.EmailConfirmed,
                Roles = user.Roles
            };
        }
    }
}