using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Aika;
using GoNorth.Data.Evne;
using GoNorth.Data.Exporting;
using GoNorth.Data.Karta;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Data.ProjectConfig;
using GoNorth.Data.Styr;
using GoNorth.Services.ProjectConfig;

namespace GoNorth.Services.Export.Data
{
    /// <summary>
    /// Service for a cached db access during exporting
    /// </summary>
    public class ExportCachedDbAccess : IExportCachedDbAccess
    {
        /// <summary>
        /// Project Db Access
        /// </summary>
        private readonly IProjectDbAccess _projectDbAccess;

        /// <summary>
        /// Export Settings Db Access
        /// </summary>
        private readonly IExportSettingsDbAccess _exportSettingsDbAccess;

        /// <summary>
        /// Object Export Snippet Db Access
        /// </summary>
        private readonly IObjectExportSnippetDbAccess _objectExportSnippetDbAccess;

        /// <summary>
        /// Npc Db Access
        /// </summary>
        private readonly IKortistoNpcDbAccess _npcDbAccess;

        /// <summary>
        /// Item Db Access
        /// </summary>
        private readonly IStyrItemDbAccess _itemDbAccess;

        /// <summary>
        /// Item Db Access
        /// </summary>
        private readonly IEvneSkillDbAccess _skillDbAccess;

        /// <summary>
        /// Quest Db Access
        /// </summary>
        private readonly IAikaQuestDbAccess _questDbAccess;
        
        /// <summary>
        /// Map Db Access
        /// </summary>
        private readonly IKartaMapDbAccess _mapDbAccess;

        /// <summary>
        /// Project config provider
        /// </summary>
        private readonly IProjectConfigProvider _projectConfigProvider;

        /// <summary>
        /// Include export template Db Access
        /// </summary>
        private readonly IIncludeExportTemplateDbAccess _includeExportTemplateDbAccess;


        /// <summary>
        /// Project
        /// </summary>
        private GoNorthProject _project;

        /// <summary>
        /// Misc Project config
        /// </summary>
        private MiscProjectConfig _miscProjectConfig;

        /// <summary>
        /// Cached Export Settings
        /// </summary>
        private Dictionary<string, ExportSettings> _cachedExportSettings;

        /// <summary>
        /// Cached Player Npc
        /// </summary>
        private Dictionary<string, KortistoNpc> _cachedPlayerNpcs;

        /// <summary>
        /// Cached Npcs
        /// </summary>
        private Dictionary<string, KortistoNpc> _cachedNpcs;

        /// <summary>
        /// Cached Items
        /// </summary>
        private Dictionary<string, StyrItem> _cachedItems;

        /// <summary>
        /// Cached Skills
        /// </summary>
        private Dictionary<string, EvneSkill> _cachedSkills;

        /// <summary>
        /// Cached Quests
        /// </summary>
        private Dictionary<string, AikaQuest> _cachedQuest;

        /// <summary>
        /// Cached Markers
        /// </summary>
        private Dictionary<string, KartaMapNamedMarkerQueryResult> _cachedMarkers;
        
        /// <summary>
        /// Cached Export snippets
        /// </summary>
        private Dictionary<string, List<ObjectExportSnippet>> _cachedExportSnippets;

        /// <summary>
        /// Cached include export template
        /// </summary>
        private Dictionary<string, IncludeExportTemplate> _cachedIncludeExportTemplates;

        /// <summary>
        /// Export Cached Db Access
        /// </summary>
        /// <param name="projectDbAccess">Project Db Access</param>
        /// <param name="exportSettingsDbAccess">Export Settings Db Access</param>
        /// <param name="objectExportSnippetDbAccess">Object export snippet Db Access</param>
        /// <param name="npcDbAccess">Npc Db Access</param>
        /// <param name="itemDbAccess">Item Db Access</param>
        /// <param name="skillDbAccess">Skill Db Access</param>
        /// <param name="questDbAccess">Quest Db Access</param>
        /// <param name="mapDbAccess">Map Db Access</param>
        /// <param name="projectConfigProvider">Project config provider</param>
        /// <param name="includeExportTemplateDbAccess">Include export template Db access</param>
        public ExportCachedDbAccess(IProjectDbAccess projectDbAccess, IExportSettingsDbAccess exportSettingsDbAccess, IObjectExportSnippetDbAccess objectExportSnippetDbAccess, IKortistoNpcDbAccess npcDbAccess, 
                                    IStyrItemDbAccess itemDbAccess, IEvneSkillDbAccess skillDbAccess, IAikaQuestDbAccess questDbAccess, IKartaMapDbAccess mapDbAccess, IProjectConfigProvider projectConfigProvider,
                                    IIncludeExportTemplateDbAccess includeExportTemplateDbAccess)
        {
            _projectDbAccess = projectDbAccess;
            _exportSettingsDbAccess = exportSettingsDbAccess;
            _objectExportSnippetDbAccess = objectExportSnippetDbAccess;
            _npcDbAccess = npcDbAccess;
            _itemDbAccess = itemDbAccess;
            _skillDbAccess = skillDbAccess;
            _questDbAccess = questDbAccess;
            _mapDbAccess = mapDbAccess;
            _projectConfigProvider = projectConfigProvider;
            _includeExportTemplateDbAccess = includeExportTemplateDbAccess;

            _cachedExportSettings = new Dictionary<string, ExportSettings>();
            _cachedPlayerNpcs = new Dictionary<string, KortistoNpc>();
            _cachedNpcs = new Dictionary<string, KortistoNpc>();
            _cachedItems = new Dictionary<string, StyrItem>();
            _cachedSkills = new Dictionary<string, EvneSkill>();
            _cachedQuest = new Dictionary<string, AikaQuest>();
            _cachedMarkers = new Dictionary<string, KartaMapNamedMarkerQueryResult>();
            _cachedExportSnippets = new Dictionary<string, List<ObjectExportSnippet>>();
            _cachedIncludeExportTemplates = new Dictionary<string, IncludeExportTemplate>();
        }

        /// <summary>
        /// Returns the project
        /// </summary>
        /// <returns>Project</returns>
        public async Task<GoNorthProject> GetDefaultProject()
        {
            if(_project != null)
            {
                return _project;
            }

            _project = await _projectDbAccess.GetDefaultProject();
            return _project;
        }

        /// <summary>
        /// Returns the misc project config
        /// </summary>
        /// <returns>Misc project config</returns>
        public async Task<MiscProjectConfig> GetMiscProjectConfig()
        {
            if(_miscProjectConfig != null)
            {
                return _miscProjectConfig;
            }

            GoNorthProject defaultProject = await GetDefaultProject();
            _miscProjectConfig = await _projectConfigProvider.GetMiscConfig(defaultProject.Id);
            return _miscProjectConfig;
        }

        /// <summary>
        /// Returns the export settings for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Export Settings</returns>
        public async Task<ExportSettings> GetExportSettings(string projectId)
        {
            if(string.IsNullOrEmpty(projectId))
            {
                return null;
            }

            if(_cachedExportSettings.ContainsKey(projectId))
            {
                return _cachedExportSettings[projectId];
            }

            ExportSettings exportSettings = await _exportSettingsDbAccess.GetExportSettings(projectId);
            _cachedExportSettings.Add(projectId, exportSettings);
            return exportSettings;
        }

        /// <summary>
        /// Returns the player npc
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Player npc</returns>
        public async Task<KortistoNpc> GetPlayerNpc(string projectId)
        {
            if(string.IsNullOrEmpty(projectId))
            {
                return null;
            }

            if(_cachedPlayerNpcs.ContainsKey(projectId))
            {
                return _cachedPlayerNpcs[projectId];
            }

            KortistoNpc playerNpc = await _npcDbAccess.GetPlayerNpc(projectId);
            _cachedPlayerNpcs.Add(projectId, playerNpc);
            return playerNpc;
        }


        /// <summary>
        /// Returns an npc by its id
        /// </summary>
        /// <param name="npcId">Id of the npc</param>
        /// <returns>Npc</returns>
        public async Task<KortistoNpc> GetNpcById(string npcId)
        {
            if(string.IsNullOrEmpty(npcId))
            {
                return null;
            }

            if(_cachedNpcs.ContainsKey(npcId))
            {
                return _cachedNpcs[npcId];
            }

            KortistoNpc npc = await _npcDbAccess.GetFlexFieldObjectById(npcId);
            _cachedNpcs.Add(npcId, npc);
            return npc;    
        }



        /// <summary>
        /// Returns an item by its id
        /// </summary>
        /// <param name="itemId">Item id</param>
        /// <returns>Item</returns>
        public async Task<StyrItem> GetItemById(string itemId)
        {
            if(string.IsNullOrEmpty(itemId))
            {
                return null;
            }

            if(_cachedItems.ContainsKey(itemId))
            {
                return _cachedItems[itemId];
            }

            StyrItem item = await _itemDbAccess.GetFlexFieldObjectById(itemId);
            _cachedItems.Add(itemId, item);
            return item;            
        }

        /// <summary>
        /// Returns a list of item by a list of ids
        /// </summary>
        /// <param name="itemIds">Item ids</param>
        /// <returns>List of items</returns>
        public async Task<List<StyrItem>> GetItemsById(List<string> itemIds)
        {
            List<StyrItem> loadedItems = new List<StyrItem>();
            List<string> idsToLoad = new List<string>();
            foreach(string curItemId in itemIds)
            {
                if(_cachedItems.ContainsKey(curItemId))
                {
                    loadedItems.Add(_cachedItems[curItemId]);
                }
                else
                {
                    idsToLoad.Add(curItemId);
                }
            }

            if(idsToLoad.Any())
            {
                List<StyrItem> newLoadedItems = await _itemDbAccess.GetObjectsById(idsToLoad);
                foreach(StyrItem curItem in newLoadedItems)
                {
                    loadedItems.Add(curItem);
                    if(!_cachedItems.ContainsKey(curItem.Id))
                    {
                        _cachedItems.Add(curItem.Id, curItem);
                    }
                }
            }

            return loadedItems;
        }

        /// <summary>
        /// Returns a skill by its id
        /// </summary>
        /// <param name="skillId">Skill id</param>
        /// <returns>Skill</returns>
        public async Task<EvneSkill> GetSkillById(string skillId)
        {
            if(string.IsNullOrEmpty(skillId))
            {
                return null;
            }

            if(_cachedSkills.ContainsKey(skillId))
            {
                return _cachedSkills[skillId];
            }

            EvneSkill skill = await _skillDbAccess.GetFlexFieldObjectById(skillId);
            _cachedSkills.Add(skillId, skill);
            return skill;   
        }

        /// <summary>
        /// Returns a list of skill by a list of ids
        /// </summary>
        /// <param name="skillIds">Skill ids</param>
        /// <returns>Skills</returns>
        public async Task<List<EvneSkill>> GetSkillsById(List<string> skillIds)
        {
            List<EvneSkill> loadedSkills = new List<EvneSkill>();
            List<string> idsToLoad = new List<string>();
            foreach(string curSkillId in skillIds)
            {
                if(_cachedSkills.ContainsKey(curSkillId))
                {
                    loadedSkills.Add(_cachedSkills[curSkillId]);
                }
                else
                {
                    idsToLoad.Add(curSkillId);
                }
            }

            if(idsToLoad.Any())
            {
                List<EvneSkill> newLoadedSkills = await _skillDbAccess.GetObjectsById(idsToLoad);
                foreach(EvneSkill curSkill in newLoadedSkills)
                {
                    loadedSkills.Add(curSkill);
                    if(!_cachedSkills.ContainsKey(curSkill.Id))
                    {
                        _cachedSkills.Add(curSkill.Id, curSkill);
                    }
                }
            }

            return loadedSkills;
        }

        /// <summary>
        /// Returns a quest by its id
        /// </summary>
        /// <param name="questId">Quest id</param>
        /// <returns>Quest</returns>
        public async Task<AikaQuest> GetQuestById(string questId)
        {
            if(string.IsNullOrEmpty(questId))
            {
                return null;
            }

            if(_cachedQuest.ContainsKey(questId))
            {
                return _cachedQuest[questId];
            }

            AikaQuest quest = await _questDbAccess.GetQuestById(questId);
            _cachedQuest.Add(questId, quest);
            return quest;    
        }

        /// <summary>
        /// Returns a marker by its id
        /// </summary>
        /// <param name="mapId">Map Id</param>
        /// <param name="markerId">Marker Id</param>
        /// <returns>Marker</returns>
        public async Task<KartaMapNamedMarkerQueryResult> GetMarkerById(string mapId, string markerId)
        {
            if(string.IsNullOrEmpty(mapId) || string.IsNullOrEmpty(markerId))
            {
                return null;
            }

            string cacheId = mapId + "|" + markerId;
            if(_cachedMarkers.ContainsKey(cacheId))
            {
                return _cachedMarkers[cacheId];
            }

            KartaMapNamedMarkerQueryResult markerQueryResult = await _mapDbAccess.GetMarkerById(mapId, markerId);
            _cachedMarkers.Add(cacheId, markerQueryResult);
            return markerQueryResult;   
        }

        /// <summary>
        /// Returns the object export snippets of an object
        /// </summary>
        /// <param name="exportObjectId">Id of the Object for which the snippets must be loaded</param>
        /// <returns>Object export snippets</returns>
        public async Task<List<ObjectExportSnippet>> GetObjectExportSnippetsByObject(string exportObjectId)
        {
            if(string.IsNullOrEmpty(exportObjectId))
            {
                return new List<ObjectExportSnippet>();
            }

            if(_cachedExportSnippets.ContainsKey(exportObjectId))
            {
                return _cachedExportSnippets[exportObjectId];
            }

            List<ObjectExportSnippet> exportSnippets = await _objectExportSnippetDbAccess.GetExportSnippets(exportObjectId);
            _cachedExportSnippets.Add(exportObjectId, exportSnippets);
            return exportSnippets;
        }

        /// <summary>
        /// Loads an include template by name
        /// </summary>
        /// <param name="projectId">Id of the project to which the template belongs</param>
        /// <param name="templateName">Name of the template to load</param>
        /// <returns>Include template</returns>
        public async Task<IncludeExportTemplate> GetIncludeTemplateByName(string projectId, string templateName)
        {
            string cacheKey = projectId + "|" + templateName;
            if(_cachedIncludeExportTemplates.ContainsKey(cacheKey))
            {
                return _cachedIncludeExportTemplates[cacheKey];
            }

            IncludeExportTemplate exportTemplate = await _includeExportTemplateDbAccess.GetIncludeTemplateByName(projectId, templateName);
            _cachedIncludeExportTemplates.Add(cacheKey, exportTemplate);
            return exportTemplate;
        }
    }
}