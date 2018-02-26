using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Config;
using GoNorth.Data.FlexFieldDatabase;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.Kortisto
{
    /// <summary>
    /// Kortisto Npc Tag Mongo DB Access
    /// </summary>
    public class KortistoNpcTagMongoDbAccess : FlexFieldObjectTagBaseMongoDbAccess, IKortistoNpcTagDbAccess
    {
        /// <summary>
        /// Collection Name of the kortisto npc tags
        /// </summary>
        public const string KortistoNpcTagCollectionName = "KortistoNpcTag";

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public KortistoNpcTagMongoDbAccess(IOptions<ConfigurationData> configuration) : base(KortistoNpcTagCollectionName, configuration)
        {
        }

    }
}