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

namespace GoNorth.Data.Evne
{
    /// <summary>
    /// Evne Skill Mongo DB Access
    /// </summary>
    public class EvneSkillMongoDbAccess : FlexFieldObjectBaseMongoDbAccess<EvneSkill>, IEvneSkillDbAccess
    {
        /// <summary>
        /// Collection Name of the evne skills
        /// </summary>
        public const string EvneSkillCollectionName = "EvneSkill";

        /// <summary>
        /// Collection Name of the evne skill recycling bin
        /// </summary>
        public const string EvneSkillRecyclingBinCollectionName = "EvneSkillRecyclingBin";

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public EvneSkillMongoDbAccess(IOptions<ConfigurationData> configuration) : base(EvneSkillCollectionName, EvneSkillRecyclingBinCollectionName, configuration)
        {
        }

    }
}