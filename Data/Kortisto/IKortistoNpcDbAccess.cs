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
        /// <param name="projectId">Project Id</param>
        /// <returns>Npc</returns>
        Task<KortistoNpc> GetPlayerNpc(string projectId);

        /// <summary>
        /// Resets the player flag to false for all npcs
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Task</returns>
        Task ResetPlayerFlagForAllNpcs(string projectId);


        /// <summary>
        /// Returns the npcs which have an item in their inventory with only the main values
        /// </summary>
        /// <param name="itemId">Item id</param>
        /// <returns>Npcs</returns>
        Task<List<KortistoNpc>> GetNpcsByItemInInventory(string itemId);

        /// <summary>
        /// Returns the npcs which have learned a skill with only the main values
        /// </summary>
        /// <param name="skillId">Skill id</param>
        /// <returns>Npcs</returns>
        Task<List<KortistoNpc>> GetNpcsByLearnedSkill(string skillId);
    }
}