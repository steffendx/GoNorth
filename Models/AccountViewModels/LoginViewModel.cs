using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace GoNorth.Models.AccountViewModels
{
    /// <summary>
    /// Login View Model
    /// </summary>
    public class LoginViewModel
    {
        /// <summary>
        /// Email
        /// </summary>
        [Required(ErrorMessage = "FieldRequired")]
        [EmailAddress(ErrorMessage = "EmailFormat")]
        [Display(Name = "Email")]
        public string Email { get; set; }

        /// <summary>
        /// Password
        /// </summary>
        [Required(ErrorMessage = "FieldRequired")]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; }

        /// <summary>
        /// true if the user should be remembered, else false
        /// </summary>
        [Display(Name = "RememberMe")]
        public bool RememberMe { get; set; }
    }
}
