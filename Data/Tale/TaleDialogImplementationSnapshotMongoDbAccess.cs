using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Config;
using GoNorth.Data.ImplementationSnapshot;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.Tale
{
    /// <summary>
    /// Tale Dialog Implementation Snapshot Mongo Db Access
    /// </summary>
    public class TaleDialogImplementationSnapshotMongoDbAccess : ObjectImplementationSnapshotExtendedMongoDbAccess<TaleDialog>, ITaleDialogImplementationSnapshotDbAccess
    {
        /// <summary>
        /// Collection Name of the Tale Dioalog Implementation Snapshots
        /// </summary>
        public const string TaleDialogImplementationSnapshotCollectionName = "TaleDialogImplementationSnapshot";

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public TaleDialogImplementationSnapshotMongoDbAccess(IOptions<ConfigurationData> configuration) : base(TaleDialogImplementationSnapshotCollectionName, configuration)
        {
        }
    }
}