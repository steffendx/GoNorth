using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using GoNorth.Data.User;
using Microsoft.AspNetCore.Identity;

namespace GoNorth.Authentication
{
    /// <summary>
    /// Go North User Store
    /// </summary>
    public class GoNorthUserStore : IUserStore<GoNorthUser>, IUserPasswordStore<GoNorthUser>, IUserEmailStore<GoNorthUser>, IUserSecurityStampStore<GoNorthUser>, IUserRoleStore<GoNorthUser>
    {
        /// <summary>
        /// User DB Access
        /// </summary>
        private readonly IUserDbAccess _UserDbAccess;

        /// <summary>
        /// User Preferences Db Access
        /// </summary>
        private readonly IUserPreferencesDbAccess _UserPreferencesDbAccess;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="userDbAccess">User Database Access</param>
        /// <param name="userPreferencesDbAccess">User Preferences Database Access</param>
        public GoNorthUserStore(IUserDbAccess userDbAccess, IUserPreferencesDbAccess userPreferencesDbAccess)
        {
            _UserDbAccess = userDbAccess;
            _UserPreferencesDbAccess = userPreferencesDbAccess;
        }

        /// <summary>
        /// Disposes the store
        /// </summary>
        public void Dispose()
        {
            
        }

        /// <summary>
        /// Creates a user
        /// </summary>
        /// <param name="user">User to create</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Result</returns>
        public async Task<IdentityResult> CreateAsync(GoNorthUser user, CancellationToken cancellationToken)
        {
            await _UserDbAccess.CreateUser(user);

            return IdentityResult.Success;
        }

        /// <summary>
        /// Deletes a user
        /// </summary>
        /// <param name="user">User to delete</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Result</returns>
        public async Task<IdentityResult> DeleteAsync(GoNorthUser user, CancellationToken cancellationToken)
        {
            await _UserDbAccess.DeleteUser(user);
            await _UserPreferencesDbAccess.DeleteUserPreferences(user.Id);
            return IdentityResult.Success;
        }

        /// <summary>
        /// Finds a user by his email
        /// </summary>
        /// <param name="normalizedEmail">Normalized email</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>User</returns>
        public async Task<GoNorthUser> FindByEmailAsync(string normalizedEmail, CancellationToken cancellationToken)
        {
            GoNorthUser user = await _UserDbAccess.GetUserByNormalizedEmail(normalizedEmail);
            return user;
        }

        /// <summary>
        /// Finds a user by his id
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>User</returns>
        public async Task<GoNorthUser> FindByIdAsync(string userId, CancellationToken cancellationToken)
        {
            GoNorthUser user = await _UserDbAccess.GetUserById(userId);
            return user;
        }

        /// <summary>
        /// Finds a user by his username
        /// </summary>
        /// <param name="normalizedUserName">Normalized username</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>User</returns>
        public async Task<GoNorthUser> FindByNameAsync(string normalizedUserName, CancellationToken cancellationToken)
        {
            GoNorthUser user = await _UserDbAccess.GetUserByNormalizedUserName(normalizedUserName);
            return user;
        }

        /// <summary>
        /// Returns the email adresse of a user
        /// </summary>
        /// <param name="user">User</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Email</returns>
        public Task<string> GetEmailAsync(GoNorthUser user, CancellationToken cancellationToken)
        {
            return Task.FromResult(user.Email);
        }

        /// <summary>
        /// Returns if the email adresse of a user is confirmed
        /// </summary>
        /// <param name="user">User</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>true if email is confirmed, else false</returns>
        public Task<bool> GetEmailConfirmedAsync(GoNorthUser user, CancellationToken cancellationToken)
        {
            return Task.FromResult(user.EmailConfirmed);
        }

        /// <summary>
        /// Returns the normalized email of a user
        /// </summary>
        /// <param name="user">User</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Normalized emial of the user</returns>
        public Task<string> GetNormalizedEmailAsync(GoNorthUser user, CancellationToken cancellationToken)
        {
            return Task.FromResult(user.NormalizedEmail);
        }

        /// <summary>
        /// Returns the normalized username of a user
        /// </summary>
        /// <param name="user">User</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Normalized username</returns>
        public Task<string> GetNormalizedUserNameAsync(GoNorthUser user, CancellationToken cancellationToken)
        {
            return Task.FromResult(user.NormalizedUserName);
        }

        /// <summary>
        /// Returns the password hash of a user
        /// </summary>
        /// <param name="user">User</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Password hash</returns>
        public Task<string> GetPasswordHashAsync(GoNorthUser user, CancellationToken cancellationToken)
        {
            return Task.FromResult(user.PasswordHash);
        }

        /// <summary>
        /// Returns the user id of a user
        /// </summary>        
        /// <param name="user">User</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>User id</returns>
        public Task<string> GetUserIdAsync(GoNorthUser user, CancellationToken cancellationToken)
        {
            return Task.FromResult(user.Id);
        }

        /// <summary>
        /// Returns the username of a user
        /// </summary>
        /// <param name="user">User</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Username</returns>
        public Task<string> GetUserNameAsync(GoNorthUser user, CancellationToken cancellationToken)
        {
            return Task.FromResult(user.UserName);
        }

        /// <summary>
        /// Returns if a user has a password
        /// </summary>
        /// <param name="user">User</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>true if user has password, else false</returns>
        public Task<bool> HasPasswordAsync(GoNorthUser user, CancellationToken cancellationToken)
        {
            return Task.FromResult(!string.IsNullOrEmpty(user.PasswordHash));
        }

        /// <summary>
        /// Sets the email of a user
        /// </summary>
        /// <param name="user">User</param>
        /// <param name="email">Email</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Task</returns>
        public Task SetEmailAsync(GoNorthUser user, string email, CancellationToken cancellationToken)
        {
            user.Email = email;
            return Task.CompletedTask;
        }

        /// <summary>
        /// Sets the email of a user as confirmed
        /// </summary>
        /// <param name="user">User</param>
        /// <param name="confirmed">true to confirm the email, else false</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Task</returns>
        public Task SetEmailConfirmedAsync(GoNorthUser user, bool confirmed, CancellationToken cancellationToken)
        {
            user.EmailConfirmed = confirmed;
            return Task.CompletedTask;
        }

        /// <summary>
        /// Sets the normalized email of a user
        /// </summary>
        /// <param name="user">User</param>
        /// <param name="normalizedEmail">Normalized email of a user</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Task</returns>
        public Task SetNormalizedEmailAsync(GoNorthUser user, string normalizedEmail, CancellationToken cancellationToken)
        {
            user.NormalizedEmail = normalizedEmail;
            return Task.CompletedTask;
        }

        /// <summary>
        /// Sets the normalized user name
        /// </summary>
        /// <param name="user">User</param>
        /// <param name="normalizedName">Normalized username</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Task</returns>
        public Task SetNormalizedUserNameAsync(GoNorthUser user, string normalizedName, CancellationToken cancellationToken)
        {
            user.NormalizedUserName = normalizedName;
            return Task.CompletedTask;
        }

        /// <summary>
        /// Sets the password hash for a user
        /// </summary>
        /// <param name="user">User</param>
        /// <param name="passwordHash">Password hash</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Task</returns>
        public Task SetPasswordHashAsync(GoNorthUser user, string passwordHash, CancellationToken cancellationToken)
        {
            user.PasswordHash = passwordHash;
            return Task.CompletedTask;
        }

        /// <summary>
        /// Sets the user name for a user
        /// </summary>
        /// <param name="user">User</param>
        /// <param name="userName">Username</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Task</returns>
        public Task SetUserNameAsync(GoNorthUser user, string userName, CancellationToken cancellationToken)
        {
            user.UserName = userName;
            return Task.CompletedTask;
        }

        /// <summary>
        /// Updates a user
        /// </summary>
        /// <param name="user">User</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Result</returns>
        public async Task<IdentityResult> UpdateAsync(GoNorthUser user, CancellationToken cancellationToken)
        {
            await _UserDbAccess.UpdateUser(user);
            return IdentityResult.Success;
        }

        /// <summary>
        /// Sets the security stamp for a user
        /// </summary>
        /// <param name="user">User</param>
        /// <param name="stamp">Security stamp</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Task</returns>
        public async Task SetSecurityStampAsync(GoNorthUser user, string stamp, CancellationToken cancellationToken)
        {
            user.SecurityStamp = stamp;
            await _UserDbAccess.UpdateSecurityStamp(user, stamp);
        }

        /// <summary>
        /// Returns the security stamp for a user
        /// </summary>
        /// <param name="user">User</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Security token</returns>
        public async Task<string> GetSecurityStampAsync(GoNorthUser user, CancellationToken cancellationToken)
        {
            GoNorthUser userInDb = await _UserDbAccess.GetUserById(user.Id);
            return userInDb != null && userInDb.SecurityStamp != null ? userInDb.SecurityStamp : string.Empty;
        }        

        /// <summary>
        /// Adds a user to a role
        /// </summary>
        /// <param name="user">User</param>
        /// <param name="roleName">Rolename</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Task</returns>
        public async Task AddToRoleAsync(GoNorthUser user, string roleName, CancellationToken cancellationToken)
        {
            GoNorthUser completeUser = await _UserDbAccess.GetUserById(user.Id);
            string interalRoleName = RoleNames.GetRoleNameByNormalizedName(roleName);
            completeUser.Roles.Add(interalRoleName);
            user.Roles.Add(interalRoleName);
            await _UserDbAccess.UpdateUser(completeUser);
        }

        /// <summary>
        /// Removes a user from a role
        /// </summary>
        /// <param name="user">User</param>
        /// <param name="roleName">Rolename</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Task</returns>
        public async Task RemoveFromRoleAsync(GoNorthUser user, string roleName, CancellationToken cancellationToken)
        {
            GoNorthUser completeUser = await _UserDbAccess.GetUserById(user.Id);
            List<string> newRoles = completeUser.Roles.ToList();
            newRoles.RemoveAll(r => r.Equals(roleName, StringComparison.OrdinalIgnoreCase));
            completeUser.Roles = newRoles;
            user.Roles = newRoles;
            await _UserDbAccess.UpdateUser(completeUser);
        }

        /// <summary>
        /// Returns the roles of a user
        /// </summary>
        /// <param name="user">User</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>List of roles</returns>
        public Task<IList<string>> GetRolesAsync(GoNorthUser user, CancellationToken cancellationToken)
        {
            return Task.FromResult(user.Roles);
        }

        /// <summary>
        /// Checks if a user is in a role
        /// </summary>
        /// <param name="user">User</param>
        /// <param name="roleName">Role Name</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>true if user is in role, else false</returns>
        public Task<bool> IsInRoleAsync(GoNorthUser user, string roleName, CancellationToken cancellationToken)
        {
            return Task.FromResult(user.Roles.Any(r => r.Equals(roleName, StringComparison.OrdinalIgnoreCase)));
        }

        /// <summary>
        /// Returns all users in a role
        /// </summary>
        /// <param name="roleName">Rolename</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Users in role</returns>
        public async Task<IList<GoNorthUser>> GetUsersInRoleAsync(string roleName, CancellationToken cancellationToken)
        {
            IList<GoNorthUser> users = await _UserDbAccess.GetUsersInRole(roleName);
            return users;
        }
    }
}