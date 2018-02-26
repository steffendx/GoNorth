using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.User;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Localization;

namespace GoNorth.Authentication
{
    /// <summary>
    /// Validates the users
    /// </summary>
    public class GoNorthUserValidator : IUserValidator<GoNorthUser>
    {
        /// <summary>
        /// Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="localizerFactory">Localizer Factory</param>
        public GoNorthUserValidator(IStringLocalizerFactory localizerFactory)
        {
            _localizer = localizerFactory.Create(typeof(GoNorthIdentityErrorDescriber));
        }

        /// <summary>
        /// Validates a Users
        /// </summary>
        /// <param name="manager">User Manager</param>
        /// <param name="user">User</param>
        /// <returns>Result</returns>
        public Task<IdentityResult> ValidateAsync(UserManager<GoNorthUser> manager, GoNorthUser user)
        {
            if(string.IsNullOrEmpty(user.DisplayName))
            {
                return Task.FromResult(IdentityResult.Failed(new IdentityError {
                    Code = "UserRequiresDisplayName", Description = _localizer["UserRequiresDisplayName"]
                }));
            }

            return Task.FromResult(IdentityResult.Success);
        }
    }
}