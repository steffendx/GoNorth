using System.Linq;
using System.Security.Claims;

namespace GoNorth.Extensions
{
    /// <summary>
    /// Go North User Extensions
    /// </summary>
    public static class GoNorthUserPrincipalExtensions
    {
        /// <summary>
        /// Returns the display name for a user principal
        /// </summary>
        /// <param name="user">User</param>
        /// <returns>Display Name</returns>
        public static string DisplayName(this ClaimsPrincipal user)
        {
            if (user.Identity.IsAuthenticated)
            {
                return user.Claims.FirstOrDefault(v => v.Type == ClaimTypes.GivenName).Value;
            }

            return "";
        }
    }
}