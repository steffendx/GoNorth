using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Project;
using GoNorth.Services.Timeline;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Identity;
using GoNorth.Data.User;
using GoNorth.Services.ImplementationStatusCompare;
using GoNorth.Data.Evne;
using GoNorth.Data.NodeGraph;
using GoNorth.Data.Kortisto;
using System.Linq;
using GoNorth.Data.Kirja;
using GoNorth.Data.Aika;
using GoNorth.Data.Tale;
using GoNorth.Services.FlexFieldThumbnail;
using GoNorth.Data.Exporting;
using GoNorth.Services.Security;
using System.Globalization;
using Microsoft.AspNetCore.Http;
using GoNorth.Services.CsvHandling;
using GoNorth.Services.Project;
using GoNorth.Services.Export.ExportSnippets;
using GoNorth.Data.StateMachines;

namespace GoNorth.Controllers.Api
{
    /// <summary>
    /// Evne Api controller
    /// </summary>
    [ApiController]
    [Authorize(Roles = RoleNames.Evne)]
    [Route("/api/[controller]/[action]")]
    public class EvneApiController : FlexFieldBaseApiController<EvneSkill>
    {
        /// <summary>
        /// Event used for the folder created event
        /// </summary>
        protected override TimelineEvent FolderCreatedEvent { get { return TimelineEvent.EvneFolderCreated; } }

        /// <summary>
        /// Event used for the folder deleted event
        /// </summary>
        protected override TimelineEvent FolderDeletedEvent { get { return TimelineEvent.EvneFolderDeleted; } }

        /// <summary>
        /// Event used for the folder updated event
        /// </summary>
        protected override TimelineEvent FolderUpdatedEvent { get { return TimelineEvent.EvneFolderUpdated; } }
        
        /// <summary>
        /// Event used for the folder moved to folder event
        /// </summary>
        protected override TimelineEvent FolderMovedToFolderEvent { get { return TimelineEvent.EvneFolderMovedToFolder; } }

        /// <summary>
        /// Event used for the folder moved to root level event
        /// </summary>
        protected override TimelineEvent FolderMovedToRootEvent { get { return TimelineEvent.EvneFolderMovedToRootFolder; } }


        /// <summary>
        /// Event used for the template created event
        /// </summary>
        protected override TimelineEvent TemplateCreatedEvent { get { return TimelineEvent.EvneSkillTemplateCreated; } }

        /// <summary>
        /// Event used for the template deleted event
        /// </summary>
        protected override TimelineEvent TemplateDeletedEvent { get { return TimelineEvent.EvneSkillTemplateDeleted; } }

        /// <summary>
        /// Event used for the template updated event
        /// </summary>
        protected override TimelineEvent TemplateUpdatedEvent { get { return TimelineEvent.EvneSkillTemplateUpdated; } }

        /// <summary>
        /// Event used for the template fields distributed event
        /// </summary>
        protected override TimelineEvent TemplateFieldsDistributedEvent { get { return TimelineEvent.EvneSkillTemplateFieldsDistributed; } }

        /// <summary>
        /// Event used for the flex field template image updated event
        /// </summary>
        protected override TimelineEvent TemplateImageUploadEvent { get { return TimelineEvent.EvneSkillTemplateImageUpload; } }


        /// <summary>
        /// Event used for the flex field object created event
        /// </summary>
        protected override TimelineEvent ObjectCreatedEvent { get { return TimelineEvent.EvneSkillCreated; } }

        /// <summary>
        /// Event used for the flex field object deleted event
        /// </summary>
        protected override TimelineEvent ObjectDeletedEvent { get { return TimelineEvent.EvneSkillDeleted; } }

        /// <summary>
        /// Event used for the flex field object updated event
        /// </summary>
        protected override TimelineEvent ObjectUpdatedEvent { get { return TimelineEvent.EvneSkillUpdated; } }

        /// <summary>
        /// Event used for the flex field object image updated event
        /// </summary>
        protected override TimelineEvent ObjectImageUploadEvent { get { return TimelineEvent.EvneSkillImageUpload; } }
                
        /// <summary>
        /// Event used for the object moved to folder event
        /// </summary>
        protected override TimelineEvent ObjectMovedToFolderEvent { get { return TimelineEvent.EvneSkillMovedToFolder; } }

        /// <summary>
        /// Event used for the object moved to root level event
        /// </summary>
        protected override TimelineEvent ObjectMovedToRootEvent { get { return TimelineEvent.EvneSkillMovedToRoot; } }


        /// <summary>
        /// Event used for the value file import event
        /// </summary>
        protected override TimelineEvent ValueFileImportEvent { get { return TimelineEvent.EvneValueFileImport; } }


        /// <summary>
        /// Aika Quest Db Access
        /// </summary>
        private readonly IAikaQuestDbAccess _aikaQuestDbAccess;

        /// <summary>
        /// Tale Db Access
        /// </summary>
        private readonly ITaleDbAccess _taleDbAccess;

        /// <summary>
        /// Kirja Page Db Access
        /// </summary>
        private readonly IKirjaPageDbAccess _kirjaPageDbAccess;

        /// <summary>
        /// Kortisto Npc Db Access
        /// </summary>
        private readonly IKortistoNpcDbAccess _kortistoNpcDbAccess;

        /// <summary>
        /// Npc Template Db Access
        /// </summary>
        private readonly IKortistoNpcTemplateDbAccess _npcTemplateDbAccess;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="folderDbAccess">Folder Db Access</param>
        /// <param name="templateDbAccess">Template Db Access</param>
        /// <param name="skillDbAccess">Skill Db Access</param>
        /// <param name="tagDbAccess">Tag Db Access</param>
        /// <param name="exportTemplateDbAccess">Export Template Db Access</param>
        /// <param name="importFieldValuesLogDbAccess">Import field values log Db Access</param>
        /// <param name="languageKeyDbAccess">Language Key Db Access</param>
        /// <param name="exportFunctionIdDbAccess">Export Function Id Db Access</param>
        /// <param name="objectExportSnippetDbAccess">Object export snippet Db Access</param>
        /// <param name="objectExportSnippetSnapshotDbAccess">Object export snippet snapshot Db Access</param>
        /// <param name="exportSnippetRelatedObjectNameResolver">Service that will resolve export snippet related object names</param>
        /// <param name="stateMachineDbAccess">State machine Db Access</param>
        /// <param name="imageAccess">Skill Image Access</param>
        /// <param name="thumbnailService">Thumbnail Service</param>
        /// <param name="aikaQuestDbAccess">Aika Quest Db ACcess</param>
        /// <param name="kirjaPageDbAccess">Kirja Page Db Access</param>
        /// <param name="taleDbAccess">Tale Db Access</param>
        /// <param name="kortistoNpcDbAccess">Kortisto Npc Db Access</param>
        /// <param name="npcTemplateDbAccess">Npc Template Db Access</param>
        /// <param name="userProjectAccess">User project Access</param>
        /// <param name="csvGenerator">CSV Generator</param>
        /// <param name="csvReader">CSV Reader</param>
        /// <param name="userManager">User Manager</param>
        /// <param name="implementationStatusComparer">Implementation Status Comparer</param>
        /// <param name="timelineService">Timeline Service</param>
        /// <param name="xssChecker">Xss Checker</param>
        /// <param name="logger">Logger</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public EvneApiController(IEvneFolderDbAccess folderDbAccess, IEvneSkillTemplateDbAccess templateDbAccess, IEvneSkillDbAccess skillDbAccess, IEvneSkillTagDbAccess tagDbAccess, IExportTemplateDbAccess exportTemplateDbAccess, ILanguageKeyDbAccess languageKeyDbAccess, IEvneImportFieldValuesLogDbAccess importFieldValuesLogDbAccess,
                                 IExportFunctionIdDbAccess exportFunctionIdDbAccess, IObjectExportSnippetDbAccess objectExportSnippetDbAccess, IObjectExportSnippetSnapshotDbAccess objectExportSnippetSnapshotDbAccess, IExportSnippetRelatedObjectNameResolver exportSnippetRelatedObjectNameResolver, IStateMachineDbAccess stateMachineDbAccess,
                                 IEvneSkillImageAccess imageAccess, IEvneThumbnailService thumbnailService, IAikaQuestDbAccess aikaQuestDbAccess, ITaleDbAccess taleDbAccess, IKirjaPageDbAccess kirjaPageDbAccess, IKortistoNpcDbAccess kortistoNpcDbAccess, IKortistoNpcTemplateDbAccess npcTemplateDbAccess, IUserProjectAccess userProjectAccess, 
                                 ICsvGenerator csvGenerator, ICsvParser csvReader, UserManager<GoNorthUser> userManager, IImplementationStatusComparer implementationStatusComparer, ITimelineService timelineService, IXssChecker xssChecker, ILogger<EvneApiController> logger, IStringLocalizerFactory localizerFactory) 
                                     : base(folderDbAccess, templateDbAccess, skillDbAccess, tagDbAccess, exportTemplateDbAccess, importFieldValuesLogDbAccess, languageKeyDbAccess, exportFunctionIdDbAccess, objectExportSnippetDbAccess, objectExportSnippetSnapshotDbAccess, exportSnippetRelatedObjectNameResolver, stateMachineDbAccess, userProjectAccess, imageAccess, 
                                            thumbnailService, csvGenerator, csvReader, userManager, implementationStatusComparer, timelineService, xssChecker, logger, localizerFactory)
        {
            _aikaQuestDbAccess = aikaQuestDbAccess;
            _taleDbAccess = taleDbAccess;
            _kirjaPageDbAccess = kirjaPageDbAccess;
            _kortistoNpcDbAccess = kortistoNpcDbAccess;
            _npcTemplateDbAccess = npcTemplateDbAccess;
        }

        /// <summary>
        /// Creates a new skill template
        /// </summary>
        /// <param name="template">Template to create</param>
        /// <returns>Result</returns>
        [ProducesResponseType(typeof(EvneSkill), StatusCodes.Status200OK)]
        [Authorize(Roles = RoleNames.EvneTemplateManager)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CreateFlexFieldTemplate([FromBody]EvneSkill template)
        {
            return await BaseCreateFlexFieldTemplate(template);
        }

        /// <summary>
        /// Deletes a skill template
        /// </summary>
        /// <param name="id">Id of the template</param>
        /// <returns>Result Status Code</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [Authorize(Roles = RoleNames.EvneTemplateManager)]
        [HttpDelete]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteFlexFieldTemplate(string id)
        {
            return await BaseDeleteFlexFieldTemplate(id);
        }

        /// <summary>
        /// Updates a skill template 
        /// </summary>
        /// <param name="id">Template Id</param>
        /// <param name="template">Update template data</param>
        /// <returns>Result Status Code</returns>
        [ProducesResponseType(typeof(EvneSkill), StatusCodes.Status200OK)]
        [Authorize(Roles = RoleNames.EvneTemplateManager)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateFlexFieldTemplate(string id, [FromBody]EvneSkill template)
        {
            return await BaseUpdateFlexFieldTemplate(id, template);
        }

        /// <summary>
        /// Distributes the fields of a template
        /// </summary>
        /// <param name="id">Template Id</param>
        /// <returns>Task</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [Authorize(Roles = RoleNames.EvneTemplateManager)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DistributeFlexFieldTemplateFields(string id)
        {
            return await BaseDistributeFlexFieldTemplateFields(id);
        }

        /// <summary>
        /// Uploads an image to a skill template
        /// </summary>
        /// <param name="id">Id of the template</param>
        /// <returns>Image Name</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [Authorize(Roles = RoleNames.EvneTemplateManager)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> FlexFieldTemplateImageUpload(string id)
        {
            return await BaseFlexFieldTemplateImageUpload(id);
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
                return _localizer["CanNotDeleteSkillReferencedInAikaQuest", referencedInQuests].Value;
            }

            List<KirjaPage> kirjaPages = await _kirjaPageDbAccess.GetPagesBySkill(id);
            if(kirjaPages.Count > 0)
            {
                string mentionedInPages = string.Join(", ", kirjaPages.Select(p => p.Name));
                return _localizer["CanNotDeleteSkillMentionedInKirjaPage", mentionedInPages].Value;
            }

            List<TaleDialog> taleDialogs = await _taleDbAccess.GetDialogsObjectIsReferenced(id);
            if(taleDialogs.Count > 0)
            {
                List<KortistoNpc> npcs = await _kortistoNpcDbAccess.ResolveFlexFieldObjectNames(taleDialogs.Select(t => t.RelatedObjectId).ToList());
                string referencedInDialogs = string.Join(", ", npcs.Select(n => n.Name));
                return _localizer["CanNotDeleteSkillReferencedInTaleDialog", referencedInDialogs].Value;
            }

            List<KortistoNpc> learnedNpcs = await _kortistoNpcDbAccess.GetNpcsByLearnedSkill(id);
            if(learnedNpcs.Count > 0)
            {
                string learnedByNpcsString = string.Join(", ", learnedNpcs.Select(n => n.Name));
                return _localizer["CanNotDeleteSkillLearnedByNpc", learnedByNpcsString].Value;
            }

            List<KortistoNpc> referencedInDailyRoutines = await _kortistoNpcDbAccess.GetNpcsObjectIsReferencedInDailyRoutine(id);
            if(referencedInDailyRoutines.Count > 0)
            {
                string usedInDailyRoutines = string.Join(", ", referencedInDailyRoutines.Select(m => m.Name));
                return _localizer["CanNotDeleteSkillUsedInDailyRoutine", usedInDailyRoutines].Value;
            }

            List<StateMachine> referencedInStateMachines = await _stateMachineDbAccess.GetStateMachinesObjectIsReferenced(id);
            if(referencedInStateMachines.Count > 0)
            {
                List<KortistoNpc> npcs = await _kortistoNpcDbAccess.ResolveFlexFieldObjectNames(referencedInStateMachines.Select(t => t.RelatedObjectId).ToList());
                List<KortistoNpc> npcTemplates = await _npcTemplateDbAccess.ResolveFlexFieldObjectNames(referencedInStateMachines.Select(t => t.RelatedObjectId).ToList());
                string usedInStateMachines = string.Join(", ", npcs.Union(npcTemplates).Select(n => n.Name));
                return _localizer["CanNotDeleteSkillUsedInStateMachines", usedInStateMachines].Value;
            }

            List<EvneSkill> referencedInSkills = await ((IEvneSkillDbAccess)_objectDbAccess).GetSkillsObjectIsReferencedIn(id);
            if(referencedInSkills.Count > 0)
            {
                string referencedInSkillsString = string.Join(", ", referencedInSkills.Select(n => n.Name));
                return _localizer["CanNotDeleteSkillUsedInSkill", referencedInSkillsString].Value;
            }

            return string.Empty;
        }

        /// <summary>
        /// Deletes additional depencendies for a flex field object
        /// </summary>
        /// <param name="flexFieldObject">Flex field object to delete</param>
        /// <returns>Task</returns>
        protected override Task DeleteAdditionalFlexFieldObjectDependencies(EvneSkill flexFieldObject)
        {
            return Task.CompletedTask;
        }

        /// <summary>
        /// Runs additional updates on a flex field object
        /// </summary>
        /// <param name="flexFieldObject">Flex Field Object</param>
        /// <param name="loadedFlexFieldObject">Loaded Flex Field Object</param>
        /// <returns>Updated flex field object</returns>
        protected override Task<EvneSkill> RunAdditionalUpdates(EvneSkill flexFieldObject, EvneSkill loadedFlexFieldObject)
        {
            loadedFlexFieldObject.Text = flexFieldObject.Text != null ? flexFieldObject.Text : new List<TextNode>();
            loadedFlexFieldObject.Action = flexFieldObject.Action != null ? flexFieldObject.Action : new List<ActionNode>();
            loadedFlexFieldObject.Condition = flexFieldObject.Condition != null ? flexFieldObject.Condition : new List<ConditionNode>();
            loadedFlexFieldObject.Link = flexFieldObject.Link != null ? flexFieldObject.Link : new List<NodeLink>();
            loadedFlexFieldObject.Reference = flexFieldObject.Reference != null ? flexFieldObject.Reference : new List<ReferenceNode>();

            return Task.FromResult(loadedFlexFieldObject);
        }

        /// <summary>
        /// Runs updates on markers
        /// </summary>
        /// <param name="flexFieldObject">Flex Field Object</param>
        /// <returns>Task</returns>
        protected override Task RunMarkerUpdates(EvneSkill flexFieldObject)
        {
            return Task.CompletedTask;
        }

        /// <summary>
        /// Compares an object with the implementation snapshot
        /// </summary>
        /// <param name="flexFieldObject">Flex field object for compare</param>
        /// <returns>CompareResult Result</returns>
        protected override async Task<CompareResult> CompareObjectWithImplementationSnapshot(EvneSkill flexFieldObject)
        {
            return await _implementationStatusComparer.CompareSkill(flexFieldObject.Id, flexFieldObject);
        }


        /// <summary>
        /// Returns the not implemented skills
        /// </summary>
        /// <param name="start">Start of the page</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Skills</returns>
        [ProducesResponseType(typeof(FlexFieldObjectQueryResult), StatusCodes.Status200OK)]
        [Authorize(Roles = RoleNames.Evne)]
        [Authorize(Roles = RoleNames.ImplementationStatusTracker)]
        [HttpGet]
        public async Task<IActionResult> GetNotImplementedSkills(int start, int pageSize)
        {
            GoNorthProject project = await _userProjectAccess.GetUserProject();
            Task<List<EvneSkill>> queryTask;
            Task<int> countTask;
            queryTask = _objectDbAccess.GetNotImplementedFlexFieldObjects(project.Id, start, pageSize, CultureInfo.CurrentUICulture.TwoLetterISOLanguageName);
            countTask = _objectDbAccess.GetNotImplementedFlexFieldObjectsCount(project.Id, CultureInfo.CurrentUICulture.TwoLetterISOLanguageName);
            Task.WaitAll(queryTask, countTask);

            FlexFieldObjectQueryResult queryResult = new FlexFieldObjectQueryResult();
            queryResult.FlexFieldObjects = queryTask.Result;
            queryResult.HasMore = start + queryResult.FlexFieldObjects.Count < countTask.Result;
            return Ok(queryResult);
        }

        /// <summary>
        /// Returns all skills an object is referenced in (excluding the skill itselfs)
        /// </summary>
        /// <param name="objectId">Object id</param>
        /// <returns>Skills</returns>
        [ProducesResponseType(typeof(List<EvneSkill>), StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> GetSkillsObjectIsReferencedIn(string objectId)
        {
            List<EvneSkill> skills = await ((IEvneSkillDbAccess)_objectDbAccess).GetSkillsObjectIsReferencedIn(objectId);
            return Ok(skills);
        }

    }
}