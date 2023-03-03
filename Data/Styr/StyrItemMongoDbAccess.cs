using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Config;
using GoNorth.Data.FlexFieldDatabase;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.Styr
{
    /// <summary>
    /// Styr Item Mongo DB Access
    /// </summary>
    public class StyrItemMongoDbAccess : FlexFieldObjectBaseMongoDbAccess<StyrItem>, IStyrItemDbAccess
    {
        /// <summary>
        /// Collection Name of the styr items
        /// </summary>
        public const string StyrItemCollectionName = "StyrItem";

        /// <summary>
        /// Collection Name of the styr item recycling bin
        /// </summary>
        public const string StyrItemRecyclingBinCollectionName = "StyrItemRecyclingBin";

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public StyrItemMongoDbAccess(IOptions<ConfigurationData> configuration) : base(StyrItemCollectionName, StyrItemRecyclingBinCollectionName, configuration)
        {
        }
    
        /// <summary>
        /// Returns the items which have an item in their inventory with only the main values
        /// </summary>
        /// <param name="itemId">Item id</param>
        /// <returns>Npcs</returns>
        public async Task<List<StyrItem>> GetItemsByItemInInventory(string itemId)
        {
            return await _ObjectCollection.AsQueryable().Where(n => n.Inventory != null && n.Inventory.Any(i => i.ItemId == itemId)).OrderBy(n => n.Name).Select(n => new StyrItem {
                Id = n.Id,
                Name = n.Name
            }).ToListAsync();
        }
    }
}