using GoNorth.Config;
using GoNorth.Data.FlexFieldDatabase;
using Microsoft.Extensions.Options;

namespace GoNorth.Data.Kortisto
{
    /// <summary>
    /// Kortisto import field values Mongo Db Access
    /// </summary>
    public class KortistoImportFieldValuesLogMongoDbAccess : FlexFieldImportFieldValuesLogMongoDbAccess, IKortistoImportFieldValuesLogDbAccess
    {
        /// <summary>
        /// Collection Name of the kortisto import field values log
        /// </summary>
        public const string KortistoImportFieldValuesLogCollectionName = "KortistoImportFieldValuesLog";

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public KortistoImportFieldValuesLogMongoDbAccess(IOptions<ConfigurationData> configuration) : base(KortistoImportFieldValuesLogCollectionName, configuration)
        {
        }
    }
}
