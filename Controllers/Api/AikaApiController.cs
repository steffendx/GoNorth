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
using GoNorth.Data.Aika;
using GoNorth.Data.Project;
using System;
using System.Linq;
using Microsoft.Extensions.Localization;
using GoNorth.Data.Kirja;
using GoNorth.Data.Karta;
using GoNorth.Data.Karta.Marker;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Controllers.Api
{
    /// <summary>
    /// Aika Api controller
    /// </summary>
    [Authorize(Roles = RoleNames.Aika)]
    [Route("/api/[controller]/[action]")]
    public class AikaApiController : Controller
    {
        /// <summary>
        /// Chapter data
        /// </summary>
        public class ChapterResponse
        {
            /// <summary>
            /// Id of the chapter
            /// </summary>
            public string Id { get; set; }

            /// <summary>
            /// Chapter Name
            /// </summary>
            public string Name { get; set; }

            /// <summary>
            /// Chapter Number
            /// </summary>
            public int Number { get; set; }
        };

        /// <summary>
        /// Quest Query Result
        /// </summary>
        public class QuestQueryResult
        {
            /// <summary>
            /// true if there are more quests to query, else false
            /// </summary>
            public bool HasMore { get; set; }

            /// <summary>
            /// Quests
            /// </summary>
            public IList<AikaQuest> Quests { get; set; }
        }

        /// <summary>
        /// Chapter Detail Query Result
        /// </summary>
        public class ChapterDetailQueryResult
        {
            /// <summary>
            /// true if there are more details to query, else false
            /// </summary>
            public bool HasMore { get; set; }

            /// <summary>
            /// Chapter Details
            /// </summary>
            public IList<AikaChapterDetail> Details { get; set; }
        }

        /// <summary>
        /// Chapter Detail Delete Validation Result
        /// </summary>
        public class ChapterDetailDeleteValidationResult
        {
            /// <summary>
            /// true if the detail can be deleted
            /// </summary>
            public bool CanBeDeleted { get; set; }

            /// <summary>
            /// Error Message
            /// </summary>
            public string ErrorMessage { get; set; }
        }

        /// <summary>
        /// Chapter Overview Db Service
        /// </summary>
        private readonly IAikaChapterOverviewDbAccess _chapterOverviewDbAccess;

        /// <summary>
        /// Chapter Detail Db Service
        /// </summary>
        private readonly IAikaChapterDetailDbAccess _chapterDetailDbAccess;

        /// <summary>
        /// Quest Db Service
        /// </summary>
        private readonly IAikaQuestDbAccess _questDbAccess;

        /// <summary>
        /// Project Db Access
        /// </summary>
        private readonly IProjectDbAccess _projectDbAccess;

        /// <summary>
        /// Kirja Page Db Access
        /// </summary>
        private readonly IKirjaPageDbAccess _kirjaPageDbAccess;

        /// <summary>
        /// Tale DB Access
        /// </summary>
        private readonly ITaleDbAccess _taleDbAccess;

        /// <summary>
        /// Kortisto DB Access
        /// </summary>
        private readonly IKortistoNpcDbAccess _kortistoNpcDbAccess;

        /// <summary>
        /// Kortisto DB Access
        /// </summary>
        private readonly IKartaMapDbAccess _kartaMapDbAccess;

        /// <summary>
        /// Timeline Service
        /// </summary>
        private readonly ITimelineService _timelineService;

        /// <summary>
        /// User Manager
        /// </summary>
        private readonly UserManager<GoNorthUser> _userManager;

        /// <summary>
        /// Implementation status comparer
        /// </summary>
        private readonly IImplementationStatusComparer _implementationStatusComparer;

        /// <summary>
        /// Logger
        /// </summary>
        private readonly ILogger _logger;

        /// <summary>
        /// Localizer
        /// </summary>
        protected readonly IStringLocalizer _localizer;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="chapterOverviewDbAccess">Chapter Overview Db Access</param>
        /// <param name="chapterDetailDbAccess">Chapter Detail Db Access</param>
        /// <param name="questDbAccess">Quest Db Access</param>
        /// <param name="projectDbAccess">Project Db Access</param>
        /// <param name="kirjaPageDbAccess">Kirja Db Access</param>
        /// <param name="taleDbAccess">Tale Db Access</param>
        /// <param name="kortistoNpcDbAccess">Kortisto Npc Db Access</param>
        /// <param name="kartaMapDbAccess">Karta Map Db Access</param>
        /// <param name="userManager">User Manager</param>
        /// <param name="implementationStatusComparer">Implementation status comparer</param>
        /// <param name="timelineService">Timeline Service</param>
        /// <param name="logger">Logger</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public AikaApiController(IAikaChapterOverviewDbAccess chapterOverviewDbAccess, IAikaChapterDetailDbAccess chapterDetailDbAccess, IAikaQuestDbAccess questDbAccess, IProjectDbAccess projectDbAccess, 
                                 IKirjaPageDbAccess kirjaPageDbAccess, ITaleDbAccess taleDbAccess, IKortistoNpcDbAccess kortistoNpcDbAccess, IKartaMapDbAccess kartaMapDbAccess, UserManager<GoNorthUser> userManager, 
                                 IImplementationStatusComparer implementationStatusComparer, ITimelineService timelineService, ILogger<AikaApiController> logger, IStringLocalizerFactory localizerFactory)
        {
            _chapterOverviewDbAccess = chapterOverviewDbAccess;
            _chapterDetailDbAccess = chapterDetailDbAccess;
            _questDbAccess = questDbAccess;
            _projectDbAccess = projectDbAccess;
            _kirjaPageDbAccess = kirjaPageDbAccess;
            _taleDbAccess = taleDbAccess;
            _kortistoNpcDbAccess = kortistoNpcDbAccess;
            _kartaMapDbAccess = kartaMapDbAccess;
            _userManager = userManager;
            _implementationStatusComparer = implementationStatusComparer;
            _timelineService = timelineService;
            _logger = logger;
            _localizer = localizerFactory.Create(typeof(AikaApiController));
        }

        /// <summary>
        /// Returns the chapter overview
        /// </summary>
        /// <returns>Chapter Overview</returns>
        [HttpGet]
        public async Task<IActionResult> GetChapterOverview()
        {
            GoNorthProject defaultProject = await _projectDbAccess.GetDefaultProject();

            AikaChapterOverview chapterOverview = await _chapterOverviewDbAccess.GetChapterOverviewByProjectId(defaultProject.Id);
            return Ok(chapterOverview);
        }

        /// <summary>
        /// Creates a new chapter detail
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="chapterId">Chapter Id</param>
        /// <param name="name">Name of the detail</param>
        /// <returns>Created Chapter Detail</returns>
        private async Task<AikaChapterDetail> CreateNewChapterDetail(string projectId, string chapterId, string name)
        {
            AikaChapterDetail newChapterDetail = new AikaChapterDetail();
            newChapterDetail.ProjectId = projectId;
            
            newChapterDetail.ChapterId = chapterId;
            newChapterDetail.Name = name;

            newChapterDetail.Start = new List<AikaStart>();
            newChapterDetail.Start.Add(CreateEmptyStartNode());
            newChapterDetail.Detail = new List<AikaChapterDetailNode>();
            newChapterDetail.Quest = new List<AikaQuestNode>();
            newChapterDetail.AllDone = new List<AikaAllDone>();
            newChapterDetail.Finish = new List<AikaFinish>();
            newChapterDetail.Link = new List<NodeLink>();

            await this.SetModifiedData(_userManager, newChapterDetail);

            newChapterDetail = await _chapterDetailDbAccess.CreateChapterDetail(newChapterDetail);
            return newChapterDetail;
        }

        /// <summary>
        /// Saves the chapter overview for the current project
        /// </summary>
        /// <param name="overview">Overview to save</param>
        /// <returns>Chapter Overview</returns>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> SaveChapterOverview([FromBody]AikaChapterOverview overview)
        {
            // Check Data
            if(overview.Chapter == null)
            {
                overview.Chapter = new List<AikaChapter>();
            }

            if(overview.Link == null)
            {
                overview.Link = new List<NodeLink>();
            }

            // Get Current Overview
            GoNorthProject defaultProject = await _projectDbAccess.GetDefaultProject();
            AikaChapterOverview chapterOverview = await _chapterOverviewDbAccess.GetChapterOverviewByProjectId(defaultProject.Id);
            bool overviewExisted = true;
            List<AikaChapterDetail> chapterDetailsToDelete = new List<AikaChapterDetail>();
            List<AikaChapterDetail> chapterDetailsToRename = new List<AikaChapterDetail>();
            List<int> deletedChapterNumbers = new List<int>();
            if(chapterOverview == null)
            {
                chapterOverview = new AikaChapterOverview();
                chapterOverview.ProjectId = defaultProject.Id;
                overviewExisted = false;
            }
            else
            {
                // Check deleted chapter numbers
                deletedChapterNumbers = chapterOverview.Chapter.Where(c => !overview.Chapter.Any(uc => uc.ChapterNumber == c.ChapterNumber)).Select(c => c.ChapterNumber).ToList();

                // Check deleted chapters
                List<AikaChapter> deletedChapters = chapterOverview.Chapter.Where(c => !overview.Chapter.Any(uc => uc.Id == c.Id)).ToList();
                foreach(AikaChapter curDeletedChapter in deletedChapters)
                {
                    if(string.IsNullOrEmpty(curDeletedChapter.DetailViewId))
                    {
                        continue;
                    }

                    AikaChapterDetail deletedChapterDetail = await _chapterDetailDbAccess.GetChapterDetailById(curDeletedChapter.DetailViewId);
                    if((deletedChapterDetail.Detail != null && deletedChapterDetail.Detail.Count > 0) ||
                       (deletedChapterDetail.Quest != null && deletedChapterDetail.Quest.Count > 0) ||
                       (deletedChapterDetail.AllDone != null && deletedChapterDetail.AllDone.Count > 0) ||
                       (deletedChapterDetail.Finish != null && deletedChapterDetail.Finish.Count > 0) )
                    {
                        _logger.LogInformation("Tried to delete non empty chapter");
                        return StatusCode((int)HttpStatusCode.BadRequest, _localizer["CanNotDeleteNonEmptyChapter"].Value);
                    }

                    chapterDetailsToDelete.Add(deletedChapterDetail);
                }

                // Check renamed chapters
                List<AikaChapter> renamedChapters = overview.Chapter.Where(c => chapterOverview.Chapter.Any(uc => uc.Id == c.Id && uc.Name != c.Name)).ToList();
                foreach(AikaChapter curRenamedChapter in renamedChapters)
                {
                    if(string.IsNullOrEmpty(curRenamedChapter.DetailViewId))
                    {
                        continue;
                    }

                    AikaChapterDetail renamedChapterDetail = await _chapterDetailDbAccess.GetChapterDetailById(curRenamedChapter.DetailViewId);
                    renamedChapterDetail.Name = curRenamedChapter.Name;
                    chapterDetailsToRename.Add(renamedChapterDetail);
                }
            }
            
            // Update Data
            chapterOverview.Link = overview.Link != null ? overview.Link : new List<NodeLink>();
            chapterOverview.Chapter = overview.Chapter != null ? overview.Chapter : new List<AikaChapter>();

            // Create Detail Views
            _logger.LogInformation("Creating chapter detail views");
            bool errorOccured = false;
            List<AikaChapterDetail> createdChapterDetails = new List<AikaChapterDetail>();
            foreach(AikaChapter curChapter in chapterOverview.Chapter)
            {
                if(string.IsNullOrEmpty(curChapter.DetailViewId))
                {
                    try
                    {
                        AikaChapterDetail newChapterDetail = await CreateNewChapterDetail(defaultProject.Id, curChapter.Id, curChapter.Name);
                        curChapter.DetailViewId = newChapterDetail.Id;
                        createdChapterDetails.Add(newChapterDetail);
                    }
                    catch(Exception ex)
                    {
                        _logger.LogError(ex, "Could not create chapter detail view.");
                        errorOccured = true;
                        break;
                    }
                }
            }

            // Rollback on error
            if(errorOccured)
            {
                foreach(AikaChapterDetail curDetail in createdChapterDetails)
                {
                    await _chapterDetailDbAccess.DeleteChapterDetail(curDetail);
                }
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            // Save Chapter overview
            await this.SetModifiedData(_userManager, chapterOverview);

            if(overviewExisted)
            {
                await _chapterOverviewDbAccess.UpdateChapterOverview(chapterOverview);
            }
            else
            {
                chapterOverview = await _chapterOverviewDbAccess.CreateChapterOverview(chapterOverview);
            }

            // Rename Chapter details
            foreach(AikaChapterDetail curRenamedChapter in chapterDetailsToRename)
            {
                await _chapterDetailDbAccess.UpdateChapterDetail(curRenamedChapter);
            }

            // Remove Chapter Details for deleted chapters
            foreach(AikaChapterDetail curDeletedChapterDetail in chapterDetailsToDelete)
            {
                await _chapterDetailDbAccess.DeleteChapterDetail(curDeletedChapterDetail);
            }

            // Adjust Aika markers for deleted chapters
            int minChapterNumber = chapterOverview.Chapter.Min(c => c.ChapterNumber);
            int maxChapterNumber = chapterOverview.Chapter.Max(c => c.ChapterNumber);
            foreach(int curChapterNumber in deletedChapterNumbers)
            {
                await AdjustKartaMapMarkersForDeletedChapter(defaultProject.Id, curChapterNumber, minChapterNumber, maxChapterNumber, chapterOverview.Chapter);
            }

            // Timeline Entry
            await _timelineService.AddTimelineEntry(TimelineEvent.AikaChapterOverviewUpdated);

            return Ok(chapterOverview);
        }

        /// <summary>
        /// Adjustes map markers for a deleted chapters
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="deletedChapter">Deleted chapter number</param>
        /// <param name="minChapterNumber">Min Chapter number</param>
        /// <param name="maxChapterNumber">Max Chapter number</param>
        /// <param name="chapters">Chapters</param>
        /// <returns></returns>
        private async Task AdjustKartaMapMarkersForDeletedChapter(string projectId, int deletedChapter, int minChapterNumber, int maxChapterNumber, List<AikaChapter> chapters)
        {
            List<KartaMap> allMaps = await _kartaMapDbAccess.GetAllProjectMapsWithFullDetail(projectId);
            foreach(KartaMap curMap in allMaps)
            {
                bool anyChange = AdjustMapMarkerListForDeletedChapter(curMap.NpcMarker, deletedChapter, minChapterNumber, maxChapterNumber, chapters);
                anyChange = AdjustMapMarkerListForDeletedChapter(curMap.ItemMarker, deletedChapter, minChapterNumber, maxChapterNumber, chapters) || anyChange;
                anyChange = AdjustMapMarkerListForDeletedChapter(curMap.KirjaPageMarker, deletedChapter, minChapterNumber, maxChapterNumber, chapters) || anyChange;
                anyChange = AdjustMapMarkerListForDeletedChapter(curMap.QuestMarker, deletedChapter, minChapterNumber, maxChapterNumber, chapters) || anyChange;
                anyChange = AdjustMapMarkerListForDeletedChapter(curMap.MapChangeMarker, deletedChapter, minChapterNumber, maxChapterNumber, chapters) || anyChange;

                if(anyChange)
                {
                    await _kartaMapDbAccess.UpdateMap(curMap);
                }
            } 
        }

        /// <summary>
        /// Adjusts a list of map markers for a deleted chapter
        /// </summary>
        /// <param name="markers">List of markers</param>
        /// <param name="deletedChapter">Deleted chapter number</param>
        /// <param name="minChapterNumber">Min Chapter number</param>
        /// <param name="maxChapterNumber">Max Chapter number</param>
        /// <param name="chapters">Chapters</param>
        /// <returns>true if any change happend, else false</returns>
        private bool AdjustMapMarkerListForDeletedChapter<Marker>(List<Marker> markers, int deletedChapter, int minChapterNumber, int maxChapterNumber, List<AikaChapter> chapters) where Marker : MapMarker
        {
            bool markerWasAdjusted = false;
            for(int curMarkerIndex = markers.Count - 1; curMarkerIndex >= 0; --curMarkerIndex)
            {
                Marker curMarker = markers[curMarkerIndex];

                // Adjust added in
                if(curMarker.AddedInChapter == deletedChapter)
                {
                    if(curMarker.AddedInChapter < maxChapterNumber)
                    {
                        curMarker.AddedInChapter = GetNextChapterNumber(curMarker.AddedInChapter, chapters);
                    }
                    else
                    {
                        if(curMarker.AddedInChapter <= minChapterNumber)
                        {
                            curMarker.AddedInChapter = -1;
                        }
                        else
                        {
                            curMarker.AddedInChapter = chapters.Where(c => c.ChapterNumber < curMarker.AddedInChapter).Max(c => c.ChapterNumber);
                        }
                    }

                    markerWasAdjusted = true;
                }
                else if(curMarker.AddedInChapter > 0  && curMarker.AddedInChapter <= minChapterNumber)
                {
                    // Check case first chapter was deleted
                    curMarker.AddedInChapter = -1;
                    markerWasAdjusted = true;
                }

                // Adjust deleted in
                if(curMarker.DeletedInChapter == deletedChapter)
                {
                    if(curMarker.DeletedInChapter < maxChapterNumber)
                    {
                        curMarker.DeletedInChapter = GetNextChapterNumber(curMarker.DeletedInChapter, chapters);
                    }
                    else
                    {
                        curMarker.DeletedInChapter = -1;
                    }

                    markerWasAdjusted = true;
                }

                if(curMarker.AddedInChapter > 0 && curMarker.AddedInChapter == curMarker.DeletedInChapter)
                {
                    markers.RemoveAt(curMarkerIndex);
                    continue;
                }

                // Adjust pixel coords
                if(curMarker.ChapterPixelCoords == null)
                {
                    continue;
                }

                MapMarkerChapterPixelCoords pixelCoords = curMarker.ChapterPixelCoords.FirstOrDefault(c => c.ChapterNumber == deletedChapter);
                if(pixelCoords != null)
                {
                    if(deletedChapter >= maxChapterNumber)
                    {
                        curMarker.ChapterPixelCoords.Remove(pixelCoords);
                    }
                    else
                    {
                        int nextChapterNumber = GetNextChapterNumber(pixelCoords.ChapterNumber, chapters);
                        MapMarkerChapterPixelCoords nextChapterPixelCoords = curMarker.ChapterPixelCoords.FirstOrDefault(c => c.ChapterNumber == nextChapterNumber);
                        if(nextChapterPixelCoords == null)
                        {
                            pixelCoords.ChapterNumber = nextChapterNumber;
                        }
                        else
                        {
                            curMarker.ChapterPixelCoords.Remove(pixelCoords);
                        }
                    }

                    markerWasAdjusted = true;
                }

                // Check first chapter deleted and adjust pixel coords if required
                if(deletedChapter < minChapterNumber)
                {
                    MapMarkerChapterPixelCoords lowestPixelCoords = curMarker.ChapterPixelCoords.FirstOrDefault(c => c.ChapterNumber == minChapterNumber);
                    if(lowestPixelCoords != null)
                    {
                        curMarker.X = lowestPixelCoords.X;
                        curMarker.Y = lowestPixelCoords.Y;
                        curMarker.ChapterPixelCoords.Remove(lowestPixelCoords);
                        
                        markerWasAdjusted = true;
                    }
                }
            }

            return markerWasAdjusted;
        }

        /// <summary>
        /// Returns the next chapter number
        /// </summary>
        /// <param name="curChapter">Current Chapter</param>
        /// <param name="chapters">All Chapters</param>
        /// <returns>Next Chapter number after the chapter</returns>
        private int GetNextChapterNumber(int curChapter, List<AikaChapter> chapters)
        {
            return chapters.Where(c => c.ChapterNumber > curChapter).Min(c => c.ChapterNumber);
        }

        /// <summary>
        /// Returns available chapters
        /// </summary>
        /// <returns>Available chapters</returns>
        [HttpGet]
        public async Task<IActionResult> GetChapters()
        {
            GoNorthProject defaultProject = await _projectDbAccess.GetDefaultProject();
            AikaChapterOverview chapterOverview = await _chapterOverviewDbAccess.GetChapterOverviewByProjectId(defaultProject.Id);
            if(chapterOverview == null || chapterOverview.Chapter == null)
            {
                return Ok(new List<ChapterResponse>());
            }

            List<ChapterResponse> chapter = chapterOverview.Chapter.Select(c => new ChapterResponse {
                Id = c.Id,
                Name = c.Name,
                Number = c.ChapterNumber
            }).OrderBy(c => c.Number).ToList();

            return Ok(chapter);
        }


        /// <summary>
        /// Searches chapter details
        /// </summary>
        /// <param name="searchPattern">Search Pattern</param>
        /// <param name="start">Start of the page</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Chapter Details</returns>
        [HttpGet]
        public async Task<IActionResult> GetChapterDetails(string searchPattern, int start, int pageSize)
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();

            Task<List<AikaChapterDetail>> queryTask;
            Task<int> countTask;
            if(string.IsNullOrEmpty(searchPattern))
            {
                queryTask = _chapterDetailDbAccess.GetChapterDetailsByProjectId(project.Id, start, pageSize);
                countTask = _chapterDetailDbAccess.GetChapterDetailsByProjectIdCount(project.Id);
            }
            else
            {
                queryTask = _chapterDetailDbAccess.SearchChapterDetails(project.Id, searchPattern, start, pageSize);
                countTask = _chapterDetailDbAccess.SearchChapterDetailsCount(project.Id, searchPattern);
            }
            Task.WaitAll(queryTask, countTask);

            ChapterDetailQueryResult queryResult = new ChapterDetailQueryResult();
            queryResult.Details = queryTask.Result;
            queryResult.HasMore = start + queryResult.Details.Count < countTask.Result;
            return Ok(queryResult);
        }

        /// <summary>
        /// Returns a chapter detail
        /// </summary>
        /// <param name="id">Id of the Chapter Detail</param>
        /// <returns>Chapter detail</returns>
        [HttpGet]
        public async Task<IActionResult> GetChapterDetail(string id)
        {
            if(string.IsNullOrEmpty(id))
            {
                return StatusCode((int)HttpStatusCode.BadRequest);
            }

            AikaChapterDetail detail = await _chapterDetailDbAccess.GetChapterDetailById(id);
            return Ok(detail);
        }

        /// <summary>
        /// Returns all chapter details which are using a quest
        /// </summary>
        /// <param name="questId">Quest Id</param>
        /// <returns>Chapter Details</returns>
        [HttpGet]
        public async Task<IActionResult> GetChapterDetailsByQuest(string questId)
        {
            List<AikaChapterDetail> details = await _chapterDetailDbAccess.GetChapterDetailsByQuestId(questId);
            return Ok(details);
        }

        /// <summary>
        /// Returns if a chapter detail can be deleted
        /// </summary>
        /// <param name="id">Id of the Chapter Detail</param>
        /// <returns>Chapter detaildelete validation result</returns>
        [HttpGet]
        public async Task<IActionResult> ValidateChapterDetailDelete(string id)
        {
            if(string.IsNullOrEmpty(id))
            {
                return StatusCode((int)HttpStatusCode.BadRequest);
            }

            AikaChapterDetail detail = await _chapterDetailDbAccess.GetChapterDetailById(id);
            ChapterDetailDeleteValidationResult validationResult = new ChapterDetailDeleteValidationResult();
            validationResult.CanBeDeleted = true;

            if((detail.Finish != null && detail.Finish.Count > 0) || (detail.Detail != null && detail.Detail.Count > 0) ||
               (detail.Quest != null && detail.Quest.Count > 0) || (detail.AllDone != null && detail.AllDone.Count > 0))
            {
                bool isDetailView = string.IsNullOrEmpty(detail.ChapterId);
                bool canBeDeleted = false;
                if(isDetailView)
                {
                    canBeDeleted = await _chapterDetailDbAccess.DetailUsedInNodesCount(id, string.Empty) > 1;
                }

                if(!canBeDeleted)
                {
                    validationResult.CanBeDeleted = false;
                    validationResult.ErrorMessage = isDetailView ? _localizer["CanNotDeleteNonEmptyChapterDetail"].Value : _localizer["CanNotDeleteNonEmptyChapter"].Value;
                }
            }

            return Ok(validationResult);
        }


        /// <summary>
        /// Creates the detail views for detail nodes in a chapter detail
        /// </summary>
        /// <param name="defaultProject">Default Project</param>
        /// <param name="detail">Detail for which to create the views</param>
        /// <returns>true if successfull, else false</returns>
        private async Task<bool> CreateDetailsForDetail(GoNorthProject defaultProject, AikaChapterDetail detail)
        {
            // Create Detail Views
            _logger.LogInformation("Creating chapter detail views");
            bool errorOccured = false;
            List<AikaChapterDetail> createdChapterDetails = new List<AikaChapterDetail>();
            foreach(AikaChapterDetailNode curDetail in detail.Detail)
            {
                if(string.IsNullOrEmpty(curDetail.DetailViewId))
                {
                    try
                    {
                        AikaChapterDetail newChapterDetail = await CreateNewChapterDetail(defaultProject.Id, string.Empty, curDetail.Name);
                        curDetail.DetailViewId = newChapterDetail.Id;
                        createdChapterDetails.Add(newChapterDetail);
                    }
                    catch(Exception ex)
                    {
                        _logger.LogError(ex, "Could not create chapter detail view.");
                        errorOccured = true;
                        break;
                    }
                }
            }

            // Rollback on error
            if(errorOccured)
            {
                foreach(AikaChapterDetail curDetail in createdChapterDetails)
                {
                    await _chapterDetailDbAccess.DeleteChapterDetail(curDetail);
                }
                return false;
            }

            return true;
        }

        /// <summary>
        /// Copies the valid chapter detail properties to a target chapter detail
        /// </summary>
        /// <param name="targetDetail">Target chapter detail to copy to</param>
        /// <param name="sourceDetail">Source chapter detail to copy from</param>
        private void CopyValidChapterDetailProperties(AikaChapterDetail targetDetail, AikaChapterDetail sourceDetail)
        {
            targetDetail.Start = GetStartNodeList(sourceDetail.Start);
            targetDetail.Detail = sourceDetail.Detail != null ? sourceDetail.Detail : new List<AikaChapterDetailNode>();
            targetDetail.Quest = sourceDetail.Quest != null ? sourceDetail.Quest : new List<AikaQuestNode>();
            targetDetail.AllDone = sourceDetail.AllDone != null ? sourceDetail.AllDone : new List<AikaAllDone>();
            targetDetail.Finish = sourceDetail.Finish != null ? sourceDetail.Finish : new List<AikaFinish>();
            targetDetail.Link = sourceDetail.Link != null ? sourceDetail.Link : new List<NodeLink>();
        }

        /// <summary>
        /// Creates a new chapter detail
        /// </summary>
        /// <param name="chapterDetail">Chapter Detail</param>
        /// <returns>Created chapter detail</returns>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CreateChapterDetail([FromBody]AikaChapterDetail chapterDetail)
        {
            GoNorthProject defaultProject = await _projectDbAccess.GetDefaultProject();
            AikaChapterDetail newChapterDetail = new AikaChapterDetail();
            newChapterDetail.ProjectId = defaultProject.Id;
            
            newChapterDetail.ChapterId = string.Empty;
            newChapterDetail.Name = chapterDetail.Name;

            CopyValidChapterDetailProperties(newChapterDetail, chapterDetail);

            await this.SetModifiedData(_userManager, newChapterDetail);

            bool detailSuccess = await CreateDetailsForDetail(defaultProject, newChapterDetail);
            if(!detailSuccess)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            newChapterDetail = await _chapterDetailDbAccess.CreateChapterDetail(newChapterDetail);

            // Timeline Entry
            await _timelineService.AddTimelineEntry(TimelineEvent.AikaChapterDetailCreated, newChapterDetail.Id);

            return Ok(newChapterDetail);
        }

        /// <summary>
        /// Updates a chapter detail
        /// </summary>
        /// <param name="id">Id of the chapter detail</param>
        /// <param name="chapterDetail">Chapter Detail</param>
        /// <returns>Updated chapter detail</returns>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateChapterDetail(string id, [FromBody]AikaChapterDetail chapterDetail)
        {
            GoNorthProject defaultProject = await _projectDbAccess.GetDefaultProject();
            AikaChapterDetail updatedChapterDetail = await _chapterDetailDbAccess.GetChapterDetailById(id);
            if(updatedChapterDetail.Detail == null)
            {
                updatedChapterDetail.Detail = new List<AikaChapterDetailNode>();
            }

            if(chapterDetail.Detail == null)
            {
                chapterDetail.Detail = new List<AikaChapterDetailNode>();
            }
            
            // Check deleted chapters
            List<AikaChapterDetail> chapterDetailsToDelete = new List<AikaChapterDetail>();
            List<AikaChapterDetail> chapterDetailsToRename = new List<AikaChapterDetail>();
            List<AikaChapterDetailNode> deletedChapterDetails = updatedChapterDetail.Detail.Where(c => !chapterDetail.Detail.Any(uc => uc.Id == c.Id)).ToList();
            foreach(AikaChapterDetailNode curDeletedChapterDetail in deletedChapterDetails)
            {
                if(string.IsNullOrEmpty(curDeletedChapterDetail.DetailViewId))
                {
                    continue;
                }

                bool detailIsStillUsed = await _chapterDetailDbAccess.DetailUsedInNodesCount(curDeletedChapterDetail.DetailViewId, curDeletedChapterDetail.Id) > 0;
                if(detailIsStillUsed)
                {
                    continue;
                }

                AikaChapterDetail deletedChapterDetail = await _chapterDetailDbAccess.GetChapterDetailById(curDeletedChapterDetail.DetailViewId);
                if((deletedChapterDetail.Detail != null && deletedChapterDetail.Detail.Count > 0) ||
                    (deletedChapterDetail.Quest != null && deletedChapterDetail.Quest.Count > 0) ||
                    (deletedChapterDetail.AllDone != null && deletedChapterDetail.AllDone.Count > 0) ||
                    (deletedChapterDetail.Finish != null && deletedChapterDetail.Finish.Count > 0) )
                {
                    _logger.LogInformation("Tried to delete non empty chapter detail");
                    return StatusCode((int)HttpStatusCode.BadRequest, _localizer["CanNotDeleteNonEmptyChapterDetail"].Value);
                }

                chapterDetailsToDelete.Add(deletedChapterDetail);
            }

            // Check renamed chapters
            List<AikaChapterDetailNode> renamedChapterDetails = chapterDetail.Detail.Where(c => updatedChapterDetail.Detail.Any(uc => uc.Id == c.Id && uc.Name != c.Name)).ToList();
            foreach(AikaChapterDetailNode curRenamedChapterDetail in renamedChapterDetails)
            {
                if(string.IsNullOrEmpty(curRenamedChapterDetail.DetailViewId))
                {
                    continue;
                }

                AikaChapterDetail renamedChapterDetail = await _chapterDetailDbAccess.GetChapterDetailById(curRenamedChapterDetail.DetailViewId);
                renamedChapterDetail.Name = curRenamedChapterDetail.Name;
                chapterDetailsToRename.Add(renamedChapterDetail);
            }

            CopyValidChapterDetailProperties(updatedChapterDetail, chapterDetail);

            await this.SetModifiedData(_userManager, updatedChapterDetail);

            bool detailSuccess = await CreateDetailsForDetail(defaultProject, updatedChapterDetail);
            if(!detailSuccess)
            {
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            await _chapterDetailDbAccess.UpdateChapterDetail(updatedChapterDetail);

            // Rename Chapter details
            foreach(AikaChapterDetail curRenamedChapterDetail in chapterDetailsToRename)
            {
                await _chapterDetailDbAccess.UpdateChapterDetail(curRenamedChapterDetail);
            }

            // Remove Chapter Details for deleted chapters
            foreach(AikaChapterDetail curDeletedChapterDetail in chapterDetailsToDelete)
            {
                await _chapterDetailDbAccess.DeleteChapterDetail(curDeletedChapterDetail);
            }

            // Timeline Entry
            await _timelineService.AddTimelineEntry(TimelineEvent.AikaChapterDetailUpdated, updatedChapterDetail.Id);

            return Ok(updatedChapterDetail);
        }
        
        /// <summary>
        /// Creates an empty start node
        /// </summary>
        /// <returns>Empty start node</returns>
        private AikaStart CreateEmptyStartNode()
        {
            AikaStart startNode = new AikaStart();
            startNode.Id = Guid.NewGuid().ToString();
            startNode.X = 20;
            startNode.Y = 350; // Default height: 700px -> 350 is middle

            return startNode;
        }

        /// <summary>
        /// Returns the start node list from a list of start nodes and ensures that there exists at least one
        /// </summary>
        /// <param name="start">List of start nodes to read from</param>
        /// <returns>Start Node List with at least one entry</returns>
        private List<AikaStart> GetStartNodeList(List<AikaStart> start)
        {
            if(start == null || start.Count == 0)
            {
                start = new List<AikaStart>();
                start.Add(CreateEmptyStartNode());
                return start;
            }

            return start;
        }

        /// <summary>
        /// Deletes a chapter detail
        /// </summary>
        /// <param name="id">Id of the Chapter Detail</param>
        /// <returns>Deleted chapter detail</returns>
        [HttpDelete]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteChapterDetail(string id)
        {
            AikaChapterDetail deletedChapterDetail = await _chapterDetailDbAccess.GetChapterDetailById(id);
            await _chapterDetailDbAccess.DeleteChapterDetail(deletedChapterDetail);

            // Timeline Entry
            await _timelineService.AddTimelineEntry(TimelineEvent.AikaChapterDetailDeleted);

            return Ok(id);
        }


        /// <summary>
        /// Searches quests
        /// </summary>
        /// <param name="searchPattern">Search Pattern</param>
        /// <param name="start">Start of the page</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Quests</returns>
        [HttpGet]
        public async Task<IActionResult> GetQuests(string searchPattern, int start, int pageSize)
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();

            Task<List<AikaQuest>> queryTask;
            Task<int> countTask;
            if(string.IsNullOrEmpty(searchPattern))
            {
                queryTask = _questDbAccess.GetQuestsByProjectId(project.Id, start, pageSize);
                countTask = _questDbAccess.GetQuestsByProjectIdCount(project.Id);
            }
            else
            {
                queryTask = _questDbAccess.SearchQuests(project.Id, searchPattern, start, pageSize);
                countTask = _questDbAccess.SearchQuestsCount(project.Id, searchPattern);
            }
            Task.WaitAll(queryTask, countTask);

            QuestQueryResult queryResult = new QuestQueryResult();
            queryResult.Quests = queryTask.Result;
            queryResult.HasMore = start + queryResult.Quests.Count < countTask.Result;
            return Ok(queryResult);
        }

        /// <summary>
        /// Returns not implemented quests
        /// </summary>
        /// <param name="start">Start of the page</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Quests</returns>
        [Authorize(Roles = RoleNames.Aika)]
        [Authorize(Roles = RoleNames.ImplementationStatusTracker)]
        [HttpGet]
        public async Task<IActionResult> GetNotImplementedQuests(int start, int pageSize)
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();

            Task<List<AikaQuest>> queryTask = _questDbAccess.GetNotImplementedQuests(project.Id, start, pageSize);
            Task<int> countTask = _questDbAccess.GetNotImplementedQuestsCount(project.Id);
            Task.WaitAll(queryTask, countTask);

            QuestQueryResult queryResult = new QuestQueryResult();
            queryResult.Quests = queryTask.Result;
            queryResult.HasMore = start + queryResult.Quests.Count < countTask.Result;
            return Ok(queryResult);
        }

        /// <summary>
        /// Returns a quest by its id
        /// </summary>
        /// <param name="id">Quest id</param>
        /// <returns>Quest</returns>
        [HttpGet]
        public async Task<IActionResult> GetQuest(string id)
        {
            AikaQuest quest = await _questDbAccess.GetQuestById(id);
            return Ok(quest);
        }

        /// <summary>
        /// Returns all quests an object is referenced in
        /// </summary>
        /// <param name="objectId">Object id</param>
        /// <returns>Quests</returns>
        [HttpGet]
        public async Task<IActionResult> GetQuestsObjectIsReferenced(string objectId)
        {
            List<AikaQuest> quests = await _questDbAccess.GetQuestsObjectIsReferenced(objectId);
            return Ok(quests);
        }

        /// <summary>
        /// Resolves the names for a list of quests
        /// </summary>
        /// <param name="questIds">Quest Ids</param>
        /// <returns>Resolved names</returns>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ResolveQuestNames([FromBody]List<string> questIds)
        {
            List<AikaQuest> questNames = await _questDbAccess.ResolveQuestNames(questIds);
            return Ok(questNames);
        }

        /// <summary>
        /// Creates a new quest
        /// </summary>
        /// <param name="quest">Quest</param>
        /// <returns>Created quest</returns>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CreateQuest([FromBody]AikaQuest quest)
        {
            GoNorthProject defaultProject = await _projectDbAccess.GetDefaultProject();
            AikaQuest newQuest = new AikaQuest();
            newQuest.ProjectId = defaultProject.Id;
            
            CopyValidQuestProperties(newQuest,  quest);

            await this.SetModifiedData(_userManager, newQuest);

            newQuest = await _questDbAccess.CreateQuest(newQuest);

            // Timeline Entry
            await _timelineService.AddTimelineEntry(TimelineEvent.AikaQuestCreated, newQuest.Id, newQuest.Name);

            return Ok(newQuest);
        }

        /// <summary>
        /// Updates a quest
        /// </summary>
        /// <param name="id">Id of the quest</param>
        /// <param name="quest">Quest</param>
        /// <returns>Updated quest</returns>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateQuest(string id, [FromBody]AikaQuest quest)
        {
            AikaQuest updatedQuest = await _questDbAccess.GetQuestById(id);
            
            CopyValidQuestProperties(updatedQuest,  quest);

            await this.SetModifiedData(_userManager, updatedQuest);

            if(updatedQuest.IsImplemented)
            {
                CompareResult result = await _implementationStatusComparer.CompareQuest(updatedQuest.Id, updatedQuest);
                if(result.CompareDifference != null && result.CompareDifference.Count > 0)
                {
                    updatedQuest.IsImplemented = false;
                }
            }

            await _questDbAccess.UpdateQuest(updatedQuest);

            // Timeline Entry
            await _timelineService.AddTimelineEntry(TimelineEvent.AikaQuestUpdated, updatedQuest.Id, updatedQuest.Name);

            return Ok(updatedQuest);
        }

        /// <summary>
        /// Copies the valid quest properties to a target quest
        /// </summary>
        /// <param name="targetQuest">Target quest to copy to</param>
        /// <param name="sourceQuest">Source quest to copy from</param>
        private void CopyValidQuestProperties(AikaQuest targetQuest, AikaQuest sourceQuest)
        {
            targetQuest.Name = sourceQuest.Name;
            targetQuest.Description = sourceQuest.Description;
            targetQuest.IsMainQuest = sourceQuest.IsMainQuest;

            targetQuest.Fields = sourceQuest.Fields;
            
            FlexFieldApiUtil.SetFieldIdsForNewFields(targetQuest.Fields);

            targetQuest.Start = GetStartNodeList(sourceQuest.Start);
            targetQuest.Text = sourceQuest.Text != null ? sourceQuest.Text : new List<TextNode>();
            targetQuest.Finish = sourceQuest.Finish != null ? sourceQuest.Finish : new List<AikaFinish>();
            targetQuest.Condition = sourceQuest.Condition != null ? sourceQuest.Condition : new List<ConditionNode>();
            targetQuest.Action = sourceQuest.Action != null ? sourceQuest.Action : new List<ActionNode>();
            targetQuest.AllDone = sourceQuest.AllDone != null ? sourceQuest.AllDone : new List<AikaAllDone>();
            targetQuest.Link = sourceQuest.Link != null ? sourceQuest.Link : new List<NodeLink>();
        }

        /// <summary>
        /// Deletes a quest
        /// </summary>
        /// <param name="id">Id of the quest</param>
        /// <returns>Deleted quest</returns>
        [HttpDelete]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteQuest(string id)
        {
            // Check References
            List<AikaChapterDetail> chapterDetails = await _chapterDetailDbAccess.GetChapterDetailsByQuestId(id);
            if(chapterDetails.Count > 0)
            {
                string usedInChapterDetails = string.Join(", ", chapterDetails.Select(p => p.Name));
                return StatusCode((int)HttpStatusCode.BadRequest, _localizer["CanNotDeleteQuestUsedInChapterDetail", usedInChapterDetails].Value);
            }

            List<KirjaPage> kirjaPages = await _kirjaPageDbAccess.GetPagesByQuest(id);
            if(kirjaPages.Count > 0)
            {
                string mentionedInPages = string.Join(", ", kirjaPages.Select(p => p.Name));
                return StatusCode((int)HttpStatusCode.BadRequest, _localizer["CanNotDeleteQuestMentionedInKirjaPage", mentionedInPages].Value);
            }

            List<TaleDialog> taleDialogs = await _taleDbAccess.GetDialogsObjectIsReferenced(id);
            taleDialogs = taleDialogs.Where(t => t.RelatedObjectId != id).ToList();
            if(taleDialogs.Count > 0)
            {
                List<KortistoNpc> npcs = await _kortistoNpcDbAccess.ResolveFlexFieldObjectNames(taleDialogs.Select(t => t.RelatedObjectId).ToList());
                string referencedInDialogs = string.Join(", ", npcs.Select(n => n.Name));
                return StatusCode((int)HttpStatusCode.BadRequest, _localizer["CanNotDeleteQuestReferencedInTaleDialog", referencedInDialogs].Value);
            }

            // Delete Quest
            AikaQuest deletedQuest = await _questDbAccess.GetQuestById(id);
            await _questDbAccess.DeleteQuest(deletedQuest);

            // Delete Marker
            await _kartaMapDbAccess.DeleteMarkersOfQuest(id);

            // Timeline Entry
            await _timelineService.AddTimelineEntry(TimelineEvent.AikaQuestDeleted, deletedQuest.Name);

            return Ok(id);
        }

    }
}