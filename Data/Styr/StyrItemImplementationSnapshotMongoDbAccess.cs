using System.IO;
using GoNorth.Config;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.ImplementationSnapshot;
using Microsoft.Extensions.Options;

namespace GoNorth.Data.Styr
{
    /// <summary>
    /// Styr Item Implementation Snapshot Mongo Db Access
    /// </summary>
    public class StyrItemImplementationSnapshotMongoDbAccess : ObjectImplementationSnapshotMongoDbAccess<StyrItem>, IStyrItemImplementationSnapshotDbAccess
    {
        /// <summary>
        /// Collection Name of the Styr Item Implementation Snapshots
        /// </summary>
        public const string StyrItemImplementationSnapshotCollectionName = "StyrItemImplementationSnapshot";

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public StyrItemImplementationSnapshotMongoDbAccess(IOptions<ConfigurationData> configuration) : base(StyrItemImplementationSnapshotCollectionName, configuration)
        {
        }
    }
}