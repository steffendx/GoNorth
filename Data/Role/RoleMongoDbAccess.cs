using System.Threading.Tasks;
using GoNorth.Config;
using GoNorth.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace GoNorth.Data.Role
{
    /// <summary>
    /// Role Mongo DB Access
    /// </summary>
    public class RoleMongoDbAccess : BaseMongoDbAccess, IRoleDbAccess
    {
        /// <summary>
        /// Collection Name of the roles
        /// </summary>
        public const string RoleCollectionName = "Role";

        /// <summary>
        /// Role Collection
        /// </summary>
        private IMongoCollection<GoNorthRole> _RoleCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public RoleMongoDbAccess(IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _RoleCollection = _Database.GetCollection<GoNorthRole>(RoleCollectionName);
        }

        /// <summary>
        /// Creates a role
        /// </summary>
        /// <param name="role">Role</param>
        /// <returns>Created role, filled with id</returns>
        public async Task<GoNorthRole> CreateRole(GoNorthRole role)
        {
            role.Id = role.Name;
            await _RoleCollection.InsertOneAsync(role);

            return role;
        }

        /// <summary>
        /// Finds a role by id
        /// </summary>
        /// <param name="id">Role Id</param>
        /// <returns>Role</returns>
        public async Task<GoNorthRole> GetRoleById(string id)
        {
            GoNorthRole role = await _RoleCollection.Find(r => r.Id == id).FirstOrDefaultAsync();
            return role;
        }

        /// <summary>
        /// Finds a role by the normalized name
        /// </summary>
        /// <param name="normalizedName">Normalized role name</param>
        /// <returns>Role</returns>
        public async Task<GoNorthRole> GetRoleByNormalizedName(string normalizedName)
        {
            GoNorthRole role = await _RoleCollection.Find(r => r.NormalizedName == normalizedName).FirstOrDefaultAsync();
            return role;
        }

        /// <summary>
        /// Updates a role
        /// </summary>
        /// <param name="role">Role</param>
        /// <returns>Task</returns>
        public async Task UpdateRole(GoNorthRole role)
        {
            ReplaceOneResult result = await _RoleCollection.ReplaceOneAsync(r => r.Name == role.Name, role);
        }

        /// <summary>
        /// Deletes a role
        /// </summary>
        /// <param name="role">Role</param>
        /// <returns>Task</returns>
        public async Task DeleteRole(GoNorthRole role)
        {
            DeleteResult result = await _RoleCollection.DeleteOneAsync(r => r.Name == role.Name);
        }
    }
}