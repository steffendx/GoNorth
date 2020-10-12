using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using GoNorth.Data.Project;
using GoNorth.Services.Timeline;
using GoNorth.Extensions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Identity;
using GoNorth.Data.User;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Services.ImplementationStatusCompare;
using GoNorth.Services.FlexFieldThumbnail;
using GoNorth.Data.Exporting;
using GoNorth.Services.Security;
using System.Globalization;
using System.Text;
using GoNorth.Services.CsvHandling;
using System.Text.Json;

namespace GoNorth.Controllers.Api
{
    /// <summary>
    /// Flex Field Base Api Controller Api controller
    /// </summary>
    public abstract class FlexFieldBaseApiController<T> : ControllerBase where T:FlexFieldObject,ICloneable
    {
        /// <summary>
        /// Number Flex Field Type
        /// </summary>
        public const int FlexFieldType_Number = 2;

        /// <summary>
        /// Option Flex Field Type
        /// </summary>
        public const int FlexFieldType_Option = 3;

        /// <summary>
        /// Folder Request data
        /// </summary>
        public class FolderRequest
        {
            /// <summary>
            /// Folder Name
            /// </summary>
            public string Name { get; set; }

            /// <summary>
            /// Description
            /// </summary>
            public string Description { get; set; }

            /// <summary>
            /// Parent Folder Id
            /// </summary>
            public string ParentId { get; set; }
        };

        /// <summary>
        /// Folder Query Result
        /// </summary>
        public class FolderQueryResult
        {
            /// <summary>
            /// Name of the folder
            /// </summary>
            public string FolderName { get; set; }

            /// <summary>
            /// Id of the parent folder
            /// </summary>
            public string ParentId { get; set; }

            /// <summary>
            /// true if there are more folders to query, else false
            /// </summary>
            public bool HasMore { get; set; }

            /// <summary>
            /// Folders
            /// </summary>
            public IList<FlexFieldFolder> Folders { get; set; }
        }


        /// <summary>
        /// Flex Field Object Query Result
        /// </summary>
        public class FlexFieldObjectQueryResult
        {
            /// <summary>
            /// true if there are more objects to query, else false
            /// </summary>
            public bool HasMore { get; set; }

            /// <summary>
            /// Objects
            /// </summary>
            public IList<T> FlexFieldObjects { get; set; }
        }


        /// <summary>
        /// Request to export field values
        /// </summary>
        public class ExportFieldValuesRequest
        {
            /// <summary>
            /// Selected template
            /// </summary>
            public string SelectedTemplate { get; set; }

            /// <summary>
            /// Selected fields
            /// </summary>
            public List<string> SelectedFields { get; set; }

            /// <summary>
            /// Id of the folder
            /// </summary>
            public string FolderId { get; set; }
        }


        /// <summary>
        /// Query result for querying field values
        /// </summary>
        public class ImportFieldValuesLogQueryResult
        {
            /// <summary>
            /// true if there are more objects to query, else false
            /// </summary>
            public bool HasMore { get; set; }

            /// <summary>
            /// Logs
            /// </summary>
            public List<FlexFieldImportFieldValuesResultLog> Logs { get; set; }
        }

        
        /// <summary>
        /// Csv Content Type
        /// </summary>
        private const string CsvContentType = "text/csv";

        /// <summary>
        /// Excel Csv Content Type
        /// </summary>
        private const string ExcelCsvContentType = "application/vnd.ms-excel";

        /// <summary>
        /// CSV Header Id
        /// </summary>
        private const string CsvHeaderId = "Id";
        
        /// <summary>
        /// CSV Header Id
        /// </summary>
        private const string CsvHeaderName = "Name";

        /// <summary>
        /// CSV Header Result
        /// </summary>
        private const string CsvHeaderResult = "Result";

        /// <summary>
        /// CSV Header Error Message
        /// </summary>
        private const string CsvHeaderErrorMessage = "Error Message";

        /// <summary>
        /// Prefix for CSV Header Template Id
        /// </summary>
        private const string CsvHeaderTemplateIdPrefix = "TemplateId:";


        /// <summary>
        /// Event used for the folder created event
        /// </summary>
        protected abstract TimelineEvent FolderCreatedEvent { get; }

        /// <summary>
        /// Event used for the folder deleted event
        /// </summary>
        protected abstract TimelineEvent FolderDeletedEvent { get; }

        /// <summary>
        /// Event used for the folder updated event
        /// </summary>
        protected abstract TimelineEvent FolderUpdatedEvent { get; }

        /// <summary>
        /// Event used for the folder moved to folder event
        /// </summary>
        protected abstract TimelineEvent FolderMovedToFolderEvent { get; }

        /// <summary>
        /// Event used for the folder moved to root level event
        /// </summary>
        protected abstract TimelineEvent FolderMovedToRootEvent { get; }


        /// <summary>
        /// Event used for the template created event
        /// </summary>
        protected abstract TimelineEvent TemplateCreatedEvent { get; }

        /// <summary>
        /// Event used for the template deleted event
        /// </summary>
        protected abstract TimelineEvent TemplateDeletedEvent { get; }

        /// <summary>
        /// Event used for the template updated event
        /// </summary>
        protected abstract TimelineEvent TemplateUpdatedEvent { get; }

        /// <summary>
        /// Event used for the template fields distributed event
        /// </summary>
        protected abstract TimelineEvent TemplateFieldsDistributedEvent { get; }

        /// <summary>
        /// Event used for the flex field template image updated event
        /// </summary>
        protected abstract TimelineEvent TemplateImageUploadEvent { get; }


        /// <summary>
        /// Event used for the flex field object created event
        /// </summary>
        protected abstract TimelineEvent ObjectCreatedEvent { get; }

        /// <summary>
        /// Event used for the flex field object deleted event
        /// </summary>
        protected abstract TimelineEvent ObjectDeletedEvent { get; }
        
        /// <summary>
        /// Event used for the flex field object updated event
        /// </summary>
        protected abstract TimelineEvent ObjectUpdatedEvent { get; }

        /// <summary>
        /// Event used for the flex field object image updated event
        /// </summary>
        protected abstract TimelineEvent ObjectImageUploadEvent { get; }   
        
        /// <summary>
        /// Event used for the object moved to folder event
        /// </summary>
        protected abstract TimelineEvent ObjectMovedToFolderEvent { get; }

        /// <summary>
        /// Event used for the object moved to root level event
        /// </summary>
        protected abstract TimelineEvent ObjectMovedToRootEvent { get; }


        /// <summary>
        /// Event used for the value file import event
        /// </summary>
        protected abstract TimelineEvent ValueFileImportEvent { get; }


        /// <summary>
        /// Object Folder Db Service
        /// </summary>
        private readonly IFlexFieldFolderDbAccess _folderDbAccess;

        /// <summary>
        /// Flex Field Object Template Db Service
        /// </summary>
        private readonly IFlexFieldObjectDbAccess<T> _templateDbAccess;

        /// <summary>
        /// Object Db Service
        /// </summary>
        protected readonly IFlexFieldObjectDbAccess<T> _objectDbAccess;

        /// <summary>
        /// Project Db Service
        /// </summary>
        protected readonly IProjectDbAccess _projectDbAccess;

        /// <summary>
        /// Flex Field Object Tag Db Access
        /// </summary>
        private readonly IFlexFieldObjectTagDbAccess _tagDbAccess;

        /// <summary>
        /// Export Template Db Access
        /// </summary>
        private readonly IExportTemplateDbAccess _exportTemplateDbAccess;

        /// <summary>
        /// Import field values log Db Access
        /// </summary>
        private readonly IFlexFieldImportFieldValuesLogDbAccess _importFieldValuesLogDbAccess;

        /// <summary>
        /// Language Key Db Access
        /// </summary>
        private readonly ILanguageKeyDbAccess _languageKeyDbAccess;

        /// <summary>
        /// Export Function Id Db Access
        /// </summary>
        private readonly IExportFunctionIdDbAccess _exportFunctionIdDbAccess;

        /// <summary>
        /// Object export snippet Db Access
        /// </summary>
        private readonly IObjectExportSnippetDbAccess _objectExportSnippetDbAccess;

        /// <summary>
        /// Object export snippet snapshot Db Access
        /// </summary>
        private readonly IObjectExportSnippetSnapshotDbAccess _objectExportSnippetSnapshotDbAccess;

        /// <summary>
        /// Image Access
        /// </summary>
        private readonly IFlexFieldObjectImageAccess _imageAccess;

        /// <summary>
        /// Thumbnail Service
        /// </summary>
        private readonly IFlexFieldThumbnailService _thumbnailService;

        /// <summary>
        /// Implementation status comparer
        /// </summary>
        protected readonly IImplementationStatusComparer _implementationStatusComparer;

        /// <summary>
        /// Timeline Service
        /// </summary>
        protected readonly ITimelineService _timelineService;

        /// <summary>
        /// CSV Generator
        /// </summary>
        protected readonly ICsvGenerator _csvGenerator;

        /// <summary>
        /// CSV Parser
        /// </summary>
        protected readonly ICsvParser _csvParser;

        /// <summary>
        /// User Manager
        /// </summary>
        protected readonly UserManager<GoNorthUser> _userManager;

        /// <summary>
        /// Xss Checker
        /// </summary>
        private readonly IXssChecker _xssChecker;

        /// <summary>
        /// Logger
        /// </summary>
        protected readonly ILogger _logger;

        /// <summary>
        /// Localizer
        /// </summary>
        protected readonly IStringLocalizer _localizer;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="folderDbAccess">Folder Db Access</param>
        /// <param name="templateDbAccess">Template Db Access</param>
        /// <param name="objectDbAccess">Object Db Access</param>
        /// <param name="projectDbAccess">Project Db Access</param>
        /// <param name="tagDbAccess">Tag Db Access</param>
        /// <param name="exportTemplateDbAccess">Export Template Db Access</param>
        /// <param name="importFieldValuesLogDbAccess">Import field values log Db Access</param>
        /// <param name="languageKeyDbAccess">Language Key Db Access</param>
        /// <param name="exportFunctionIdDbAccess">Export Function Id Db Access</param>
        /// <param name="objectExportSnippetDbAccess">Object export snippet Db Access</param>
        /// <param name="objectExportSnippetSnapshotDbAccess">Object export snippet snapshot Db Access</param>
        /// <param name="imageAccess">Image Access</param>
        /// <param name="thumbnailService">Thumbnail Service</param>
        /// <param name="csvGenerator">CSV Generator</param>
        /// <param name="csvParser">CSV Parser</param>
        /// <param name="userManager">User Manager</param>
        /// <param name="implementationStatusComparer">Implementation Status Comparer</param>
        /// <param name="timelineService">Timeline Service</param>
        /// <param name="xssChecker">Xss Checker</param>
        /// <param name="logger">Logger</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public FlexFieldBaseApiController(IFlexFieldFolderDbAccess folderDbAccess, IFlexFieldObjectDbAccess<T> templateDbAccess, IFlexFieldObjectDbAccess<T> objectDbAccess, IProjectDbAccess projectDbAccess, IFlexFieldObjectTagDbAccess tagDbAccess, IExportTemplateDbAccess exportTemplateDbAccess, 
                                          IFlexFieldImportFieldValuesLogDbAccess importFieldValuesLogDbAccess, ILanguageKeyDbAccess languageKeyDbAccess, IExportFunctionIdDbAccess exportFunctionIdDbAccess, IObjectExportSnippetDbAccess objectExportSnippetDbAccess, 
                                          IObjectExportSnippetSnapshotDbAccess objectExportSnippetSnapshotDbAccess, IFlexFieldObjectImageAccess imageAccess, IFlexFieldThumbnailService thumbnailService, ICsvGenerator csvGenerator, ICsvParser csvParser, UserManager<GoNorthUser> userManager, 
                                          IImplementationStatusComparer implementationStatusComparer, ITimelineService timelineService, IXssChecker xssChecker, ILogger<FlexFieldBaseApiController<T>> logger, IStringLocalizerFactory localizerFactory)
        {
            _folderDbAccess = folderDbAccess;
            _templateDbAccess = templateDbAccess;
            _objectDbAccess = objectDbAccess;
            _projectDbAccess = projectDbAccess;
            _tagDbAccess = tagDbAccess;
            _exportTemplateDbAccess = exportTemplateDbAccess;
            _importFieldValuesLogDbAccess = importFieldValuesLogDbAccess;
            _languageKeyDbAccess = languageKeyDbAccess;
            _exportFunctionIdDbAccess = exportFunctionIdDbAccess;
            _objectExportSnippetDbAccess = objectExportSnippetDbAccess;
            _objectExportSnippetSnapshotDbAccess = objectExportSnippetSnapshotDbAccess;
            _imageAccess = imageAccess;
            _thumbnailService = thumbnailService;
            _csvGenerator = csvGenerator;
            _csvParser = csvParser;
            _userManager = userManager;
            _implementationStatusComparer = implementationStatusComparer;
            _timelineService = timelineService;
            _xssChecker = xssChecker;
            _logger = logger;
            _localizer = localizerFactory.Create(this.GetType());
        }

        /// <summary>
        /// Returns folders
        /// </summary>
        /// <param name="parentId">Parent Id of the folder which children should be requested, null or "" to retrieve root folders</param>
        /// <param name="start">Start of the page</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Folders</returns>
        [ProducesResponseType(StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<ActionResult<FolderQueryResult>> Folders(string parentId, int start, int pageSize)
        {
            string folderName = string.Empty;
            string parentFolderId = string.Empty;
            Task<List<FlexFieldFolder>> queryTask;
            Task<int> countTask;
            if(string.IsNullOrEmpty(parentId))
            {
                GoNorthProject project = await _projectDbAccess.GetDefaultProject();
                queryTask = _folderDbAccess.GetRootFoldersForProject(project.Id, start, pageSize, CultureInfo.CurrentUICulture.TwoLetterISOLanguageName);
                countTask = _folderDbAccess.GetRootFolderCount(project.Id, CultureInfo.CurrentUICulture.TwoLetterISOLanguageName);
            }
            else
            {
                FlexFieldFolder folder = await _folderDbAccess.GetFolderById(parentId);
                parentFolderId = folder.ParentFolderId;
                folderName = folder.Name;
                queryTask = _folderDbAccess.GetChildFolders(parentId, start, pageSize, CultureInfo.CurrentUICulture.TwoLetterISOLanguageName);
                countTask = _folderDbAccess.GetChildFolderCount(parentId, CultureInfo.CurrentUICulture.TwoLetterISOLanguageName);
            }

            Task.WaitAll(queryTask, countTask);

            FolderQueryResult queryResult = new FolderQueryResult();
            queryResult.FolderName = folderName;
            queryResult.ParentId = parentFolderId;
            queryResult.Folders = queryTask.Result;
            queryResult.HasMore = start + queryResult.Folders.Count < countTask.Result;
            return Ok(queryResult);
        }

        /// <summary>
        /// Creates a new folder
        /// </summary>
        /// <param name="folder">Folder to create</param>
        /// <returns>Result</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CreateFolder([FromBody]FolderRequest folder)
        {
            if(string.IsNullOrEmpty(folder.Name))
            {
                return BadRequest();
            }

            try
            {
                GoNorthProject project = await _projectDbAccess.GetDefaultProject();
                FlexFieldFolder newFolder = new FlexFieldFolder {
                    ProjectId = project.Id,
                    ParentFolderId = folder.ParentId,
                    Name = folder.Name,
                    Description = folder.Description
                };
                newFolder = await _folderDbAccess.CreateFolder(newFolder);
                await _timelineService.AddTimelineEntry(FolderCreatedEvent, folder.Name, newFolder.Id);
                return Ok(newFolder.Id);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not create folder {0}", folder.Name);
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        /// <summary>
        /// Deletes a folder
        /// </summary>
        /// <param name="id">Id of the folder</param>
        /// <returns>Result Status Code</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [HttpDelete]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteFolder(string id)
        {
            FlexFieldFolder folder = await _folderDbAccess.GetFolderById(id);
            bool isFolderEmpty = await IsFolderEmpty(folder);
            if(!isFolderEmpty)
            {
                _logger.LogInformation("Attempted to delete non empty folder {0}.", folder.Name);
                return StatusCode((int)HttpStatusCode.InternalServerError, _localizer["FolderNotEmpty"].Value);
            }

            await _folderDbAccess.DeleteFolder(folder);
            _logger.LogInformation("Folder was deleted.");

            if(!string.IsNullOrEmpty(folder.ImageFile))
            {
                _imageAccess.CheckAndDeleteUnusedImage(folder.ImageFile);
            }

            if(!string.IsNullOrEmpty(folder.ThumbnailImageFile))
            {
                _imageAccess.CheckAndDeleteUnusedImage(folder.ThumbnailImageFile);
            }

            await _timelineService.AddTimelineEntry(FolderDeletedEvent, folder.Name);
            return Ok(id);
        }

        /// <summary>
        /// Checks if a folder is empty
        /// </summary>
        /// <param name="folder">Folder to check</param>
        /// <returns>True if the folder is empty, else false</returns>
        private async Task<bool> IsFolderEmpty(FlexFieldFolder folder)
        {
            int childFolderCount = await _folderDbAccess.GetChildFolderCount(folder.Id, CultureInfo.CurrentUICulture.TwoLetterISOLanguageName);
            if(childFolderCount > 0)
            {
                return false;
            }

            return true;
        }

        /// <summary>
        /// Updates a folder 
        /// </summary>
        /// <param name="id">Folder Id</param>
        /// <param name="folder">Update folder data</param>
        /// <returns>Result Status Code</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateFolder(string id, [FromBody]FolderRequest folder)
        {
            FlexFieldFolder loadedFolder = await _folderDbAccess.GetFolderById(id);
            loadedFolder.Name = folder.Name;
            loadedFolder.Description = folder.Description;

            await _folderDbAccess.UpdateFolder(loadedFolder);
            _logger.LogInformation("Folder was updated.");
            await _timelineService.AddTimelineEntry(FolderUpdatedEvent, folder.Name, loadedFolder.Id);

            return Ok(id);
        }

        /// <summary>
        /// Moves a folder to a folder
        /// </summary>
        /// <param name="id">Id of the folder to move</param>
        /// <param name="newParentId">Id of the folder to move the object to</param>
        /// <returns>Result</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> MoveFolderToFolder(string id, string newParentId)
        {
            if(string.IsNullOrEmpty(id))
            {
                return BadRequest();
            }

            if(newParentId == null)
            {
                newParentId = string.Empty;
            }

            try
            {
                FlexFieldFolder folderToMove = await _folderDbAccess.GetFolderById(id);
                if(folderToMove == null)
                {
                    return NotFound();
                }

                FlexFieldFolder folderToMoveTo = null;
                if(!string.IsNullOrEmpty(newParentId))
                {
                    folderToMoveTo = await _folderDbAccess.GetFolderById(newParentId);
                    if(folderToMoveTo == null)
                    {
                        return NotFound();
                    }
                }

                await _folderDbAccess.MoveToFolder(id, newParentId);
                
                TimelineEvent eventToUse = FolderMovedToFolderEvent;
                if(string.IsNullOrEmpty(newParentId))
                {
                    eventToUse = FolderMovedToRootEvent;
                }
                await _timelineService.AddTimelineEntry(eventToUse, folderToMove.Name, folderToMove.Id, folderToMoveTo != null ? folderToMoveTo.Name : string.Empty, folderToMoveTo != null ? folderToMoveTo.Id : string.Empty);

                return Ok(id);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not move folder {0}", id);
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }


        /// <summary>
        /// Generates the Thumbnail Filename
        /// </summary>
        /// <param name="filename">Original Filename</param>
        /// <returns>Thumbnail Filename</returns>
        private string GenerateThumbnailFilename(string filename)
        {
            return Path.Combine(Path.GetDirectoryName(filename), Path.GetFileNameWithoutExtension(filename) + "_t" + Path.GetExtension(filename));
        }
        
        /// <summary>
        /// Uploads an image to a flex field folder
        /// </summary>
        /// <param name="id">Id of the flex field folder</param>
        /// <returns>Image Name</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UploadFolderImage(string id)
        {
            // Validate Date
            string validateResult = this.ValidateImageUploadData();
            if(validateResult != null)
            {
                return BadRequest(_localizer[validateResult]);
            }

            IFormFile uploadFile = Request.Form.Files[0];
            FlexFieldFolder targetFolder = await _folderDbAccess.GetFolderById(id);
            if(targetFolder == null)
            {
                return BadRequest(_localizer["CouldNotUploadImage"]);
            }

            // Save Image
            string objectImageFile = string.Empty;
            try
            {
                using(Stream imageStream = _imageAccess.CreateFlexFieldObjectImage(uploadFile.FileName, out objectImageFile))
                {
                    uploadFile.CopyTo(imageStream);
                }

                string thumbnailFilename = GenerateThumbnailFilename(objectImageFile);
                if(!_thumbnailService.GenerateThumbnail(objectImageFile, thumbnailFilename))
                {
                    thumbnailFilename = null;
                }

                string oldImageFile = targetFolder.ImageFile;
                string oldThumbnailImageFile = targetFolder.ThumbnailImageFile;
                targetFolder.ImageFile = objectImageFile;
                targetFolder.ThumbnailImageFile = thumbnailFilename;

                await _folderDbAccess.UpdateFolder(targetFolder);

                if(!string.IsNullOrEmpty(oldImageFile))
                {
                    _imageAccess.CheckAndDeleteUnusedImage(oldImageFile);
                }

                if(!string.IsNullOrEmpty(oldThumbnailImageFile))
                {
                    _imageAccess.CheckAndDeleteUnusedImage(oldThumbnailImageFile);
                }
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not upload image");
                return StatusCode((int)HttpStatusCode.InternalServerError, _localizer["CouldNotUploadImage"]);
            }

            return Ok(objectImageFile);
        }


        /// <summary>
        /// Returns a flex field template by its id
        /// </summary>
        /// <param name="id">Id of the template</param>
        /// <returns>Flex Field Template</returns>
        [ProducesResponseType(StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<ActionResult<T>> FlexFieldTemplate(string id)
        {
            T template = await _templateDbAccess.GetFlexFieldObjectById(id);
            return Ok(template);
        }

        /// <summary>
        /// Returns entry templates
        /// </summary>
        /// <param name="start">Start of the page</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>EntryTemplates</returns>
        [ProducesResponseType(StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<ActionResult<FlexFieldObjectQueryResult>> FlexFieldTemplates(int start, int pageSize)
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();
            Task<List<T>> queryTask;
            Task<int> countTask;
            queryTask = _templateDbAccess.GetFlexFieldObjectsInRootFolderForProject(project.Id, start, pageSize, CultureInfo.CurrentUICulture.TwoLetterISOLanguageName);
            countTask = _templateDbAccess.GetFlexFieldObjectsInRootFolderCount(project.Id, CultureInfo.CurrentUICulture.TwoLetterISOLanguageName);
            Task.WaitAll(queryTask, countTask);

            FlexFieldObjectQueryResult queryResult = new FlexFieldObjectQueryResult();
            queryResult.FlexFieldObjects = queryTask.Result;
            queryResult.HasMore = start + queryResult.FlexFieldObjects.Count < countTask.Result;
            return Ok(queryResult);
        }

        /// <summary>
        /// Checks for xss attacks in an object
        /// </summary>
        /// <param name="checkObject">Object to check</param>
        private void CheckXssForObject(T checkObject)
        {
            foreach(FlexField curField in checkObject.Fields)
            {
                _xssChecker.CheckXss(curField.Value);
            }
        }

        /// <summary>
        /// Creates a new flex field template
        /// </summary>
        /// <param name="template">Template to create</param>
        /// <returns>Result</returns>
        protected async Task<IActionResult> BaseCreateFlexFieldTemplate(T template)
        {
            if(string.IsNullOrEmpty(template.Name))
            {
                return BadRequest();
            }

            CheckXssForObject(template);
            
            if(FlexFieldApiUtil.HasDuplicateFieldNames(template.Fields))
            {
                return BadRequest(_localizer["DuplicateFieldNameExist"]);
            }

            template.ParentFolderId = string.Empty;

            if(template.Tags == null)
            {
                template.Tags = new List<string>();
            }

            try
            {
                GoNorthProject project = await _projectDbAccess.GetDefaultProject();
                template.ProjectId = project.Id;

                template = await RunAdditionalUpdates(template, template);

                await this.SetModifiedData(_userManager, template);

                template = await _templateDbAccess.CreateFlexFieldObject(template);
                await AddNewTags(template.Tags);
                await _timelineService.AddTimelineEntry(TemplateCreatedEvent, template.Name, template.Id);
                return Ok(template);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not create flex field template {0}", template.Name);
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        /// <summary>
        /// Deletes a flex field template
        /// </summary>
        /// <param name="id">Id of the template</param>
        /// <returns>Result Status Code</returns>
        protected async Task<IActionResult> BaseDeleteFlexFieldTemplate(string id)
        {
            T template = await _templateDbAccess.GetFlexFieldObjectById(id);
            await _templateDbAccess.DeleteFlexFieldObject(template);
            _logger.LogInformation("Template was deleted.");

            await RemoveUnusedTags(template.Tags);

            if(!string.IsNullOrEmpty(template.ImageFile))
            {
                _imageAccess.CheckAndDeleteUnusedImage(template.ImageFile);
            }

            if(!string.IsNullOrEmpty(template.ThumbnailImageFile))
            {
                _imageAccess.CheckAndDeleteUnusedImage(template.ThumbnailImageFile);
            }

            await DeleteExportTemplateIfExists(id);

            await _timelineService.AddTimelineEntry(TemplateDeletedEvent, template.Name);
            return Ok(id);
        }

        /// <summary>
        /// Deletes an export template if it exists
        /// </summary>
        /// <param name="id">Id of the object thats deleted</param>
        /// <returns>Task</returns>
        private async Task DeleteExportTemplateIfExists(string id)
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();
            ExportTemplate exportTemplate = await _exportTemplateDbAccess.GetTemplateByCustomizedObjectId(project.Id, id);
            if(exportTemplate != null)
            {
                await _exportTemplateDbAccess.DeleteTemplate(exportTemplate);
            }
        }

        /// <summary>
        /// Updates a flex field template 
        /// </summary>
        /// <param name="id">Template Id</param>
        /// <param name="template">Update template data</param>
        /// <returns>Result Status Code</returns>
        protected async Task<IActionResult> BaseUpdateFlexFieldTemplate(string id, T template)
        {
            if(FlexFieldApiUtil.HasDuplicateFieldNames(template.Fields))
            {
                return BadRequest(_localizer["DuplicateFieldNameExist"]);
            }

            CheckXssForObject(template);

            T loadedTemplate = await _templateDbAccess.GetFlexFieldObjectById(id);
            List<string> oldTags = loadedTemplate.Tags;
            if(oldTags == null)
            {
                oldTags = new List<string>();
            }
            if(template.Tags == null)
            {
                template.Tags = new List<string>();
            }

            loadedTemplate.Name = template.Name;
            loadedTemplate.Fields = template.Fields;
            loadedTemplate.Tags = template.Tags;
    
            template = await RunAdditionalUpdates(template, loadedTemplate);

            await this.SetModifiedData(_userManager, loadedTemplate);

            await _templateDbAccess.UpdateFlexFieldObject(loadedTemplate);
            _logger.LogInformation("Template was updated.");

            await AddNewTags(template.Tags.Except(oldTags, StringComparer.OrdinalIgnoreCase).ToList());
            await RemoveUnusedTags(oldTags.Except(template.Tags, StringComparer.OrdinalIgnoreCase).ToList());
            _logger.LogInformation("Tags were updated.");

            await _timelineService.AddTimelineEntry(TemplateUpdatedEvent, loadedTemplate.Name, loadedTemplate.Id);

            return Ok(loadedTemplate);
        }

        /// <summary>
        /// Distributes the fields of a template
        /// </summary>
        /// <param name="id">Template Id</param>
        /// <returns>Task</returns>
        protected async Task<IActionResult> BaseDistributeFlexFieldTemplateFields(string id)
        {
            T template = await _templateDbAccess.GetFlexFieldObjectById(id);
            if(template == null)
            {
                return BadRequest();
            }

            List<T> flexFieldObjects = await _objectDbAccess.GetFlexFieldObjectsByTemplate(id);
            foreach(T curObject in flexFieldObjects)
            {
                // Update Additional Configuration
                foreach(FlexField curField in curObject.Fields)
                {
                    FlexField templateField = template.Fields.FirstOrDefault(f => f.Name == curField.Name);
                    if(templateField != null && templateField.AdditionalConfiguration != curField.AdditionalConfiguration)
                    {
                        curField.AdditionalConfiguration = templateField.AdditionalConfiguration;
                    }
                }

                // Add new Fields
                List<FlexField> newFields = template.Fields.Where(f => !curObject.Fields.Any(nf => nf.Name == f.Name)).ToList();
                newFields.ForEach(f => f.CreatedFromTemplate = true);
                if(newFields.Count > 0)
                {
                    curObject.IsImplemented = false;
                }
                curObject.Fields.AddRange(newFields);

                FlexFieldApiUtil.SetFieldIdsForNewFields(curObject.Fields);
                FlexFieldApiUtil.SetFieldIdsForNewFieldsInFolders(curObject.Fields, template);

                await _objectDbAccess.UpdateFlexFieldObject(curObject);
            }

            await _timelineService.AddTimelineEntry(TemplateFieldsDistributedEvent, template.Name, template.Id);

            return Ok(id);
        }


        /// <summary>
        /// Returns an flex field object by its id
        /// </summary>
        /// <param name="id">Id of the flex field object</param>
        /// <returns>Flex field object</returns>
        [ProducesResponseType(StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<ActionResult<T>> FlexFieldObject(string id)
        {
            T flexFieldObject = await _objectDbAccess.GetFlexFieldObjectById(id);
            flexFieldObject = StripObject(flexFieldObject);
            return Ok(flexFieldObject);
        }

        /// <summary>
        /// Strips an object based on the rights of a user
        /// </summary>
        /// <param name="flexFieldObject">Flex field object to strip</param>
        /// <returns>Stripped object</returns>
        protected virtual T StripObject(T flexFieldObject)
        {
            return flexFieldObject;
        }

        /// <summary>
        /// Returns flex field objects
        /// </summary>
        /// <param name="parentId">Id of the folder which flex field objects should be retrieved, null or "" to retrieve from root folders</param>
        /// <param name="start">Start of the page</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Flex Field Objects</returns>
        [ProducesResponseType(StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<ActionResult<FlexFieldObjectQueryResult>> FlexFieldObjects(string parentId, int start, int pageSize)
        {
            Task<List<T>> queryTask;
            Task<int> countTask;
            if(string.IsNullOrEmpty(parentId))
            {
                GoNorthProject project = await _projectDbAccess.GetDefaultProject();
                queryTask = _objectDbAccess.GetFlexFieldObjectsInRootFolderForProject(project.Id, start, pageSize, CultureInfo.CurrentUICulture.TwoLetterISOLanguageName);
                countTask = _objectDbAccess.GetFlexFieldObjectsInRootFolderCount(project.Id, CultureInfo.CurrentUICulture.TwoLetterISOLanguageName);
            }
            else
            {
                queryTask = _objectDbAccess.GetFlexFieldObjectsInFolder(parentId, start, pageSize, CultureInfo.CurrentUICulture.TwoLetterISOLanguageName);
                countTask = _objectDbAccess.GetFlexFieldObjectsInFolderCount(parentId, CultureInfo.CurrentUICulture.TwoLetterISOLanguageName);
            }

            Task.WaitAll(queryTask, countTask);

            FlexFieldObjectQueryResult queryResult = new FlexFieldObjectQueryResult();
            queryResult.FlexFieldObjects = queryTask.Result;
            queryResult.HasMore = start + queryResult.FlexFieldObjects.Count < countTask.Result;
            return Ok(queryResult);
        }

        /// <summary>
        /// Searches flex field objects
        /// </summary>
        /// <param name="searchPattern">Search Pattern</param>
        /// <param name="start">Start of the page</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Flex field objects</returns>
        [ProducesResponseType(StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<ActionResult<FlexFieldObjectQueryResult>> SearchFlexFieldObjects(string searchPattern, int start, int pageSize)
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();

            Task<List<T>> queryTask;
            Task<int> countTask;
            queryTask = _objectDbAccess.SearchFlexFieldObjects(project.Id, searchPattern, start, pageSize, CultureInfo.CurrentUICulture.TwoLetterISOLanguageName);
            countTask = _objectDbAccess.SearchFlexFieldObjectsCount(project.Id, searchPattern, CultureInfo.CurrentUICulture.TwoLetterISOLanguageName);
            Task.WaitAll(queryTask, countTask);

            FlexFieldObjectQueryResult queryResult = new FlexFieldObjectQueryResult();
            queryResult.FlexFieldObjects = queryTask.Result;
            queryResult.HasMore = start + queryResult.FlexFieldObjects.Count < countTask.Result;
            return Ok(queryResult);
        }

        /// <summary>
        /// Resolves the names for a list of flex field objects
        /// </summary>
        /// <param name="objectIds">Flex field object Ids</param>
        /// <returns>Resolved names</returns>
        [ProducesResponseType(StatusCodes.Status200OK)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult<List<T>>> ResolveFlexFieldObjectNames([FromBody]List<string> objectIds)
        {
            List<T> objectNames = await _objectDbAccess.ResolveFlexFieldObjectNames(objectIds);
            return Ok(objectNames);
        }

        /// <summary>
        /// Creates a new flex field object
        /// </summary>
        /// <param name="flexFieldObject">Flex Field object to create</param>
        /// <returns>Result</returns>
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult<T>> CreateFlexFieldObject([FromBody]T flexFieldObject)
        {
            if(string.IsNullOrEmpty(flexFieldObject.Name))
            {
                return BadRequest();
            }

            CheckXssForObject(flexFieldObject);

            if(FlexFieldApiUtil.HasDuplicateFieldNames(flexFieldObject.Fields))
            {
                return BadRequest(_localizer["DuplicateFieldNameExist"]);
            }

            FlexFieldApiUtil.SetFieldIdsForNewFields(flexFieldObject.Fields);
            FlexFieldApiUtil.SetFieldIdsForNewFieldsInFolders(flexFieldObject.Fields);

            if(flexFieldObject.Tags == null)
            {
                flexFieldObject.Tags = new List<string>();
            }

            try
            {
                GoNorthProject project = await _projectDbAccess.GetDefaultProject();
                flexFieldObject.ProjectId = project.Id;

                flexFieldObject = await RunAdditionalUpdates(flexFieldObject, flexFieldObject);

                await this.SetModifiedData(_userManager, flexFieldObject);

                flexFieldObject = await _objectDbAccess.CreateFlexFieldObject(flexFieldObject);
                await AddNewTags(flexFieldObject.Tags);
                await _timelineService.AddTimelineEntry(ObjectCreatedEvent, flexFieldObject.Name, flexFieldObject.Id);
                return Ok(flexFieldObject);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not create flex field object {0}", flexFieldObject.Name);
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        /// <summary>
        /// Checks if a object is referenced before a delete
        /// </summary>
        /// <param name="id">Id</param>
        /// <returns>Empty string if no references exists, error string if references exists</returns>
        protected abstract Task<string> CheckObjectReferences(string id);

        /// <summary>
        /// Deletes additional depencendies for a flex field object
        /// </summary>
        /// <param name="flexFieldObject">Flex field object to delete</param>
        /// <returns>Task</returns>
        protected abstract Task DeleteAdditionalFlexFieldObjectDependencies(T flexFieldObject);

        /// <summary>
        /// Deletes a flex field object
        /// </summary>
        /// <param name="id">Id of the flex field object</param>
        /// <returns>Result Status Code</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [HttpDelete]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteFlexFieldObject(string id)
        {
            // Check references
            string referenceError = await CheckObjectReferences(id);
            if(!string.IsNullOrEmpty(referenceError))
            {
                return BadRequest(referenceError);
            }

            // Delete Object and dialog
            T flexFieldObject = await _objectDbAccess.GetFlexFieldObjectById(id);
            await _objectDbAccess.DeleteFlexFieldObject(flexFieldObject);
            _logger.LogInformation("Flex Field was deleted.");

            await _languageKeyDbAccess.DeleteAllLanguageKeysInGroup(flexFieldObject.ProjectId, flexFieldObject.Id);
            await _exportFunctionIdDbAccess.DeleteAllExportFunctionIdsForObject(flexFieldObject.ProjectId, flexFieldObject.Id);
            await _objectExportSnippetDbAccess.DeleteExportSnippetsByObjectId(flexFieldObject.Id);
            await _objectExportSnippetSnapshotDbAccess.DeleteExportSnippetSnapshotsByObjectId(flexFieldObject.Id);

            await DeleteAdditionalFlexFieldObjectDependencies(flexFieldObject);

            await RemoveUnusedTags(flexFieldObject.Tags);

            if(!string.IsNullOrEmpty(flexFieldObject.ImageFile))
            {
                _imageAccess.CheckAndDeleteUnusedImage(flexFieldObject.ImageFile);
            }

            if(!string.IsNullOrEmpty(flexFieldObject.ThumbnailImageFile))
            {
                _imageAccess.CheckAndDeleteUnusedImage(flexFieldObject.ThumbnailImageFile);
            }

            await DeleteExportTemplateIfExists(id);

            await _timelineService.AddTimelineEntry(ObjectDeletedEvent, flexFieldObject.Name);
            return Ok(id);
        }

        /// <summary>
        /// Runs additional updates on a flex field object
        /// </summary>
        /// <param name="flexFieldObject">Flex Field Object</param>
        /// <param name="loadedFlexFieldObject">Loaded Flex Field Object</param>
        /// <returns>Updated flex field object</returns>
        protected abstract Task<T> RunAdditionalUpdates(T flexFieldObject, T loadedFlexFieldObject);

        /// <summary>
        /// Checks if an update is valid
        /// </summary>
        /// <param name="flexFieldObject">Flex Field Object</param>
        /// <param name="loadedFlexFieldObject">Loaded Flex Field Object</param>
        /// <returns>Empty string if update is valid, error string if update is not valid</returns>
        protected virtual Task<string> CheckUpdateValid(T flexFieldObject, T loadedFlexFieldObject) { return Task.FromResult(string.Empty); }

        /// <summary>
        /// Runs updates on markers
        /// </summary>
        /// <param name="flexFieldObject">Flex Field Object</param>
        /// <returns>Task</returns>
        protected abstract Task RunMarkerUpdates(T flexFieldObject);

        /// <summary>
        /// Compares an object with the implementation snapshot
        /// </summary>
        /// <param name="flexFieldObject">Flex field object for compare</param>
        /// <returns>CompareResult Result</returns>
        protected abstract Task<CompareResult> CompareObjectWithImplementationSnapshot(T flexFieldObject);

        /// <summary>
        /// Sets the not implemented flag for an object on a relevant change
        /// </summary>
        /// <param name="newState">New State of the object</param>
        protected async Task SetNotImplementedFlagOnChange(T newState)
        {
            if(!newState.IsImplemented)
            {
                return;
            }

            CompareResult result = await CompareObjectWithImplementationSnapshot(newState);
            if(result.CompareDifference != null && result.CompareDifference.Count > 0)
            {
                newState.IsImplemented = false;
            }
        }

        /// <summary>
        /// Updates a flex field object 
        /// </summary>
        /// <param name="id">Flex field object Id</param>
        /// <param name="flexFieldObject">Update flex field object data</param>
        /// <returns>Result Status Code</returns>
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult<T>> UpdateFlexFieldObject(string id, [FromBody]T flexFieldObject)
        {
            CheckXssForObject(flexFieldObject);

            T loadedFlexFieldObject = await _objectDbAccess.GetFlexFieldObjectById(id);
            
            string updateErrorMessage = await CheckUpdateValid(flexFieldObject, loadedFlexFieldObject);
            if(!string.IsNullOrEmpty(updateErrorMessage))
            {
                return BadRequest(updateErrorMessage);
            }

            List<string> oldTags = loadedFlexFieldObject.Tags;
            if(oldTags == null)
            {
                oldTags = new List<string>();
            }
            if(flexFieldObject.Tags == null)
            {
                flexFieldObject.Tags = new List<string>();
            }

            if(FlexFieldApiUtil.HasDuplicateFieldNames(flexFieldObject.Fields))
            {
                return BadRequest(_localizer["DuplicateFieldNameExist"]);
            }

            FlexFieldApiUtil.SetFieldIdsForNewFields(flexFieldObject.Fields);
            FlexFieldApiUtil.SetFieldIdsForNewFieldsInFolders(flexFieldObject.Fields);

            bool nameChanged = loadedFlexFieldObject.Name != flexFieldObject.Name;

            loadedFlexFieldObject.Name = flexFieldObject.Name;
            loadedFlexFieldObject.Fields = flexFieldObject.Fields;
            loadedFlexFieldObject.Tags = flexFieldObject.Tags;

            loadedFlexFieldObject = await RunAdditionalUpdates(flexFieldObject, loadedFlexFieldObject);

            await this.SetModifiedData(_userManager, loadedFlexFieldObject);

            await SetNotImplementedFlagOnChange(loadedFlexFieldObject);

            await _objectDbAccess.UpdateFlexFieldObject(loadedFlexFieldObject);
            _logger.LogInformation("Flex field object was updated.");

            await AddNewTags(flexFieldObject.Tags.Except(oldTags, StringComparer.OrdinalIgnoreCase).ToList());
            await RemoveUnusedTags(oldTags.Except(flexFieldObject.Tags, StringComparer.OrdinalIgnoreCase).ToList());
            _logger.LogInformation("Tags were updated.");

            if(nameChanged)
            {
                await RunMarkerUpdates(loadedFlexFieldObject);
            }

            await _timelineService.AddTimelineEntry(ObjectUpdatedEvent, loadedFlexFieldObject.Name, loadedFlexFieldObject.Id);

            return Ok(loadedFlexFieldObject);
        }


        /// <summary>
        /// Uploads an image to a flex field object
        /// </summary>
        /// <param name="id">Id of the flex field object</param>
        /// <returns>Image Name</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> FlexFieldImageUpload(string id)
        {
            return await UploadImage(_objectDbAccess, ObjectImageUploadEvent, id);
        }

        /// <summary>
        /// Uploads an image to a flex field template
        /// </summary>
        /// <param name="id">Id of the template</param>
        /// <returns>Image Name</returns>
        protected async Task<IActionResult> BaseFlexFieldTemplateImageUpload(string id)
        {
            return await UploadImage(_templateDbAccess, TemplateImageUploadEvent, id);
        }

        /// <summary>
        /// Uploads an image to a flex field object or template
        /// </summary>
        /// <param name="dbAccess">Db access to use (tempate or object)</param>
        /// <param name="timelineEvent">Timeline Event to use</param>
        /// <param name="id">Id of the flex field object</param>
        /// <returns>Image Name</returns>
        private async Task<IActionResult> UploadImage(IFlexFieldObjectDbAccess<T> dbAccess, TimelineEvent timelineEvent, string id)
        {
            // Validate Date
            string validateResult = this.ValidateImageUploadData();
            if(validateResult != null)
            {
                return BadRequest(_localizer[validateResult]);
            }

            IFormFile uploadFile = Request.Form.Files[0];
            T targetFlexFieldObject = await dbAccess.GetFlexFieldObjectById(id);
            if(targetFlexFieldObject == null)
            {
                return BadRequest(_localizer["CouldNotUploadImage"]);
            }

            // Save Image
            string objectImageFile = string.Empty;
            try
            {
                using(Stream imageStream = _imageAccess.CreateFlexFieldObjectImage(uploadFile.FileName, out objectImageFile))
                {
                    uploadFile.CopyTo(imageStream);
                }

                string thumbnailFilename = GenerateThumbnailFilename(objectImageFile);
                if(!_thumbnailService.GenerateThumbnail(objectImageFile, thumbnailFilename))
                {
                    thumbnailFilename = null;
                }

                string oldImageFile = targetFlexFieldObject.ImageFile;
                string oldThumbnailImageFile = targetFlexFieldObject.ThumbnailImageFile;
                targetFlexFieldObject.ImageFile = objectImageFile;
                targetFlexFieldObject.ThumbnailImageFile = thumbnailFilename;
                targetFlexFieldObject.IsImplemented = false;

                await this.SetModifiedData(_userManager, targetFlexFieldObject);

                await dbAccess.UpdateFlexFieldObject(targetFlexFieldObject);

                if(!string.IsNullOrEmpty(oldImageFile))
                {
                    _imageAccess.CheckAndDeleteUnusedImage(oldImageFile);
                }

                if(!string.IsNullOrEmpty(oldThumbnailImageFile))
                {
                    _imageAccess.CheckAndDeleteUnusedImage(oldThumbnailImageFile);
                }

                await _timelineService.AddTimelineEntry(timelineEvent, targetFlexFieldObject.Name, targetFlexFieldObject.Id);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not upload image");
                return StatusCode((int)HttpStatusCode.InternalServerError, _localizer["CouldNotUploadImage"]);
            }

            return Ok(objectImageFile);
        }

        /// <summary>
        /// Returns a flex field object image
        /// </summary>
        /// <param name="imageFile">Image File</param>
        /// <returns>Flex Field Image</returns>
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [HttpGet]
        public IActionResult FlexFieldObjectImage(string imageFile)
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
                Stream imageStream = _imageAccess.OpenFlexFieldObjectImage(imageFile);
                return File(imageStream, mimeType);
            }
            catch(FileNotFoundException)
            {
                return NotFound();
            }
        }

        
        /// <summary>
        /// Moves an object to a folder
        /// </summary>
        /// <param name="id">Id of the folder to move</param>
        /// <param name="newParentId">Id of the folder to move the object to</param>
        /// <returns>Result</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> MoveObjectToFolder(string id, string newParentId)
        {
            if(string.IsNullOrEmpty(id))
            {
                return BadRequest();
            }

            if(newParentId == null)
            {
                newParentId = string.Empty;
            }

            try
            {
                T objectToMove = await _objectDbAccess.GetFlexFieldObjectById(id);
                if(objectToMove == null)
                {
                    return NotFound();
                }

                FlexFieldFolder folderToMoveTo = null;
                if(!string.IsNullOrEmpty(newParentId))
                {
                    folderToMoveTo = await _folderDbAccess.GetFolderById(newParentId);
                    if(folderToMoveTo == null)
                    {
                        return NotFound();
                    }
                }

                TimelineEvent eventToUse = ObjectMovedToFolderEvent;
                if(string.IsNullOrEmpty(newParentId))
                {
                    eventToUse = ObjectMovedToRootEvent;
                }

                await _objectDbAccess.MoveToFolder(id, newParentId);
                await _timelineService.AddTimelineEntry(eventToUse, objectToMove.Name, objectToMove.Id, folderToMoveTo != null ? folderToMoveTo.Name : string.Empty, folderToMoveTo != null ? folderToMoveTo.Id : string.Empty);
                return Ok(id);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not move folder {0}", id);
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }


        /// <summary>
        /// Returns all flex field object Tags
        /// </summary>
        /// <returns>All flex field object Tags</returns>
        [ProducesResponseType(typeof(List<string>), StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> FlexFieldObjectTags()
        {
            List<string> allTags = await _tagDbAccess.GetAllTags();
            return Ok(allTags);
        }

        /// <summary>
        /// Adds new tags
        /// </summary>
        /// <param name="tagsToCheck">Tags to check</param>
        /// <returns>Task</returns>
        private async Task AddNewTags(List<string> tagsToCheck)
        {
            if(tagsToCheck == null || tagsToCheck.Count == 0)
            {
                return;
            }

            List<string> existingTags = await _tagDbAccess.GetAllTags();
            if(existingTags == null)
            {
                existingTags = new List<string>();
            }

            List<string> newTags = tagsToCheck.Except(existingTags, StringComparer.OrdinalIgnoreCase).ToList();
            foreach(string curNewTag in newTags)
            {
                await _tagDbAccess.AddTag(curNewTag);
            }
        }

        /// <summary>
        /// Removes unused tags
        /// </summary>
        /// <param name="tagsToCheck">Tags to check</param>
        /// <returns>Task</returns>
        private async Task RemoveUnusedTags(List<string> tagsToCheck)
        {
            if(tagsToCheck == null || tagsToCheck.Count == 0)
            {
                return;
            }

            foreach(string curDeleteTag in tagsToCheck)
            {
                Task<bool> objectUsingTag = _objectDbAccess.AnyFlexFieldObjectUsingTag(curDeleteTag);
                Task<bool> templateUsingTag = _templateDbAccess.AnyFlexFieldObjectUsingTag(curDeleteTag);
                Task.WaitAll(objectUsingTag, templateUsingTag);
                if(objectUsingTag.Result || templateUsingTag.Result)
                {
                    continue;
                }

                await _tagDbAccess.DeleteTag(curDeleteTag);
            }
        }

        /// <summary>
        /// Exports a list of field values for a list of templates
        /// </summary>
        /// <param name="exportRequest">Export request</param>
        /// <returns>File with field values</returns>
        [ValidateAntiForgeryToken]
        [ProducesResponseType(typeof(byte[]), StatusCodes.Status200OK)]
        [HttpPost]
        public async Task<IActionResult> ExportFieldValues([FromForm]ExportFieldValuesRequest exportRequest)
        {
            if(exportRequest.SelectedFields == null)
            {
                exportRequest.SelectedFields = new List<string>();
            }

            T template = await _templateDbAccess.GetFlexFieldObjectById(exportRequest.SelectedTemplate);
            if (template == null)
            {
                return NotFound();
            }

            List<T> objects = await _objectDbAccess.GetFlexFieldObjectsByTemplate(exportRequest.SelectedTemplate);
            if(!string.IsNullOrEmpty(exportRequest.FolderId))
            {
                GoNorthProject curProject = await _projectDbAccess.GetDefaultProject();
                List<FlexFieldFolder> folders = await _folderDbAccess.GetFoldersForHierarchy(curProject.Id);
                objects = FilterObjectsByFolder(objects, folders, exportRequest.FolderId);
            }

            List<Dictionary<string, string>> rowValues = objects.Select(o => GetFieldValuesForObject(exportRequest.SelectedFields, o)).ToList();

            List<string> headerValues = new List<string> { CsvHeaderId, CsvHeaderName };
            headerValues.AddRange(exportRequest.SelectedFields);
            headerValues.Add(CsvHeaderTemplateIdPrefix + template.Id);

            string csvValues = await _csvGenerator.GenerateCsvFile(headerValues, rowValues);

            return File(Encoding.UTF8.GetBytes(csvValues), CsvContentType, template.Name + "_FieldValues.csv");
        }

        /// <summary>
        /// Filters an object by folder hierarchy
        /// </summary>
        /// <param name="objects">Objects to filter</param>
        /// <param name="folders">Folder</param>
        /// <param name="folderId">Id of the folder from which to filter</param>
        /// <returns>List of objects</returns>
        private List<T> FilterObjectsByFolder(List<T> objects, List<FlexFieldFolder> folders, string folderId)
        {
            List<FlexFieldFolder> filteredFolders = folders.Where(f => IsFolderChildOfFolder(folderId, f, folders)).ToList();
            return objects.Where(o => filteredFolders.Any(f => f.Id == o.ParentFolderId)).ToList();
        }

        /// <summary>
        /// Checks if a folder is a child of a folder
        /// </summary>
        /// <param name="folderId">Id of the folder to check</param>
        /// <param name="folder">Folder</param>
        /// <param name="folders">Folders</param>
        /// <returns>true if the folder is a child</returns>
        private bool IsFolderChildOfFolder(string folderId, FlexFieldFolder folder, List<FlexFieldFolder> folders)
        {
            if(folder.Id == folderId)
            {
                return true;
            }

            FlexFieldFolder parent = folder;
            do
            {
                parent = folders.FirstOrDefault(f => f.Id == parent.ParentFolderId);
                if(parent == null)
                {
                    break;
                }

                if(parent.Id == folderId)
                {
                    return true;
                }
            }
            while(parent != null);

            return false;
        }

        /// <summary>
        /// Returns the field values for an object
        /// </summary>
        /// <param name="selectedFields">Selected fields for exporting</param>
        /// <param name="obj">Object to export</param>
        /// <returns>Field values for the object</returns>
        private Dictionary<string, string> GetFieldValuesForObject(List<string> selectedFields, T obj)
        {
            Dictionary<string, string> fieldValues = new Dictionary<string, string>();
            fieldValues.Add(CsvHeaderId, obj.Id);
            fieldValues.Add(CsvHeaderName, obj.Name);

            List<FlexField> fieldsToExport = obj.Fields.Where(f => selectedFields.Contains(f.Name) && f.Name != CsvHeaderId && f.Name != CsvHeaderName).ToList();
            foreach(FlexField curField in fieldsToExport)
            {
                if(!fieldValues.ContainsKey(curField.Name))
                {
                    fieldValues.Add(curField.Name, curField.Value);
                }
            }

            return fieldValues;
        }

        /// <summary>
        /// Runs a field value import pre check
        /// </summary>
        /// <returns>Prcheck Result</returns>
        [ValidateAntiForgeryToken]
        [ProducesResponseType(typeof(FlexFieldImportValuePreCheckResult), StatusCodes.Status200OK)]
        [HttpPost]
        public async Task<IActionResult> ImportFieldValuesPreCheck()
        {
            if (!Request.Form.Files.Any())
            {
                return BadRequest();
            }

            IFormFile uploadFile = Request.Form.Files[0];
            if (uploadFile.ContentType != CsvContentType && uploadFile.ContentType != ExcelCsvContentType)
            {
                return BadRequest();
            }

            CsvReadResult csvReadResult;
            using (Stream csvStream = uploadFile.OpenReadStream())
            {
                csvReadResult = await _csvParser.ReadCsvFile(csvStream);
            }

            if (csvReadResult == null)
            {
                return BadRequest();
            }

            if(!csvReadResult.Columns.Any())
            {
                return BadRequest(_localizer["ImportFieldValuesNoValidRows"]);
            }

            List<T> objectsToUpdate = await LoadObjectsFromCsv(csvReadResult);
            FlexFieldImportValuePreCheckResult preCheckResult = await BuildCsvPreCheckResult(uploadFile.FileName, csvReadResult, objectsToUpdate);
            if(preCheckResult == null)
            {
                return BadRequest(_localizer["ImportFieldValuesNoValidTemplateSpecified"]);
            }
            return Ok(preCheckResult);
        }

        /// <summary>
        /// Loads the objects which need to be updated for a CSV
        /// </summary>
        /// <param name="csvReadResult">CSV Read result</param>
        /// <returns>Loaded objects</returns>
        private async Task<List<T>> LoadObjectsFromCsv(CsvReadResult csvReadResult)
        {
            List<string> ids = new List<string>();
            foreach (Dictionary<string, string> curRow in csvReadResult.Rows)
            {
                if (curRow.ContainsKey(CsvHeaderId))
                {
                    ids.Add(curRow[CsvHeaderId]);
                }
            }
            List<T> objectsToUpdate = await _objectDbAccess.GetFlexFieldObjectsByIds(ids);
            return objectsToUpdate;
        }
        
        /// <summary>
        /// Builds the CSV PreCheck result
        /// </summary>
        /// <param name="filename">Filename</param>
        /// <param name="csvReadResult">CSV Read Result</param>
        /// <param name="objectsToUpdate">Loaded objects</param>
        /// <returns>Pre Check result</returns>
        private async Task<FlexFieldImportValuePreCheckResult> BuildCsvPreCheckResult(string filename, CsvReadResult csvReadResult, List<T> objectsToUpdate)
        {
            FlexFieldImportValuePreCheckResult preCheckResult = new FlexFieldImportValuePreCheckResult();
            preCheckResult.Filename = filename;

            preCheckResult.Columns = csvReadResult.Columns.Where(c => c != CsvHeaderId && !c.StartsWith(CsvHeaderTemplateIdPrefix)).ToList();

            string headerTemplateValue = csvReadResult.Columns.FirstOrDefault(c => c.StartsWith(CsvHeaderTemplateIdPrefix));
            if(string.IsNullOrEmpty(headerTemplateValue))
            {
                return null;
            }
            
            string templateId = headerTemplateValue.Replace(CsvHeaderTemplateIdPrefix, string.Empty);
            T template = await _templateDbAccess.GetFlexFieldObjectById(templateId);
            if(template == null)
            {
                return null;
            }

            preCheckResult.TemplateId = template.Id;

            foreach(Dictionary<string, string> curRow in csvReadResult.Rows)
            {
                string id = string.Empty;
                if(curRow.ContainsKey(CsvHeaderId))
                {
                    id = curRow[CsvHeaderId];
                }

                FlexFieldImportValuePreCheckRow preCheckRow = new FlexFieldImportValuePreCheckRow();
                preCheckRow.Id = id;

                T existingObject = objectsToUpdate.FirstOrDefault(o => o.Id == id);
                foreach(string curCol in csvReadResult.Columns)
                {
                    if(curCol == CsvHeaderId || curCol.StartsWith(CsvHeaderTemplateIdPrefix))
                    {
                        continue;
                    }

                    FlexFieldImportValuePreCheckCell preCheckCell = new FlexFieldImportValuePreCheckCell();
                    preCheckCell.Name = curCol;
                    preCheckCell.NewValue = string.Empty;
                    if(curRow.ContainsKey(curCol))
                    {
                        preCheckCell.NewValue = curRow[curCol];    
                    }

                    preCheckCell.OldValue = string.Empty;
                    if(curCol == CsvHeaderName && existingObject != null)
                    {
                        preCheckCell.OldValue = existingObject.Name;
                    }
                    else if(existingObject != null && existingObject.Fields != null)
                    {
                        FlexField field = existingObject.Fields.FirstOrDefault(f => f.Name == curCol);
                        if(field != null)
                        {
                            preCheckCell.OldValue = field.Value;
                        }
                    }
                    preCheckRow.ColumnValues.Add(preCheckCell);
                }

                if(existingObject != null)
                {
                    preCheckResult.ExistingRows.Add(preCheckRow);
                }
                else
                {
                    preCheckResult.NewRows.Add(preCheckRow);
                }
            }

            return preCheckResult;
        }
        
        /// <summary>
        /// Runs a field value import
        /// </summary>
        /// <param name="importRows">Rows to import</param>
        /// <returns>Import Result</returns>
        [ValidateAntiForgeryToken]
        [ProducesResponseType(typeof(FlexFieldImportFieldValuesResultLog), StatusCodes.Status200OK)]
        [HttpPost]
        public async Task<IActionResult> ImportFieldValues([FromBody]FlexFieldImportValueImportRequest importRows)
        {
            if(string.IsNullOrEmpty(importRows.TemplateId))
            {
                return BadRequest();
            }

            if(string.IsNullOrEmpty(importRows.TargetFolderId))
            {
                importRows.TargetFolderId = string.Empty;
            }

            T template = await _templateDbAccess.GetFlexFieldObjectById(importRows.TemplateId);
            if(template == null)
            {
                return BadRequest();
            }

            GoNorthProject curProject = await _projectDbAccess.GetDefaultProject();

            FlexFieldImportFieldValuesResultLog importResult = new FlexFieldImportFieldValuesResultLog();
            importResult.FileName = importRows.Filename;
            importResult.ProjectId = curProject.Id;
            importResult.Columns = importRows.Columns;

            List<string> existingIds = importRows.ExistingRows.Select(e => e.Id).ToList();
            List<T> existingObjectsToUpdate = await _objectDbAccess.GetFlexFieldObjectsByIds(existingIds);

            await ImportFieldValuesExistingRows(template, importRows.ExistingRows, importResult, existingObjectsToUpdate);
            await ImportFieldValuesNewRows(template, importRows.TargetFolderId, importRows.NewRows, importResult);

            if(importResult.ExistingRows.Any(e => e.Result == FlexFieldImportValueRowResult.Success) || importResult.NewRows.Any(e => e.Result == FlexFieldImportValueRowResult.Success))
            {
                await _timelineService.AddTimelineEntry(ValueFileImportEvent, importResult.ExistingRows.Where(e => e.Result == FlexFieldImportValueRowResult.Success).Count().ToString(), 
                                                        importResult.NewRows.Where(e => e.Result == FlexFieldImportValueRowResult.Success).Count().ToString());
            }

            await this.SetModifiedData(_userManager, importResult);

            importResult = await _importFieldValuesLogDbAccess.CreateImportLog(importResult);

            return Ok(importResult);
        }

        /// <summary>
        /// Imports the field values for existing rows
        /// </summary>
        /// <param name="template">Template to which the rows belong</param>
        /// <param name="existingRows">Existing rows that are being imported</param>
        /// <param name="importResult">Import result to populate</param>
        /// <param name="existingObjectsToUpdate">Already existing objects</param>
        /// <returns>Task</returns>
        private async Task ImportFieldValuesExistingRows(T template, List<FlexFieldImportValuePreCheckRow> existingRows, FlexFieldImportFieldValuesResultLog importResult, List<T> existingObjectsToUpdate)
        {
            foreach (FlexFieldImportValuePreCheckRow curExistingRow in existingRows)
            {
                FlexFieldImportValueRow importRow = new FlexFieldImportValueRow();
                importRow.Id = curExistingRow.Id;
                importRow.ColumnValues = curExistingRow.ColumnValues;

                T existingObject = existingObjectsToUpdate.FirstOrDefault(e => e.Id == curExistingRow.Id);
                if (existingObject == null)
                {
                    importRow.Result = FlexFieldImportValueRowResult.Failed;
                    importRow.ErrorMessage = _localizer["ImportFieldValuesObjectNotFound"];
                    importResult.ExistingRows.Add(importRow);
                    continue;
                }

                string invalidField = string.Empty;
                bool unknownFieldForTemplate = false;
                bool fieldValueInvalid = false;
                bool anyChange = false;
                foreach (FlexFieldImportValuePreCheckCell curColumn in curExistingRow.ColumnValues)
                {
                    if(curColumn.Name.StartsWith(CsvHeaderTemplateIdPrefix))
                    {
                        continue;
                    }

                    if (curColumn.Name == CsvHeaderName)
                    {
                        if (existingObject.Name != curColumn.NewValue)
                        {
                            existingObject.Name = curColumn.NewValue;
                            anyChange = true;
                        }
                    }
                    else
                    {
                        bool isNewField = false;
                        string columnName = curColumn.Name.ToLowerInvariant();
                        FlexField updatedField = existingObject.Fields.FirstOrDefault(f => f.Name.ToLowerInvariant() == columnName);
                        if (updatedField == null)
                        {
                            isNewField = true;
                            updatedField = GetFlexFieldFromTemplate(template, columnName);
                            if(updatedField == null)
                            {
                                invalidField = curColumn.Name;
                                unknownFieldForTemplate = true;
                                continue;
                            }
                        }

                        if (updatedField.Value == curColumn.NewValue && (!isNewField || string.IsNullOrEmpty(curColumn.NewValue)))
                        {
                            continue;
                        }

                        if (!ValidateFieldValue(updatedField, curColumn.NewValue))
                        {
                            invalidField = curColumn.Name;
                            fieldValueInvalid = true;
                            break;
                        }

                        updatedField.Value = curColumn.NewValue;
                        if(isNewField)
                        {
                            existingObject.Fields.Add(updatedField);
                        }
                        anyChange = true;
                    }
                }

                if(string.IsNullOrEmpty(existingObject.Name))
                {
                    importRow.Result = FlexFieldImportValueRowResult.Failed;
                    importRow.ErrorMessage = _localizer["ImportFieldValuesNameIsEmpty"];
                    importResult.ExistingRows.Add(importRow);
                    continue;
                }

                if (fieldValueInvalid || unknownFieldForTemplate)
                {
                    importRow.Result = FlexFieldImportValueRowResult.Failed;
                    importRow.ErrorMessage = _localizer[unknownFieldForTemplate ? "ImportFieldValuesValueNotValid" : "ImportFieldValuesValueNotValid", invalidField];
                    importResult.ExistingRows.Add(importRow);
                    continue;
                }

                if (!anyChange)
                {
                    importRow.Result = FlexFieldImportValueRowResult.NoChange;
                    importResult.ExistingRows.Add(importRow);
                    continue;
                }

                try
                {
                    await SetNotImplementedFlagOnChange(existingObject);

                    existingObject = await RunAdditionalUpdates(existingObject, existingObject);

                    await this.SetModifiedData(_userManager, existingObject);

                    await _objectDbAccess.UpdateFlexFieldObject(existingObject);
                    importRow.Result = FlexFieldImportValueRowResult.Success;
                }
                catch (Exception ex)
                {
                    importRow.Result = FlexFieldImportValueRowResult.Failed;
                    importRow.ErrorMessage = _localizer["ImportFieldValuesObjectCouldNotBeUpdated"];
                    _logger.LogError(ex, string.Format("Could not import object {0}", existingObject.Id));
                }

                importResult.ExistingRows.Add(importRow);
            }
        }

        /// <summary>
        /// Returns a flex field from a template
        /// </summary>
        /// <param name="template">Template</param>
        /// <param name="name">Name of the field</param>
        /// <returns>Flex Field</returns>
        private FlexField GetFlexFieldFromTemplate(T template, string name)
        {
            FlexField templateField = template.Fields.FirstOrDefault(f => f.Name.ToLowerInvariant() == name);
            if(templateField == null)
            {
                return null;
            }

            templateField = (FlexField)templateField.Clone();
            templateField.Id = Guid.NewGuid().ToString();
            templateField.CreatedFromTemplate = true;
            return templateField;
        }

        /// <summary>
        /// Imports the new rows for a field value
        /// </summary>
        /// <param name="template">Template to use</param>
        /// <param name="targetFolderId">Target folder id</param>
        /// <param name="newRows">New Rows to import</param>
        /// <param name="importResult">Import result to fill</param>
        /// <returns>Task</returns>
        private async Task ImportFieldValuesNewRows(T template, string targetFolderId, List<FlexFieldImportValuePreCheckRow> newRows, FlexFieldImportFieldValuesResultLog importResult)
        {
            if(!newRows.Any())
            {
                return;
            }

            foreach (FlexFieldImportValuePreCheckRow curNewRow in newRows)
            {
                T newObject = (T)template.Clone();
                newObject.TemplateId = template.Id;
                newObject.ParentFolderId = targetFolderId;

                string invalidField = string.Empty;
                bool unknownFieldForTemplate = false;
                bool fieldValueInvalid = false;

                FlexFieldImportValueRow importRow = new FlexFieldImportValueRow();
                importRow.ColumnValues = curNewRow.ColumnValues;

                foreach (FlexFieldImportValuePreCheckCell curColumn in curNewRow.ColumnValues)
                {
                    if(curColumn.Name.StartsWith(CsvHeaderTemplateIdPrefix))
                    {
                        continue;
                    }

                    if (curColumn.Name == CsvHeaderName)
                    {
                        newObject.Name = curColumn.NewValue;
                    }
                    else
                    {
                        string columnName = curColumn.Name.ToLowerInvariant();
                        FlexField updatedField = newObject.Fields.FirstOrDefault(f => f.Name.ToLowerInvariant() == columnName);
                        if (updatedField == null)
                        {
                            invalidField = curColumn.Name;
                            unknownFieldForTemplate = true;
                            continue;
                        }

                        if (!ValidateFieldValue(updatedField, curColumn.NewValue))
                        {
                            invalidField = curColumn.Name;
                            fieldValueInvalid = true;
                            break;
                        }

                        updatedField.Value = curColumn.NewValue;
                    }
                }

                if(string.IsNullOrEmpty(newObject.Name))
                {
                    importRow.Result = FlexFieldImportValueRowResult.Failed;
                    importRow.ErrorMessage = _localizer["ImportFieldValuesNameIsEmpty"];
                    importResult.NewRows.Add(importRow);
                    continue;
                }

                if (fieldValueInvalid || unknownFieldForTemplate)
                {
                    importRow.Result = FlexFieldImportValueRowResult.Failed;
                    importRow.ErrorMessage = _localizer[unknownFieldForTemplate ? "ImportFieldValuesValueNotValid" : "ImportFieldValuesValueNotValid", invalidField];
                    importResult.NewRows.Add(importRow);
                    continue;
                }

                try
                {
                    newObject.IsImplemented = false;

                    newObject = await RunAdditionalUpdates(newObject, newObject);

                    await this.SetModifiedData(_userManager, newObject);

                    newObject = await _objectDbAccess.CreateFlexFieldObject(newObject);
                    importRow.Result = FlexFieldImportValueRowResult.Success;
                    importRow.Id = newObject.Id;
                }
                catch (Exception ex)
                {
                    importRow.Result = FlexFieldImportValueRowResult.Failed;
                    importRow.ErrorMessage = _localizer["ImportFieldValuesObjectCouldNotBeCreated"];
                    _logger.LogError(ex, string.Format("Could not import new object {0}", newObject.Name));
                }

                importResult.NewRows.Add(importRow);
            }
        }

        /// <summary>
        /// Validates a field value
        /// </summary>
        /// <param name="field">Target field</param>
        /// <param name="newValue">New value</param>
        /// <returns>True if the field is valid, else false</returns>
        private bool ValidateFieldValue(FlexField field, string newValue)
        {
            if(field.FieldType == FlexFieldType_Number)
            {
                float tempVal;
                return float.TryParse(newValue, out tempVal);
            }
            else if(field.FieldType == FlexFieldType_Option)
            {
                try
                {
                    List<string> allowedOptions = JsonSerializer.Deserialize<List<string>>(field.AdditionalConfiguration);
                    return allowedOptions.Any(a => a == newValue);
                }
                catch(Exception ex)
                {
                    _logger.LogError(ex, string.Format("Could not parse options for field {0}", field.Name));
                    return false;
                }
            }

            return true;
        }

        
        /// <summary>
        /// Exports the result of an import for field values
        /// </summary>
        /// <param name="id">Id of the log</param>
        /// <returns>Export file</returns>
        [ProducesResponseType(typeof(byte[]), StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> ExportFieldValueImportResult(string id)
        {
            FlexFieldImportFieldValuesResultLog importLog = await _importFieldValuesLogDbAccess.GetImportLogById(id);
            if(importLog == null)
            {
                return NotFound();
            }

            List<string> columns = new List<string> { CsvHeaderId, CsvHeaderResult, CsvHeaderErrorMessage };
            columns.AddRange(importLog.Columns);

            List<Dictionary<string, string>> rowValues = importLog.ExistingRows.Select(o => columns.ToDictionary(c => c, c => GetExportFieldValueLogValue(c, o, false))).ToList();
            rowValues.AddRange(importLog.NewRows.Select(o => columns.ToDictionary(c => c, c => GetExportFieldValueLogValue(c, o, true))).ToList());

            string csvValues = await _csvGenerator.GenerateCsvFile(columns, rowValues);

            return File(Encoding.UTF8.GetBytes(csvValues), CsvContentType, Path.GetFileNameWithoutExtension(importLog.FileName) + "_Result.csv");
        }

        /// <summary>
        /// Returns the column value for a log result
        /// </summary>
        /// <param name="column">Column</param>
        /// <param name="valueRow">Value row</param>
        /// <param name="isNewRow">True if the row is a new row</param>
        /// <returns>Value</returns>
        private string GetExportFieldValueLogValue(string column, FlexFieldImportValueRow valueRow, bool isNewRow)
        {
            if(column == CsvHeaderId)
            {
                if(isNewRow) 
                {
                    return !string.IsNullOrEmpty(valueRow.Id) ? string.Format("NEW: {0}", valueRow.Id) : "<NEW>";
                }
                else
                {
                    return valueRow.Id;
                }
            }
            else if(column == CsvHeaderResult)
            {
                return valueRow.Result.ToString();
            }
            else if(column == CsvHeaderErrorMessage)
            {
                return valueRow.ErrorMessage;
            }

            if(valueRow.ColumnValues == null)
            {
                return string.Empty;
            }

            FlexFieldImportValuePreCheckCell value = valueRow.ColumnValues.FirstOrDefault(c => c.Name == column);
            if(value == null)
            {
                return string.Empty;
            }

            if(value.NewValue == value.OldValue)
            {
                return value.NewValue;
            }

            if(isNewRow)
            {
                return value.NewValue;
            }

            return string.Format("{0} -> {1}", !string.IsNullOrEmpty(value.OldValue) ? value.OldValue : "<BLANK>", !string.IsNullOrEmpty(value.NewValue) ? value.NewValue : "<BLANK>");
        }

        /// <summary>
        /// Returns a list of import logs
        /// </summary>
        /// <param name="start">Start of the page</param>
        /// <param name="pageSize">Size of the page</param>
        /// <returns>List of import logs without details</returns>
        [ProducesResponseType(StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<ActionResult<ImportFieldValuesLogQueryResult>> GetFlexFieldValueImportLogs(int start, int pageSize)
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();
            Task<List<FlexFieldImportFieldValuesResultLog>> queryTask;
            Task<int> countTask;
            queryTask = _importFieldValuesLogDbAccess.GetImportLogsByProject(project.Id, start, pageSize);
            countTask = _importFieldValuesLogDbAccess.GetImportLogsByProjectCount(project.Id);
            Task.WaitAll(queryTask, countTask);

            ImportFieldValuesLogQueryResult queryResult = new ImportFieldValuesLogQueryResult();
            queryResult.Logs = queryTask.Result;
            queryResult.HasMore = start + queryResult.Logs.Count < countTask.Result;
            return Ok(queryResult);
        }
        

        /// <summary>
        /// Returns a flex field value import log
        /// </summary>
        /// <param name="id">Id of the log</param>
        /// <returns>Import log</returns>
        [ProducesResponseType(typeof(FlexFieldImportFieldValuesResultLog), StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<ActionResult<ImportFieldValuesLogQueryResult>> GetFlexFieldValueImportLog(string id)
        {
            FlexFieldImportFieldValuesResultLog importLog = await _importFieldValuesLogDbAccess.GetImportLogById(id);
            return Ok(importLog);
        }
    }
}