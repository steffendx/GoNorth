using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace GoNorth.Data.User
{
    /// <summary>
    /// GoNorth User
    /// </summary>
    public class GoNorthUser : IdentityUser
    {
        /// <summary>
        /// Display name
        /// </summary>
        public string DisplayName { get; set; }

        /// <summary>
        /// Roles of user
        /// </summary>
        public IList<string> Roles { get; set; }


        /// <summary>
        /// Constructor
        /// </summary>
        public GoNorthUser()
        {
            Roles = new List<string>();
        }
    }
}
