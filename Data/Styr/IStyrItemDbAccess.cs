using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.FlexFieldDatabase;

namespace GoNorth.Data.Styr
{
    /// <summary>
    /// Interface for Database Access for Styr Items
    /// </summary>
    public interface IStyrItemDbAccess : IFlexFieldObjectDbAccess<StyrItem>
    {
        /// <summary>
        /// Returns the items which have an item in their inventory with only the main values
        /// </summary>
        /// <param name="itemId">Item id</param>
        /// <returns>Npcs</returns>
        Task<List<StyrItem>> GetItemsByItemInInventory(string itemId);
    }
}