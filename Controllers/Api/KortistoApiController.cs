using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Timeline;
using GoNorth.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using GoNorth.Data.Kirja;
using Microsoft.AspNetCore.Identity;
using GoNorth.Data.User;
using GoNorth.Data.Karta;
using GoNorth.Data.Tale;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Aika;
using GoNorth.Services.ImplementationStatusCompare;
using GoNorth.Services.FlexFieldThumbnail;
using GoNorth.Data.Karta.Marker;
using GoNorth.Data.Exporting;

namespace GoNorth.Controllers.Api
{
    /// <summary>
    /// Kortisto Api controller
    /// </summary>
    [Authorize(Roles = RoleNames.Kortisto)]
    [Route("/api/[controller]/[action]")]
    public class KortistoApiController : FlexFieldBaseApiController<KortistoNpc>
    {
        /// <summary>
        /// Event used for the folder created event
        /// </summary>
        protected override TimelineEvent FolderCreatedEvent { get { return TimelineEvent.KortistoFolderCreated; } }

        /// <summary>
        /// Event used for the folder deleted event
        /// </summary>
        protected override TimelineEvent FolderDeletedEvent { get { return TimelineEvent.KortistoFolderDeleted; } }

        /// <summary>
        /// Event used for the folder updated event
        /// </summary>
        protected override TimelineEvent FolderUpdatedEvent { get { return TimelineEvent.KortistoFolderUpdated; } }


        /// <summary>
        /// Event used for the template created event
        /// </summary>
        protected override TimelineEvent TemplateCreatedEvent { get { return TimelineEvent.KortistoNpcTemplateCreated; } }

        /// <summary>
        /// Event used for the template deleted event
        /// </summary>
        protected override TimelineEvent TemplateDeletedEvent { get { return TimelineEvent.KortistoNpcTemplateDeleted; } }

        /// <summary>
        /// Event used for the template updated event
        /// </summary>
        protected override TimelineEvent TemplateUpdatedEvent { get { return TimelineEvent.KortistoNpcTemplateUpdated; } }

        /// <summary>
        /// Event used for the template fields distributed event
        /// </summary>
        protected override TimelineEvent TemplateFieldsDistributedEvent { get { return TimelineEvent.KortistoNpcTemplateFieldsDistributed; } }

        /// <summary>
        /// Event used for the flex field template image updated event
        /// </summary>
        protected override TimelineEvent TemplateImageUploadEvent { get { return TimelineEvent.KortistoNpcTemplateImageUpload; } }


        /// <summary>
        /// Event used for the flex field object created event
        /// </summary>
        protected override TimelineEvent ObjectCreatedEvent { get { return TimelineEvent.KortistoNpcCreated; } }

        /// <summary>
        /// Event used for the flex field object deleted event
        /// </summary>
        protected override TimelineEvent ObjectDeletedEvent { get { return TimelineEvent.KortistoNpcDeleted; } }

        /// <summary>
        /// Event used for the flex field object updated event
        /// </summary>
        protected override TimelineEvent ObjectUpdatedEvent { get { return TimelineEvent.KortistoNpcUpdated; } }

        /// <summary>
        /// Event used for the flex field object image updated event
        /// </summary>
        protected override TimelineEvent ObjectImageUploadEvent { get { return TimelineEvent.KortistoNpcImageUpload; } }


        /// <summary>
        /// Aika Quest DB Access
        /// </summary>
        private readonly IAikaQuestDbAccess _aikaQuestDbAccess;

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
        /// Constructor
        /// </summary>
        /// <param name="folderDbAccess">Folder Db Access</param>
        /// <param name="templateDbAccess">Template Db Access</param>
        /// <param name="npcDbAccess">Npc Db Access</param>
        /// <param name="projectDbAccess">User Db Access</param>
        /// <param name="tagDbAccess">Tag Db Access</param>
        /// <param name="exportTemplateDbAccess">Export Template Db Access</param>
        /// <param name="languageKeyDbAccess">Language Key Db Access</param>
        /// <param name="imageAccess">Npc Image Access</param>
        /// <param name="thumbnailService">Thumbnail Service</param>
        /// <param name="aikaQuestDbAccess">Aika Quest Db Access</param>
        /// <param name="taleDbAccess">Tale Db Access</param>
        /// <param name="kirjaPageDbAccess">Kirja Page Db Access</param>
        /// <param name="kartaMapDbAccess">Karta Map Db Access</param>
        /// <param name="userManager">User Manager</param>
        /// <param name="implementationStatusComparer">Implementation Status Comparer</param>
        /// <param name="timelineService">Timeline Service</param>
        /// <param name="logger">Logger</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public KortistoApiController(IKortistoFolderDbAccess folderDbAccess, IKortistoNpcTemplateDbAccess templateDbAccess, IKortistoNpcDbAccess npcDbAccess, IProjectDbAccess projectDbAccess, IKortistoNpcTagDbAccess tagDbAccess, IExportTemplateDbAccess exportTemplateDbAccess, 
                                     ILanguageKeyDbAccess languageKeyDbAccess, IKortistoNpcImageAccess imageAccess, IKortistoThumbnailService thumbnailService, IAikaQuestDbAccess aikaQuestDbAccess, ITaleDbAccess taleDbAccess, IKirjaPageDbAccess kirjaPageDbAccess, 
                                     IKartaMapDbAccess kartaMapDbAccess, UserManager<GoNorthUser> userManager, IImplementationStatusComparer implementationStatusComparer, ITimelineService timelineService, ILogger<KortistoApiController> logger, IStringLocalizerFactory localizerFactory) 
                                     : base(folderDbAccess, templateDbAccess, npcDbAccess, projectDbAccess, tagDbAccess, exportTemplateDbAccess, languageKeyDbAccess, imageAccess, thumbnailService, userManager, implementationStatusComparer, timelineService, logger, localizerFactory)
        {
            _aikaQuestDbAccess = aikaQuestDbAccess;
            _taleDbAccess = taleDbAccess;
            _kirjaPageDbAccess = kirjaPageDbAccess;
            _kartaMapDbAccess = kartaMapDbAccess;
        }

        /// <summary>
        /// Creates a new npc template
        /// </summary>
        /// <param name="template">Template to create</param>
        /// <returns>Result</returns>
        [Authorize(Roles = RoleNames.KortistoTemplateManager)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CreateFlexFieldTemplate([FromBody]KortistoNpc template)
        {
            return await BaseCreateFlexFieldTemplate(template);
        }

        /// <summary>
        /// Deletes a npc template
        /// </summary>
        /// <param name="id">Id of the template</param>
        /// <returns>Result Status Code</returns>
        [Authorize(Roles = RoleNames.KortistoTemplateManager)]
        [HttpDelete]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteFlexFieldTemplate(string id)
        {
            return await BaseDeleteFlexFieldTemplate(id);
        }

        /// <summary>
        /// Updates a npc template 
        /// </summary>
        /// <param name="id">Template Id</param>
        /// <param name="template">Update template data</param>
        /// <returns>Result Status Code</returns>
        [Authorize(Roles = RoleNames.KortistoTemplateManager)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateFlexFieldTemplate(string id, [FromBody]KortistoNpc template)
        {
            return await BaseUpdateFlexFieldTemplate(id, template);
        }

        /// <summary>
        /// Distributes the fields of a template
        /// </summary>
        /// <param name="id">Template Id</param>
        /// <returns>Task</returns>
        [Authorize(Roles = RoleNames.KortistoTemplateManager)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DistributeFlexFieldTemplateFields(string id)
        {
            return await BaseDistributeFlexFieldTemplateFields(id);
        }

        /// <summary>
        /// Uploads an image to an npc template
        /// </summary>
        /// <param name="id">Id of the template</param>
        /// <returns>Image Name</returns>
        [Authorize(Roles = RoleNames.KortistoTemplateManager)]
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
        protected override KortistoNpc StripObject(KortistoNpc flexFieldObject)
        {
            if(!User.IsInRole(RoleNames.Styr))
            {
                flexFieldObject.Inventory = new List<KortistoInventoryItem>();
            }

            if(!User.IsInRole(RoleNames.Evne))
            {
                flexFieldObject.Skills = new List<KortistoNpcSkill>();
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
                return _localizer["CanNotDeleteNpcReferencedInAikaQuest", referencedInQuests].Value;
            }

            List<KirjaPage> kirjaPages = await _kirjaPageDbAccess.GetPagesByNpc(id);
            if(kirjaPages.Count > 0)
            {
                string mentionedInPages = string.Join(", ", kirjaPages.Select(p => p.Name));
                return _localizer["CanNotDeleteNpcMentionedInKirjaPage", mentionedInPages].Value;
            }

            List<KartaMapMarkerQueryResult> kartaMaps = await _kartaMapDbAccess.GetAllMapsNpcIsMarkedIn(id);
            if(kartaMaps.Count > 0)
            {
                string markedInMaps = string.Join(", ", kartaMaps.Select(m => m.Name));
                return _localizer["CanNotDeleteNpcMarkedInKartaMap", markedInMaps].Value;
            }

            List<TaleDialog> taleDialogs = await _taleDbAccess.GetDialogsObjectIsReferenced(id);
            taleDialogs = taleDialogs.Where(t => t.RelatedObjectId != id).ToList();
            if(taleDialogs.Count > 0)
            {
                List<KortistoNpc> npcs = await _objectDbAccess.ResolveFlexFieldObjectNames(taleDialogs.Select(t => t.RelatedObjectId).ToList());
                string referencedInDialogs = string.Join(", ", npcs.Select(n => n.Name));
                return _localizer["CanNotDeleteNpcReferencedInTaleDialog", referencedInDialogs].Value;
            }

            return string.Empty;
        }

        /// <summary>
        /// Deletes additional depencendies for a flex field object
        /// </summary>
        /// <param name="flexFieldObject">Flex field object to delete</param>
        /// <returns>Task</returns>
        protected override async Task DeleteAdditionalFlexFieldObjectDependencies(KortistoNpc flexFieldObject)
        {
            TaleDialog dialog = await _taleDbAccess.GetDialogByRelatedObjectId(flexFieldObject.Id);
            if(dialog != null)
            {
                await _taleDbAccess.DeleteDialog(dialog);
            }
            _logger.LogInformation("Dialog was deleted.");
        }

        /// <summary>
        /// Runs additional updates on a flex field object
        /// </summary>
        /// <param name="flexFieldObject">Flex Field Object</param>
        /// <param name="loadedFlexFieldObject">Loaded Flex Field Object</param>
        /// <returns>Updated flex field object</returns>
        protected override async Task<KortistoNpc> RunAdditionalUpdates(KortistoNpc flexFieldObject, KortistoNpc loadedFlexFieldObject)
        {
            if(User.IsInRole(RoleNames.KortistoPlayerManager))
            {
                if(flexFieldObject.IsPlayerNpc && loadedFlexFieldObject.IsPlayerNpc != flexFieldObject.IsPlayerNpc)
                {
                    GoNorthProject project = await _projectDbAccess.GetDefaultProject();
                    await ((IKortistoNpcDbAccess)_objectDbAccess).ResetPlayerFlagForAllNpcs(project.Id);
                }
                loadedFlexFieldObject.IsPlayerNpc = flexFieldObject.IsPlayerNpc;
            }

            loadedFlexFieldObject.NameGenTemplate = flexFieldObject.NameGenTemplate;

            if(User.IsInRole(RoleNames.Styr))
            {
                loadedFlexFieldObject.Inventory = flexFieldObject.Inventory;
            }

            if(User.IsInRole(RoleNames.Evne))
            {
                loadedFlexFieldObject.Skills = flexFieldObject.Skills;
            }
            
            return loadedFlexFieldObject;
        }

        /// <summary>
        /// Runs updates on markers
        /// </summary>
        /// <param name="flexFieldObject">Flex Field Object</param>
        /// <returns>Task</returns>
        protected override async Task RunMarkerUpdates(KortistoNpc flexFieldObject)
        {
            await SyncNpcNameToMarkers(flexFieldObject.Id, flexFieldObject.Name);
        }

        /// <summary>
        /// Syncs the npc name to markers after an update
        /// </summary>
        /// <param name="id">Id of the npc</param>
        /// <param name="npcName">New npc name</param>
        /// <returns>Task</returns>
        private async Task SyncNpcNameToMarkers(string id, string npcName)
        {
            List<KartaMapMarkerQueryResult> markerResult = await _kartaMapDbAccess.GetAllMapsNpcIsMarkedIn(id);
            foreach(KartaMapMarkerQueryResult curMapQueryResult in markerResult)
            {
                KartaMap map = await _kartaMapDbAccess.GetMapById(curMapQueryResult.MapId);
                foreach(NpcMapMarker curMarker in map.NpcMarker)
                {
                    if(curMarker.NpcId == id)
                    {
                        curMarker.NpcName = npcName;
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
        protected override async Task<CompareResult> CompareObjectWithImplementationSnapshot(KortistoNpc flexFieldObject)
        {
            return await _implementationStatusComparer.CompareNpc(flexFieldObject.Id, flexFieldObject);
        }


        /// <summary>
        /// Returns the player npc
        /// </summary>
        /// <returns>Npc</returns>
        [HttpGet]
        public async Task<IActionResult> PlayerNpc()
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();
            KortistoNpc npc = await ((IKortistoNpcDbAccess)_objectDbAccess).GetPlayerNpc(project.Id);
            return Ok(npc);
        }

        /// <summary>
        /// Returns the npcs which have an item in their inventory with only the main values
        /// </summary>
        /// <param name="itemId">Item id</param>
        /// <returns>Npcs</returns>
        [HttpGet]
        public async Task<IActionResult> GetNpcsByItemInInventory(string itemId)
        {
            List<KortistoNpc> npcs = await ((IKortistoNpcDbAccess)_objectDbAccess).GetNpcsByItemInInventory(itemId);
            return Ok(npcs);
        }

        /// <summary>
        /// Returns the npcs which have learned a skill with only the main values
        /// </summary>
        /// <param name="skillId">Skill id</param>
        /// <returns>Npcs</returns>
        [HttpGet]
        public async Task<IActionResult> GetNpcsByLearnedSkill(string skillId)
        {
            List<KortistoNpc> npcs = await ((IKortistoNpcDbAccess)_objectDbAccess).GetNpcsByLearnedSkill(skillId);
            return Ok(npcs);
        }


        /// <summary>
        /// Returns the not implemented npcs
        /// </summary>
        /// <param name="start">Start of the page</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Npcs</returns>
        [Authorize(Roles = RoleNames.Kortisto)]
        [Authorize(Roles = RoleNames.ImplementationStatusTracker)]
        [HttpGet]
        public async Task<IActionResult> GetNotImplementedNpcs(int start, int pageSize)
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();
            Task<List<KortistoNpc>> queryTask;
            Task<int> countTask;
            queryTask = _objectDbAccess.GetNotImplementedFlexFieldObjects(project.Id, start, pageSize);
            countTask = _objectDbAccess.GetNotImplementedFlexFieldObjectsCount(project.Id);
            Task.WaitAll(queryTask, countTask);

            FlexFieldObjectQueryResult queryResult = new FlexFieldObjectQueryResult();
            queryResult.FlexFieldObjects = queryTask.Result;
            queryResult.HasMore = start + queryResult.FlexFieldObjects.Count < countTask.Result;
            return Ok(queryResult);
        }

    }
}