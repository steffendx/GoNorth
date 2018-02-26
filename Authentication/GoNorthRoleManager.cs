using System.Collections.Generic;
using GoNorth.Data.Role;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace GoNorth.Authentication
{
    /// <summary>
    /// Go North Role Manager
    /// </summary>
    public class GoNorthRoleManager : RoleManager<GoNorthRole>
    {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="store">Role Store</param>
        /// <param name="roleValidators">Role Validators</param>
        /// <param name="keyNormalizer">Key Normalizer</param>
        /// <param name="errors">Errors</param>
        /// <param name="logger">Logger</param>
        public GoNorthRoleManager(IRoleStore<GoNorthRole> store, IEnumerable<IRoleValidator<GoNorthRole>> roleValidators, ILookupNormalizer keyNormalizer, IdentityErrorDescriber errors, ILogger<RoleManager<GoNorthRole>> logger) : base(store, roleValidators, keyNormalizer, errors, logger)
        {
        }
    }
}