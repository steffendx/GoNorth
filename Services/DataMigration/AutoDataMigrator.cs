using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Authentication;
using GoNorth.Data;
using GoNorth.Data.User;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace GoNorth.Services.DataMigration
{
    /// <summary>
    /// Class for a Data Migrator that will automatically update existing data
    /// </summary>
    public class AutoDataMigrator : IDataMigrator
    {
        /// <summary>
        /// Database setup
        /// </summary>
        private readonly IDbSetup _dbSetup;

        /// <summary>
        /// User Database access
        /// </summary>
        private readonly IUserDbAccess _userDbAccess;

        /// <summary>
        /// Logger
        /// </summary>
        private readonly ILogger _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="dbSetup">Database setup</param>
        /// <param name="userDbAccess">User database access</param>
        /// <param name="logger">Logger</param>
        public AutoDataMigrator(IDbSetup dbSetup, IUserDbAccess userDbAccess, ILogger<AutoDataMigrator> logger)
        {
            _dbSetup = dbSetup;
            _userDbAccess = userDbAccess;
            _logger = logger;
        }

        /// <summary>
        /// Checks for migratable data
        /// </summary>
        /// <returns>Task for the async task</returns>
        public async Task UpdateMigratableData()
        {
            try
            {
                await RemoveUnusedRolesForUsers();
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not remove old user roles");
            }

            try
            {
                await _dbSetup.CheckForNeededMigrations();
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not migrate database");
            }
        }

        /// <summary>
        /// Removes the unused roles for the users
        /// </summary>
        /// <returns>Task</returns>
        private async Task RemoveUnusedRolesForUsers()
        {
            List<string> existingRoles = RoleNames.GetAllRoleNames();
            IList<GoNorthUser> users = await _userDbAccess.GetUsers(0, int.MaxValue);
            foreach(GoNorthUser curUser in users)
            {
                IEnumerable<string> deletedRoles = curUser.Roles.Except(existingRoles);
                if(deletedRoles != null && deletedRoles.Any())
                {
                    GoNorthUser user = await _userDbAccess.GetUserById(curUser.Id);
                    user.Roles = curUser.Roles.Except(deletedRoles).ToList();
                    await _userDbAccess.UpdateUser(user);
                }
            }
        }
    }
}
