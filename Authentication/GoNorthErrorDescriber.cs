using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Localization;

namespace GoNorth.Authentication
{
    /// <summary>
    /// Go North Identity Error Describer
    /// </summary>
    public class GoNorthIdentityErrorDescriber : IdentityErrorDescriber
    {
        /// <summary>
        /// Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="localizerFactory">Localizer Factory</param>
        public GoNorthIdentityErrorDescriber(IStringLocalizerFactory localizerFactory)
        {
            _localizer = localizerFactory.Create(typeof(GoNorthIdentityErrorDescriber));
        }

        /// <summary>
        /// Returns the default error
        /// </summary>
        /// <returns>Error</returns>
        public override IdentityError DefaultError() { return new IdentityError { Code = nameof(DefaultError), Description = _localizer["DefaultError"] }; }

        /// <summary>
        /// Returns the ConcurrencyFailure error
        /// </summary>
        /// <returns>Error</returns>
        public override IdentityError ConcurrencyFailure() { return new IdentityError { Code = nameof(ConcurrencyFailure), Description = _localizer["ConcurrencyFailure"] }; }

        /// <summary>
        /// Returns the PasswordMismatch error
        /// </summary>
        /// <returns>Error</returns>
        public override IdentityError PasswordMismatch() { return new IdentityError { Code = nameof(PasswordMismatch), Description = _localizer["PasswordMismatch"] }; }

        /// <summary>
        /// Returns the InvalidToken error
        /// </summary>
        /// <returns>Error</returns>
        public override IdentityError InvalidToken() { return new IdentityError { Code = nameof(InvalidToken), Description = _localizer["InvalidToken"] }; }

        /// <summary>
        /// Returns the LoginAlreadyAssociated error
        /// </summary>
        /// <returns>Error</returns>
        public override IdentityError LoginAlreadyAssociated() { return new IdentityError { Code = nameof(LoginAlreadyAssociated), Description = _localizer["LoginAlreadyAssociated"] }; }

        /// <summary>
        /// Returns the InvalidUserName error
        /// </summary>
        /// <param name="userName">UserName</param>
        /// <returns>Error</returns>
        public override IdentityError InvalidUserName(string userName) { return new IdentityError { Code = nameof(InvalidUserName), Description = _localizer["InvalidUserName", userName] }; }

        /// <summary>
        /// Returns the InvalidEmail error
        /// </summary>
        /// <returns>Error</returns>
        public override IdentityError InvalidEmail(string email) { return new IdentityError { Code = nameof(InvalidEmail), Description = _localizer["InvalidEmail", email] }; }

        /// <summary>
        /// Returns the DuplicateUserName error
        /// </summary>
        /// <returns>Error</returns>
        public override IdentityError DuplicateUserName(string userName) { return new IdentityError { Code = nameof(DuplicateUserName), Description = _localizer["DuplicateUserName", userName] }; }

        /// <summary>
        /// Returns the DuplicateEmail error
        /// </summary>
        /// <returns>Error</returns>
        public override IdentityError DuplicateEmail(string email) { return new IdentityError { Code = nameof(DuplicateEmail), Description = _localizer["DuplicateEmail", email]  }; }

        /// <summary>
        /// Returns the InvalidRoleName error
        /// </summary>
        /// <returns>Error</returns>
        public override IdentityError InvalidRoleName(string role) { return new IdentityError { Code = nameof(InvalidRoleName), Description = _localizer["InvalidRoleName", role]  }; }

        /// <summary>
        /// Returns the DuplicateRoleName error
        /// </summary>
        /// <returns>Error</returns>
        public override IdentityError DuplicateRoleName(string role) { return new IdentityError { Code = nameof(DuplicateRoleName), Description = _localizer["DuplicateRoleName", role]  }; }

        /// <summary>
        /// Returns the UserAlreadyHasPassword error
        /// </summary>
        /// <returns>Error</returns>
        public override IdentityError UserAlreadyHasPassword() { return new IdentityError { Code = nameof(UserAlreadyHasPassword), Description = _localizer["UserAlreadyHasPassword"] }; }

        /// <summary>
        /// Returns the UserLockoutNotEnabled error
        /// </summary>
        /// <returns>Error</returns>
        public override IdentityError UserLockoutNotEnabled() { return new IdentityError { Code = nameof(UserLockoutNotEnabled), Description = _localizer["UserLockoutNotEnabled"] }; }

        /// <summary>
        /// Returns the UserAlreadyInRole error
        /// </summary>
        /// <returns>Error</returns>
        public override IdentityError UserAlreadyInRole(string role) { return new IdentityError { Code = nameof(UserAlreadyInRole), Description = _localizer["UserAlreadyInRole", role] }; }

        /// <summary>
        /// Returns the UserNotInRole error
        /// </summary>
        /// <returns>Error</returns>
        public override IdentityError UserNotInRole(string role) { return new IdentityError { Code = nameof(UserNotInRole), Description = _localizer["UserNotInRole", role] }; }

        /// <summary>
        /// Returns the PasswordTooShort error
        /// </summary>
        /// <returns>Error</returns>
        public override IdentityError PasswordTooShort(int length) { return new IdentityError { Code = nameof(PasswordTooShort), Description = _localizer["PasswordTooShort", length] }; }

        /// <summary>
        /// Returns the PasswordRequiresNonAlphanumeric error
        /// </summary>
        /// <returns>Error</returns>
        public override IdentityError PasswordRequiresNonAlphanumeric() { return new IdentityError { Code = nameof(PasswordRequiresNonAlphanumeric), Description = _localizer["PasswordRequiresNonAlphanumeric"] }; }

        /// <summary>
        /// Returns the PasswordRequiresDigit error
        /// </summary>
        /// <returns>Error</returns>
        public override IdentityError PasswordRequiresDigit() { return new IdentityError { Code = nameof(PasswordRequiresDigit), Description = _localizer["PasswordRequiresDigit"] }; }

        /// <summary>
        /// Returns the PasswordRequiresLower error
        /// </summary>
        /// <returns>Error</returns>
        public override IdentityError PasswordRequiresLower() { return new IdentityError { Code = nameof(PasswordRequiresLower), Description = _localizer["PasswordRequiresLower"] }; }

        /// <summary>
        /// Returns the PasswordRequiresUpper error
        /// </summary>
        /// <returns>Error</returns>
        public override IdentityError PasswordRequiresUpper() { return new IdentityError { Code = nameof(PasswordRequiresUpper), Description = _localizer["PasswordRequiresUpper"] }; }
    }
}