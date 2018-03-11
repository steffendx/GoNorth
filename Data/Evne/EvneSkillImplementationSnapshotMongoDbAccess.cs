using System.IO;
using GoNorth.Config;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.ImplementationSnapshot;
using Microsoft.Extensions.Options;

namespace GoNorth.Data.Evne
{
    /// <summary>
    /// Evne Implementation Snapshot Mongo Db Access
    /// </summary>
    public class EvneSkillImplementationSnapshotMongoDbAccess : ObjectImplementationSnapshotMongoDbAccess<EvneSkill>, IEvneSkillImplementationSnapshotDbAccess
    {
        /// <summary>
        /// Collection Name of the Evne Skill Implementation Snapshots
        /// </summary>
        public const string EvneSkillImplementationSnapshotCollectionName = "EvneSkillImplementationSnapshot";

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public EvneSkillImplementationSnapshotMongoDbAccess(IOptions<ConfigurationData> configuration) : base(EvneSkillImplementationSnapshotCollectionName, configuration)
        {
        }
    }
}