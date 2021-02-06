using GoNorth.Config;
using GoNorth.Data.ImplementationSnapshot;
using Microsoft.Extensions.Options;

namespace GoNorth.Data.StateMachines
{
    /// <summary>
    /// State machine Implementation Snapshot Mongo Db Access
    /// </summary>
    public class StateMachineImplementationSnapshotMongoDbAccess : ObjectImplementationSnapshotExtendedMongoDbAccess<StateMachine>, IStateMachineImplementationSnapshotDbAccess
    {
        /// <summary>
        /// Collection Name of the state machine Implementation Snapshots
        /// </summary>
        public const string StateMachineImplementationSnapshotCollectionName = "StateMachineImplementationSnapshot";

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public StateMachineImplementationSnapshotMongoDbAccess(IOptions<ConfigurationData> configuration) : base(StateMachineImplementationSnapshotCollectionName, configuration)
        {
        }
    }
}