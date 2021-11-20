using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using GoNorth.Data.Kirja;
using GoNorth.Data.Project;
using GoNorth.Services.Kirja;
using GoNorth.Services.Timeline;
using GoNorth.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Identity;
using GoNorth.Data.User;
using GoNorth.Data.Karta;
using Microsoft.Extensions.Options;
using GoNorth.Config;
using System.Text.RegularExpressions;
using GoNorth.Data.Karta.Marker;
using GoNorth.Services.Security;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Styr;
using GoNorth.Data.Evne;
using GoNorth.Data.Aika;
using System.Globalization;
using GoNorth.Services.Project;
using GoNorth.Data.Tale;
using GoNorth.Data.Exporting;
using GoNorth.Services.Export.ExportSnippets;
using GoNorth.Data.StateMachines;
using GoNorth.Services.Encryption;
using GoNorth.Authentication;

namespace GoNorth.Controllers.Api
{
    /// <summary>
    /// Kirja Api controller
    /// </summary>
    [ApiController]
    [Authorize(Roles = RoleNames.Kirja)]
    [Route("/api/[controller]/[action]")]
    public class KirjaApiController : ControllerBase
    {
        /// <summary>
        /// Page Request data
        /// </summary>
        public class PageRequest
        {
            /// <summary>
            /// Page Name
            /// </summary>
            public string Name { get; set; }

            /// <summary>
            /// Content of the page
            /// </summary>
            public string Content { get; set; }
        }

        /// <summary>
        /// Page Query Result
        /// </summary>
        public class PageQueryResult
        {
            /// <summary>
            /// true if there are more pages to query, else false
            /// </summary>
            public bool HasMore { get; set; }

            /// <summary>
            /// Pages
            /// </summary>
            public IList<KirjaPage> Pages { get; set; }
        }

        /// <summary>
        /// Single Page Version Query Result
        /// </summary>
        public class SinglePageVersionQueryResult
        {
            /// <summary>
            /// Most recent version
            /// </summary>
            public int MostRecentVersion { get; set; }

            /// <summary>
            /// Version
            /// </summary>
            public KirjaPageVersion Version { get; set; }
        }

        /// <summary>
        /// Page Version Query Result
        /// </summary>
        public class PageVersionQueryResult
        {
            /// <summary>
            /// true if there are more versions to query, else false
            /// </summary>
            public bool HasMore { get; set; }

            /// <summary>
            /// Most recent version
            /// </summary>
            public int MostRecentVersion { get; set; }

            /// <summary>
            /// Versions
            /// </summary>
            public IList<KirjaPageVersion> Versions { get; set; }
        }

        /// <summary>
        /// Page version reference validation result
        /// </summary>
        public class PageVersionReferenceValidationResult
        {
            /// <summary>
            /// Missing Npcs
            /// </summary>
            public List<string> MissingNpcs { get; set; }

            /// <summary>
            /// Missing Items
            /// </summary>
            public List<string> MissingItems { get; set; }

            /// <summary>
            /// Missing Skills
            /// </summary>
            public List<string> MissingSkills { get; set; }

            /// <summary>
            /// Missing Pages
            /// </summary>
            public List<string> MissingPages { get; set; }

            /// <summary>
            /// Missing Quests
            /// </summary>
            public List<string> MissingQuests { get; set; }
        }

        /// <summary>
        /// Request to start a review
        /// </summary>
        public class StartReviewRequest 
        {
            /// <summary>
            /// Name of the review
            /// </summary>
            public string Name { get; set; }

            /// <summary>
            /// Id of the page that must be reviewd
            /// </summary>
            public string PageId { get; set; }

            /// <summary>
            /// Id of the version for which the review was started
            /// </summary>
            public string VersionId { get; set; }
        }

        /// <summary>
        /// Page Review Query Result
        /// </summary>
        public class PageReviewQueryResult
        {
            /// <summary>
            /// true if there are more reviews to query, else false
            /// </summary>
            public bool HasMore { get; set; }

            /// <summary>
            /// Reviews
            /// </summary>
            public IList<KirjaPageReview> Reviews { get; set; }
        }

        /// <summary>
        /// Review Request data
        /// </summary>
        public class ReviewRequest
        {   
            /// <summary>
            /// Content of the page
            /// </summary>
            public string Content { get; set; }
            
            /// <summary>
            /// Additional comment of the page
            /// </summary>
            public string AdditionalComment { get; set; }
        }

        /// <summary>
        /// External access token length
        /// </summary>
        public const int ExternalAccessTokenLength = 256;

        /// <summary>
        /// Page Db Access
        /// </summary>
        private readonly IKirjaPageDbAccess _pageDbAccess;

        /// <summary>
        /// Page Version Db ACcess
        /// </summary>
        private readonly IKirjaPageVersionDbAccess _pageVersionDbAccess;

        /// <summary>
        /// Page Review Db Access
        /// </summary>
        private readonly IKirjaPageReviewDbAccess _pageReviewDbAccess;

        /// <summary>
        /// User project access
        /// </summary>
        private readonly IUserProjectAccess _userProjectAccess;

        /// <summary>
        /// Karta Map Db Access
        /// </summary>
        private readonly IKartaMapDbAccess _kartaMapDbAccess;

        /// <summary>
        /// Npc Db Access
        /// </summary>
        private readonly IKortistoNpcDbAccess _npcDbAccess;

        /// <summary>
        /// Npc Db Access
        /// </summary>
        private readonly IKortistoNpcTemplateDbAccess _npcTemplateDbAccess;

        /// <summary>
        /// Item Db Access
        /// </summary>
        private readonly IStyrItemDbAccess _itemDbAccess;

        /// <summary>
        /// Skill Db Access
        /// </summary>
        private readonly IEvneSkillDbAccess _skillDbAccess;

        /// <summary>
        /// Quest Db Access
        /// </summary>
        private readonly IAikaQuestDbAccess _questDbAccess;

        /// <summary>
        /// Dialog Db Access
        /// </summary>
        private readonly ITaleDbAccess _dialogDbAccess;

        /// <summary>
        /// Object export snippet Db Access
        /// </summary>
        protected readonly IObjectExportSnippetDbAccess _objectExportSnippetDbAccess;

        /// <summary>
        /// File Access
        /// </summary>
        private readonly IKirjaFileAccess _fileAccess;

        /// <summary>
        /// Timeline Service
        /// </summary>
        private readonly ITimelineService _timelineService;

        /// <summary>
        /// Page parser service
        /// </summary>
        private readonly IKirjaPageParserService _pageParserService;

        /// <summary>
        /// Service that will resolve export snippet related object names
        /// </summary>
        private readonly IExportSnippetRelatedObjectNameResolver _exportSnippetRelatedObjectNameResolver;

        /// <summary>
        /// State machine Db Access
        /// </summary>
        private readonly IStateMachineDbAccess _stateMachineDbAccess;

        /// <summary>
        /// User Manager
        /// </summary>
        private readonly UserManager<GoNorthUser> _userManager;

        /// <summary>
        /// Xss Checker
        /// </summary>
        private readonly IXssChecker _xssChecker;

        /// <summary>
        /// Secure token generator
        /// </summary>
        private readonly ISecureTokenGenerator _secureTokenGenerator;

        /// <summary>
        /// Logger
        /// </summary>
        private readonly ILogger _logger;
    
        /// <summary>
        /// Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Allowed Attachment Mime Types
        /// </summary>
        private readonly List<string> _allowedAttachmentMimeTypes;

        /// <summary>
        /// Version merge time span in minutes
        /// </summary>
        private readonly float _versionMergeTimeSpan;

        /// <summary>
        /// Max Version Count for pages
        /// </summary>
        private readonly int _maxVersionCount;

        /// <summary>
        /// true if external sharing is disabled
        /// </summary>
        private readonly bool _disableWikiExternalSharing;
        
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="pageDbAccess">Page Db Access</param>
        /// <param name="pageVersionDbAccess">Page Version Db Access</param>
        /// <param name="pageReviewDbAccess">Page review Db Access</param>
        /// <param name="kartaMapDbAccess">Karta Map Db Access</param>
        /// <param name="npcDbAccess">Npc Db Access</param>
        /// <param name="npcTemplateDbAccess">Npc Template Db Access</param>
        /// <param name="itemDbAccess">Item Db Access</param>
        /// <param name="skillDbAccess">Skill Db Access</param>
        /// <param name="questDbAccess">Quest Db Access</param>
        /// <param name="dialogDbAccess">Dialog Db Access</param>
        /// <param name="objectExportSnippetDbAccess">Object export snippet Db Access</param>
        /// <param name="stateMachineDbAccess">State Machine Db Access</param>
        /// <param name="userProjectAccess">User project access</param>
        /// <param name="fileAccess">File Access</param>
        /// <param name="timelineService">Timeline Service</param>
        /// <param name="pageParserService">Page parser service</param>
        /// <param name="exportSnippetRelatedObjectNameResolver">Service that will resolve export snippet related object names</param>
        /// <param name="userManager">User Manager</param>
        /// <param name="xssChecker">Xss Checker</param>
        /// <param name="secureTokenGenerator">Secure Token Generator</param>
        /// <param name="logger">Logger</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="configuration">Config Data</param>
        public KirjaApiController(IKirjaPageDbAccess pageDbAccess, IKirjaPageVersionDbAccess pageVersionDbAccess, IKirjaPageReviewDbAccess pageReviewDbAccess, IKartaMapDbAccess kartaMapDbAccess, IKortistoNpcDbAccess npcDbAccess, IKortistoNpcTemplateDbAccess npcTemplateDbAccess, 
                                  IStyrItemDbAccess itemDbAccess, IEvneSkillDbAccess skillDbAccess, IAikaQuestDbAccess questDbAccess, ITaleDbAccess dialogDbAccess, IObjectExportSnippetDbAccess objectExportSnippetDbAccess, IStateMachineDbAccess stateMachineDbAccess, 
                                  IUserProjectAccess userProjectAccess, IKirjaFileAccess fileAccess, ITimelineService timelineService, IKirjaPageParserService pageParserService, IExportSnippetRelatedObjectNameResolver exportSnippetRelatedObjectNameResolver, UserManager<GoNorthUser> userManager, 
                                  IXssChecker xssChecker, ISecureTokenGenerator secureTokenGenerator, ILogger<KirjaApiController> logger, IStringLocalizerFactory localizerFactory, IOptions<ConfigurationData> configuration)
        {
            _pageDbAccess = pageDbAccess;
            _pageVersionDbAccess = pageVersionDbAccess;
            _pageReviewDbAccess = pageReviewDbAccess;
            _kartaMapDbAccess = kartaMapDbAccess;
            _npcDbAccess = npcDbAccess;
            _npcTemplateDbAccess = npcTemplateDbAccess;
            _itemDbAccess = itemDbAccess;
            _skillDbAccess = skillDbAccess;
            _questDbAccess = questDbAccess;
            _dialogDbAccess = dialogDbAccess;
            _objectExportSnippetDbAccess = objectExportSnippetDbAccess;
            _stateMachineDbAccess = stateMachineDbAccess;
            _userProjectAccess = userProjectAccess;
            _fileAccess = fileAccess;
            _timelineService = timelineService;
            _pageParserService = pageParserService;
            _exportSnippetRelatedObjectNameResolver = exportSnippetRelatedObjectNameResolver;
            _userManager = userManager;
            _xssChecker = xssChecker;
            _secureTokenGenerator = secureTokenGenerator;
            _logger = logger;
            _localizer = localizerFactory.Create(typeof(KirjaApiController));
            _allowedAttachmentMimeTypes = configuration.Value.Misc.KirjaAllowedAttachmentMimeTypes.Split(",").Select(s => ConvertMimeTypeToRegex(s)).ToList();
            _versionMergeTimeSpan = configuration.Value.Misc.KirjaVersionMergeTimeSpan;
            _maxVersionCount = configuration.Value.Misc.KirjaMaxVersionCount;
            _disableWikiExternalSharing = configuration.Value.Misc.DisableWikiExternalSharing.HasValue ? configuration.Value.Misc.DisableWikiExternalSharing.Value : false;
        }

        /// <summary>
        /// Converts a mime type to a regex. Does not change file endings
        /// </summary>
        /// <param name="mimeType">Mime type</param>
        /// <returns>Converted mime type</returns>
        private string ConvertMimeTypeToRegex(string mimeType)
        {
            if (!mimeType.StartsWith("."))
            {
                return "^" + Regex.Escape(mimeType).Replace("\\*", ".*") + "$";
            }

            return mimeType;
        }

        /// <summary>
        /// Returns a page by its id
        /// </summary>
        /// <param name="id">Id of the page</param>
        /// <returns>Page</returns>
        [ProducesResponseType(typeof(KirjaPage), StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> Page(string id)
        {
            KirjaPage page = null;
            if(!string.IsNullOrEmpty(id))
            {
                page = await _pageDbAccess.GetPageById(id);
            }
            else
            {
                GoNorthProject project = await _userProjectAccess.GetUserProject();
                page = await _pageDbAccess.GetDefaultPageForProject(project.Id);
                if(page == null)
                {
                    page = new KirjaPage();
                    page.IsDefault = true;
                    page.ProjectId = project.Id;
                    page.Name = _localizer["DefaultPageName"];
                    page.Content = _localizer["DefaultPageContent"];

                    _pageParserService.ParsePage(page);

                    page = await _pageDbAccess.CreatePage(page);
                }
            }
            return Ok(page);
        }

        /// <summary>
        /// Returns a page version by its id
        /// </summary>
        /// <param name="versionId">Id of the page version</param>
        /// <returns>Page Version</returns>
        [ProducesResponseType(typeof(SinglePageVersionQueryResult), StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> PageVersion(string versionId)
        {
            SinglePageVersionQueryResult queryResult = new SinglePageVersionQueryResult();

            queryResult.Version = await _pageVersionDbAccess.GetPageVersionById(versionId);
            if(queryResult.Version != null)
            {
                queryResult.MostRecentVersion = await _pageVersionDbAccess.GetMaxPageVersionNumber(queryResult.Version.OriginalPageId);
            }
            return Ok(queryResult);
        }

        /// <summary>
        /// Searches pages
        /// </summary>
        /// <param name="searchPattern">Search Pattern</param>
        /// <param name="start">Start of the page</param>
        /// <param name="pageSize">Page Size</param>
        /// <param name="excludeId">Id to exclude</param>
        /// <returns>Pages</returns>
        [ProducesResponseType(typeof(PageQueryResult), StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> SearchPages(string searchPattern, int start, int pageSize, string excludeId)
        {
            if(searchPattern == null)
            {
                searchPattern = "";
            }

            GoNorthProject project = await _userProjectAccess.GetUserProject();
            Task<List<KirjaPage>> queryTask;
            Task<int> countTask;
            queryTask = _pageDbAccess.SearchPages(project.Id, searchPattern, start, pageSize, excludeId, CultureInfo.CurrentUICulture.TwoLetterISOLanguageName);
            countTask = _pageDbAccess.SearchPagesCount(project.Id, searchPattern, excludeId, CultureInfo.CurrentUICulture.TwoLetterISOLanguageName);
            Task.WaitAll(queryTask, countTask);

            PageQueryResult queryResult = new PageQueryResult();
            queryResult.Pages = queryTask.Result;
            queryResult.HasMore = start + queryResult.Pages.Count < countTask.Result;
            return Ok(queryResult);
        }

        /// <summary>
        /// Returns the versions of a page
        /// </summary>
        /// <param name="pageId">Page Id</param>
        /// <param name="start">Start of the page</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Page Versions</returns>
        [ProducesResponseType(typeof(PageVersionQueryResult), StatusCodes.Status200OK)]
        [HttpGet]
        public IActionResult GetPageVersions(string pageId, int start, int pageSize)
        {
            Task<List<KirjaPageVersion>> queryTask;
            Task<int> countTask;
            Task<int> maxVersionTask;
            queryTask = _pageVersionDbAccess.GetVersionsOfPage(pageId, start, pageSize);
            countTask = _pageVersionDbAccess.GetVersionsOfPageCount(pageId);
            maxVersionTask = _pageVersionDbAccess.GetMaxPageVersionNumber(pageId);
            Task.WaitAll(queryTask, countTask, maxVersionTask);

            PageVersionQueryResult queryResult = new PageVersionQueryResult();
            queryResult.Versions = queryTask.Result;
            queryResult.MostRecentVersion = maxVersionTask.Result;
            queryResult.HasMore = start + queryResult.Versions.Count < countTask.Result;
            return Ok(queryResult);
        }


        /// <summary>
        /// Returns all pages a page is mentioned in
        /// </summary>
        /// <param name="pageId">Page Id</param>
        /// <returns>Pages</returns>
        [ProducesResponseType(typeof(List<KirjaPage>), StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> GetPagesByPage(string pageId)
        {
            List<KirjaPage> pages = await _pageDbAccess.GetPagesByPage(pageId);
            return Ok(pages);
        }

        /// <summary>
        /// Returns all pages a quest is mentioned in
        /// </summary>
        /// <param name="questId">Quest Id</param>
        /// <returns>Pages</returns>
        [ProducesResponseType(typeof(List<KirjaPage>), StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> GetPagesByQuest(string questId)
        {
            List<KirjaPage> pages = await _pageDbAccess.GetPagesByQuest(questId);
            return Ok(pages);
        }

        /// <summary>
        /// Returns all pages an npc is mentioned in
        /// </summary>
        /// <param name="npcId">Npc Id</param>
        /// <returns>Pages</returns>
        [ProducesResponseType(typeof(List<KirjaPage>), StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> GetPagesByNpc(string npcId)
        {
            List<KirjaPage> pages = await _pageDbAccess.GetPagesByNpc(npcId);
            return Ok(pages);
        }

        /// <summary>
        /// Returns all pages an item is mentioned in
        /// </summary>
        /// <param name="itemId">Item Id</param>
        /// <returns>Pages</returns>
        [ProducesResponseType(typeof(List<KirjaPage>), StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> GetPagesByItem(string itemId)
        {
            List<KirjaPage> pages = await _pageDbAccess.GetPagesByItem(itemId);
            return Ok(pages);
        }

        /// <summary>
        /// Returns all pages a skill is mentioned in
        /// </summary>
        /// <param name="skillId">Skill Id</param>
        /// <returns>Pages</returns>
        [ProducesResponseType(typeof(List<KirjaPage>), StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> GetPagesBySkill(string skillId)
        {
            List<KirjaPage> pages = await _pageDbAccess.GetPagesBySkill(skillId);
            return Ok(pages);
        }

        /// <summary>
        /// Creates a new page
        /// </summary>
        /// <param name="page">Create Page data</param>
        /// <returns>Id</returns>
        [ProducesResponseType(typeof(KirjaPage), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CreatePage([FromBody]PageRequest page)
        {
            if(string.IsNullOrEmpty(page.Name))
            {
                return BadRequest();
            }

            _xssChecker.CheckXss(page.Name);
            _xssChecker.CheckXss(page.Content);

            try
            {
                GoNorthProject project = await _userProjectAccess.GetUserProject();

                KirjaPage newPage = new KirjaPage();
                newPage.ProjectId = project.Id;
                newPage.Name = page.Name;
                newPage.Content = page.Content;

                newPage.Attachments = new List<KirjaPageAttachment>();

                _pageParserService.ParsePage(newPage);
                await this.SetModifiedData(_userManager, newPage);

                newPage = await _pageDbAccess.CreatePage(newPage);
                await SaveVersionOfPage(newPage);
                await _timelineService.AddTimelineEntry(newPage.ProjectId, TimelineEvent.KirjaPageCreated, newPage.Name, newPage.Id);
                return Ok(newPage);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not create page {0}", page.Name);
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        /// <summary>
        /// Updates a page
        /// </summary>
        /// <param name="id">Page Id</param>
        /// <param name="page">Update page data</param>
        /// <returns>Result Status Code</returns>
        [ProducesResponseType(typeof(KirjaPage), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdatePage(string id, [FromBody]PageRequest page)
        {
            _xssChecker.CheckXss(page.Name);
            _xssChecker.CheckXss(page.Content);

            KirjaPage loadedPage = await _pageDbAccess.GetPageById(id);
            if(loadedPage == null)
            {
                return NotFound();
            }

            List<string> oldImages = null;
            if(loadedPage.UplodadedImages != null)
            {
                oldImages = new List<string>(loadedPage.UplodadedImages);
            }
            else
            {
                oldImages = new List<string>();
            }

            bool nameChanged = loadedPage.Name != page.Name;

            loadedPage.Name = page.Name;
            loadedPage.Content = page.Content;
            _pageParserService.ParsePage(loadedPage);
            await this.SetModifiedData(_userManager, loadedPage);

            await _pageDbAccess.UpdatePage(loadedPage);
            _logger.LogInformation("Page was updated.");

            if(nameChanged) 
            {
                await SyncPageNameToMarkers(id, page.Name);
            }

            string versionId = await SaveVersionOfPage(loadedPage);
            string oldVersionId = string.Empty;
            if(!string.IsNullOrEmpty(versionId))
            {
                List<KirjaPageVersion> allVersions = await _pageVersionDbAccess.GetVersionsOfPage(loadedPage.Id, 0, 2);
                if(allVersions.Count > 1)
                {
                    oldVersionId = allVersions[1].Id;
                }
            }
            _logger.LogInformation("Versions were updated.");
            
            await DeleteUnusedImages(loadedPage.Id, oldImages.Except(loadedPage.UplodadedImages, StringComparer.OrdinalIgnoreCase).ToList());
            _logger.LogInformation("Unused Images were deleted.");

            await _timelineService.AddTimelineEntry(loadedPage.ProjectId, TimelineEvent.KirjaPageUpdated, loadedPage.Name, loadedPage.Id, versionId, oldVersionId);

            return Ok(loadedPage);
        }

        /// <summary>
        /// Saves a new version of a page
        /// </summary>
        /// <param name="page">Page</param>
        /// <returns>Version Id</returns>
        private async Task<string> SaveVersionOfPage(KirjaPage page)
        {
            if(_maxVersionCount == 0)
            {
                return string.Empty;
            }

            // Check if the last modification to the page was made by the same user and is in the merge time span
            bool isUpdate = false;
            KirjaPageVersion version = new KirjaPageVersion();
            if(_versionMergeTimeSpan > 0)
            {
                GoNorthUser currentUser = await _userManager.GetUserAsync(User);
                KirjaPageVersion existingVersion = await _pageVersionDbAccess.GetLatestVersionOfPage(page.Id);
                if(existingVersion != null && existingVersion.ModifiedBy == currentUser.Id && (float)(DateTimeOffset.UtcNow - existingVersion.ModifiedOn).TotalMinutes < _versionMergeTimeSpan)
                {
                    version = existingVersion;
                    isUpdate = true;
                }
            }

            if(!isUpdate)
            {
                int versionNumber = await _pageVersionDbAccess.GetMaxPageVersionNumber(page.Id);
                ++versionNumber;
                version.VersionNumber = versionNumber;
            }
            
            version.OriginalPageId = page.Id;
            version.ProjectId = page.ProjectId;
            version.IsDefault = page.IsDefault;
            version.Name = page.Name;
            version.Content = page.Content;
            version.MentionedKirjaPages = page.MentionedKirjaPages;
            version.MentionedQuests = page.MentionedQuests;
            version.MentionedNpcs = page.MentionedNpcs;
            version.MentionedItems = page.MentionedItems;
            version.MentionedSkills = page.MentionedSkills;
            version.UplodadedImages = page.UplodadedImages;
            version.Attachments = null;
            version.ModifiedOn = page.ModifiedOn;
            version.ModifiedBy = page.ModifiedBy;

            if(isUpdate)
            {
                await _pageVersionDbAccess.UpdatePageVersion(version);
            }
            else
            {
                version = await _pageVersionDbAccess.CreatePageVersion(version);
            }

            // Delete old versions
            if(_maxVersionCount > 0)
            {
                List<KirjaPageVersion> oldVersions = await _pageVersionDbAccess.GetVersionsOfPage(page.Id, 0, int.MaxValue);
                List<string> imagesToDelete = new List<string>();
                HashSet<string> stillUsedImages = page.UplodadedImages != null ? page.UplodadedImages.ToHashSet() : new HashSet<string>();
                for(int curVersion = 0; curVersion < oldVersions.Count; ++curVersion)
                {
                    if(curVersion < _maxVersionCount)
                    {
                        if(oldVersions[curVersion].UplodadedImages != null)
                        {
                            foreach(string curImage in oldVersions[curVersion].UplodadedImages)
                            {
                                if(!stillUsedImages.Contains(curImage))
                                {
                                    stillUsedImages.Add(curImage);
                                }
                            }
                        }
                    }
                    else
                    {
                        if(oldVersions[curVersion].Id != version.Id)
                        {
                            await _pageVersionDbAccess.DeletePageVersion(oldVersions[curVersion]);
                            if(oldVersions[curVersion].UplodadedImages != null)
                            {
                                imagesToDelete.AddRange(oldVersions[curVersion].UplodadedImages);
                            }
                        }
                    }
                }

                imagesToDelete = imagesToDelete.Distinct().ToList();
                foreach(string curImage in imagesToDelete)
                {
                    if(!stillUsedImages.Contains(curImage))
                    {
                        _fileAccess.DeleteFile(curImage);
                    }
                }
            }

            return version.Id;
        }

        /// <summary>
        /// Syncs the page name to markers after an update
        /// </summary>
        /// <param name="id">Id of the page</param>
        /// <param name="pageName">New page name</param>
        /// <returns>Task</returns>
        private async Task SyncPageNameToMarkers(string id, string pageName)
        {
            List<KartaMapMarkerQueryResult> markerResult = await _kartaMapDbAccess.GetAllMapsKirjaPageIsMarkedIn(id);
            foreach(KartaMapMarkerQueryResult curMapQueryResult in markerResult)
            {
                KartaMap map = await _kartaMapDbAccess.GetMapById(curMapQueryResult.MapId);
                foreach(KirjaPageMapMarker curMarker in map.KirjaPageMarker)
                {
                    if(curMarker.PageId == id)
                    {
                        curMarker.PageName = pageName;
                    }
                }
                await _kartaMapDbAccess.UpdateMap(map);
            }
        }

        /// <summary>
        /// Deletes a page
        /// </summary>
        /// <param name="id">Id of the page</param>
        /// <returns>Result Status Code</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [HttpDelete]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeletePage(string id)
        {
            List<KirjaPage> kirjaPages = await _pageDbAccess.GetPagesByPage(id);
            if(kirjaPages.Count > 0)
            {
                string mentionedInPages = string.Join(", ", kirjaPages.Select(p => p.Name));
                return BadRequest(_localizer["CanNotDeletePageMentionedInOtherPages", mentionedInPages].Value);
            }

            List<KartaMapMarkerQueryResult> kartaMaps = await _kartaMapDbAccess.GetAllMapsKirjaPageIsMarkedIn(id);
            if(kartaMaps.Count > 0)
            {
                string markedInMaps = string.Join(", ", kartaMaps.Select(p => p.Name));
                return BadRequest(_localizer["CanNotDeletePageMarkedInKartaMap", markedInMaps].Value);
            }

            List<TaleDialog> taleDialogs = await _dialogDbAccess.GetDialogsObjectIsReferenced(id);
            if(taleDialogs.Count > 0)
            {
                List<KortistoNpc> npcs = await _npcDbAccess.ResolveFlexFieldObjectNames(taleDialogs.Select(t => t.RelatedObjectId).ToList());
                string referencedInDialogs = string.Join(", ", npcs.Select(n => n.Name));
                return BadRequest(_localizer["CanNotDeletePageReferencedInDialog", referencedInDialogs].Value);
            }
            
            List<KortistoNpc> usedNpcs = await _npcDbAccess.GetNpcsObjectIsReferencedInDailyRoutine(id);
            if(usedNpcs.Count > 0)
            {
                string referencedInNpcs = string.Join(", ", usedNpcs.Select(p => p.Name));
                return BadRequest(_localizer["CanNotDeletePageReferencedInNpc", referencedInNpcs].Value);
            }

            List<AikaQuest> aikaQuests = await _questDbAccess.GetQuestsObjectIsReferenced(id);
            if(aikaQuests.Count > 0)
            {
                string referencedInQuests = string.Join(", ", aikaQuests.Select(p => p.Name));
                return BadRequest(_localizer["CanNotDeletePageReferencedInQuest", referencedInQuests].Value);
            }

            List<EvneSkill> referencedInSkills = await _skillDbAccess.GetSkillsObjectIsReferencedIn(id);
            if(referencedInSkills.Count > 0)
            {
                string usedInSkills = string.Join(", ", referencedInSkills.Select(m => m.Name));
                return BadRequest(_localizer["CanNotDeletePageReferencedInSkill", usedInSkills].Value);
            }
            
            List<ObjectExportSnippet> referencedInSnippets = await _objectExportSnippetDbAccess.GetExportSnippetsObjectIsReferenced(id);
            if(referencedInSnippets.Count > 0)
            {
                List<ObjectExportSnippetReference> references = await _exportSnippetRelatedObjectNameResolver.ResolveExportSnippetReferences(referencedInSnippets, true, true, true);
                string usedInDailyRoutines = string.Join(", ", references.Select(m => string.Format("{0} ({1})", m.ObjectName, m.ExportSnippet)));
                return BadRequest(_localizer["CanNotDeletePageReferencedInExportSnippet", usedInDailyRoutines].Value);
            }

            List<StateMachine> referencedInStateMachines = await _stateMachineDbAccess.GetStateMachinesObjectIsReferenced(id);
            if(referencedInStateMachines.Count > 0)
            {
                List<KortistoNpc> npcs = await _npcDbAccess.ResolveFlexFieldObjectNames(referencedInStateMachines.Select(t => t.RelatedObjectId).ToList());
                List<KortistoNpc> npcTemplates = await _npcTemplateDbAccess.ResolveFlexFieldObjectNames(referencedInStateMachines.Select(t => t.RelatedObjectId).ToList());
                string usedInStateMachines = string.Join(", ", npcs.Union(npcTemplates).Select(n => n.Name));
                return BadRequest(_localizer["CanNotDeletePageUsedInStateMachines", usedInStateMachines].Value);
            }

            KirjaPage page = await _pageDbAccess.GetPageById(id);
            if(page.IsDefault)
            {
                return BadRequest(_localizer["CanNotDeleteRootPage"].Value);
            }

            await _pageDbAccess.DeletePage(page);
            _logger.LogInformation("Page was deleted.");

            // Delete Images
            List<string> allImages = new List<string>();
            if(page.UplodadedImages != null)
            {
                allImages.AddRange(page.UplodadedImages);
            }

            List<KirjaPageVersion> oldVersions = await _pageVersionDbAccess.GetVersionsOfPage(page.Id, 0, int.MaxValue);
            foreach(KirjaPageVersion curVersion in oldVersions)
            {
                if(curVersion.UplodadedImages != null)
                {
                    allImages.AddRange(curVersion.UplodadedImages);
                }
            }

            allImages = allImages.Distinct().ToList();
            foreach(string curImage in allImages)
            {
                _fileAccess.DeleteFile(curImage);
            }

            // Delete Attachments
            if(page.Attachments != null)
            {
                foreach(KirjaPageAttachment curAttachment in page.Attachments)
                {
                    _fileAccess.DeleteFile(curAttachment.Filename);
                }
            }

            await _pageVersionDbAccess.DeletePageVersionsByPage(page.Id);
            await _pageReviewDbAccess.DeletePageReviewsByPage(page.Id);

            await _timelineService.AddTimelineEntry(page.ProjectId, TimelineEvent.KirjaPageDeleted, page.Name);
            return Ok(id);
        }



        /// <summary>
        /// Uploads an image for kirja
        /// </summary>
        /// <returns>Image Name</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult ImageUpload()
        {
            // Validate Date
            string validateResult = this.ValidateImageUploadData();
            if(validateResult != null)
            {
                return BadRequest(_localizer[validateResult]);
            }

            // Save Image
            IFormFile uploadFile = Request.Form.Files[0];
            string imageFile = string.Empty;
            try
            {
                using(Stream imageStream = _fileAccess.CreateFile(uploadFile.FileName, out imageFile))
                {
                    uploadFile.CopyTo(imageStream);
                }
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not upload image");
                return StatusCode((int)HttpStatusCode.InternalServerError, _localizer["CouldNotUploadImage"]);
            }

            return Ok(imageFile);
        }

        /// <summary>
        /// Returns an page image
        /// </summary>
        /// <param name="imageFile">Image File</param>
        /// <returns>Page Image</returns>
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpGet]
        public IActionResult KirjaImage(string imageFile)
        {
            if(string.IsNullOrEmpty(imageFile))
            {
                return BadRequest();
            }

            string fileExtension = Path.GetExtension(imageFile);
            string mimeType = this.GetImageMimeTypeForExtension(fileExtension);
            if(string.IsNullOrEmpty(mimeType))
            {
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            try
            {
                Stream imageStream = _fileAccess.OpenFile(imageFile);
                return File(imageStream, mimeType);
            }
            catch(FileNotFoundException)
            {
                return NotFound();
            }
        }

        /// <summary>
        /// Deletes unusued images
        /// </summary>
        /// <param name="pageId">Page Id</param>
        /// <param name="imagesToDelete">Images to delete</param>
        /// <returns>Task</returns>
        private async Task DeleteUnusedImages(string pageId, List<string> imagesToDelete)
        {
            foreach(string curImage in imagesToDelete)
            {
                if(!await _pageVersionDbAccess.AnyVersionUsingImage(pageId, curImage))
                {
                    _fileAccess.DeleteFile(curImage);
                }
            }
        }


        /// <summary>
        /// Uploads a page attachment
        /// </summary>
        /// <param name="id">Id of the page</param>
        [ProducesResponseType(typeof(KirjaPageAttachment), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UploadPageAttachment(string id)
        {
            // Validate Date
             if(Request.Form.Files.Count != 1)
            {
                return BadRequest(_localizer["OnlyOneFileAllowed"]);
            }
    
            IFormFile uploadFile = Request.Form.Files[0];
            string fileEnding = Path.GetExtension(uploadFile.FileName).ToLowerInvariant();
            string fileContentType = uploadFile.ContentType;
            bool mimeTypeAllowed = false;
            foreach(string curAllowedMimeType in _allowedAttachmentMimeTypes)
            {
                if(Regex.IsMatch(fileContentType, curAllowedMimeType) || (curAllowedMimeType.StartsWith(".") && curAllowedMimeType.ToLowerInvariant() == fileEnding))
                {
                    mimeTypeAllowed = true;
                    break;
                }
            }

            if(!mimeTypeAllowed)
            {
                return BadRequest(_localizer["FileTypeNotAllowed"]);
            }

            // Get Page
            KirjaPage page = await _pageDbAccess.GetPageById(id);
            if(page == null)
            {
                return NotFound();
            }

            // Save File
            string fileName = string.Empty;
            try
            {
                using(Stream fileStream = _fileAccess.CreateFile(uploadFile.FileName, out fileName))
                {
                    uploadFile.CopyTo(fileStream);
                }
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not upload file");
                return StatusCode((int)HttpStatusCode.InternalServerError, _localizer["CouldNotUploadFile"]);
            }

            // Save File to page
            if(page.Attachments == null)
            {
                page.Attachments = new List<KirjaPageAttachment>();
            }

            KirjaPageAttachment pageAttachment = new KirjaPageAttachment();
            pageAttachment.OriginalFilename = uploadFile.FileName;
            pageAttachment.Filename = fileName;
            pageAttachment.MimeType = fileContentType;

            page.Attachments.Add(pageAttachment);
            page.Attachments = page.Attachments.OrderBy(pa => pa.OriginalFilename).ToList();

            try
            {
                await this.SetModifiedData(_userManager, page);
                await _pageDbAccess.UpdatePage(page);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not save page after file upload");
                _fileAccess.DeleteFile(fileName);
                return StatusCode((int)HttpStatusCode.InternalServerError, _localizer["CouldNotUploadFile"]);
            }

            await _timelineService.AddTimelineEntry(page.ProjectId, TimelineEvent.KirjaAttachmentAdded, page.Name, page.Id, pageAttachment.OriginalFilename);

            return Ok(pageAttachment);
        }

        /// <summary>
        /// Returns a kirja attachment
        /// </summary>
        /// <param name="pageId">Id of the page which contains the attachment</param>
        /// <param name="attachmentFile">Attachment File</param>
        /// <returns>Attachment File</returns>
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpGet]
        public async Task<IActionResult> KirjaAttachment(string pageId, string attachmentFile)
        {
            // Check Data
            if(string.IsNullOrEmpty(pageId) || string.IsNullOrEmpty(attachmentFile))
            {
                return BadRequest();
            }

            KirjaPage page = await _pageDbAccess.GetPageById(pageId);
            if(page == null || page.Attachments == null)
            {
                return NotFound();
            }

            // Get Attachment
            KirjaPageAttachment attachment = FindAttachment(page, attachmentFile);
            if(attachment == null)
            {
                return NotFound();
            }

            // Return File
            try
            {
                Stream imageStream = _fileAccess.OpenFile(attachment.Filename);
                return File(imageStream, attachment.MimeType, attachment.OriginalFilename);
            }
            catch(FileNotFoundException)
            {
                return NotFound();
            }
        }

        /// <summary>
        /// Returns a kirja attachment
        /// </summary>
        /// <param name="pageId">Id of the page which contains the attachment</param>
        /// <param name="attachmentFile">Attachment File</param>
        /// <returns>Attachment File</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpDelete]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteAttachment(string pageId, string attachmentFile)
        {
            // Check Data
            if(string.IsNullOrEmpty(pageId) || string.IsNullOrEmpty(attachmentFile))
            {
                return BadRequest();
            }

            KirjaPage page = await _pageDbAccess.GetPageById(pageId);
            if(page == null || page.Attachments == null)
            {
                return NotFound();
            }

            // Get Attachment
            KirjaPageAttachment attachment = FindAttachment(page, attachmentFile);
            if(attachment == null)
            {
                return Ok(pageId);
            }

            // Delete Attachment
            try
            {
                await this.SetModifiedData(_userManager, page);
                page.Attachments.Remove(attachment);
                await _pageDbAccess.UpdatePage(page);
                _logger.LogInformation("Attachment deleted from page");

                _fileAccess.DeleteFile(attachment.Filename);
                _logger.LogInformation("Attachment file deleted");
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not delete attachment");
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
            
            await _timelineService.AddTimelineEntry(page.ProjectId, TimelineEvent.KirjaAttachmentDeleted, page.Name, page.Id, attachment.OriginalFilename);

            return Ok(pageId);
        }

        /// <summary>
        /// Searches an attachment in the list of attachments of a page
        /// </summary>
        /// <param name="page">Page with attachments</param>
        /// <param name="attachmentFile">Attachment file to search</param>
        /// <returns>Attachment file, null if file was not found</returns>
        private KirjaPageAttachment FindAttachment(KirjaPage page, string attachmentFile)
        {
            foreach(KirjaPageAttachment curAttachment in page.Attachments)
            {
                if(curAttachment.Filename == attachmentFile)
                {
                    return curAttachment;
                }
            }

            return null;
        }


        /// <summary>
        /// Validates the version references
        /// </summary>
        /// <param name="versionId">Version references</param>
        /// <returns>Result of the version reference validation</returns>
        [ProducesResponseType(typeof(PageVersionReferenceValidationResult), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpGet]
        public async Task<IActionResult> ValidateVersionReferences(string versionId)
        {
            KirjaPageVersion version = await _pageVersionDbAccess.GetPageVersionById(versionId);
            if(version == null)
            {
                return NotFound();
            }

            PageVersionReferenceValidationResult validationResult = new PageVersionReferenceValidationResult();
            validationResult.MissingNpcs = new List<string>();
            if(version.MentionedNpcs != null)
            {
                List<KortistoNpc> npcs = await _npcDbAccess.ResolveFlexFieldObjectNames(version.MentionedNpcs);
                validationResult.MissingNpcs = version.MentionedNpcs.Where(n => !npcs.Any(npc => npc.Id.ToLowerInvariant() == n.ToLowerInvariant())).ToList();
            }

            validationResult.MissingItems = new List<string>();
            if(version.MentionedItems != null)
            {
                List<StyrItem> items = await _itemDbAccess.ResolveFlexFieldObjectNames(version.MentionedItems);
                validationResult.MissingItems = version.MentionedItems.Where(n => !items.Any(item => item.Id.ToLowerInvariant() == n.ToLowerInvariant())).ToList();
            }

            validationResult.MissingSkills = new List<string>();
            if(version.MentionedSkills != null)
            {
                List<EvneSkill> skills = await _skillDbAccess.ResolveFlexFieldObjectNames(version.MentionedSkills);
                validationResult.MissingSkills = version.MentionedSkills.Where(n => !skills.Any(skill => skill.Id.ToLowerInvariant() == n.ToLowerInvariant())).ToList();
            }

            validationResult.MissingQuests = new List<string>();
            if(version.MentionedQuests != null)
            {
                List<AikaQuest> quests = await _questDbAccess.ResolveQuestNames(version.MentionedQuests);
                validationResult.MissingQuests = version.MentionedQuests.Where(n => !quests.Any(quest => quest.Id.ToLowerInvariant() == n.ToLowerInvariant())).ToList();
            }

            validationResult.MissingPages = new List<string>();
            if(version.MentionedKirjaPages != null)
            {
                List<KirjaPage> pages = await _pageDbAccess.ResolveNames(version.MentionedKirjaPages);
                validationResult.MissingPages = version.MentionedKirjaPages.Where(n => !pages.Any(page => page.Id.ToLowerInvariant() == n.ToLowerInvariant())).ToList();
            }

            return  Ok(validationResult);
        }


        /// <summary>
        /// Starts a review
        /// </summary>
        /// <param name="request">Request</param>
        /// <returns>Review Id</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> StartReview([FromBody]StartReviewRequest request)
        {
            if(request == null || string.IsNullOrEmpty(request.Name) || string.IsNullOrEmpty(request.PageId))
            {
                return BadRequest();
            }

            KirjaPage page;
            if(string.IsNullOrEmpty(request.VersionId))
            {
                page = await _pageDbAccess.GetPageById(request.PageId);
            } 
            else
            {
                page = await _pageVersionDbAccess.GetPageVersionById(request.VersionId);
            }

            if(page == null)
            {
                return NotFound();
            }

            KirjaPageReview review;
            try
            {
                review = new KirjaPageReview();
                review.Name = request.Name;
                review.ProjectId = page.ProjectId;
                review.ReviewedPageId = page.Id;
                review.IsDefault = false;
                review.Content = page.Content;
                review.AdditionalComment = "";
                review.ExternalAccessToken = "";

                review.MentionedNpcs = page.MentionedNpcs;
                review.MentionedItems = page.MentionedItems;
                review.MentionedSkills = page.MentionedSkills;
                review.MentionedKirjaPages = page.MentionedKirjaPages;
                review.MentionedQuests = page.MentionedQuests;

                review.Attachments = new List<KirjaPageAttachment>();

                review.CreatedOn = DateTimeOffset.UtcNow;
                
                await this.SetModifiedData(_userManager, review);

                review = await _pageReviewDbAccess.CreatePageReview(review);

                await _timelineService.AddTimelineEntry(review.ProjectId, TimelineEvent.KirjaPageReviewStarted, review.Name, review.Id, page.Name, page.Id);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not start page {0}", page.Name);
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            return Ok(review.Id);
        }
        
        /// <summary>
        /// Returns a review
        /// </summary>
        /// <param name="id">Id of the review</param>
        /// <returns>Review</returns>
        [ProducesResponseType(typeof(KirjaPageReview), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpGet]
        public async Task<IActionResult> Review(string id)
        {
            KirjaPageReview review = await _pageReviewDbAccess.GetPageReviewById(id);
            return Ok(review);
        }
        
        /// <summary>
        /// Returns a review for an external user
        /// </summary>
        /// <param name="id">Id of the review</param>
        /// <param name="token">Access token</param>
        /// <returns>Review</returns>
        [ProducesResponseType(typeof(KirjaPageReview), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> ExternalReview(string id, string token)
        {
            if(_disableWikiExternalSharing) 
            {
                return NotFound();
            }

            KirjaPageReview pageReview = await _pageReviewDbAccess.GetPageReviewById(id);
            if(pageReview == null || string.IsNullOrEmpty(pageReview.ExternalAccessToken) || pageReview.ExternalAccessToken != token)
            {
                return NotFound();
            }

            return Ok(pageReview);
        }

        /// <summary>
        /// Updates a review
        /// </summary>
        /// <param name="id">Id of the review</param>
        /// <param name="saveRequest">Save request</param>
        /// <returns>Updated Review</returns>
        [ProducesResponseType(typeof(KirjaPageReview), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateReview(string id, [FromBody]ReviewRequest saveRequest)
        {
            _xssChecker.CheckXss(saveRequest.Content);
            _xssChecker.CheckXss(saveRequest.AdditionalComment);

            KirjaPageReview loadedReview = await _pageReviewDbAccess.GetPageReviewById(id);
            if(loadedReview == null)
            {
                return NotFound();
            }

            loadedReview.Content = saveRequest.Content;
            loadedReview.AdditionalComment = saveRequest.AdditionalComment;
            _pageParserService.ParsePage(loadedReview);
            await this.SetModifiedData(_userManager, loadedReview);

            await _pageReviewDbAccess.UpdatePageReview(loadedReview);
            _logger.LogInformation("Page was updated.");

            await _timelineService.AddTimelineEntry(loadedReview.ProjectId, TimelineEvent.KirjaPageReviewUpdated, loadedReview.Name, loadedReview.Id);

            return Ok(loadedReview);
        }
        
        /// <summary>
        /// Updates a review
        /// </summary>
        /// <param name="id">Id of the review</param>
        /// <param name="token">Access token</param>
        /// <param name="saveRequest">Save request</param>
        /// <returns>Updated Review</returns>
        [ProducesResponseType(typeof(KirjaPageReview), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        [AllowAnonymous]
        public async Task<IActionResult> UpdateExternalReview(string id, string token, [FromBody]ReviewRequest saveRequest)
        {
            if(_disableWikiExternalSharing) 
            {
                return NotFound();
            }
            
            _xssChecker.CheckXss(saveRequest.Content);
            _xssChecker.CheckXss(saveRequest.AdditionalComment);

            KirjaPageReview loadedReview = await _pageReviewDbAccess.GetPageReviewById(id);
            if(loadedReview == null || string.IsNullOrEmpty(loadedReview.ExternalAccessToken) || loadedReview.ExternalAccessToken != token)
            {
                return NotFound();
            }

            loadedReview.Content = saveRequest.Content;
            loadedReview.AdditionalComment = saveRequest.AdditionalComment;
            _pageParserService.ParsePage(loadedReview);

            loadedReview.ModifiedOn = DateTimeOffset.UtcNow;
            loadedReview.ModifiedBy = ExternalUserConstants.ExternalUserId;

            await _pageReviewDbAccess.UpdatePageReview(loadedReview);
            _logger.LogInformation("Page was updated.");

            await _timelineService.AddExternalTimelineEntry(loadedReview.ProjectId, TimelineEvent.KirjaPageReviewUpdated, loadedReview.Name, loadedReview.Id);

            return Ok(loadedReview);
        }
        
        /// <summary>
        /// Returns the reviews of a page
        /// </summary>
        /// <param name="pageId">Page Id</param>
        /// <param name="start">Start of the page</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Page Reviews</returns>
        [ProducesResponseType(typeof(PageReviewQueryResult), StatusCodes.Status200OK)]
        [HttpGet]
        public IActionResult GetPageReviews(string pageId, int start, int pageSize)
        {
            Task<List<KirjaPageReview>> queryTask;
            Task<int> countTask;
            queryTask = _pageReviewDbAccess.GetReviewsOfPage(pageId, start, pageSize);
            countTask = _pageReviewDbAccess.GetReviewsOfPageCount(pageId);
            Task.WaitAll(queryTask, countTask);

            PageReviewQueryResult queryResult = new PageReviewQueryResult();
            queryResult.Reviews = queryTask.Result;
            queryResult.HasMore = start + queryResult.Reviews.Count < countTask.Result;
            return Ok(queryResult);
        }

        /// <summary>
        /// Returns the amount of reviews that are waiting to get merged
        /// </summary>
        /// <param name="pageId">Page Id</param>
        /// <returns>Count of reviews that are waiting to get merged</returns>
        [ProducesResponseType(typeof(int), StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> GetPageReviewCountWaitingForMerge(string pageId)
        {
            int waitingForMergeCount = await _pageReviewDbAccess.GetPageReviewCountWaitingForMerge(pageId);
            return Ok(waitingForMergeCount);
        }

        /// <summary>
        /// Generates an external access token for a review
        /// </summary>
        /// <param name="id">Id of the review</param>
        /// <returns>External access token</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> GenerateExternalAccessToken(string id)
        {
            if(_disableWikiExternalSharing)
            {
                return NotFound();
            }

            KirjaPageReview review = await _pageReviewDbAccess.GetPageReviewById(id);
            if(review == null)
            {
                return NotFound();
            }

            if(!string.IsNullOrEmpty(review.ExternalAccessToken))
            {
                return Ok(review.ExternalAccessToken);
            }

            while(true)
            {
                review.ExternalAccessToken = _secureTokenGenerator.GenerateSecureToken(ExternalAccessTokenLength);
                KirjaPageReview checkReview = await _pageReviewDbAccess.GetPageReviewByExternalAccessToken(review.ExternalAccessToken);
                if(checkReview == null)
                {
                    break;
                }
            }

            await _pageReviewDbAccess.UpdatePageReview(review);

            await _timelineService.AddTimelineEntry(review.ProjectId, TimelineEvent.KirjaPageReviewExternallyShared, review.Name, review.Id);

            return Ok(review.ExternalAccessToken);
        }


        /// <summary>
        /// Revokes an external access token for a review
        /// </summary>
        /// <param name="id">Id of the review</param>
        /// <returns>Task</returns>
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpDelete]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RevokeExternalAccessToken(string id)
        {
            if(_disableWikiExternalSharing)
            {
                return NotFound();
            }

            KirjaPageReview review = await _pageReviewDbAccess.GetPageReviewById(id);
            if(review == null)
            {
                return NotFound();
            }

            review.ExternalAccessToken = null;

            await _pageReviewDbAccess.UpdatePageReview(review);
            await _timelineService.AddTimelineEntry(review.ProjectId, TimelineEvent.KirjaPageReviewExternalShareRevoked, review.Name, review.Id);

            return Ok();
        }

        /// <summary>
        /// Sets the review status
        /// </summary>
        /// <param name="id">Id of the review</param>
        /// <param name="status">Status of the review</param>
        /// <returns>Task</returns>
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> SetReviewStatus(string id, KirjaPageReviewStatus status)
        {
            KirjaPageReview review = await _pageReviewDbAccess.GetPageReviewById(id);
            if(review == null)
            {
                return NotFound();
            }
            KirjaPage originalPage = await _pageDbAccess.GetPageById(review.ReviewedPageId);

            if(review.Status == status)
            {
                return Ok();
            }

            review.Status = status;

            await _pageReviewDbAccess.UpdatePageReview(review);


            TimelineEvent timelineEvent = GetTimelineEventFromReviewStatus(status);
            await _timelineService.AddTimelineEntry(review.ProjectId, timelineEvent, review.Name, review.Id, originalPage != null ? originalPage.Name : "", originalPage != null ? originalPage.Id : "");

            return Ok();
        }

        /// <summary>
        /// Sets the review status from an external access
        /// </summary>
        /// <param name="id">Id of the review</param>
        /// <param name="status">Status of the review</param>
        /// <param name="token">Access token</param>
        /// <returns>Task</returns>
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        [AllowAnonymous]
        public async Task<IActionResult> SetExternalReviewStatus(string id, KirjaPageReviewStatus status, string token)
        {            
            if(_disableWikiExternalSharing)
            {
                return NotFound();
            }

            KirjaPageReview review = await _pageReviewDbAccess.GetPageReviewById(id);
            if(review == null|| string.IsNullOrEmpty(review.ExternalAccessToken) || review.ExternalAccessToken != token)
            {
                return NotFound();
            }

            if(status == KirjaPageReviewStatus.Merged)
            {
                return Unauthorized();
            }

            KirjaPage originalPage = await _pageDbAccess.GetPageById(review.ReviewedPageId);
            if(review.Status == status)
            {
                return Ok();
            }

            review.Status = status;

            await _pageReviewDbAccess.UpdatePageReview(review);

            TimelineEvent timelineEvent = GetTimelineEventFromReviewStatus(status);
            await _timelineService.AddExternalTimelineEntry(review.ProjectId, timelineEvent, review.Name, review.Id, originalPage != null ? originalPage.Name : "", originalPage != null ? originalPage.Id : "");

            return Ok();
        }

        /// <summary>
        /// Returns the timeline event from a review status
        /// </summary>
        /// <param name="status">Status</param>
        /// <returns>Timeline Event</returns>
        private TimelineEvent GetTimelineEventFromReviewStatus(KirjaPageReviewStatus status)
        {
            if(status == KirjaPageReviewStatus.Open)
            {
                return TimelineEvent.KirjaPageReviewReopened;
            }
            else if(status == KirjaPageReviewStatus.Merged)
            {
                return TimelineEvent.KirjaPageReviewMerged;
            }

            return TimelineEvent.KirjaPageReviewMarkedAsCompleted;
        }

        /// <summary>
        /// Deletes a page review
        /// </summary>
        /// <param name="id">Id of the review</param>
        /// <returns>Result Status Code</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpDelete]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteReview(string id)
        {
            KirjaPageReview review = await _pageReviewDbAccess.GetPageReviewById(id);
            if(review == null)
            {
                return NotFound();
            }

            string pageName = "";
            string pageId = "";
            KirjaPage page = await _pageDbAccess.GetPageById(review.ReviewedPageId);
            if(page != null)
            {
                pageName = page.Name;
                pageId = page.Id;
            }

            await _pageReviewDbAccess.DeletePageReview(review);
            _logger.LogInformation("Review was deleted.");

            await _timelineService.AddTimelineEntry(review.ProjectId, TimelineEvent.KirjaPageReviewDeleted, review.Name, pageName, pageId);
            return Ok(id);
        }

    }
}