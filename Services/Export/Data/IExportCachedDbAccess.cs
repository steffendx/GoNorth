using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Aika;
using GoNorth.Data.Evne;
using GoNorth.Data.Exporting;
using GoNorth.Data.Karta;
using GoNorth.Data.Kirja;
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
        /// Returns the user project
        /// </summary>
        /// <returns>Project</returns>
        Task<GoNorthProject> GetUserProject();

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
        /// Returns a list of item by a list of ids
        /// </summary>
        /// <param name="itemIds">Item ids</param>
        /// <returns>List of items</returns>
        Task<List<StyrItem>> GetItemsById(List<string> itemIds);

        /// <summary>
        /// Returns a skill by its id
        /// </summary>
        /// <param name="skillId">Skill id</param>
        /// <returns>Skill</returns>
        Task<EvneSkill> GetSkillById(string skillId);

        /// <summary>
        /// Returns a list of skill by a list of ids
        /// </summary>
        /// <param name="skillIds">Skill ids</param>
        /// <returns>Skills</returns>
        Task<List<EvneSkill>> GetSkillsById(List<string> skillIds);

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
        /// Returns a wiki page by its id
        /// </summary>
        /// <param name="pageId">Page Id</param>
        /// <returns>Wiki page</returns>
        Task<KirjaPage> GetWikiPageById(string pageId);

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

        /// <summary>
        /// Loads an include template by name
        /// </summary>
        /// <param name="projectId">Id of the project to which the template belongs</param>
        /// <param name="templateName">Name of the template to load</param>
        /// <returns>Include template</returns>
        Task<IncludeExportTemplate> GetIncludeTemplateByName(string projectId, string templateName);
    }
}