using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Config;
using GoNorth.Data.FlexFieldDatabase;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.Evne
{
    /// <summary>
    /// Evne Skill Tag Mongo DB Access
    /// </summary>
    public class EvneSkillTagMongoDbAccess : FlexFieldObjectTagBaseMongoDbAccess, IEvneSkillTagDbAccess
    {
        /// <summary>
        /// Collection Name of the evne skill tags
        /// </summary>
        public const string EvneSkillTagCollectionName = "EvneSkillTag";

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public EvneSkillTagMongoDbAccess(IOptions<ConfigurationData> configuration) : base(EvneSkillTagCollectionName, configuration)
        {
        }

    }
}