using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Timeline;
using GoNorth.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using GoNorth.Data.Kirja;
using Microsoft.AspNetCore.Identity;
using GoNorth.Data.User;
using GoNorth.Data.Karta;
using GoNorth.Data.Tale;
using GoNorth.Data.Aika;
using GoNorth.Services.ImplementationStatusCompare;
using GoNorth.Services.FlexFieldThumbnail;
using GoNorth.Data.Karta.Marker;
using GoNorth.Data.Exporting;
using GoNorth.Services.Security;
using GoNorth.Services.ProjectConfig;
using GoNorth.Data.ProjectConfig;
using Microsoft.AspNetCore.Http;
using System.Globalization;
using GoNorth.Services.CsvHandling;
using GoNorth.Services.Project;
using GoNorth.Services.Export.ExportSnippets;
using GoNorth.Data.Evne;

namespace GoNorth.Controllers.Api
{
    /// <summary>
    /// Kortisto Api controller
    /// </summary>
    [ApiController]
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
        /// Event used for the folder moved to folder event
        /// </summary>
        protected override TimelineEvent FolderMovedToFolderEvent { get { return TimelineEvent.KortistoFolderMovedToFolder; } }

        /// <summary>
        /// Event used for the folder moved to root level event
        /// </summary>
        protected override TimelineEvent FolderMovedToRootEvent { get { return TimelineEvent.KortistoFolderMovedToRootFolder; } }


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
        /// Event used for the object moved to folder event
        /// </summary>
        protected override TimelineEvent ObjectMovedToFolderEvent { get { return TimelineEvent.KortistoNpcMovedToFolder; } }

        /// <summary>
        /// Event used for the object moved to root level event
        /// </summary>
        protected override TimelineEvent ObjectMovedToRootEvent { get { return TimelineEvent.KortistoNpcMovedToRoot; } }


        /// <summary>
        /// Event used for the value file import event
        /// </summary>
        protected override TimelineEvent ValueFileImportEvent { get { return TimelineEvent.KortistoValueFileImport; } }


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
        /// Project Config provider
        /// </summary>
        private readonly IProjectConfigProvider _projectConfigProvider;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="folderDbAccess">Folder Db Access</param>
        /// <param name="templateDbAccess">Template Db Access</param>
        /// <param name="npcDbAccess">Npc Db Access</param>
        /// <param name="tagDbAccess">Tag Db Access</param>
        /// <param name="exportTemplateDbAccess">Export Template Db Access</param>
        /// <param name="importFieldValuesLogDbAccess">Import field values log Db Access</param>
        /// <param name="languageKeyDbAccess">Language Key Db Access</param>
        /// <param name="exportFunctionIdDbAccess">Export Function Id Db Access</param>
        /// <param name="objectExportSnippetDbAccess">Object export snippet Db Access</param>
        /// <param name="objectExportSnippetSnapshotDbAccess">Object export snippet snapshot Db Access</param>
        /// <param name="exportSnippetRelatedObjectNameResolver">Service that will resolve export snippet related object names</param>
        /// <param name="imageAccess">Npc Image Access</param>
        /// <param name="thumbnailService">Thumbnail Service</param>
        /// <param name="aikaQuestDbAccess">Aika Quest Db Access</param>
        /// <param name="skillDbAccess">Skill Db Access</param>
        /// <param name="taleDbAccess">Tale Db Access</param>
        /// <param name="kirjaPageDbAccess">Kirja Page Db Access</param>
        /// <param name="kartaMapDbAccess">Karta Map Db Access</param>
        /// <param name="userProjectAccess">User project access</param>
        /// <param name="projectConfigProvider">Project config provider</param>
        /// <param name="csvGenerator">CSV Generator</param>
        /// <param name="csvReader">CSV Reader</param>
        /// <param name="userManager">User Manager</param>
        /// <param name="implementationStatusComparer">Implementation Status Comparer</param>
        /// <param name="timelineService">Timeline Service</param>
        /// <param name="xssChecker">Xss Checker</param>
        /// <param name="logger">Logger</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public KortistoApiController(IKortistoFolderDbAccess folderDbAccess, IKortistoNpcTemplateDbAccess templateDbAccess, IKortistoNpcDbAccess npcDbAccess, IKortistoNpcTagDbAccess tagDbAccess, IExportTemplateDbAccess exportTemplateDbAccess, IKortistoImportFieldValuesLogDbAccess importFieldValuesLogDbAccess,
                                     ILanguageKeyDbAccess languageKeyDbAccess, IExportFunctionIdDbAccess exportFunctionIdDbAccess, IObjectExportSnippetDbAccess objectExportSnippetDbAccess, IObjectExportSnippetSnapshotDbAccess objectExportSnippetSnapshotDbAccess, IExportSnippetRelatedObjectNameResolver exportSnippetRelatedObjectNameResolver, 
                                     IKortistoNpcImageAccess imageAccess, IKortistoThumbnailService thumbnailService, IAikaQuestDbAccess aikaQuestDbAccess, IEvneSkillDbAccess skillDbAccess, ITaleDbAccess taleDbAccess, IKirjaPageDbAccess kirjaPageDbAccess, IKartaMapDbAccess kartaMapDbAccess, IUserProjectAccess userProjectAccess, 
                                     IProjectConfigProvider projectConfigProvider, ICsvGenerator csvGenerator, ICsvParser csvReader, UserManager<GoNorthUser> userManager, IImplementationStatusComparer implementationStatusComparer, ITimelineService timelineService, IXssChecker xssChecker, ILogger<KortistoApiController> logger, 
                                     IStringLocalizerFactory localizerFactory) 
                                     : base(folderDbAccess, templateDbAccess, npcDbAccess, tagDbAccess, exportTemplateDbAccess, importFieldValuesLogDbAccess, languageKeyDbAccess, exportFunctionIdDbAccess, objectExportSnippetDbAccess, objectExportSnippetSnapshotDbAccess, exportSnippetRelatedObjectNameResolver, userProjectAccess, imageAccess, thumbnailService, 
                                            csvGenerator, csvReader, userManager, implementationStatusComparer, timelineService, xssChecker, logger, localizerFactory)
        {
            _aikaQuestDbAccess = aikaQuestDbAccess;
            _skillDbAccess = skillDbAccess;
            _taleDbAccess = taleDbAccess;
            _kirjaPageDbAccess = kirjaPageDbAccess;
            _kartaMapDbAccess = kartaMapDbAccess;
            _projectConfigProvider = projectConfigProvider;
        }

        /// <summary>
        /// Creates a new npc template
        /// </summary>
        /// <param name="template">Template to create</param>
        /// <returns>Result</returns>
        [ProducesResponseType(typeof(KortistoNpc), StatusCodes.Status200OK)]
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
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
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
        [ProducesResponseType(typeof(KortistoNpc), StatusCodes.Status200OK)]
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
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
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
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
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

            List<KortistoNpc> referencedInDailyRoutines = await ((IKortistoNpcDbAccess)_objectDbAccess).GetNpcsObjectIsReferencedInDailyRoutine(id);
            if(referencedInDailyRoutines.Count > 0)
            {
                string usedInDailyRoutines = string.Join(", ", referencedInDailyRoutines.Select(m => m.Name));
                return _localizer["CanNotDeleteNpcUsedInDailyRoutine", usedInDailyRoutines].Value;
            }

            List<EvneSkill> referencedInSkills = await _skillDbAccess.GetSkillsObjectIsReferencedIn(id);
            if(referencedInSkills.Count > 0)
            {
                string referencedInSkillsString = string.Join(", ", referencedInSkills.Select(n => n.Name));
                return _localizer["CanNotDeleteNpcUsedInSkill", referencedInSkillsString].Value;
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
        /// Checks if an update is valid
        /// </summary>
        /// <param name="flexFieldObject">Flex Field Object</param>
        /// <param name="loadedFlexFieldObject">Loaded Flex Field Object</param>
        /// <returns>Empty string if update is valid, error string if update is not valid</returns>
        protected override async Task<string> CheckUpdateValid(KortistoNpc flexFieldObject, KortistoNpc loadedFlexFieldObject)
        { 
            return await CheckForDeletedReferencedDailyRoutines(flexFieldObject, loadedFlexFieldObject);
        }

        /// <summary>
        /// Checks if an update is valid
        /// </summary>
        /// <param name="flexFieldObject">Flex Field Object</param>
        /// <param name="loadedFlexFieldObject">Loaded Flex Field Object</param>
        /// <returns>Empty string if update is valid, error string if update is not valid</returns>
        private async Task<string> CheckForDeletedReferencedDailyRoutines(KortistoNpc flexFieldObject, KortistoNpc loadedFlexFieldObject)
        {
            List<string> oldEventIds = new List<string>();
            if(loadedFlexFieldObject.DailyRoutine != null)
            {
                oldEventIds = loadedFlexFieldObject.DailyRoutine.Select(e => e.EventId).ToList();
            }

            List<string> newEventIds = new List<string>();
            if(flexFieldObject.DailyRoutine != null)
            {
                newEventIds = flexFieldObject.DailyRoutine.Select(e => e.EventId).ToList();
            }

            oldEventIds = oldEventIds.Except(newEventIds).ToList();
            if(!oldEventIds.Any())
            {
                return string.Empty;
            }

            // Check Events
            foreach(string curDeletedEventId in oldEventIds)
            {
                List<KortistoNpc> usedNpcs = await ((IKortistoNpcDbAccess)_objectDbAccess).GetNpcsObjectIsReferencedInDailyRoutine(curDeletedEventId);
                usedNpcs = usedNpcs.Where(n => n.Id != loadedFlexFieldObject.Id).ToList();
                if(usedNpcs.Count > 0)
                {
                    string referencedInNpcs = string.Join(", ", usedNpcs.Select(p => p.Name));
                    return _localizer["CanNotDeleteDailyRoutineEventReferencedInNpc", FormatDailyRoutineEventTime(loadedFlexFieldObject.DailyRoutine, curDeletedEventId), referencedInNpcs].Value;
                }

                List<TaleDialog> taleDialogs = await _taleDbAccess.GetDialogsObjectIsReferenced(curDeletedEventId);
                if(taleDialogs.Count > 0)
                {
                    List<KortistoNpc> npcs = await _objectDbAccess.ResolveFlexFieldObjectNames(taleDialogs.Select(t => t.RelatedObjectId).ToList());
                    string referencedInDialogs = string.Join(", ", npcs.Select(n => n.Name));
                    return _localizer["CanNotDeleteDailyRoutineEventReferencedInTaleDialog", FormatDailyRoutineEventTime(loadedFlexFieldObject.DailyRoutine, curDeletedEventId), referencedInDialogs].Value;
                }

                List<AikaQuest> aikaQuests = await _aikaQuestDbAccess.GetQuestsObjectIsReferenced(curDeletedEventId);
                if(aikaQuests.Count > 0)
                {
                    string referencedInQuests = string.Join(", ", aikaQuests.Select(p => p.Name));
                    return _localizer["CanNotDeleteDailyRoutineEventReferencedInAikaQuest", FormatDailyRoutineEventTime(loadedFlexFieldObject.DailyRoutine, curDeletedEventId), referencedInQuests].Value;
                }

                List<EvneSkill> referencedInSkills = await _skillDbAccess.GetSkillsObjectIsReferencedIn(curDeletedEventId);
                if(referencedInSkills.Count > 0)
                {
                    string usedInSkills = string.Join(", ", referencedInSkills.Select(m => m.Name));
                    return _localizer["CanNotDeleteDailyRoutineEventReferencedInSkill", FormatDailyRoutineEventTime(loadedFlexFieldObject.DailyRoutine, curDeletedEventId), usedInSkills].Value;
                }
                
                List<ObjectExportSnippet> referencedInSnippets = await _objectExportSnippetDbAccess.GetExportSnippetsObjectIsReferenced(curDeletedEventId);
                if(referencedInSnippets.Count > 0)
                {
                    List<ObjectExportSnippetReference> references = await _exportSnippetRelatedObjectNameResolver.ResolveExportSnippetReferences(referencedInSnippets, true, true, true);
                    string usedInDailyRoutines = string.Join(", ", references.Select(m => string.Format("{0} ({1})", m.ObjectName, m.ExportSnippet)));
                    return _localizer["CanNotDeleteDailyRoutineEventUsedInExportSnippet", FormatDailyRoutineEventTime(loadedFlexFieldObject.DailyRoutine, curDeletedEventId), usedInDailyRoutines].Value;
                }
            }

            return string.Empty;
        }

        /// <summary>
        /// Formats the daily routine event time
        /// </summary>
        /// <param name="dailyRoutines">Daily routines</param>
        /// <param name="deletedEventId">Event Id</param>
        /// <returns>Formatted Routine Event</returns>
        private string FormatDailyRoutineEventTime(List<KortistoNpcDailyRoutineEvent> dailyRoutines, string deletedEventId)
        {
            KortistoNpcDailyRoutineEvent dailyRoutineEvent = dailyRoutines.FirstOrDefault(d => d.EventId == deletedEventId);
            if(dailyRoutineEvent == null)
            {
                return string.Empty;
            }

            string timeFormat = _localizer["TimeFormat"].Value;
            if(dailyRoutineEvent.EarliestTime.Hours == dailyRoutineEvent.LatestTime.Hours && dailyRoutineEvent.EarliestTime.Minutes == dailyRoutineEvent.LatestTime.Minutes)
            {
                return dailyRoutineEvent.EarliestTime.ToString(timeFormat);
            }

            string earliestTime = dailyRoutineEvent.EarliestTime.ToString(timeFormat);
            string latestTime = dailyRoutineEvent.LatestTime.ToString(timeFormat);
            return string.Format("{0} - {1}", earliestTime, latestTime);
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
                    await ((IKortistoNpcDbAccess)_objectDbAccess).ResetPlayerFlagForAllNpcs(loadedFlexFieldObject.ProjectId);
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

            loadedFlexFieldObject.DailyRoutine = flexFieldObject.DailyRoutine;
            if(loadedFlexFieldObject.DailyRoutine != null)
            {
                foreach(KortistoNpcDailyRoutineEvent curEvent in loadedFlexFieldObject.DailyRoutine)
                {
                    if(string.IsNullOrEmpty(curEvent.EventId))
                    {
                        curEvent.EventId = Guid.NewGuid().ToString();
                    }
                }
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
        /// Saves a single daily routine event
        /// </summary>
        /// <param name="id">Id of the npc to update the daily routine for</param>
        /// <param name="routineEvent">Event data</param>
        /// <returns>Id of the event</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpPost]
        public async Task<IActionResult> SaveDailyRoutineEvent(string id, [FromBody]KortistoNpcDailyRoutineEvent routineEvent)
        {
            KortistoNpc npc = await _objectDbAccess.GetFlexFieldObjectById(id);
            if(npc == null)
            {
                return NotFound();
            }

            // Update / Create event
            if(npc.DailyRoutine == null)
            {
                npc.DailyRoutine = new List<KortistoNpcDailyRoutineEvent>();
            }

            if(string.IsNullOrEmpty(routineEvent.EventId))
            {
                routineEvent.EventId = Guid.NewGuid().ToString();
                npc.DailyRoutine.Add(routineEvent);
            }
            else
            {
                int targetIndex = npc.DailyRoutine.FindIndex(d => d.EventId == routineEvent.EventId);
                if(targetIndex == -1)
                {
                    return BadRequest();
                }

                npc.DailyRoutine[targetIndex] = routineEvent;
            }

            await SaveNpcAfterEventUpdate(npc);

            return Ok(routineEvent.EventId);
        }

        /// <summary>
        /// Deletes a single daily routine event
        /// </summary>
        /// <param name="id">Id of the npc to delete the daily routine for</param>
        /// <param name="eventId">Event id</param>
        /// <returns>Id of the event</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpDelete]
        public async Task<IActionResult> DeleteDailyRoutineEvent(string id, string eventId)
        {
            KortistoNpc npc = await _objectDbAccess.GetFlexFieldObjectById(id);
            if(npc == null)
            {
                return NotFound();
            }

            // Delete event
            if(npc.DailyRoutine == null)
            {
                return NotFound();
            }

            int removeCount = npc.DailyRoutine.RemoveAll(e => e.EventId == eventId);
            if(removeCount == 0)
            {
                return NotFound();
            }

            await SaveNpcAfterEventUpdate(npc);

            return Ok(eventId);
        }

        /// <summary>
        /// Saves a npc after an event update
        /// </summary>
        /// <param name="npc">Npc to save</param>
        /// <returns>Task</returns>
        private async Task SaveNpcAfterEventUpdate(KortistoNpc npc)
        {
            await this.SetModifiedData(_userManager, npc);
            await SetNotImplementedFlagOnChange(npc);
            await _objectDbAccess.UpdateFlexFieldObject(npc);
            await _timelineService.AddTimelineEntry(npc.ProjectId, ObjectUpdatedEvent, npc.Name, npc.Id);
        }


        /// <summary>
        /// Returns all npcs that have a daily routine with events outside of the configured time frame
        /// </summary>
        /// <returns>Npcs that have a daily routine with events outside of the configured time frame</returns>
        [ProducesResponseType(typeof(List<KortistoNpc>), StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> GetNpcsWithDailyRoutineOutsideTimeRange()
        {
            GoNorthProject defaultProject = await _userProjectAccess.GetUserProject();
            MiscProjectConfig miscConfig = await _projectConfigProvider.GetMiscConfig(defaultProject.Id);

            List<KortistoNpc> npcs = await ((IKortistoNpcDbAccess)_objectDbAccess).GetNpcsWithDailyRoutineAfterTime(miscConfig.HoursPerDay, miscConfig.MinutesPerHour);
            return Ok(npcs);
        }

        /// <summary>
        /// Returns all npcs an object is referenced in the daily routine (not including the relatedobjectid itself)
        /// </summary>
        /// <param name="objectId">Object id</param>
        /// <returns>Dialogs</returns>
        [ProducesResponseType(typeof(List<KortistoNpc>), StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> GetNpcsObjectIsReferencedInDailyRoutine(string objectId)
        {
            List<KortistoNpc> npcs = await ((IKortistoNpcDbAccess)_objectDbAccess).GetNpcsObjectIsReferencedInDailyRoutine(objectId);
            return Ok(npcs);
        }


        /// <summary>
        /// Returns the player npc
        /// </summary>
        /// <returns>Npc</returns>
        [ProducesResponseType(typeof(KortistoNpc), StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> PlayerNpc()
        {
            GoNorthProject project = await _userProjectAccess.GetUserProject();
            KortistoNpc npc = await ((IKortistoNpcDbAccess)_objectDbAccess).GetPlayerNpc(project.Id);
            return Ok(npc);
        }

        /// <summary>
        /// Returns the npcs which have an item in their inventory with only the main values
        /// </summary>
        /// <param name="itemId">Item id</param>
        /// <returns>Npcs</returns>
        [ProducesResponseType(typeof(List<KortistoNpc>), StatusCodes.Status200OK)]
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
        [ProducesResponseType(typeof(List<KortistoNpc>), StatusCodes.Status200OK)]
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
        [ProducesResponseType(typeof(FlexFieldObjectQueryResult), StatusCodes.Status200OK)]
        [Authorize(Roles = RoleNames.Kortisto)]
        [Authorize(Roles = RoleNames.ImplementationStatusTracker)]
        [HttpGet]
        public async Task<IActionResult> GetNotImplementedNpcs(int start, int pageSize)
        {
            GoNorthProject project = await _userProjectAccess.GetUserProject();
            Task<List<KortistoNpc>> queryTask;
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