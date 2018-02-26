using System;
using System.Threading;
using System.Threading.Tasks;
using GoNorth.Data.Role;
using Microsoft.AspNetCore.Identity;

namespace GoNorth.Authentication
{
    /// <summary>
    /// Go North Role store
    /// </summary>
    public class GoNorthRoleStore : IRoleStore<GoNorthRole>
    {
        /// <summary>
        /// Role DB Access
        /// </summary>
        private IRoleDbAccess _RoleDbAccess;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="roleDbAccess">Role Database Access</param>
        public GoNorthRoleStore(IRoleDbAccess roleDbAccess)
        {
            _RoleDbAccess = roleDbAccess;
        }

        /// <summary>
        /// Disposes the store
        /// </summary>
        public void Dispose()
        {
        }

        /// <summary>
        /// Creates a role
        /// </summary>
        /// <param name="role">Role</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Result</returns>
        public async Task<IdentityResult> CreateAsync(GoNorthRole role, CancellationToken cancellationToken)
        {
            await _RoleDbAccess.CreateRole(role);

            return IdentityResult.Success;
        }
        
        /// <summary>
        /// Deletes a role
        /// </summary>
        /// <param name="role">Role</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Result</returns>
        public async Task<IdentityResult> DeleteAsync(GoNorthRole role, CancellationToken cancellationToken)
        {
            await _RoleDbAccess.DeleteRole(role);
            return IdentityResult.Success;
        }

        /// <summary>
        /// Finds a role by its Id
        /// </summary>
        /// <param name="roleId">Role Id</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Role</returns>
        public async Task<GoNorthRole> FindByIdAsync(string roleId, CancellationToken cancellationToken)
        {
            GoNorthRole role = await _RoleDbAccess.GetRoleById(roleId);
            return role;
        }

        /// <summary>
        /// Finds a role by its name
        /// </summary>
        /// <param name="normalizedRoleName">Normalized Role name</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Role</returns>
        public async Task<GoNorthRole> FindByNameAsync(string normalizedRoleName, CancellationToken cancellationToken)
        {
            GoNorthRole role = await _RoleDbAccess.GetRoleByNormalizedName(normalizedRoleName);
            return role;
        }

        /// <summary>
        /// Returns the normalized name of a role
        /// </summary>
        /// <param name="role">Role</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Normalized role</returns>
        public Task<string> GetNormalizedRoleNameAsync(GoNorthRole role, CancellationToken cancellationToken)
        {
            return Task.FromResult(role.NormalizedName);
        }

        /// <summary>
        /// Returns the id of a role
        /// </summary>
        /// <param name="role">Role</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Role Id</returns>
        public Task<string> GetRoleIdAsync(GoNorthRole role, CancellationToken cancellationToken)
        {
            return Task.FromResult(role.Id);
        }

        /// <summary>
        /// Returns the name of a role
        /// </summary>
        /// <param name="role">Role</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Name of the role</returns>
        public Task<string> GetRoleNameAsync(GoNorthRole role, CancellationToken cancellationToken)
        {
            return Task.FromResult(role.Name);
        }

        /// <summary>
        /// Sets the normalized role name of a role
        /// </summary>
        /// <param name="role">Role</param>
        /// <param name="normalizedName">Normalized role name</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Task</returns>
        public Task SetNormalizedRoleNameAsync(GoNorthRole role, string normalizedName, CancellationToken cancellationToken)
        {
            role.NormalizedName = normalizedName;
            return Task.CompletedTask;
        }

        /// <summary>
        /// Sets the name of a role
        /// </summary>
        /// <param name="role">Role</param>
        /// <param name="roleName">Name of the role</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Task</returns>
        public Task SetRoleNameAsync(GoNorthRole role, string roleName, CancellationToken cancellationToken)
        {
            role.Name = roleName;
            return Task.CompletedTask;
        }

        /// <summary>
        /// Updates a role
        /// </summary>
        /// <param name="role">Role</param>
        /// <param name="cancellationToken">Cancellation token</param>
        /// <returns>Result</returns>
        public async Task<IdentityResult> UpdateAsync(GoNorthRole role, CancellationToken cancellationToken)
        {
            await _RoleDbAccess.UpdateRole(role);
            return IdentityResult.Success;
        }
    }
}