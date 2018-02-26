using System.IO;
using GoNorth.Config;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.ImplementationSnapshot;
using Microsoft.Extensions.Options;

namespace GoNorth.Data.Aika
{
    /// <summary>
    /// Aika Quest Implementation Snapshot Mongo Db Access
    /// </summary>
    public class AikaQuestImplementationSnapshotMongoDbAccess : ObjectImplementationSnapshotMongoDbAccess<AikaQuest>, IAikaQuestImplementationSnapshotDbAccess
    {
        /// <summary>
        /// Collection Name of the Aika Quest Implementation Snapshots
        /// </summary>
        public const string AikaQuestImplementationSnapshotCollectionName = "AikaQuestImplementationSnapshot";

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public AikaQuestImplementationSnapshotMongoDbAccess(IOptions<ConfigurationData> configuration) : base(AikaQuestImplementationSnapshotCollectionName, configuration)
        {
        }
    }
}