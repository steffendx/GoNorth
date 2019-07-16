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


        /// <summary>
        /// Returns all npcs an object is referenced in the daily routine (not including the relatedobjectid itself)
        /// </summary>
        /// <param name="objectId">Object Id</param>
        /// <returns>All npcs the object is referenced in without detail information and the entrie with relatedobjectid = itself</returns>
        Task<List<KortistoNpc>> GetNpcsObjectIsReferencedInDailyRoutine(string objectId);
        
        /// <summary>
        /// Returns all npcs that have a movement target in a map with full informations
        /// </summary>
        /// <param name="mapId">Map Id</param>
        /// <returns>All npcs that have a movement target in a map with full informations</returns>
        Task<List<KortistoNpc>> GetNpcsWithMovementTargetInMap(string mapId);


        /// <summary>
        /// Returns the npcs which have a daily routine event that is later than a given time
        /// </summary>
        /// <param name="hours">Hours</param>
        /// <param name="minutes">Minutes</param>
        /// <returns>Npcs</returns>
        Task<List<KortistoNpc>> GetNpcsWithDailyRoutineAfterTime(int hours, int minutes);
    }
}