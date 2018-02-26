using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Config;
using GoNorth.Data.FlexFieldDatabase;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.Kortisto
{
    /// <summary>
    /// Kortisto Npc Template Mongo DB Access
    /// </summary>
    public class KortistoNpcTemplateMongoDbAccess : FlexFieldObjectBaseMongoDbAccess<KortistoNpc>, IKortistoNpcTemplateDbAccess
    {
        /// <summary>
        /// Collection Name of the kortisto npc templates
        /// </summary>
        public const string KortistoNpcTemplateCollectionName = "KortistoNpcTemplate";

        /// <summary>
        /// Collection Name of the kortisto npc templates recycling bin
        /// </summary>
        public const string KortistoNpcTemplateRecyclingBinCollectionName = "KortistoNpcTemplateRecyclingBin";

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public KortistoNpcTemplateMongoDbAccess(IOptions<ConfigurationData> configuration) : base(KortistoNpcTemplateCollectionName, KortistoNpcTemplateRecyclingBinCollectionName, configuration)
        {
        }

    }
}