using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Aika;
using GoNorth.Data.Evne;
using GoNorth.Data.Exporting;
using GoNorth.Data.Karta;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Data.ProjectConfig;
using GoNorth.Data.Styr;

namespace GoNorth.Services.Export.Data
{
    /// <summary>
    /// Interface for a cached db access during exporting
    /// </summary>
    public interface IExportCachedDbAccess
    {
        /// <summary>
        /// Returns the project
        /// </summary>
        /// <returns>Project</returns>
        Task<GoNorthProject> GetDefaultProject();

        /// <summary>
        /// Returns the export settings for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Export Settings</returns>
        Task<ExportSettings> GetExportSettings(string projectId);

        /// <summary>
        /// Returns the player npc
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Player npc</returns>
        Task<KortistoNpc> GetPlayerNpc(string projectId);

        /// <summary>
        /// Returns an npc by its id
        /// </summary>
        /// <param name="npcId">Id of the npc</param>
        /// <returns>Npc</returns>
        Task<KortistoNpc> GetNpcById(string npcId);

        /// <summary>
        /// Returns an item by its id
        /// </summary>
        /// <param name="itemId">Item id</param>
        /// <returns>Item</returns>
        Task<StyrItem> GetItemById(string itemId);

        /// <summary>
        /// Returns a skill by its id
        /// </summary>
        /// <param name="skillId">Skill id</param>
        /// <returns>Skill</returns>
        Task<EvneSkill> GetSkillById(string skillId);

        /// <summary>
        /// Returns a quest by its id
        /// </summary>
        /// <param name="questId">Quest id</param>
        /// <returns>Quest</returns>
        Task<AikaQuest> GetQuestById(string questId);

        /// <summary>
        /// Returns a marker by its id
        /// </summary>
        /// <param name="mapId">Map Id</param>
        /// <param name="markerId">Marker Id</param>
        /// <returns>Marker</returns>
        Task<KartaMapNamedMarkerQueryResult> GetMarkerById(string mapId, string markerId);

        /// <summary>
        /// Returns the misc project config
        /// </summary>
        /// <returns>Misc project config</returns>
        Task<MiscProjectConfig> GetMiscProjectConfig();

        /// <summary>
        /// Returns the object export snippets of an object
        /// </summary>
        /// <param name="exportObjectId">Id of the Object for which the snippets must be loaded</param>
        /// <returns>Object export snippets</returns>
        Task<List<ObjectExportSnippet>> GetObjectExportSnippetsByObject(string exportObjectId);
    }
}