using System.IO;
using GoNorth.Config;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.ImplementationSnapshot;
using Microsoft.Extensions.Options;

namespace GoNorth.Data.Kortisto
{
    /// <summary>
    /// Kortisto Npc Implementation Snapshot Mongo Db Access
    /// </summary>
    public class KortistoNpcImplementationSnapshotMongoDbAccess : ObjectImplementationSnapshotExtendedMongoDbAccess<KortistoNpc>, IKortistoNpcImplementationSnapshotDbAccess
    {
        /// <summary>
        /// Collection Name of the Kortisto Npc Implementation Snapshots
        /// </summary>
        public const string KortistoNpcImplementationSnapshotCollectionName = "KortistoNpcImplementationSnapshot";

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public KortistoNpcImplementationSnapshotMongoDbAccess(IOptions<ConfigurationData> configuration) : base(KortistoNpcImplementationSnapshotCollectionName, configuration)
        {
        }
    }
}