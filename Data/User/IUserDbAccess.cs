using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Models;

namespace GoNorth.Data.User
{
    /// <summary>
    /// Interface for Database Access for user
    /// </summary>
    public interface IUserDbAccess
    {
        /// <summary>
        /// Creates a new user
        /// </summary>
        /// <param name="user">User to create</param>
        /// <returns>Created user, with filled id</returns>
        Task<GoNorthUser> CreateUser(GoNorthUser user);

        /// <summary>
        /// Gets a user by his Id
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>User</returns>
        Task<GoNorthUser> GetUserById(string userId);

        /// <summary>
        /// Gets a user by his email
        /// </summary>
        /// <param name="normalizedEmail">Normalized Email of the user</param>
        /// <returns>User</returns>
        Task<GoNorthUser> GetUserByNormalizedEmail(string normalizedEmail);

        /// <summary>
        /// Gets a user by his normalized username
        /// </summary>
        /// <param name="normalizedUserName">Normalized username</param>
        /// <returns>User</returns>
        Task<GoNorthUser> GetUserByNormalizedUserName(string normalizedUserName);

        /// <summary>
        /// Returns true if an Admin User exists, else false
        /// </summary>
        /// <returns>true if Admin User exists, else false</returns>
        Task<bool> DoesAdminUserExist();

        /// <summary>
        /// Returns all users in a role
        /// </summary>
        /// <param name="roleName">Role Name</param>
        /// <returns>List of users</returns>
        Task<IList<GoNorthUser>> GetUsersInRole(string roleName);

        /// <summary>
        /// Returns a list of users
        /// </summary>
        /// <param name="start">Start Index</param>
        /// <param name="pageSize">Page size</param>
        /// <returns>List of users</returns>
        Task<IList<GoNorthUser>> GetUsers(int start, int pageSize);

        /// <summary>
        /// Returns the user count
        /// </summary>
        /// <returns>User Count</returns>
        Task<int> GetUserCount();

        /// <summary>
        /// Updates a user
        /// </summary>
        /// <param name="user">User</param>
        /// <returns>Task</returns>
        Task UpdateUser(GoNorthUser user);

        /// <summary>
        /// Updates the security stamp for a user
        /// </summary>
        /// <param name="user">User</param>
        /// <param name="stamp">Security Stamp</param>
        /// <returns>Task</returns>
        Task UpdateSecurityStamp(GoNorthUser user, string stamp);

        /// <summary>
        /// Deletes a user
        /// </summary>
        /// <param name="user">User</param>
        /// <returns>Task</returns>
        Task DeleteUser(GoNorthUser user);

    }
}