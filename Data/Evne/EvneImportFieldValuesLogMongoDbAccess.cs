using GoNorth.Config;
using GoNorth.Data.FlexFieldDatabase;
using Microsoft.Extensions.Options;

namespace GoNorth.Data.Evne
{
    /// <summary>
    /// Evne import field values Mongo Db Access
    /// </summary>
    public class EvneImportFieldValuesLogMongoDbAccess : FlexFieldImportFieldValuesLogMongoDbAccess, IEvneImportFieldValuesLogDbAccess
    {
        /// <summary>
        /// Collection Name of the evne import field values log
        /// </summary>
        public const string EvneImportFieldValuesLogCollectionName = "EvneImportFieldValuesLog";

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public EvneImportFieldValuesLogMongoDbAccess(IOptions<ConfigurationData> configuration) : base(EvneImportFieldValuesLogCollectionName, configuration)
        {
        }
    }
}
