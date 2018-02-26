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
    /// User Mongo DB Access
    /// </summary>
    public class UserMongoDbAccess : BaseMongoDbAccess, IUserDbAccess
    {
        /// <summary>
        /// Collection Name of the users
        /// </summary>
        public const string UserCollectionName = "User";

        /// <summary>
        /// User Collection
        /// </summary>
        private IMongoCollection<GoNorthUser> _UserCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public UserMongoDbAccess(IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _UserCollection = _Database.GetCollection<GoNorthUser>(UserCollectionName);
        }

        /// <summary>
        /// Creates a new user
        /// </summary>
        /// <param name="user">User to create</param>
        /// <returns>Created user, with filled id</returns>
        public async Task<GoNorthUser> CreateUser(GoNorthUser user)
        {
            user.Id = Guid.NewGuid().ToString();
            await _UserCollection.InsertOneAsync(user);

            return user;
        }

        /// <summary>
        /// Gets a user by his Id
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>User</returns>
        public async Task<GoNorthUser> GetUserById(string userId)
        {
            GoNorthUser user = await _UserCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();
            return user;
        }

        /// <summary>
        /// Gets a user by his normalized email
        /// </summary>
        /// <param name="normalizedEmail">Normalized Email of the user</param>
        /// <returns>User</returns>
        public async Task<GoNorthUser> GetUserByNormalizedEmail(string normalizedEmail)
        {
            GoNorthUser user = await _UserCollection.Find(u => u.NormalizedEmail == normalizedEmail).FirstOrDefaultAsync();
            return user;
        }

        /// <summary>
        /// Gets a user by his normalized username
        /// </summary>
        /// <param name="normalizedUserName"></param>
        /// <returns>User</returns>
        public async Task<GoNorthUser> GetUserByNormalizedUserName(string normalizedUserName)
        {
            GoNorthUser user = await _UserCollection.Find(u => u.NormalizedUserName == normalizedUserName).FirstOrDefaultAsync();
            return user;
        }

        /// <summary>
        /// Returns true if an Admin User exists, else false
        /// </summary>
        /// <returns>true if Admin User exists, else false</returns>
        public async Task<bool> DoesAdminUserExist()
        {
            bool userExists = await _UserCollection.Find(u => u.Roles.Any(r => r == RoleNames.Administrator)).AnyAsync();
            return userExists;
        }

        /// <summary>
        /// Returns all users in a role
        /// </summary>
        /// <param name="roleName">Role Name</param>
        /// <returns>List of users</returns>
        public async Task<IList<GoNorthUser>> GetUsersInRole(string roleName)
        {
            IList<GoNorthUser> users = await _UserCollection.Find(u => u.Roles.Any(r => r == roleName)).ToListAsync();
            return users;
        }

        /// <summary>
        /// Returns a list of users
        /// </summary>
        /// <param name="start">Start Index</param>
        /// <param name="pageSize">Page size</param>
        /// <returns>List of users</returns>
        public async Task<IList<GoNorthUser>> GetUsers(int start, int pageSize)
        {
            List<GoNorthUser> users = await _UserCollection.AsQueryable().OrderBy(u => u.Email).Skip(start).Take(pageSize).ToListAsync();
            return users;
        }

        /// <summary>
        /// Returns the user count
        /// </summary>
        /// <returns>User Count</returns>
        public async Task<int> GetUserCount()
        {
            return await _UserCollection.AsQueryable().CountAsync();
        }

        /// <summary>
        /// Updates a user
        /// </summary>
        /// <param name="user">User</param>
        /// <returns>Task</returns>
        public async Task UpdateUser(GoNorthUser user)
        {
            ReplaceOneResult result = await _UserCollection.ReplaceOneAsync(u => u.Id == user.Id, user);
        }

        /// <summary>
        /// Updates the security stamp for a user
        /// </summary>
        /// <param name="user">User</param>
        /// <param name="stamp">Security Stamp</param>
        /// <returns>Task</returns>
        public async Task UpdateSecurityStamp(GoNorthUser user, string stamp)
        {
            await _UserCollection.UpdateOneAsync(Builders<GoNorthUser>.Filter.Eq(u => u.Id, user.Id), Builders<GoNorthUser>.Update.Set(u => u.SecurityStamp, stamp));
        }

        /// <summary>
        /// Deletes a user
        /// </summary>
        /// <param name="user">User</param>
        /// <returns>Task</returns>
        public async Task DeleteUser(GoNorthUser user)
        {
            DeleteResult result = await _UserCollection.DeleteOneAsync(u => u.Id == user.Id);
        }
    }
}