using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Project;
using GoNorth.Services.Timeline;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using GoNorth.Data.Kirja;
using Microsoft.AspNetCore.Identity;
using GoNorth.Data.User;
using GoNorth.Data.Karta;
using GoNorth.Data.Tale;
using GoNorth.Data.Styr;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Aika;
using GoNorth.Services.ImplementationStatusCompare;
using GoNorth.Services.FlexFieldThumbnail;
using GoNorth.Data.Karta.Marker;
using GoNorth.Data.Exporting;
using GoNorth.Services.Security;
using Microsoft.AspNetCore.Http;
using System.Globalization;
using GoNorth.Services.CsvHandling;
using GoNorth.Services.Project;
using GoNorth.Services.Export.ExportSnippets;
using GoNorth.Data.Evne;
using GoNorth.Data.StateMachines;
using Microsoft.Extensions.Options;
using GoNorth.Config;

namespace GoNorth.Controllers.Api
{
    /// <summary>
    /// Styr Api controller
    /// </summary>
    [ApiController]
    [Authorize(Roles = RoleNames.Styr)]
    [Route("/api/[controller]/[action]")]
    public class StyrApiController : FlexFieldBaseApiController<StyrItem>
    {
        /// <summary>
        /// Event used for the folder created event
        /// </summary>
        protected override TimelineEvent FolderCreatedEvent { get { return TimelineEvent.StyrFolderCreated; } }

        /// <summary>
        /// Event used for the folder deleted event
        /// </summary>
        protected override TimelineEvent FolderDeletedEvent { get { return TimelineEvent.StyrFolderDeleted; } }

        /// <summary>
        /// Event used for the folder updated event
        /// </summary>
        protected override TimelineEvent FolderUpdatedEvent { get { return TimelineEvent.StyrFolderUpdated; } }
                
        /// <summary>
        /// Event used for the folder moved to folder event
        /// </summary>
        protected override TimelineEvent FolderMovedToFolderEvent { get { return TimelineEvent.StyrFolderMovedToFolder; } }

        /// <summary>
        /// Event used for the folder moved to root level event
        /// </summary>
        protected override TimelineEvent FolderMovedToRootEvent { get { return TimelineEvent.StyrFolderMovedToRootFolder; } }


        /// <summary>
        /// Event used for the template created event
        /// </summary>
        protected override TimelineEvent TemplateCreatedEvent { get { return TimelineEvent.StyrItemTemplateCreated; } }

        /// <summary>
        /// Event used for the template deleted event
        /// </summary>
        protected override TimelineEvent TemplateDeletedEvent { get { return TimelineEvent.StyrItemTemplateDeleted; } }

        /// <summary>
        /// Event used for the template updated event
        /// </summary>
        protected override TimelineEvent TemplateUpdatedEvent { get { return TimelineEvent.StyrItemTemplateUpdated; } }

        /// <summary>
        /// Event used for the template fields distributed event
        /// </summary>
        protected override TimelineEvent TemplateFieldsDistributedEvent { get { return TimelineEvent.StyrItemTemplateFieldsDistributed; } }

        /// <summary>
        /// Event used for the flex field template image updated event
        /// </summary>
        protected override TimelineEvent TemplateImageUploadEvent { get { return TimelineEvent.StyrItemTemplateImageUpload; } }


        /// <summary>
        /// Event used for the flex field object created event
        /// </summary>
        protected override TimelineEvent ObjectCreatedEvent { get { return TimelineEvent.StyrItemCreated; } }

        /// <summary>
        /// Event used for the flex field object deleted event
        /// </summary>
        protected override TimelineEvent ObjectDeletedEvent { get { return TimelineEvent.StyrItemDeleted; } }

        /// <summary>
        /// Event used for the flex field object updated event
        /// </summary>
        protected override TimelineEvent ObjectUpdatedEvent { get { return TimelineEvent.StyrItemUpdated; } }

        /// <summary>
        /// Event used for the flex field object image updated event
        /// </summary>
        protected override TimelineEvent ObjectImageUploadEvent { get { return TimelineEvent.StyrItemImageUpload; } }
                                
        /// <summary>
        /// Event used for the object moved to folder event
        /// </summary>
        protected override TimelineEvent ObjectMovedToFolderEvent { get { return TimelineEvent.StyrItemMovedToFolder; } }

        /// <summary>
        /// Event used for the object moved to root level event
        /// </summary>
        protected override TimelineEvent ObjectMovedToRootEvent { get { return TimelineEvent.StyrItemMovedToRoot; } }


        /// <summary>
        /// Event used for the value file import event
        /// </summary>
        protected override TimelineEvent ValueFileImportEvent { get { return TimelineEvent.StyrValueFileImport; } }


        /// <summary>
        /// Aika Quest DB Access
        /// </summary>
        private readonly IAikaQuestDbAccess _aikaQuestDbAccess;

        /// <summary>
        /// Skill DB Access
        /// </summary>
        private readonly IEvneSkillDbAccess _skillDbAccess;

        /// <summary>
        /// Tale DB Access
        /// </summary>
        private readonly ITaleDbAccess _taleDbAccess;

        /// <summary>
        /// Kirja Page Db Access
        /// </summary>
        private readonly IKirjaPageDbAccess _kirjaPageDbAccess;

        /// <summary>
        /// Karta Map Db Access
        /// </summary>
        private readonly IKartaMapDbAccess _kartaMapDbAccess;

        /// <summary>
        /// Kortisto Npc Db Access
        /// </summary>
        private readonly IKortistoNpcDbAccess _kortistoNpcDbAccess;

        /// <summary>
        /// Npc Template Db Access
        /// </summary>
        private readonly IKortistoNpcTemplateDbAccess _npcTemplateDbAccess;

        /// <summary>
        /// True if item inventory is disabled
        /// </summary>
        private readonly bool _disableItemInventory;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="folderDbAccess">Folder Db Access</param>
        /// <param name="templateDbAccess">Template Db Access</param>
        /// <param name="itemDbAccess">Item Db Access</param>
        /// <param name="tagDbAccess">Tag Db Access</param>
        /// <param name="exportTemplateDbAccess">Export Template Db Access</param>
        /// <param name="importFieldValuesLogDbAccess">Import field values log Db Access</param>
        /// <param name="languageKeyDbAccess">Language Key Db Access</param>
        /// <param name="exportFunctionIdDbAccess">Export Function Id Db Access</param>
        /// <param name="objectExportSnippetDbAccess">Object export snippet Db Access</param>
        /// <param name="objectExportSnippetSnapshotDbAccess">Object export snippet snapshot Db Access</param>
        /// <param name="exportSnippetRelatedObjectNameResolver">Service that will resolve export snippet related object names</param>
        /// <param name="stateMachineDbAccess">State Machine Db Access</param>
        /// <param name="imageAccess">Item Image Access</param>
        /// <param name="thumbnailService">Thumbnail Service</param>
        /// <param name="aikaQuestDbAccess">Aika Quest Db Access</param>
        /// <param name="taleDbAccess">Tale Db Access</param>
        /// <param name="skillDbAccess">Skill Db Access</param>
        /// <param name="kirjaPageDbAccess">Kirja Page Db Access</param>
        /// <param name="kartaMapDbAccess">Karta Map Db Access</param>
        /// <param name="kortistoNpcDbAccess">Kortisto Npc Db Access</param>
        /// <param name="npcTemplateDbAccess">Npc Template Db Access</param>
        /// <param name="userProjectAccess">User Project Access</param>
        /// <param name="csvGenerator">CSV Generator</param>
        /// <param name="csvReader">CSV Reader</param>
        /// <param name="userManager">User Manager</param>
        /// <param name="implementationStatusComparer">Implementation Status Comparer</param>
        /// <param name="timelineService">Timeline Service</param>
        /// <param name="xssChecker">Xss Checker</param>
        /// <param name="logger">Logger</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="configuration">Config Data</param>
        public StyrApiController(IStyrFolderDbAccess folderDbAccess, IStyrItemTemplateDbAccess templateDbAccess, IStyrItemDbAccess itemDbAccess, IStyrItemTagDbAccess tagDbAccess, IExportTemplateDbAccess exportTemplateDbAccess, IStyrImportFieldValuesLogDbAccess importFieldValuesLogDbAccess, 
                                 ILanguageKeyDbAccess languageKeyDbAccess, IExportFunctionIdDbAccess exportFunctionIdDbAccess, IObjectExportSnippetDbAccess objectExportSnippetDbAccess, IObjectExportSnippetSnapshotDbAccess objectExportSnippetSnapshotDbAccess, IExportSnippetRelatedObjectNameResolver exportSnippetRelatedObjectNameResolver, 
                                 IStateMachineDbAccess stateMachineDbAccess, IStyrItemImageAccess imageAccess, IStyrThumbnailService thumbnailService, IAikaQuestDbAccess aikaQuestDbAccess, IEvneSkillDbAccess skillDbAccess, ITaleDbAccess taleDbAccess, IKirjaPageDbAccess kirjaPageDbAccess, IKartaMapDbAccess kartaMapDbAccess, 
                                 IKortistoNpcDbAccess kortistoNpcDbAccess, IKortistoNpcTemplateDbAccess npcTemplateDbAccess, IUserProjectAccess userProjectAccess, ICsvGenerator csvGenerator, ICsvParser csvReader, UserManager<GoNorthUser> userManager, IImplementationStatusComparer implementationStatusComparer, ITimelineService timelineService, 
                                 IXssChecker xssChecker, ILogger<StyrApiController> logger, IStringLocalizerFactory localizerFactory, IOptions<ConfigurationData> configuration) 
                                  : base(folderDbAccess, templateDbAccess, itemDbAccess, tagDbAccess, exportTemplateDbAccess, importFieldValuesLogDbAccess, languageKeyDbAccess, exportFunctionIdDbAccess, objectExportSnippetDbAccess, objectExportSnippetSnapshotDbAccess, exportSnippetRelatedObjectNameResolver, stateMachineDbAccess, userProjectAccess, imageAccess, 
                                         thumbnailService, csvGenerator, csvReader, userManager, implementationStatusComparer, timelineService, xssChecker, logger, localizerFactory)
        {
            _aikaQuestDbAccess = aikaQuestDbAccess;
            _skillDbAccess = skillDbAccess;
            _taleDbAccess = taleDbAccess;
            _kirjaPageDbAccess = kirjaPageDbAccess;
            _kartaMapDbAccess = kartaMapDbAccess;
            _kortistoNpcDbAccess = kortistoNpcDbAccess;
            _npcTemplateDbAccess = npcTemplateDbAccess;
            _disableItemInventory = configuration.Value.Misc.DisableItemInventory.HasValue ? configuration.Value.Misc.DisableItemInventory.Value : false;
        }

        /// <summary>
        /// Creates a new item template
        /// </summary>
        /// <param name="template">Template to create</param>
        /// <returns>Result</returns>
        [ProducesResponseType(typeof(StyrItem), StatusCodes.Status200OK)]
        [Authorize(Roles = RoleNames.StyrTemplateManager)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CreateFlexFieldTemplate([FromBody]StyrItem template)
        {
            return await BaseCreateFlexFieldTemplate(template);
        }

        /// <summary>
        /// Deletes a item template
        /// </summary>
        /// <param name="id">Id of the template</param>
        /// <returns>Result Status Code</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [Authorize(Roles = RoleNames.StyrTemplateManager)]
        [HttpDelete]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteFlexFieldTemplate(string id)
        {
            return await BaseDeleteFlexFieldTemplate(id);
        }

        /// <summary>
        /// Updates a item template 
        /// </summary>
        /// <param name="id">Template Id</param>
        /// <param name="template">Update template data</param>
        /// <returns>Result Status Code</returns>
        [ProducesResponseType(typeof(StyrItem), StatusCodes.Status200OK)]
        [Authorize(Roles = RoleNames.StyrTemplateManager)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateFlexFieldTemplate(string id, [FromBody]StyrItem template)
        {
            return await BaseUpdateFlexFieldTemplate(id, template);
        }

        /// <summary>
        /// Distributes the fields of a template
        /// </summary>
        /// <param name="id">Template Id</param>
        /// <returns>Task</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [Authorize(Roles = RoleNames.StyrTemplateManager)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DistributeFlexFieldTemplateFields(string id)
        {
            return await BaseDistributeFlexFieldTemplateFields(id);
        }

        /// <summary>
        /// Uploads an image to an item template
        /// </summary>
        /// <param name="id">Id of the template</param>
        /// <returns>Image Name</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [Authorize(Roles = RoleNames.StyrTemplateManager)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> FlexFieldTemplateImageUpload(string id)
        {
            return await BaseFlexFieldTemplateImageUpload(id);
        }

        /// <summary>
        /// Strips an object based on the rights of a user
        /// </summary>
        /// <param name="flexFieldObject">Flex field object to strip</param>
        /// <returns>Stripped object</returns>
        protected override StyrItem StripObject(StyrItem flexFieldObject)
        {
            if(_disableItemInventory)
            {
                flexFieldObject.Inventory = new List<StyrInventoryItem>();
            }

            return flexFieldObject;
        }

        /// <summary>
        /// Checks if a object is referenced before a delete
        /// </summary>
        /// <param name="id">Id</param>
        /// <returns>Empty string if no references exists, error string if references exists</returns>
        protected override async Task<string> CheckObjectReferences(string id)
        {
            List<AikaQuest> aikaQuests = await _aikaQuestDbAccess.GetQuestsObjectIsReferenced(id);
            if(aikaQuests.Count > 0)
            {
                string referencedInQuests = string.Join(", ", aikaQuests.Select(p => p.Name));
                return _localizer["CanNotDeleteItemReferencedInAikaQuest", referencedInQuests].Value;
            }

            List<KirjaPage> kirjaPages = await _kirjaPageDbAccess.GetPagesByItem(id);
            if(kirjaPages.Count > 0)
            {
                string mentionedInPages = string.Join(", ", kirjaPages.Select(p => p.Name));
                return _localizer["CanNotDeleteItemMentionedInKirjaPage", mentionedInPages].Value;
            }

            List<KartaMapMarkerQueryResult> kartaMaps = await _kartaMapDbAccess.GetAllMapsItemIsMarkedIn(id);
            if(kartaMaps.Count > 0)
            {
                string markedInMaps = string.Join(", ", kartaMaps.Select(m => m.Name));
                return _localizer["CanNotDeleteItemMarkedInKartaMap", markedInMaps].Value;
            }

            List<TaleDialog> taleDialogs = await _taleDbAccess.GetDialogsObjectIsReferenced(id);
            taleDialogs = taleDialogs.Where(t => t.RelatedObjectId != id).ToList();
            if(taleDialogs.Count > 0)
            {
                List<KortistoNpc> npcs = await _kortistoNpcDbAccess.ResolveFlexFieldObjectNames(taleDialogs.Select(t => t.RelatedObjectId).ToList());
                string referencedInDialogs = string.Join(", ", npcs.Select(n => n.Name));
                return _localizer["CanNotDeleteItemReferencedInTaleDialog", referencedInDialogs].Value;
            }

            List<KortistoNpc> inventoryNpcs = await _kortistoNpcDbAccess.GetNpcsByItemInInventory(id);
            if(inventoryNpcs.Count > 0)
            {
                string usedInInventories = string.Join(", ", inventoryNpcs.Select(n => n.Name));
                return _localizer["CanNotDeleteItemUsedInInventory", usedInInventories].Value;
            }

            List<KortistoNpc> referencedInDailyRoutines = await _kortistoNpcDbAccess.GetNpcsObjectIsReferencedInDailyRoutine(id);
            if(referencedInDailyRoutines.Count > 0)
            {
                string usedInDailyRoutines = string.Join(", ", referencedInDailyRoutines.Select(m => m.Name));
                return _localizer["CanNotDeleteItemUsedInDailyRoutine", usedInDailyRoutines].Value;
            }

            List<StateMachine> referencedInStateMachines = await _stateMachineDbAccess.GetStateMachinesObjectIsReferenced(id);
            if(referencedInStateMachines.Count > 0)
            {
                List<KortistoNpc> npcs = await _kortistoNpcDbAccess.ResolveFlexFieldObjectNames(referencedInStateMachines.Select(t => t.RelatedObjectId).ToList());
                List<KortistoNpc> npcTemplates = await _npcTemplateDbAccess.ResolveFlexFieldObjectNames(referencedInStateMachines.Select(t => t.RelatedObjectId).ToList());
                string usedInStateMachines = string.Join(", ", npcs.Union(npcTemplates).Select(n => n.Name));
                return _localizer["CanNotDeleteItemUsedInStateMachines", usedInStateMachines].Value;
            }

            List<EvneSkill> referencedInSkills = await _skillDbAccess.GetSkillsObjectIsReferencedIn(id);
            if(referencedInSkills.Count > 0)
            {
                string referencedInSkillsString = string.Join(", ", referencedInSkills.Select(n => n.Name));
                return _localizer["CanNotDeleteItemUsedInSkill", referencedInSkillsString].Value;
            }

            if(!_disableItemInventory)
            {
                List<StyrItem> referencedInItems = await ((IStyrItemDbAccess)_objectDbAccess).GetItemsByItemInInventory(id);
                if(referencedInItems.Count > 0)
                {
                    string referencedInItemsString = string.Join(", ", referencedInItems.Select(n => n.Name));
                    return _localizer["CanNotDeleteItemUsedInItemInventory", referencedInItemsString].Value;
                }
            }

            return string.Empty;
        }

        /// <summary>
        /// Returns the items which have an item in their inventory with only the main values
        /// </summary>
        /// <param name="itemId">Item id</param>
        /// <returns>Items</returns>
        [ProducesResponseType(typeof(List<StyrItem>), StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> GetItemsByItemInInventory(string itemId)
        {
            List<StyrItem> items = await ((IStyrItemDbAccess)_objectDbAccess).GetItemsByItemInInventory(itemId);
            return Ok(items);
        }

        /// <summary>
        /// Deletes additional depencendies for a flex field object
        /// </summary>
        /// <param name="flexFieldObject">Flex field object to delete</param>
        /// <returns>Task</returns>
        protected override Task DeleteAdditionalFlexFieldObjectDependencies(StyrItem flexFieldObject)
        {
            return Task.CompletedTask;
        }

        /// <summary>
        /// Runs additional updates on a flex field object
        /// </summary>
        /// <param name="flexFieldObject">Flex Field Object</param>
        /// <param name="loadedFlexFieldObject">Loaded Flex Field Object</param>
        /// <returns>Updated flex field object</returns>
        protected override Task<StyrItem> RunAdditionalUpdates(StyrItem flexFieldObject, StyrItem loadedFlexFieldObject)
        {
            if(!_disableItemInventory)
            {
                loadedFlexFieldObject.Inventory = flexFieldObject.Inventory;
            }

            return Task.FromResult(loadedFlexFieldObject);
        }

        /// <summary>
        /// Runs updates on markers
        /// </summary>
        /// <param name="flexFieldObject">Flex Field Object</param>
        /// <returns>Task</returns>
        protected override async Task RunMarkerUpdates(StyrItem flexFieldObject)
        {
            await SyncItemNameToMarkers(flexFieldObject.Id, flexFieldObject.Name);
        }

        /// <summary>
        /// Syncs the item name to markers after an update
        /// </summary>
        /// <param name="id">Id of the item</param>
        /// <param name="itemName">New item name</param>
        /// <returns>Task</returns>
        private async Task SyncItemNameToMarkers(string id, string itemName)
        {
            List<KartaMapMarkerQueryResult> markerResult = await _kartaMapDbAccess.GetAllMapsItemIsMarkedIn(id);
            foreach(KartaMapMarkerQueryResult curMapQueryResult in markerResult)
            {
                KartaMap map = await _kartaMapDbAccess.GetMapById(curMapQueryResult.MapId);
                foreach(ItemMapMarker curMarker in map.ItemMarker)
                {
                    if(curMarker.ItemId == id)
                    {
                        curMarker.ItemName = itemName;
                    }
                }
                await _kartaMapDbAccess.UpdateMap(map);
            }
        }

        /// <summary>
        /// Compares an object with the implementation snapshot
        /// </summary>
        /// <param name="flexFieldObject">Flex field object for compare</param>
        /// <returns>CompareResult Result</returns>
        protected override async Task<CompareResult> CompareObjectWithImplementationSnapshot(StyrItem flexFieldObject)
        {
            return await _implementationStatusComparer.CompareItem(flexFieldObject.Id, flexFieldObject);
        }

        /// <summary>
        /// Returns the not implemented items
        /// </summary>
        /// <param name="start">Start of the page</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Items</returns>
        [ProducesResponseType(typeof(FlexFieldObjectQueryResult), StatusCodes.Status200OK)]
        [Authorize(Roles = RoleNames.Styr)]
        [Authorize(Roles = RoleNames.ImplementationStatusTracker)]
        [HttpGet]
        public async Task<IActionResult> GetNotImplementedItems(int start, int pageSize)
        {
            GoNorthProject project = await _userProjectAccess.GetUserProject();
            Task<List<StyrItem>> queryTask;
            Task<int> countTask;
            queryTask = _objectDbAccess.GetNotImplementedFlexFieldObjects(project.Id, start, pageSize, CultureInfo.CurrentUICulture.TwoLetterISOLanguageName);
            countTask = _objectDbAccess.GetNotImplementedFlexFieldObjectsCount(project.Id, CultureInfo.CurrentUICulture.TwoLetterISOLanguageName);
            Task.WaitAll(queryTask, countTask);

            FlexFieldObjectQueryResult queryResult = new FlexFieldObjectQueryResult();
            queryResult.FlexFieldObjects = queryTask.Result;
            queryResult.HasMore = start + queryResult.FlexFieldObjects.Count < countTask.Result;
            return Ok(queryResult);
        }

    }
}