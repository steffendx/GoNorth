using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Config;
using GoNorth.Data.FlexFieldDatabase;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.Evne
{
    /// <summary>
    /// Evne Skill Template Mongo DB Access
    /// </summary>
    public class EvneSkillTemplateMongoDbAccess : FlexFieldObjectBaseMongoDbAccess<EvneSkill>, IEvneSkillTemplateDbAccess
    {
        /// <summary>
        /// Collection Name of the evne skill templates
        /// </summary>
        public const string EvneSkillTemplateCollectionName = "EvneSkillTemplate";

        /// <summary>
        /// Collection Name of the evne skill templates recycling bin
        /// </summary>
        public const string EvneSkillTemplateRecyclingBinCollectionName = "EvneSkillTemplateRecyclingBin";

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public EvneSkillTemplateMongoDbAccess(IOptions<ConfigurationData> configuration) : base(EvneSkillTemplateCollectionName, EvneSkillTemplateRecyclingBinCollectionName, configuration)
        {
        }

    }
}