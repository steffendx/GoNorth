using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using GoNorth.Config;
using GoNorth.Data.FlexFieldDatabase;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.Styr
{
    /// <summary>
    /// Styr Item Mongo DB Access
    /// </summary>
    public class StyrItemMongoDbAccess : FlexFieldObjectBaseMongoDbAccess<StyrItem>, IStyrItemDbAccess
    {
        /// <summary>
        /// Collection Name of the styr items
        /// </summary>
        public const string StyrItemCollectionName = "StyrItem";

        /// <summary>
        /// Collection Name of the styr item recycling bin
        /// </summary>
        public const string StyrItemRecyclingBinCollectionName = "StyrItemRecyclingBin";

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public StyrItemMongoDbAccess(IOptions<ConfigurationData> configuration) : base(StyrItemCollectionName, StyrItemRecyclingBinCollectionName, configuration)
        {
        }

    }
}