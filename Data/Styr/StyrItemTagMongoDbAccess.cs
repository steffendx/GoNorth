using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Config;
using GoNorth.Data.FlexFieldDatabase;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.Styr
{
    /// <summary>
    /// Styr Item Tag Mongo DB Access
    /// </summary>
    public class StyrItemTagMongoDbAccess : FlexFieldObjectTagBaseMongoDbAccess, IStyrItemTagDbAccess
    {
        /// <summary>
        /// Collection Name of the styr item tags
        /// </summary>
        public const string StyrItemTagCollectionName = "StyrItemTag";

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public StyrItemTagMongoDbAccess(IOptions<ConfigurationData> configuration) : base(StyrItemTagCollectionName, configuration)
        {
        }

    }
}