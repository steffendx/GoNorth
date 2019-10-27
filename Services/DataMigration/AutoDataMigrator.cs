using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using GoNorth.Data;
using GoNorth.Data.User;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace GoNorth.Services.DataMigration
{
    /// <summary>
    /// Class for a Data Migrator that will automatically update existing data
    /// </summary>
    public class AutoDataMigrator : IHostedService
    {
        /// <summary>
        /// Service Scope Factory
        /// </summary>
        private readonly IServiceScopeFactory _serviceScopeFactory;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="serviceScopeFactory">Service Scope Factory</param>
        public AutoDataMigrator(IServiceScopeFactory serviceScopeFactory)
        {
            _serviceScopeFactory = serviceScopeFactory;
        }

        /// <summary>
        /// Checks for migratable data
        /// </summary>
        /// <param name="cancellationToken">Cancellation Token</param>
        /// <returns>Task for the async task</returns>
        public async Task StartAsync(CancellationToken cancellationToken)
        {
            using(IServiceScope serviceScope = _serviceScopeFactory.CreateScope())
            {
                IUserDbAccess userDbAccess = (IUserDbAccess)serviceScope.ServiceProvider.GetService(typeof(IUserDbAccess));
                IDbSetup dbSetup = (IDbSetup)serviceScope.ServiceProvider.GetService(typeof(IDbSetup));
                ILogger logger = (ILogger)serviceScope.ServiceProvider.GetService(typeof(ILogger<AutoDataMigrator>));

                try
                {
                    await RemoveUnusedRolesForUsers(userDbAccess);
                }
                catch(Exception ex)
                {
                    logger.LogError(ex, "Could not remove old user roles");
                }

                try
                {
                    await dbSetup.CheckForNeededMigrations();
                }
                catch(Exception ex)
                {
                    logger.LogError(ex, "Could not migrate database");
                }
            }
        }

        /// <summary>
        /// Removes the unused roles for the users
        /// </summary>
        /// <param name="userDbAccess">Usser Db Access</param>
        /// <returns>Task</returns>
        private async Task RemoveUnusedRolesForUsers(IUserDbAccess userDbAccess)
        {
            List<string> existingRoles = RoleNames.GetAllRoleNames();
            IList<GoNorthUser> users = await userDbAccess.GetUsers(0, int.MaxValue);
            foreach(GoNorthUser curUser in users)
            {
                IEnumerable<string> deletedRoles = curUser.Roles.Except(existingRoles);
                if(deletedRoles != null && deletedRoles.Any())
                {
                    GoNorthUser user = await userDbAccess.GetUserById(curUser.Id);
                    user.Roles = curUser.Roles.Except(deletedRoles).ToList();
                    await userDbAccess.UpdateUser(user);
                }
            }
        }


        /// <summary>
        /// Gets called on stop
        /// </summary>
        /// <param name="cancellationToken">Cancellation Token</param>
        /// <returns>Task</returns>
        public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }
}
