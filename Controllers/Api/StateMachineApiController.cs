using System.Threading.Tasks;
using GoNorth.Data.Kortisto;
using GoNorth.Services.Timeline;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Identity;
using GoNorth.Data.User;
using System.Collections.Generic;
using GoNorth.Extensions;
using System.Linq;
using GoNorth.Services.ImplementationStatusCompare;
using Microsoft.AspNetCore.Http;
using GoNorth.Services.Project;
using GoNorth.Services.ReferenceAnalyzer;
using GoNorth.Data.StateMachines;

namespace GoNorth.Controllers.Api
{
    /// <summary>
    /// State Machine Api controller
    /// </summary>
    [ApiController]
    [Authorize(Roles = RoleNames.Kortisto)]
    [Route("/api/[controller]/[action]")]
    public class StateMachineApiController : ControllerBase
    {
        /// <summary>
        /// Object using a state machine query result
        /// </summary>
        public class ObjectUsingStateMachine
        {
            /// <summary>
            /// Object Id
            /// </summary>
            public string ObjectId { get; set; }

            /// <summary>
            /// Object name
            /// </summary>
            public string ObjectName { get; set; }
        }

        /// <summary>
        /// State machine Db Service
        /// </summary>
        private readonly IStateMachineDbAccess _stateMachineDbAccess;

        /// <summary>
        /// Npc Db Service
        /// </summary>
        private readonly IKortistoNpcDbAccess _npcDbAccess;

        /// <summary>
        /// Npc Template Db Service
        /// </summary>
        private readonly IKortistoNpcTemplateDbAccess _npcTemplateDbAccess;

        /// <summary>
        /// User project access
        /// </summary>
        private readonly IUserProjectAccess _userProjectAccess;

        /// <summary>
        /// Implementation status comparer
        /// </summary>
        private readonly IImplementationStatusComparer _implementationStatusComparer;

        /// <summary>
        /// Interface to analyze references
        /// </summary>
        private readonly IReferenceAnalyzer _referenceAnalyzer;

        /// <summary>
        /// Timeline Service
        /// </summary>
        private readonly ITimelineService _timelineService;

        /// <summary>
        /// User Manager
        /// </summary>
        private readonly UserManager<GoNorthUser> _userManager;

        /// <summary>
        /// Logger
        /// </summary>
        private readonly ILogger _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="stateMachineDbAccess">State Machine Db Access</param>
        /// <param name="npcDbAccess">Npc Db Access</param>
        /// <param name="npcTemplateDbAccess">Npc Template Db Access</param>
        /// <param name="userProjectAccess">User project access</param>
        /// <param name="userManager">User Manager</param>
        /// <param name="implementationStatusComparer">Implementation status comparer</param>
        /// <param name="referenceAnalyzer">Reference analyzer</param>
        /// <param name="timelineService">Timeline Service</param>
        /// <param name="logger">Logger</param>
        public StateMachineApiController(IStateMachineDbAccess stateMachineDbAccess, IKortistoNpcDbAccess npcDbAccess, IKortistoNpcTemplateDbAccess npcTemplateDbAccess, IUserProjectAccess userProjectAccess, 
                                         UserManager<GoNorthUser> userManager, IImplementationStatusComparer implementationStatusComparer, IReferenceAnalyzer referenceAnalyzer, ITimelineService timelineService, 
                                         ILogger<StateMachineApiController> logger)
        {
            _stateMachineDbAccess = stateMachineDbAccess;
            _npcDbAccess = npcDbAccess;
            _npcTemplateDbAccess = npcTemplateDbAccess;
            _userProjectAccess = userProjectAccess;
            _userManager = userManager;
            _implementationStatusComparer = implementationStatusComparer;
            _referenceAnalyzer = referenceAnalyzer;
            _timelineService = timelineService;
            _logger = logger;
        }

        /// <summary>
        /// Returns a state machine by is related object id
        /// </summary>
        /// <param name="relatedObjectId">Related object id</param>
        /// <returns>State machine</returns>
        [ProducesResponseType(typeof(StateMachine), StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> GetStateMachineByRelatedObjectId(string relatedObjectId)
        {
            StateMachine stateMachine = await _stateMachineDbAccess.GetStateMachineByRelatedObjectId(relatedObjectId);
            return Ok(stateMachine);
        }

        /// <summary>
        /// Returns all state machines an object is referenced in (this does not check the RelatedObjectId field)
        /// </summary>
        /// <param name="objectId">Object id</param>
        /// <returns>State machines using the object</returns>
        [ProducesResponseType(typeof(List<ObjectReferenceWithType>), StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> GetStateMachineObjectIsReferenced(string objectId)
        {
            List<StateMachine> stateMachines = await _stateMachineDbAccess.GetStateMachinesObjectIsReferenced(objectId);
            List<KortistoNpc> npcs = await _npcDbAccess.ResolveFlexFieldObjectNames(stateMachines.Select(d => d.RelatedObjectId).ToList());
            List<KortistoNpc> npcTemplates = await _npcTemplateDbAccess.ResolveFlexFieldObjectNames(stateMachines.Select(d => d.RelatedObjectId).ToList());
            Dictionary<string, string> npcNames = npcs.ToDictionary(n => n.Id, n => n.Name);
            Dictionary<string, string> npcTemplateNames = npcTemplates.ToDictionary(n => n.Id, n => n.Name);
            List<ObjectReferenceWithType> objectReferences = stateMachines.SelectMany(d => {
                ObjectReferenceType? referenceType = null;
                string objectName = string.Empty;
                if(npcNames.ContainsKey(d.RelatedObjectId))
                {
                    referenceType = ObjectReferenceType.Npc;
                    objectName = npcNames[d.RelatedObjectId];
                }
                else if(npcTemplateNames.ContainsKey(d.RelatedObjectId))
                {
                    referenceType = ObjectReferenceType.NpcTemplate;
                    objectName = npcTemplateNames[d.RelatedObjectId];
                }
                else
                {
                    return new List<ObjectReferenceWithType>();
                }

                return d.State.Where(s => s.ScriptNodeGraph != null).Select(s => {
                    ObjectReference objRef = _referenceAnalyzer.BuildObjectReferences(objectId, d.RelatedObjectId, objectName, s.ScriptNodeGraph.Action, s.ScriptNodeGraph.Condition, s.ScriptNodeGraph.Reference, null);
                    ObjectReferenceWithType refWithType = ObjectReferenceWithType.FromObjectReference(objRef, referenceType.Value);
                    return refWithType;
                }).Where(r => r.DetailedReferences.Any()).ToList();
            }).ToList();
            return Ok(objectReferences);
        }

        /// <summary>
        /// Saves a state machine
        /// </summary>
        /// <param name="relatedObjectId">Related object id</param>
        /// <param name="stateMachine">State machine Data to save</param>
        /// <returns>State machine</returns>
        [ProducesResponseType(typeof(StateMachine), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ValidateAntiForgeryToken]
        [HttpPost]
        public async Task<IActionResult> SaveStateMachine(string relatedObjectId, [FromBody]StateMachine stateMachine)
        {
            // Validate data
            if(string.IsNullOrEmpty(relatedObjectId))
            {
                return BadRequest();
            }

            List<KortistoNpc> npcNames = await _npcDbAccess.ResolveFlexFieldObjectNames(new List<string> { relatedObjectId });
            bool isTemplateMode = false;
            string npcName = null;
            if(npcNames.Count == 1)
            {
                npcName = npcNames[0].Name;
            }
            else
            {
                List<KortistoNpc> npcTemplatesNames = await _npcTemplateDbAccess.ResolveFlexFieldObjectNames(new List<string> { relatedObjectId });
                if(npcTemplatesNames.Count == 1)
                {
                    npcName = npcTemplatesNames[0].Name;
                    isTemplateMode = true;
                }
            }

            if(string.IsNullOrEmpty(npcName))
            {
                return BadRequest();
            }

            // Update or create state machine
            StateMachine existingStateMachine = await _stateMachineDbAccess.GetStateMachineByRelatedObjectId(relatedObjectId);
            bool isCreate = false;
            if(existingStateMachine == null)
            {
                KortistoNpc npc;
                if(!isTemplateMode)
                {
                    npc = await _npcDbAccess.GetFlexFieldObjectById(relatedObjectId);
                }
                else
                {
                    npc = await _npcTemplateDbAccess.GetFlexFieldObjectById(relatedObjectId);
                }

                existingStateMachine = new StateMachine();
                existingStateMachine.RelatedObjectId = relatedObjectId;
                existingStateMachine.ProjectId = npc.ProjectId;
                isCreate = true;
            }

            existingStateMachine.Start = stateMachine.Start != null ? stateMachine.Start : new List<StateMachineStartEnd>();
            existingStateMachine.State = stateMachine.State != null ? stateMachine.State : new List<StateMachineState>();
            existingStateMachine.End = stateMachine.End != null ? stateMachine.End : new List<StateMachineStartEnd>();
            existingStateMachine.Link = stateMachine.Link != null ? stateMachine.Link : new List<StateTransition>();

            await this.SetModifiedData(_userManager, existingStateMachine);

            await SetImplementationStatusOfRelatedObject(existingStateMachine);

            // Save Data
            if(isCreate)
            {
                existingStateMachine = await _stateMachineDbAccess.CreateStateMachine(existingStateMachine);
                await _timelineService.AddTimelineEntry(existingStateMachine.ProjectId, TimelineEvent.StateMachineCreated, relatedObjectId, npcName);
            }
            else
            {
                await _stateMachineDbAccess.UpdateStateMachine(existingStateMachine);
                await _timelineService.AddTimelineEntry(existingStateMachine.ProjectId, TimelineEvent.StateMachineUpdated, relatedObjectId, npcName);
            }

            return Ok(existingStateMachine);
        }

        /// <summary>
        /// Returns the customized state machines for objects for an object
        /// </summary>
        /// <param name="relatedObjectId">Related object id</param>
        /// <returns>Result</returns>
        [ProducesResponseType(typeof(List<ObjectUsingStateMachine>), StatusCodes.Status200OK)]
        [Authorize(Roles = RoleNames.ManageExportTemplates)]
        [HttpGet]
        public async Task<IActionResult> GetCustomizedStateMachinesByParentObject(string relatedObjectId)
        {
            KortistoNpc npcTemplate = await _npcTemplateDbAccess.GetFlexFieldObjectById(relatedObjectId);

            if(npcTemplate == null)
            {
                return Ok(new List<ObjectUsingStateMachine>());
            }

            List<KortistoNpc> npcs = await _npcDbAccess.GetFlexFieldObjectsByTemplate(npcTemplate.Id);
            Dictionary<string, string> npcNames = npcs.ToDictionary(n => n.Id, n => n.Name);
            List<StateMachine> customizedStateMachines = await _stateMachineDbAccess.GetStateMachineByRelatedObjectIds(npcs.Select(n => n.Id).ToList());

            List<ObjectUsingStateMachine> objectsUsingTemplate = customizedStateMachines.Select(c => new ObjectUsingStateMachine {
                ObjectId = c.RelatedObjectId,
                ObjectName = npcNames.ContainsKey(c.RelatedObjectId) ? npcNames[c.RelatedObjectId] : string.Empty
            }).ToList();

            return Ok(objectsUsingTemplate);
        }

        /// <summary>
        /// Sets the implementation status of the related object
        /// </summary>
        /// <param name="stateMachine">State machine</param>
        /// <returns>Task</returns>
        private async Task SetImplementationStatusOfRelatedObject(StateMachine stateMachine)
        {
            KortistoNpc relatedObject = await _npcDbAccess.GetFlexFieldObjectById(stateMachine.RelatedObjectId);
            if(relatedObject == null || !relatedObject.IsImplemented)
            {
                return;
            }

            CompareResult result = await _implementationStatusComparer.CompareStateMachine(stateMachine.Id, stateMachine);
            if(result.CompareDifference != null && (result.CompareDifference.Count > 0 || !result.DoesSnapshotExist))
            {
                relatedObject.IsImplemented = false;
                await _npcDbAccess.UpdateFlexFieldObject(relatedObject);
            }
        }
    }
}