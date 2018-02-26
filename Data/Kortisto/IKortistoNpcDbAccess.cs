using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.FlexFieldDatabase;

namespace GoNorth.Data.Kortisto
{
    /// <summary>
    /// Interface for Database Access for Kortisto Npcs
    /// </summary>
    public interface IKortistoNpcDbAccess : IFlexFieldObjectDbAccess<KortistoNpc>
    {
        /// <summary>
        /// Returns the player npc
        /// </summary>
        /// <returns>Npc</returns>
        Task<KortistoNpc> GetPlayerNpc();

        /// <summary>
        /// Resets the player flag to false for all npcs
        /// </summary>
        /// <returns>Task</returns>
        Task ResetPlayerFlagForAllNpcs();


        /// <summary>
        /// Returns the npcs which have an item in their inventory with only the main items
        /// </summary>
        /// <param name="itemId">Item id</param>
        /// <returns>Npcs</returns>
        Task<List<KortistoNpc>> GetNpcsByItemInInventory(string itemId);
    }
}