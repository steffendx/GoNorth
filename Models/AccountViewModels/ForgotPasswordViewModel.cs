using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace GoNorth.Models.AccountViewModels
{
    /// <summary>
    /// Forgot password view model
    /// </summary>
    public class ForgotPasswordViewModel
    {
        /// <summary>
        /// Email
        /// </summary>
        [Required(ErrorMessage = "FieldRequired")]
        [EmailAddress(ErrorMessage = "EmailFormat")]
        [Display(Name = "Email")]
        public string Email { get; set; }
    }
}
