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

namespace GoNorth.Controllers.Api
{
    /// <summary>
    /// Kirja Api controller
    /// </summary>
    [Authorize(Roles = RoleNames.Kirja)]
    [Route("/api/[controller]/[action]")]
    public class KirjaApiController : Controller
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
        /// Page Db Access
        /// </summary>
        private readonly IKirjaPageDbAccess _pageDbAccess;

        /// <summary>
        /// Project Db Service
        /// </summary>
        private readonly IProjectDbAccess _projectDbAccess;

        /// <summary>
        /// Karta Map Db Access
        /// </summary>
        private readonly IKartaMapDbAccess _kartaMapDbAccess;

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
        /// User Manager
        /// </summary>
        private readonly UserManager<GoNorthUser> _userManager;

        /// <summary>
        /// Xss Checker
        /// </summary>
        private readonly IXssChecker _xssChecker;

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
        /// Constructor
        /// </summary>
        /// <param name="pageDbAccess">Page Db Access</param>
        /// <param name="projectDbAccess">User Db Access</param>
        /// <param name="kartaMapDbAccess">Karta Map Db Access</param>
        /// <param name="fileAccess">File Access</param>
        /// <param name="timelineService">Timeline Service</param>
        /// <param name="pageParserService">Page parser service</param>
        /// <param name="userManager">User Manager</param>
        /// <param name="xssChecker">Xss Checker</param>
        /// <param name="logger">Logger</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="configuration">Config Data</param>
        public KirjaApiController(IKirjaPageDbAccess pageDbAccess, IProjectDbAccess projectDbAccess, IKartaMapDbAccess kartaMapDbAccess, IKirjaFileAccess fileAccess, ITimelineService timelineService, IKirjaPageParserService pageParserService, 
                                  UserManager<GoNorthUser> userManager, IXssChecker xssChecker, ILogger<KirjaApiController> logger, IStringLocalizerFactory localizerFactory, IOptions<ConfigurationData> configuration)
        {
            _pageDbAccess = pageDbAccess;
            _projectDbAccess = projectDbAccess;
            _kartaMapDbAccess = kartaMapDbAccess;
            _fileAccess = fileAccess;
            _timelineService = timelineService;
            _pageParserService = pageParserService;
            _userManager = userManager;
            _xssChecker = xssChecker;
            _logger = logger;
            _localizer = localizerFactory.Create(typeof(KirjaApiController));
            _allowedAttachmentMimeTypes = configuration.Value.Misc.KirjaAllowedAttachmentMimeTypes.Split(",").Select(s => "^" + Regex.Escape(s).Replace("\\*", ".*") + "$").ToList();
        }

        /// <summary>
        /// Returns a page by its id
        /// </summary>
        /// <param name="id">Id of the page</param>
        /// <returns>Page</returns>
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
                GoNorthProject project = await _projectDbAccess.GetDefaultProject();
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
        /// Searches pages
        /// </summary>
        /// <param name="searchPattern">Search Pattern</param>
        /// <param name="start">Start of the page</param>
        /// <param name="pageSize">Page Size</param>
        /// <param name="excludeId">Id to exclude</param>
        /// <returns>Pages</returns>
        [HttpGet]
        public async Task<IActionResult> SearchPages(string searchPattern, int start, int pageSize, string excludeId)
        {
            if(searchPattern == null)
            {
                searchPattern = "";
            }

            GoNorthProject project = await _projectDbAccess.GetDefaultProject();
            Task<List<KirjaPage>> queryTask;
            Task<int> countTask;
            queryTask = _pageDbAccess.SearchPages(project.Id, searchPattern, start, pageSize, excludeId);
            countTask = _pageDbAccess.SearchPagesCount(project.Id, searchPattern, excludeId);
            Task.WaitAll(queryTask, countTask);

            PageQueryResult queryResult = new PageQueryResult();
            queryResult.Pages = queryTask.Result;
            queryResult.HasMore = start + queryResult.Pages.Count < countTask.Result;
            return Ok(queryResult);
        }


        /// <summary>
        /// Returns all pages a page is mentioned in
        /// </summary>
        /// <param name="pageId">Page Id</param>
        /// <returns>Pages</returns>
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
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CreatePage([FromBody]PageRequest page)
        {
            if(string.IsNullOrEmpty(page.Name))
            {
                return StatusCode((int)HttpStatusCode.BadRequest);
            }

            _xssChecker.CheckXss(page.Name);
            _xssChecker.CheckXss(page.Content);

            try
            {
                GoNorthProject project = await _projectDbAccess.GetDefaultProject();

                KirjaPage newPage = new KirjaPage();
                newPage.ProjectId = project.Id;
                newPage.Name = page.Name;
                newPage.Content = page.Content;

                newPage.Attachments = new List<KirjaPageAttachment>();

                _pageParserService.ParsePage(newPage);
                await this.SetModifiedData(_userManager, newPage);

                newPage = await _pageDbAccess.CreatePage(newPage);
                await _timelineService.AddTimelineEntry(TimelineEvent.KirjaPageCreated, newPage.Name, newPage.Id);
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
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdatePage(string id, [FromBody]PageRequest page)
        {
            _xssChecker.CheckXss(page.Name);
            _xssChecker.CheckXss(page.Content);

            KirjaPage loadedPage = await _pageDbAccess.GetPageById(id);
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

            DeleteUnusedImages(oldImages.Except(loadedPage.UplodadedImages, StringComparer.OrdinalIgnoreCase).ToList());
            _logger.LogInformation("Unused Images were deleted.");

            if(nameChanged) 
            {
                await SyncPageNameToMarkers(id, page.Name);
            }

            await _timelineService.AddTimelineEntry(TimelineEvent.KirjaPageUpdated, loadedPage.Name, loadedPage.Id);

            return Ok(loadedPage);
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
        [HttpDelete]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeletePage(string id)
        {
            List<KirjaPage> kirjaPages = await _pageDbAccess.GetPagesByPage(id);
            if(kirjaPages.Count > 0)
            {
                string mentionedInPages = string.Join(", ", kirjaPages.Select(p => p.Name));
                return StatusCode((int)HttpStatusCode.BadRequest, _localizer["CanNotDeletePageMentionedInOtherPages", mentionedInPages].Value);
            }

            List<KartaMapMarkerQueryResult> kartaMaps = await _kartaMapDbAccess.GetAllMapsKirjaPageIsMarkedIn(id);
            if(kartaMaps.Count > 0)
            {
                string markedInMaps = string.Join(", ", kartaMaps.Select(p => p.Name));
                return StatusCode((int)HttpStatusCode.BadRequest, _localizer["CanNotDeletePageMarkedInKartaMap", markedInMaps].Value);
            }

            KirjaPage page = await _pageDbAccess.GetPageById(id);
            if(page.IsDefault)
            {
                return StatusCode((int)HttpStatusCode.BadRequest, _localizer["CanNotDeleteRootPage"].Value);
            }

            await _pageDbAccess.DeletePage(page);
            _logger.LogInformation("Page was deleted.");

            if(page.UplodadedImages != null)
            {
                DeleteUnusedImages(page.UplodadedImages);
            }

            await _timelineService.AddTimelineEntry(TimelineEvent.KirjaPageDeleted, page.Name);
            return Ok(id);
        }



        /// <summary>
        /// Uploads an image for kirja
        /// </summary>
        /// <returns>Image Name</returns>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult ImageUpload()
        {
            // Validate Date
            string validateResult = this.ValidateImageUploadData();
            if(validateResult != null)
            {
                return StatusCode((int)HttpStatusCode.BadRequest, _localizer[validateResult]);
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
        [HttpGet]
        public IActionResult KirjaImage(string imageFile)
        {
            if(string.IsNullOrEmpty(imageFile))
            {
                return StatusCode((int)HttpStatusCode.BadRequest);
            }

            string fileExtension = Path.GetExtension(imageFile);
            string mimeType = this.GetImageMimeTypeForExtension(fileExtension);
            if(string.IsNullOrEmpty(mimeType))
            {
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }

            Stream imageStream = _fileAccess.OpenFile(imageFile);
            return File(imageStream, mimeType);
        }

        /// <summary>
        /// Deletes unusued images
        /// </summary>
        /// <param name="imagesToDelete">Images to delete</param>
        private void DeleteUnusedImages(List<string> imagesToDelete)
        {
            foreach(string curImage in imagesToDelete)
            {
                _fileAccess.DeleteFile(curImage);
            }
        }


        /// <summary>
        /// Uploads a page attachment
        /// </summary>
        /// <param name="id">Id of the page</param>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UploadPageAttachment(string id)
        {
            // Validate Date
             if(Request.Form.Files.Count != 1)
            {
                return StatusCode((int)HttpStatusCode.BadRequest, _localizer["OnlyOneFileAllowed"]);
            }
    
            IFormFile uploadFile = Request.Form.Files[0];
            string fileContentType = uploadFile.ContentType;
            bool mimeTypeAllowed = false;
            foreach(string curAllowedMimeType in _allowedAttachmentMimeTypes)
            {
                if(Regex.IsMatch(fileContentType, curAllowedMimeType))
                {
                    mimeTypeAllowed = true;
                    break;
                }
            }

            if(!mimeTypeAllowed)
            {
                return StatusCode((int)HttpStatusCode.BadRequest, _localizer["FileTypeNotAllowed"]);
            }

            // Get Page
            KirjaPage page = await _pageDbAccess.GetPageById(id);
            if(page == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound);
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

            await _timelineService.AddTimelineEntry(TimelineEvent.KirjaAttachmentAdded, page.Name, page.Id, pageAttachment.OriginalFilename);

            return Ok(pageAttachment);
        }

        /// <summary>
        /// Returns a kirja attachment
        /// </summary>
        /// <param name="pageId">Id of the page which contains the attachment</param>
        /// <param name="attachmentFile">Attachment File</param>
        /// <returns>Attachment File</returns>
        [HttpGet]
        public async Task<IActionResult> KirjaAttachment(string pageId, string attachmentFile)
        {
            // Check Data
            if(string.IsNullOrEmpty(pageId) || string.IsNullOrEmpty(attachmentFile))
            {
                return StatusCode((int)HttpStatusCode.BadRequest);
            }

            KirjaPage page = await _pageDbAccess.GetPageById(pageId);
            if(page == null || page.Attachments == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound);
            }

            // Get Attachment
            KirjaPageAttachment attachment = FindAttachment(page, attachmentFile);
            if(attachment == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound);
            }

            // Return File
            Stream imageStream = _fileAccess.OpenFile(attachment.Filename);
            return File(imageStream, attachment.MimeType, attachment.OriginalFilename);
        }

        /// <summary>
        /// Returns a kirja attachment
        /// </summary>
        /// <param name="pageId">Id of the page which contains the attachment</param>
        /// <param name="attachmentFile">Attachment File</param>
        /// <returns>Attachment File</returns>
        [HttpDelete]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteAttachment(string pageId, string attachmentFile)
        {
            // Check Data
            if(string.IsNullOrEmpty(pageId) || string.IsNullOrEmpty(attachmentFile))
            {
                return StatusCode((int)HttpStatusCode.BadRequest);
            }

            KirjaPage page = await _pageDbAccess.GetPageById(pageId);
            if(page == null || page.Attachments == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound);
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
            
            await _timelineService.AddTimelineEntry(TimelineEvent.KirjaAttachmentDeleted, page.Name, page.Id, attachment.OriginalFilename);

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

    }
}