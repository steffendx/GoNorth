using MongoDB.Driver;
using Microsoft.Extensions.Configuration;
using GoNorth.Config;
using Microsoft.Extensions.Options;

namespace GoNorth.Data
{
    /// <summary>
    /// Base class for mongo Db Access
    /// </summary>
    public class BaseMongoDbAccess
    {
        /// <summary>
        /// MongoDB Client
        /// </summary>
        protected MongoClient _Client;

        /// <summary>
        /// MongoDB Database
        /// </summary>
        protected IMongoDatabase _Database;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public BaseMongoDbAccess(IOptions<ConfigurationData> configuration)
        {
            MongoDbConfig dbConfig = configuration.Value.MongoDb;

            _Client = new MongoClient(dbConfig.ConnectionString);
            _Database = _Client.GetDatabase(dbConfig.DbName);
        }
    }
}
