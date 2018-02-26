using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Config;
using GoNorth.Data.FlexFieldDatabase;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace GoNorth.Data.Styr
{
    /// <summary>
    /// Styr Folder Mongo DB Access
    /// </summary>
    public class StyrFolderMongoDbAccess : FlexFieldFolderBaseMongoDbAccess, IStyrFolderDbAccess
    {
        /// <summary>
        /// Collection Name of the styr folders
        /// </summary>
        public const string StyrFolderCollectionName = "StyrFolder";

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public StyrFolderMongoDbAccess(IOptions<ConfigurationData> configuration) : base(StyrFolderCollectionName, configuration)
        {
        }
    }
}