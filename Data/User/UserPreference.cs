namespace GoNorth.Data.User
{
    /// <summary>
    /// User Preferences
    /// </summary>
    public class UserPreferences
    {
        /// <summary>
        /// User Id
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Code Editor Theme
        /// </summary>
        public string CodeEditorTheme { get; set; }


        /// <summary>
        /// Creates the default user preferences
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>User Preferences</returns>
        public static UserPreferences CreateDefaultUserPreferences(string userId)
        {
            UserPreferences preferences = new UserPreferences();
            preferences.Id = userId;
            preferences.CodeEditorTheme = "ace/theme/monokai";
            return preferences;
        }
    }
}
