using System.Threading.Tasks;
using GoNorth.Data.Kortisto;
using GoNorth.Services.Timeline;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Identity;
using GoNorth.Data.User;
using GoNorth.Data.Tale;
using System.Collections.Generic;
using GoNorth.Data.NodeGraph;
using GoNorth.Extensions;
using GoNorth.Data.Project;
using System.Linq;
using GoNorth.Services.ImplementationStatusCompare;
using Microsoft.AspNetCore.Http;
using GoNorth.Services.Project;
using GoNorth.Services.ReferenceAnalyzer;

namespace GoNorth.Controllers.Api
{
    /// <summary>
    /// Tale Api controller
    /// </summary>
    [ApiController]
    [Authorize(Roles = RoleNames.Tale)]
    [Route("/api/[controller]/[action]")]
    public class TaleApiController : ControllerBase
    {
        /// <summary>
        /// Dialog Query Result object, includes npc names
        /// </summary>
        public class DialogQueryObject
        {
            /// <summary>
            /// Id of the dialog
            /// </summary>
            public string Id { get; set; }

            /// <summary>
            /// Id of the related object
            /// </summary>
            public string RelatedObjectId { get; set; }

            /// <summary>
            /// Name of the npc
            /// </summary>
            public string Name { get; set; }
        }

        /// <summary>
        /// Dialogs Query Result
        /// </summary>
        public class DialogQueryResult
        {
            /// <summary>
            /// true if there are more dialogs to query, else false
            /// </summary>
            public bool HasMore { get; set; }

            /// <summary>
            /// Dialogs
            /// </summary>
            public IList<DialogQueryObject> Dialogs { get; set; }
        }

        /// <summary>
        /// Dialog Implemented response
        /// </summary>
        public class DialogImplementedResponse
        {
            /// <summary>
            /// true if the dialog exists, else false
            /// </summary>
            public bool Exists { get; set; }

            /// <summary>
            /// true if the dialog is implemented, else false
            /// </summary>
            public bool IsImplemented { get; set; }
        }


        /// <summary>
        /// Tale Db Service
        /// </summary>
        private readonly ITaleDbAccess _taleDbAccess;

        /// <summary>
        /// Npc Db Service
        /// </summary>
        private readonly IKortistoNpcDbAccess _npcDbAccess;

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
        /// <param name="taleDbAccess">Tale Db Access</param>
        /// <param name="npcDbAccess">Npc Db Access</param>
        /// <param name="userProjectAccess">User project access</param>
        /// <param name="userManager">User Manager</param>
        /// <param name="implementationStatusComparer">Implementation status comparer</param>
        /// <param name="referenceAnalyzer">Reference analyzer</param>
        /// <param name="timelineService">Timeline Service</param>
        /// <param name="logger">Logger</param>
        public TaleApiController(ITaleDbAccess taleDbAccess, IKortistoNpcDbAccess npcDbAccess, IUserProjectAccess userProjectAccess, UserManager<GoNorthUser> userManager, 
                                 IImplementationStatusComparer implementationStatusComparer, IReferenceAnalyzer referenceAnalyzer, ITimelineService timelineService, ILogger<TaleApiController> logger)
        {
            _taleDbAccess = taleDbAccess;
            _npcDbAccess = npcDbAccess;
            _userProjectAccess = userProjectAccess;
            _userManager = userManager;
            _implementationStatusComparer = implementationStatusComparer;
            _referenceAnalyzer = referenceAnalyzer;
            _timelineService = timelineService;
            _logger = logger;
        }

        /// <summary>
        /// Returns a dialog by is related object id
        /// </summary>
        /// <param name="relatedObjectId">Related object id</param>
        /// <returns>Dialog</returns>
        [ProducesResponseType(typeof(TaleDialog), StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> GetDialogByRelatedObjectId(string relatedObjectId)
        {
            TaleDialog dialog = await _taleDbAccess.GetDialogByRelatedObjectId(relatedObjectId);
            return Ok(dialog);
        }

        /// <summary>
        /// Returns if a dialog is implemented by its related object id
        /// </summary>
        /// <param name="relatedObjectId">Related object id</param>
        /// <returns>Dialog Implemented state</returns>
        [ProducesResponseType(typeof(DialogImplementedResponse), StatusCodes.Status200OK)]
        [Authorize(Roles = RoleNames.ImplementationStatusTracker)]
        [Authorize(Roles = RoleNames.Tale)]
        [HttpGet]
        public async Task<IActionResult> IsDialogImplementedByRelatedObjectId(string relatedObjectId)
        {
            DialogImplementedResponse response = new DialogImplementedResponse();

            TaleDialog dialog = await _taleDbAccess.GetDialogByRelatedObjectId(relatedObjectId);
            if(dialog != null)
            {
                response.Exists = true;
                response.IsImplemented = dialog.IsImplemented;
            }

            return Ok(response);
        }

        /// <summary>
        /// Returns all dialogs an object is referenced in (this does not check the RelatedObjectId field)
        /// </summary>
        /// <param name="objectId">Object id</param>
        /// <returns>Dialogs</returns>
        [ProducesResponseType(typeof(List<ObjectReference>), StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> GetDialogsObjectIsReferenced(string objectId)
        {
            List<TaleDialog> dialogs = await _taleDbAccess.GetDialogsObjectIsReferenced(objectId);
            List<KortistoNpc> npcs = await _npcDbAccess.ResolveFlexFieldObjectNames(dialogs.Select(d => d.RelatedObjectId).ToList());
            Dictionary<string, string> npcNames = npcs.ToDictionary(n => n.Id, n => n.Name);
            List<ObjectReference> objectReferences = dialogs.Select(d => {
                if(!npcNames.ContainsKey(d.RelatedObjectId))
                {
                    return null;
                }
                return _referenceAnalyzer.BuildObjectReferences(objectId, d.RelatedObjectId, npcNames[d.RelatedObjectId], d.Action, d.Condition, d.Reference, d.Choice);
            }).Where(o => o != null).ToList();
            return Ok(objectReferences);
        }

        /// <summary>
        /// Saves a dialog
        /// </summary>
        /// <param name="relatedObjectId">Related object id</param>
        /// <param name="dialog">Dialog Data to save</param>
        /// <returns>Dialog</returns>
        [ProducesResponseType(typeof(TaleDialog), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ValidateAntiForgeryToken]
        [HttpPost]
        public async Task<IActionResult> SaveDialog(string relatedObjectId, [FromBody]TaleDialog dialog)
        {
            // Validate data
            if(string.IsNullOrEmpty(relatedObjectId))
            {
                return BadRequest();
            }

            List<KortistoNpc> npcNames = await _npcDbAccess.ResolveFlexFieldObjectNames(new List<string> { relatedObjectId });
            if(npcNames.Count == 0)
            {
                return BadRequest();
            }
            string npcName = npcNames[0].Name;

            // Update or create dialog
            TaleDialog existingDialog = await _taleDbAccess.GetDialogByRelatedObjectId(relatedObjectId);
            bool isCreate = false;
            if(existingDialog == null)
            {
                KortistoNpc npc = await _npcDbAccess.GetFlexFieldObjectById(relatedObjectId);

                existingDialog = new TaleDialog();
                existingDialog.RelatedObjectId = relatedObjectId;
                existingDialog.ProjectId = npc.ProjectId;
                isCreate = true;
            }

            existingDialog.Link = dialog.Link != null ? dialog.Link : new List<NodeLink>();
            existingDialog.PlayerText = dialog.PlayerText != null ? dialog.PlayerText : new List<TextNode>();
            existingDialog.NpcText = dialog.NpcText != null ? dialog.NpcText : new List<TextNode>();
            existingDialog.Choice = dialog.Choice != null ? dialog.Choice : new List<TaleChoiceNode>();
            existingDialog.Action = dialog.Action != null ? dialog.Action : new List<ActionNode>();
            existingDialog.Condition = dialog.Condition != null ? dialog.Condition : new List<ConditionNode>();
            existingDialog.Reference = dialog.Reference != null ? dialog.Reference : new List<ReferenceNode>();

            await this.SetModifiedData(_userManager, existingDialog);

            // Save Data
            if(isCreate)
            {
                existingDialog = await _taleDbAccess.CreateDialog(existingDialog);
                await _timelineService.AddTimelineEntry(existingDialog.ProjectId, TimelineEvent.TaleDialogCreated, relatedObjectId, npcName);
            }
            else
            {
                // Check implementation state
                if(existingDialog.IsImplemented)
                {
                    CompareResult result = await _implementationStatusComparer.CompareDialog(existingDialog.Id, existingDialog);
                    if(result.CompareDifference != null && result.CompareDifference.Count > 0)
                    {
                        existingDialog.IsImplemented = false;
                    }
                }

                await _taleDbAccess.UpdateDialog(existingDialog);
                await _timelineService.AddTimelineEntry(existingDialog.ProjectId, TimelineEvent.TaleDialogUpdated, relatedObjectId, npcName);
            }

            return Ok(existingDialog);
        }


        /// <summary>
        /// Returns the not implemented dialogs
        /// </summary>
        /// <param name="start">Start of the page</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Items</returns>
        [ProducesResponseType(typeof(DialogQueryResult), StatusCodes.Status200OK)]
        [Authorize(Roles = RoleNames.Tale)]
        [Authorize(Roles = RoleNames.ImplementationStatusTracker)]
        [HttpGet]
        public async Task<IActionResult> GetNotImplementedDialogs(int start, int pageSize)
        {
            GoNorthProject project = await _userProjectAccess.GetUserProject();
            Task<List<TaleDialog>> queryTask;
            Task<int> countTask;
            queryTask = _taleDbAccess.GetNotImplementedDialogs(project.Id, start, pageSize);
            countTask = _taleDbAccess.GetNotImplementedDialogsCount(project.Id);
            Task.WaitAll(queryTask, countTask);

            // Resolve npc names
            List<KortistoNpc> npcNames = await _npcDbAccess.ResolveFlexFieldObjectNames(queryTask.Result.Select(d => d.RelatedObjectId).ToList());

            DialogQueryResult queryResult = new DialogQueryResult();
            queryResult.Dialogs = queryTask.Result.Select(d => new DialogQueryObject {
                Id = d.Id,
                RelatedObjectId = d.RelatedObjectId,
                Name = npcNames.First(n => n.Id == d.RelatedObjectId).Name
            }).ToList();
            queryResult.HasMore = start + queryResult.Dialogs.Count < countTask.Result;
            return Ok(queryResult);
        }
    }
}