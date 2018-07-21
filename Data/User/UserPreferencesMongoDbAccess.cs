using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Config;
using GoNorth.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.User
{
    /// <summary>
    /// User Preferences Mongo DB Access
    /// </summary>
    public class UserPreferencesMongoDbAccess : BaseMongoDbAccess, IUserPreferencesDbAccess
    {
        /// <summary>
        /// Collection Name of the users preferences
        /// </summary>
        public const string UserPreferencesCollectionName = "UserPreference";

        /// <summary>
        /// User Preferences Collection
        /// </summary>
        private IMongoCollection<UserPreferences> _UserPreferencesCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public UserPreferencesMongoDbAccess(IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _UserPreferencesCollection = _Database.GetCollection<UserPreferences>(UserPreferencesCollectionName);
        }

        /// <summary>
        /// Returns the user preferences for a user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>User Preferences</returns>
        public async Task<UserPreferences> GetUserPreferences(string userId)
        {
            UserPreferences preferences = await _UserPreferencesCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if(preferences == null)
            {
                preferences = UserPreferences.CreateDefaultUserPreferences(userId);
            }

            return preferences;
        }

        /// <summary>
        /// Sets the code editor theme for a user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <param name="theme">Theme to set for the user</param>
        /// <returns>Task</returns>
        public async Task SetUserCodeEditorTheme(string userId, string theme)
        {
            await UpdateUserPreferences(userId, up => up.CodeEditorTheme = theme);
        }

        /// <summary>
        /// Deletes the preferences for a user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>Task</returns>
        public async Task DeleteUserPreferences(string userId)
        {
            await _UserPreferencesCollection.DeleteOneAsync(u => u.Id == userId);
        }


        /// <summary>
        /// Returns the user preferences for a user, ensuring a value is returned
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="valueUpdate">Value Update Function</param>
        /// <returns>Task</returns>
        private async Task UpdateUserPreferences(string userId, Action<UserPreferences> valueUpdate)
        {
            bool isNewEntry = false;
            UserPreferences preferences = await _UserPreferencesCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if(preferences == null)
            {
                preferences = UserPreferences.CreateDefaultUserPreferences(userId);
                isNewEntry = true;
            }

            valueUpdate(preferences);

            if(isNewEntry)
            {
                await _UserPreferencesCollection.InsertOneAsync(preferences);
            }
            else
            {
                await _UserPreferencesCollection.ReplaceOneAsync(u => u.Id == userId, preferences);
            }
        }

    }
}