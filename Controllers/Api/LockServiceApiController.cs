using System;
using System.Threading.Tasks;
using GoNorth.Config;
using GoNorth.Data.LockService;
using GoNorth.Data.Project;
using GoNorth.Data.User;
using GoNorth.Services.Project;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace GoNorth.Controllers.Api
{
    /// <summary>
    /// Timeline controller
    /// </summary>
    [ApiController]
    [Authorize]
    [Route("/api/[controller]/[action]")]
    public class LockServiceApiController : ControllerBase
    {
        /// <summary>
        /// Lock Response
        /// </summary>
        public class LockResponse
        {
            /// <summary>
            /// true if the user is locked by an other user
            /// </summary>
            public bool LockedByOtherUser { get; set; }

            /// <summary>
            /// Name of the user that has the resource locked if its someone else
            /// </summary>
            public string LockedByUserName { get; set; }

            /// <summary>
            /// Time valid for this lock
            /// </summary>
            public int LockValidForMinutes { get; set; }
        }

        /// <summary>
        /// Timespan for the lock
        /// </summary>
        private readonly int LockTimespan = 2;

        /// <summary>
        /// User Manager
        /// </summary>
        private readonly UserManager<GoNorthUser> _userManager;

        /// <summary>
        /// Lock Service Db Access
        /// </summary>
        private readonly ILockServiceDbAccess _lockServiceDbAccess;

        /// <summary>
        /// User project access
        /// </summary>
        private readonly IUserProjectAccess _userProjectAccess;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="userManager">User Manager</param>
        /// <param name="lockServiceDbAccess">Lock Service Db Access</param>
        /// <param name="userProjectAccess">User project access</param>
        /// <param name="configuration">Configuration data</param>
        public LockServiceApiController(UserManager<GoNorthUser> userManager, ILockServiceDbAccess lockServiceDbAccess, IUserProjectAccess userProjectAccess, IOptions<ConfigurationData> configuration)
        {
            _userManager = userManager;
            _lockServiceDbAccess = lockServiceDbAccess;
            _userProjectAccess = userProjectAccess;
            LockTimespan = configuration.Value.Misc.ResourceLockTimespan.HasValue ? configuration.Value.Misc.ResourceLockTimespan.Value : Constants.DefaultResourceLockTimespan;
        }

        /// <summary>
        /// Acquires a lock for a resource
        /// </summary>
        /// <param name="category">Category of the lock</param>
        /// <param name="id">Id of the resource</param>
        /// <param name="appendProjectIdToKey">True if the project id must be appended to the key</param>
        /// <returns>Lock Result</returns>
        [ProducesResponseType(typeof(LockResponse), StatusCodes.Status200OK)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> AcquireLock(string category, string id, bool appendProjectIdToKey = false)
        {
            return await CheckLockInternal(category, id, true, appendProjectIdToKey);
        }

        /// <summary>
        /// Returns the lock state for a resource
        /// </summary>
        /// <param name="category">Category of the lock</param>
        /// <param name="id">Id of the resource</param>
        /// <param name="appendProjectIdToKey">True if the project id must be appended to the key</param>
        /// <returns>Lock Result</returns>
        [ProducesResponseType(typeof(LockResponse), StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> CheckLock(string category, string id, bool appendProjectIdToKey = false)
        {
            return await CheckLockInternal(category, id, false, appendProjectIdToKey);
        }

        /// <summary>
        /// Checks the lock state and locks if required
        /// </summary>
        /// <param name="category">Category of the lock</param>
        /// <param name="id">Id of the resource</param>
        /// <param name="lockIfFree">true if the resource should be locked if its free</param>
        /// <param name="appendProjectIdToKey">True if the project id must be appended to the key</param>
        /// <returns>Lock Response</returns>
        private async Task<IActionResult> CheckLockInternal(string category, string id, bool lockIfFree, bool appendProjectIdToKey)
        {
            id = await AppendProjectIdIfRequired(id, appendProjectIdToKey);

            GoNorthUser currentUser = await _userManager.GetUserAsync(User);

            LockResponse response = new LockResponse();
            response.LockedByOtherUser = false;
            response.LockValidForMinutes = LockTimespan;

            LockEntry existingLock = await _lockServiceDbAccess.GetResourceLockEntry(category, id);
            if(existingLock != null)
            {
                if(existingLock.UserId != currentUser.Id && existingLock.ExpireDate > DateTimeOffset.UtcNow)
                {
                    GoNorthUser lockedByUser = await _userManager.FindByIdAsync(existingLock.UserId);
                    response.LockedByUserName = lockedByUser.DisplayName;
                    response.LockedByOtherUser = true;
                    return Ok(response);
                }
            }

            if(lockIfFree)
            {
                await _lockServiceDbAccess.LockResource(category, id, currentUser.Id, DateTimeOffset.UtcNow.AddMinutes(LockTimespan));
            }

            return Ok(response);
        }
        
        /// <summary>
        /// Deletes a lock for a resource
        /// </summary>
        /// <param name="category">Category of the lock</param>
        /// <param name="id">Id of the resource</param>
        /// <param name="appendProjectIdToKey">True if the project id must be appended to the key</param>
        /// <returns>Result</returns>
        [ProducesResponseType(StatusCodes.Status200OK)]
        [HttpPost]
        public async Task<IActionResult> DeleteLock(string category, string id, bool appendProjectIdToKey = false)
        {
            id = await AppendProjectIdIfRequired(id, appendProjectIdToKey);

            GoNorthUser currentUser = await _userManager.GetUserAsync(User);

            LockEntry existingLock = await _lockServiceDbAccess.GetResourceLockEntry(category, id);
            if (existingLock != null && existingLock.UserId == currentUser.Id)
            {
                await _lockServiceDbAccess.DeleteLockById(existingLock.Id);
            }

            return Ok();
        }

        /// <summary>
        /// Appends the project id to the lock id if required
        /// </summary>
        /// <param name="id">Id of the lock</param>
        /// <param name="appendProjectIdToKey">True if the project id musit be appended</param>
        /// <returns>Updated id</returns>
        private async Task<string> AppendProjectIdIfRequired(string id, bool appendProjectIdToKey)
        {
            if (appendProjectIdToKey)
            {
                GoNorthProject defaultProject = await _userProjectAccess.GetUserProject();
                id += "|" + defaultProject.Id;
            }

            return id;
        }
    }
}