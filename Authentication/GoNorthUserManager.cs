using System;
using System.Collections.Generic;
using GoNorth.Data.User;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace GoNorth.Authentication
{
    /// <summary>
    /// Go North User Manager
    /// </summary>
    public class GoNorthUserManager : UserManager<GoNorthUser>
    {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="store">User Store</param>
        /// <param name="optionsAccessor">Options Accessor</param>
        /// <param name="passwordHasher">Password hash</param>
        /// <param name="userValidators">User validators</param>
        /// <param name="passwordValidators">Password validators</param>
        /// <param name="keyNormalizer">Key noramlizer</param>
        /// <param name="errors">Errors</param>
        /// <param name="services">Services</param>
        /// <param name="logger">Logger</param>
        public GoNorthUserManager(IUserStore<GoNorthUser> store, IOptions<IdentityOptions> optionsAccessor, IPasswordHasher<GoNorthUser> passwordHasher, IEnumerable<IUserValidator<GoNorthUser>> userValidators, IEnumerable<IPasswordValidator<GoNorthUser>> passwordValidators, ILookupNormalizer keyNormalizer, IdentityErrorDescriber errors, IServiceProvider services, ILogger<UserManager<GoNorthUser>> logger) : base(store, optionsAccessor, passwordHasher, userValidators, passwordValidators, keyNormalizer, errors, services, logger)
        {
        }
    }
}