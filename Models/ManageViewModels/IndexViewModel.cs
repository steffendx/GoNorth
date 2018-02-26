using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace GoNorth.Models.ManageViewModels
{
    /// <summary>
    /// Index view model
    /// </summary>
    public class IndexViewModel
    {
        /// <summary>
        /// Username
        /// </summary>
        [Display(Name = "Username")]
        public string Username { get; set; }

        /// <summary>
        /// true if the email is confirmed, else false
        /// </summary>
        public bool IsEmailConfirmed { get; set; }

        /// <summary>
        /// Email
        /// </summary>
        [Required(ErrorMessage = "FieldRequired")]
        [EmailAddress(ErrorMessage = "EmailFormat")]
        [Display(Name = "Email")]
        public string Email { get; set; }

        /// <summary>
        /// Phone number
        /// </summary>
        [Required(ErrorMessage = "FieldRequired")]
        [Display(Name = "Name")]
        public string DisplayName { get; set; }

        /// <summary>
        /// Status message
        /// </summary>
        public string StatusMessage { get; set; }
    }
}
