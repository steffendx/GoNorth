using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Config;
using GoNorth.Data.FlexFieldDatabase;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace GoNorth.Data.Evne
{
    /// <summary>
    /// Evne Folder Mongo DB Access
    /// </summary>
    public class EvneFolderMongoDbAccess : FlexFieldFolderBaseMongoDbAccess, IEvneFolderDbAccess
    {
        /// <summary>
        /// Collection Name of the evne folders
        /// </summary>
        public const string EvneFolderCollectionName = "EvneFolder";

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public EvneFolderMongoDbAccess(IOptions<ConfigurationData> configuration) : base(EvneFolderCollectionName, configuration)
        {
        }
    }
}