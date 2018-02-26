using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace GoNorth.Models.AccountViewModels
{
    /// <summary>
    /// Reset password view model
    /// </summary>
    public class ResetPasswordViewModel
    {
        /// <summary>
        /// Email
        /// </summary>
        [Display(Name = "Email")]
        [Required(ErrorMessage = "FieldRequired")]
        [EmailAddress(ErrorMessage = "EmailFormat")]
        public string Email { get; set; }

        /// <summary>
        /// Password
        /// </summary>
        [Display(Name = "Password")]
        [Required(ErrorMessage = "FieldRequired")]
        [StringLength(100, ErrorMessage = "PasswordLength", MinimumLength = Constants.MinPasswordLength)]
        [DataType(DataType.Password)]
        public string Password { get; set; }

        /// <summary>
        /// Confirm password
        /// </summary>
        [DataType(DataType.Password)]
        [Display(Name = "ConfirmPassword")]
        [Compare("Password", ErrorMessage = "PasswordsDoNotMatch")]
        public string ConfirmPassword { get; set; }

        /// <summary>
        /// Reset password code
        /// </summary>
        public string Code { get; set; }
    }
}
