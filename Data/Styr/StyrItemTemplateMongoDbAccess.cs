using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Config;
using GoNorth.Data.FlexFieldDatabase;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.Styr
{
    /// <summary>
    /// Styr Item Template Mongo DB Access
    /// </summary>
    public class StyrItemTemplateMongoDbAccess : FlexFieldObjectBaseMongoDbAccess<StyrItem>, IStyrItemTemplateDbAccess
    {
        /// <summary>
        /// Collection Name of the styr item templates
        /// </summary>
        public const string StyrItemTemplateCollectionName = "StyrItemTemplate";

        /// <summary>
        /// Collection Name of the styr item templates recycling bin
        /// </summary>
        public const string StyrItemTemplateRecyclingBinCollectionName = "StyrItemTemplateRecyclingBin";

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public StyrItemTemplateMongoDbAccess(IOptions<ConfigurationData> configuration) : base(StyrItemTemplateCollectionName, StyrItemTemplateRecyclingBinCollectionName, configuration)
        {
        }

    }
}