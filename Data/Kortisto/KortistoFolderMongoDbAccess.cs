using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Config;
using GoNorth.Data.FlexFieldDatabase;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace GoNorth.Data.Kortisto
{
    /// <summary>
    /// Kortisto Folder Mongo DB Access
    /// </summary>
    public class KortistoFolderMongoDbAccess : FlexFieldFolderBaseMongoDbAccess, IKortistoFolderDbAccess
    {
        /// <summary>
        /// Collection Name of the kortisto folders
        /// </summary>
        public const string KortistoFolderCollectionName = "KortistoFolder";

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public KortistoFolderMongoDbAccess(IOptions<ConfigurationData> configuration) : base(KortistoFolderCollectionName, configuration)
        {
        }
    }
}