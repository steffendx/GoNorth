using System.Threading.Tasks;
using GoNorth.Models;

namespace GoNorth.Data.Role
{
    /// <summary>
    /// Interface for Database Access for roles
    /// </summary>
    public interface IRoleDbAccess
    {
        /// <summary>
        /// Creates a role
        /// </summary>
        /// <param name="role">Role</param>
        /// <returns>Created role, filled with id</returns>
        Task<GoNorthRole> CreateRole(GoNorthRole role);

        /// <summary>
        /// Finds a role by id
        /// </summary>
        /// <param name="id">Role Id</param>
        /// <returns>Role</returns>
        Task<GoNorthRole> GetRoleById(string id);

        /// <summary>
        /// Finds a role by the normalized name
        /// </summary>
        /// <param name="normalizedName">Normalized role name</param>
        /// <returns>Role</returns>
        Task<GoNorthRole> GetRoleByNormalizedName(string normalizedName);

        /// <summary>
        /// Updates a role
        /// </summary>
        /// <param name="role">Role</param>
        /// <returns>Task</returns>
        Task UpdateRole(GoNorthRole role);

        /// <summary>
        /// Deletes a role
        /// </summary>
        /// <param name="role">Role</param>
        /// <returns>Task</returns>
        Task DeleteRole(GoNorthRole role);
    }
}