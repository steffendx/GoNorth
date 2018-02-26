using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.LockService;
using GoNorth.Data.User;
using GoNorth.Services.Timeline;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace GoNorth.Controllers.Api
{
    /// <summary>
    /// Timeline controller
    /// </summary>
    [Authorize]
    [Route("/api/[controller]/[action]")]
    public class LockServiceApiController : Controller
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
        private const int LockTimespan = 2;

        /// <summary>
        /// User Manager
        /// </summary>
        private UserManager<GoNorthUser> _userManager;

        /// <summary>
        /// Lock Service Db Access
        /// </summary>
        private ILockServiceDbAccess _lockServiceDbAccess;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="userManager">User Manager</param>
        /// <param name="lockServiceDbAccess">Lock Service Db Access</param>
        public LockServiceApiController(UserManager<GoNorthUser> userManager, ILockServiceDbAccess lockServiceDbAccess)
        {
            _userManager = userManager;
            _lockServiceDbAccess = lockServiceDbAccess;
        }

        /// <summary>
        /// Acquires a lock for a resource
        /// </summary>
        /// <param name="category">Category of the lock</param>
        /// <param name="id">Id of the resource</param>
        /// <returns>Lock Result</returns>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> AcquireLock(string category, string id)
        {
            return await CheckLockInternal(category, id, true);
        }

        /// <summary>
        /// Returns the lock state for a resource
        /// </summary>
        /// <param name="category">Category of the lock</param>
        /// <param name="id">Id of the resource</param>
        /// <returns>Lock Result</returns>
        [HttpGet]
        public async Task<IActionResult> CheckLock(string category, string id)
        {
            return await CheckLockInternal(category, id, false);
        }

        /// <summary>
        /// Checks the lock state and locks if required
        /// </summary>
        /// <param name="category">Category of the lock</param>
        /// <param name="id">Id of the resource</param>
        /// <param name="lockIfFree">true if the resource should be locked if its free</param>
        /// <returns>Lock Response</returns>
        private async Task<IActionResult> CheckLockInternal(string category, string id, bool lockIfFree)
        {
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
    }
}