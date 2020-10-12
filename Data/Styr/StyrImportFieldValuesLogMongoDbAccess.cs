using GoNorth.Config;
using GoNorth.Data.FlexFieldDatabase;
using Microsoft.Extensions.Options;

namespace GoNorth.Data.Styr
{
    /// <summary>
    /// Styr import field values Mongo Db Access
    /// </summary>
    public class StyrImportFieldValuesLogMongoDbAccess : FlexFieldImportFieldValuesLogMongoDbAccess, IStyrImportFieldValuesLogDbAccess
    {
        /// <summary>
        /// Collection Name of the styr import field values log
        /// </summary>
        public const string StyrImportFieldValuesLogCollectionName = "StyrImportFieldValuesLog";

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public StyrImportFieldValuesLogMongoDbAccess(IOptions<ConfigurationData> configuration) : base(StyrImportFieldValuesLogCollectionName, configuration)
        {
        }
    }
}
