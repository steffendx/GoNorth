using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using GoNorth.Data;
using GoNorth.Data.User;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace GoNorth.Extensions
{
    /// <summary>
    /// Extension class for Api controllers that set modified date objects
    /// </summary>
    public static class ModifiedDataApiControllerExtensions
    {
        /// <summary>
        /// Sets the modified data
        /// </summary>
        /// <param name="controller">Controller that contains the Request to validate</param>
        /// <param name="userManager">UserManager</param>
        /// <param name="modifiedDataObject">Object which modified data should be set</param>
        /// <returns>Task</returns>
        public static async Task SetModifiedData(this ControllerBase controller, UserManager<GoNorthUser> userManager, IHasModifiedData modifiedDataObject)
        {
            GoNorthUser currentUser = await userManager.GetUserAsync(controller.User);

            modifiedDataObject.ModifiedOn = DateTimeOffset.UtcNow;
            modifiedDataObject.ModifiedBy = currentUser.Id;
        }
    }
}