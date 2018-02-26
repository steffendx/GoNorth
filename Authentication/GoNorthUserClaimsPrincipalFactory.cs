using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using GoNorth.Data.Role;
using GoNorth.Data.User;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace GoNorth.Authentication
{
    /// <summary>
    /// Go North Role store
    /// </summary>
    public class GoNorthUserClaimsPrincipalFactory : UserClaimsPrincipalFactory<GoNorthUser, GoNorthRole>
    {

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="userManager">User Manager</param>
        /// <param name="roleManager">Role Manager</param>
        /// <param name="optionsAccessor">Options Accessor</param>
        public GoNorthUserClaimsPrincipalFactory(UserManager<GoNorthUser> userManager, RoleManager<GoNorthRole> roleManager, IOptions<IdentityOptions> optionsAccessor) : base(userManager, roleManager, optionsAccessor)
        {
        }

        /// <summary>
        /// Creates the claims for a user
        /// </summary>
        /// <param name="user">User</param>
        /// <returns>Claims Principal</returns>
        public async override Task<ClaimsPrincipal> CreateAsync(GoNorthUser user)
        {
            ClaimsPrincipal principal = await base.CreateAsync(user);
            
            ClaimsIdentity claimsIdentity = (ClaimsIdentity)principal.Identity;
            claimsIdentity.AddClaims(new[] {
                new Claim(ClaimTypes.GivenName, user.DisplayName)
            });
            claimsIdentity.AddClaims(user.Roles.Select(r => new Claim(ClaimTypes.Role, r)).ToArray());

            return principal;
        }
    }
}