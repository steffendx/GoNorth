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
using System.Net;
using GoNorth.Data.NodeGraph;
using GoNorth.Extensions;
using GoNorth.Data.Project;
using System.Linq;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Controllers.Api
{
    /// <summary>
    /// Tale Api controller
    /// </summary>
    [Authorize(Roles = RoleNames.Tale)]
    [Route("/api/[controller]/[action]")]
    public class TaleApiController : Controller
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
        /// Tale Db Service
        /// </summary>
        private readonly IKortistoNpcDbAccess _npcDbAccess;

        /// <summary>
        /// Project Db Service
        /// </summary>
        private readonly IProjectDbAccess _projectDbAccess;

        /// <summary>
        /// Implementation status comparer
        /// </summary>
        private readonly IImplementationStatusComparer _implementationStatusComparer;

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
        /// <param name="projectDbAccess">Project Db Access</param>
        /// <param name="userManager">User Manager</param>
        /// <param name="implementationStatusComparer">Implementation status comparer</param>
        /// <param name="timelineService">Timeline Service</param>
        /// <param name="logger">Logger</param>
        public TaleApiController(ITaleDbAccess taleDbAccess, IKortistoNpcDbAccess npcDbAccess, IProjectDbAccess projectDbAccess, UserManager<GoNorthUser> userManager, IImplementationStatusComparer implementationStatusComparer, 
                                 ITimelineService timelineService, ILogger<TaleApiController> logger)
        {
            _taleDbAccess = taleDbAccess;
            _npcDbAccess = npcDbAccess;
            _projectDbAccess = projectDbAccess;
            _userManager = userManager;
            _implementationStatusComparer = implementationStatusComparer;
            _timelineService = timelineService;
            _logger = logger;
        }

        /// <summary>
        /// Returns a dialog by is related object id
        /// </summary>
        /// <param name="relatedObjectId">Related object id</param>
        /// <returns>Dialog</returns>
        [Produces(typeof(TaleDialog))]
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
        [Produces(typeof(DialogImplementedResponse))]
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
        [Produces(typeof(List<TaleDialog>))]
        [HttpGet]
        public async Task<IActionResult> GetDialogsObjectIsReferenced(string objectId)
        {
            List<TaleDialog> dialogs = await _taleDbAccess.GetDialogsObjectIsReferenced(objectId);
            return Ok(dialogs);
        }

        /// <summary>
        /// Saves a dialog
        /// </summary>
        /// <param name="relatedObjectId">Related object id</param>
        /// <param name="dialog">Dialog Data to save</param>
        /// <returns>Dialog</returns>
        [Produces(typeof(TaleDialog))]
        [ValidateAntiForgeryToken]
        [HttpPost]
        public async Task<IActionResult> SaveDialog(string relatedObjectId, [FromBody]TaleDialog dialog)
        {
            // Validate data
            if(string.IsNullOrEmpty(relatedObjectId))
            {
                return StatusCode((int)HttpStatusCode.BadRequest);
            }

            List<KortistoNpc> npcNames = await _npcDbAccess.ResolveFlexFieldObjectNames(new List<string> { relatedObjectId });
            if(npcNames.Count == 0)
            {
                return StatusCode((int)HttpStatusCode.BadRequest);
            }
            string npcName = npcNames[0].Name;

            GoNorthProject project = await _projectDbAccess.GetDefaultProject();

            // Update or create dialog
            TaleDialog existingDialog = await _taleDbAccess.GetDialogByRelatedObjectId(relatedObjectId);
            bool isCreate = false;
            if(existingDialog == null)
            {
                existingDialog = new TaleDialog();
                existingDialog.RelatedObjectId = relatedObjectId;
                isCreate = true;
            }

            existingDialog.ProjectId = project.Id;
            existingDialog.Link = dialog.Link != null ? dialog.Link : new List<NodeLink>();
            existingDialog.PlayerText = dialog.PlayerText != null ? dialog.PlayerText : new List<TextNode>();
            existingDialog.NpcText = dialog.NpcText != null ? dialog.NpcText : new List<TextNode>();
            existingDialog.Choice = dialog.Choice != null ? dialog.Choice : new List<TaleChoiceNode>();
            existingDialog.Action = dialog.Action != null ? dialog.Action : new List<ActionNode>();
            existingDialog.Condition = dialog.Condition != null ? dialog.Condition : new List<ConditionNode>();

            await this.SetModifiedData(_userManager, existingDialog);

            // Save Data
            if(isCreate)
            {
                existingDialog = await _taleDbAccess.CreateDialog(existingDialog);
                await _timelineService.AddTimelineEntry(TimelineEvent.TaleDialogCreated, relatedObjectId, npcName);
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
                await _timelineService.AddTimelineEntry(TimelineEvent.TaleDialogUpdated, relatedObjectId, npcName);
            }

            return Ok(existingDialog);
        }


        /// <summary>
        /// Returns the not implemented dialogs
        /// </summary>
        /// <param name="start">Start of the page</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Items</returns>
        [Produces(typeof(DialogQueryResult))]
        [Authorize(Roles = RoleNames.Tale)]
        [Authorize(Roles = RoleNames.ImplementationStatusTracker)]
        [HttpGet]
        public async Task<IActionResult> GetNotImplementedDialogs(int start, int pageSize)
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();
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