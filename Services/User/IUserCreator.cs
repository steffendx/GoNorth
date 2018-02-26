using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace GoNorth.Services.User
{
    /// <summary>
    /// Interface for User Creator service
    /// </summary>
    public interface IUserCreator
    {
        /// <summary>
        /// Creates a new user
        /// </summary>
        /// <param name="url">Url Helper</param>
        /// <param name="requestScheme">Request Scheme</param>
        /// <param name="displayName">Displayname of the user</param>
        /// <param name="email">Email of the user</param>
        /// <param name="password">Password of the user</param>
        /// <param name="defaultRole">Default Role of the user</param>
        /// <returns>Identity Result</returns>
        Task<IdentityResult> CreateUser(IUrlHelper url, string requestScheme, string displayName, string email, string password, string defaultRole);
    }
}
