using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Models;

namespace GoNorth.Data.User
{
    /// <summary>
    /// Interface for User Preferences Database Access
    /// </summary>
    public interface IUserPreferencesDbAccess
    {
        /// <summary>
        /// Returns the user preferences for a user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>User Preferences</returns>
        Task<UserPreferences> GetUserPreferences(string userId);

        /// <summary>
        /// Sets the code editor theme for a user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <param name="theme">Theme to set for the user</param>
        /// <returns>Task</returns>
        Task SetUserCodeEditorTheme(string userId, string theme);

        /// <summary>
        /// Deletes the preferences for a user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>Task</returns>
        Task DeleteUserPreferences(string userId);
    }
}