using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Aika;
using GoNorth.Data.Evne;
using GoNorth.Data.Karta.Marker;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Styr;
using GoNorth.Data.Tale;

namespace GoNorth.Services.ImplementationStatusCompare
{
    /// <summary>
    /// Interface for Implementation Status Comparer
    /// </summary>
    public interface IImplementationStatusComparer
    {
        /// <summary>
        /// Compares an npc
        /// </summary>
        /// <param name="npcId">Id of the npc</param>
        /// <param name="currentNpc">Current npc, if null the npc will be loaded</param>
        /// <returns>Compare Result</returns>
        Task<CompareResult> CompareNpc(string npcId, KortistoNpc currentNpc = null);

        /// <summary>
        /// Compares an item
        /// </summary>
        /// <param name="itemId">Id of the item</param>
        /// <param name="currentItem">Current item, if null the item will be loaded</param>
        /// <returns>Compare Result</returns>
        Task<CompareResult> CompareItem(string itemId, StyrItem currentItem = null);

        /// <summary>
        /// Compares a skill
        /// </summary>
        /// <param name="skillId">Id of the skill</param>
        /// <param name="currentSkill">Current skill, if null the skill will be loaded</param>
        /// <returns>Compare Result</returns>
        Task<CompareResult> CompareSkill(string skillId, EvneSkill currentSkill = null);

        /// <summary>
        /// Compares a dialog
        /// </summary>
        /// <param name="dialogId">Id of the dialog</param>
        /// <param name="currentDialog">Current dialog, if null the dialog will be loaded</param>
        /// <returns>Compare Result</returns>
        Task<CompareResult> CompareDialog(string dialogId, TaleDialog currentDialog = null);

        /// <summary>
        /// Compares a quest
        /// </summary>
        /// <param name="questId">Id of the quest</param>
        /// <param name="currentQuest">Current Quest, if null the quest will be loaded</param>
        /// <returns>Compare Result</returns>
        Task<CompareResult> CompareQuest(string questId, AikaQuest currentQuest = null);

        /// <summary>
        /// Compares a marker
        /// </summary>
        /// <param name="mapId">Id of the map</param>
        /// <param name="markerId">Id of the marker</param>
        /// <param name="markerType">Type of the marker</param>
        /// <param name="currentMarker">Current marker, if null the marker will be loaded</param>
        /// <returns>Compare Result</returns>
        Task<CompareResult> CompareMarker(string mapId, string markerId, MarkerType markerType, IImplementationComparable currentMarker = null);

        /// <summary>
        /// Formates a compare result
        /// </summary>
        /// <param name="differences">Differences to format</param>
        /// <returns>Formatted differences</returns>
        Task<List<CompareDifferenceFormatted>> FormatCompareResult(List<CompareDifference> differences);
    }
}