using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace GoNorth.Models.DeploymentViewModels
{
    /// <summary>
    /// First Time Deployment view model
    /// </summary>
    public class FirstTimeDeploymentViewModel
    {
        /// <summary>
        /// First Time Deployment Password
        /// </summary>
        [Display(Name = "FirstTimeDeploymentPassword")]
        [Required(ErrorMessage = "FieldRequired")]
        [DataType(DataType.Password)]
        public string FirstTimeDeploymentPassword { get; set; }

        /// <summary>
        /// Name
        /// </summary>
        [Display(Name = "Name")]
        [Required(ErrorMessage = "FieldRequired")]
        public string Name { get; set; }

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
    }
}
