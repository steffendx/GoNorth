using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace GoNorth.Models.ManageViewModels
{
    /// <summary>
    /// Change password view model
    /// </summary>
    public class ChangePasswordViewModel
    {
        /// <summary>
        /// Old password
        /// </summary>
        [Required(ErrorMessage = "FieldRequired")]
        [DataType(DataType.Password)]
        [Display(Name = "CurrentPassword")]
        public string OldPassword { get; set; }

        /// <summary>
        /// New password
        /// </summary>
        [Required(ErrorMessage = "FieldRequired")]
        [StringLength(100, ErrorMessage = "PasswordLength", MinimumLength = Constants.MinPasswordLength)]
        [DataType(DataType.Password)]
        [Display(Name = "NewPassword")]
        public string NewPassword { get; set; }

        /// <summary>
        /// Confirm password
        /// </summary>
        [DataType(DataType.Password)]
        [Display(Name = "ConfirmNewPassword")]
        [Compare("NewPassword", ErrorMessage = "PasswordsDoNotMatch")]
        public string ConfirmPassword { get; set; }

        /// <summary>
        /// Status message
        /// </summary>
        public string StatusMessage { get; set; }
    }
}
