using System.Threading.Tasks;
using GoNorth.Data.User;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace GoNorth.Services.User
{
    /// <summary>
    /// Interface for User Deleter service
    /// </summary>
    public interface IUserDeleter
    {
        /// <summary>
        /// Deletes a user and all associated data
        /// </summary>
        /// <param name="user">User</param>
        /// <returns>Deletion result</returns>
        Task<IdentityResult> DeleteUser(GoNorthUser user);
    }
}
