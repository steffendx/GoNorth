using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using GoNorth.Data.Aika;
using GoNorth.Data.Karta;
using GoNorth.Data.Kirja;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Data.Styr;
using GoNorth.Data.TaskManagement;
using GoNorth.Services.Timeline;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;

namespace GoNorth.Controllers.Api
{
    /// <summary>
    /// User Api controller
    /// </summary>
    [Authorize(Roles = RoleNames.Administrator)]
    [Route("/api/[controller]/[action]")]
    public class ProjectApiController : Controller
    {
        /// <summary>
        /// Project Db Service
        /// </summary>
        private readonly IProjectDbAccess _projectDbAccess;

        /// <summary>
        /// Kortisto Folder Db Access
        /// </summary>
        private readonly IKortistoFolderDbAccess _kortistoFolderDbAccess;

        /// <summary>
        /// Npc Db Access
        /// </summary>
        private readonly IKortistoNpcDbAccess _npcDbAccess;
        
        /// <summary>
        /// Styr Folder Db Access
        /// </summary>
        private readonly IStyrFolderDbAccess _styrFolderDbAccess;

        /// <summary>
        /// Item Db Access
        /// </summary>
        private readonly IStyrItemDbAccess _itemDbAccess;

        /// <summary>
        /// KirjaPage Db Access
        /// </summary>
        private readonly IKirjaPageDbAccess _kirjaPageDbAccess;

        /// <summary>
        /// Chapter Detail Db Access
        /// </summary>
        private readonly IAikaChapterDetailDbAccess _chapterDetailDbAccess;

        /// <summary>
        /// Quest Db Access
        /// </summary>
        private readonly IAikaQuestDbAccess _questDbAccess;

        /// <summary>
        /// Karta Map Db Access
        /// </summary>
        private readonly IKartaMapDbAccess _mapDbAccess;

        /// <summary>
        /// Task Board Db Access
        /// </summary>
        private readonly ITaskBoardDbAccess _taskBoardDbAccess;

        /// <summary>
        /// Timeline Service
        /// </summary>
        private readonly ITimelineService _timelineService;

        /// <summary>
        /// Logger
        /// </summary>
        private readonly ILogger _logger;

        /// <summary>
        /// Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="projectDbAccess">User Db Access</param>
        /// <param name="kortistoFolderDbAccess">Kortisto Folder Db Access</param>
        /// <param name="npcDbAccess">Npc Db Access</param>
        /// <param name="styrFolderDbAccess">Styr Folder Db Access</param>
        /// <param name="itemDbAccess">Item Db Access</param>
        /// <param name="kirjaPageDbAccess">Kirja Page Db Access</param>
        /// <param name="chapterDetailDbAccess">Chapter Detail Db Access</param>
        /// <param name="questDbAccess">Quest Db Access</param>
        /// <param name="mapDbAccess">Map Db Access</param>
        /// <param name="taskBoardDbAccess">Task Board Db Access</param>
        /// <param name="timelineService">Timeline Service</param>
        /// <param name="logger">Logger</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public ProjectApiController(IProjectDbAccess projectDbAccess, IKortistoFolderDbAccess kortistoFolderDbAccess, IKortistoNpcDbAccess npcDbAccess, IStyrFolderDbAccess styrFolderDbAccess, IStyrItemDbAccess itemDbAccess, IKirjaPageDbAccess kirjaPageDbAccess, 
                                    IAikaChapterDetailDbAccess chapterDetailDbAccess, IAikaQuestDbAccess questDbAccess, IKartaMapDbAccess mapDbAccess, ITaskBoardDbAccess taskBoardDbAccess, ITimelineService timelineService, 
                                    ILogger<ProjectApiController> logger, IStringLocalizerFactory localizerFactory)
        {
            _projectDbAccess = projectDbAccess;
            _kortistoFolderDbAccess = kortistoFolderDbAccess;
            _npcDbAccess = npcDbAccess;
            _styrFolderDbAccess = styrFolderDbAccess;
            _itemDbAccess = itemDbAccess;
            _kirjaPageDbAccess = kirjaPageDbAccess;
            _chapterDetailDbAccess = chapterDetailDbAccess;
            _questDbAccess = questDbAccess;
            _mapDbAccess = mapDbAccess;
            _taskBoardDbAccess = taskBoardDbAccess;
            _timelineService = timelineService;
            _logger = logger;
            _localizer = localizerFactory.Create(typeof(ProjectApiController));
        }

        /// <summary>
        /// Returns all project entries
        /// </summary>
        /// <returns>Project Entries</returns>
        [HttpGet]
        public async Task<IActionResult> Entries()
        {
            List<GoNorthProject> projects = await _projectDbAccess.GetProjects();

            return Ok(projects);
        }

        /// <summary>
        /// Creates a new project
        /// </summary>
        /// <param name="project">Project to create</param>
        /// <returns>Result</returns>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CreateProject([FromBody]GoNorthProject project)
        {
            if(string.IsNullOrEmpty(project.Name))
            {
                return StatusCode((int)HttpStatusCode.BadRequest);
            }

            try
            {
                project = await _projectDbAccess.CreateProject(project);
                await _timelineService.AddTimelineEntry(TimelineEvent.ProjectCreated, project.Name);
                return Ok(project.Id);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, "Could not create project {0}", project.Name);
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }

        /// <summary>
        /// Deletes a user
        /// </summary>
        /// <param name="id">Id of the user</param>
        /// <returns>Result Status Code</returns>
        [HttpDelete]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteProject(string id)
        {
            GoNorthProject project = await _projectDbAccess.GetProjectById(id);
            bool isProjectEmpty = await IsProjectEmpty(project);
            if(!isProjectEmpty)
            {
                _logger.LogInformation("Attempted to delete non empty project {0}.", project.Name);
                return StatusCode((int)HttpStatusCode.BadRequest, _localizer["ProjectNotEmpty"].Value);
            }

            await _projectDbAccess.DeleteProject(project);
            _logger.LogInformation("Project was deleted.");

            await _timelineService.AddTimelineEntry(TimelineEvent.ProjectDeleted, project.Name);
            return Ok(id);
        }

        /// <summary>
        /// Checks if a project is empty
        /// </summary>
        /// <param name="project">Project to check</param>
        /// <returns>True if the project is empty, else false</returns>
        private async Task<bool> IsProjectEmpty(GoNorthProject project)
        {
            int rootKortistoFolderCount = await _kortistoFolderDbAccess.GetRootFolderCount(project.Id);
            if(rootKortistoFolderCount > 0)
            {
                return false;
            }

            int rootNpcCount = await _npcDbAccess.GetFlexFieldObjectsInRootFolderCount(project.Id);
            if(rootNpcCount > 0)
            {
                return false;
            }

            int rootStyrFolderCount = await _styrFolderDbAccess.GetRootFolderCount(project.Id);
            if(rootStyrFolderCount > 0)
            {
                return false;
            }

            int rootItemCount = await _itemDbAccess.GetFlexFieldObjectsInRootFolderCount(project.Id);
            if(rootItemCount > 0)
            {
                return false;
            }

            int kirjaPageCount = await _kirjaPageDbAccess.SearchPagesCount(project.Id, string.Empty, string.Empty);
            if(kirjaPageCount > 0)
            {
                return false;
            }

            int chapterDetailCount = await _chapterDetailDbAccess.GetChapterDetailsByProjectIdCount(project.Id);
            if(chapterDetailCount > 0)
            {
                return false;
            }

            int questCount = await _questDbAccess.GetQuestsByProjectIdCount(project.Id);
            if(questCount > 0)
            {
                return false;
            }

            List<KartaMap> maps = await _mapDbAccess.GetAllProjectMaps(project.Id);
            if(maps != null && maps.Count > 0)
            {
                return false;
            }

            int taskBoardCount = await _taskBoardDbAccess.GetOpenTaskBoardCount(project.Id);
            taskBoardCount += await _taskBoardDbAccess.GetClosedTaskBoardCount(project.Id);
            if(taskBoardCount > 0)
            {
                return false;
            }

            return true;
        }

        /// <summary>
        /// Updates a project 
        /// </summary>
        /// <param name="id">Project Id</param>
        /// <param name="project">Update project data</param>
        /// <returns>Result Status Code</returns>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateProject(string id, [FromBody]GoNorthProject project)
        {
            GoNorthProject loadedProject = await _projectDbAccess.GetProjectById(id);
            loadedProject.Id = id;
            loadedProject.Name = project.Name;
            loadedProject.IsDefault = project.IsDefault;

            await _projectDbAccess.UpdateProject(loadedProject);
            _logger.LogInformation("Project was updated.");
            await _timelineService.AddTimelineEntry(TimelineEvent.ProjectUpdated, project.Name);

            return Ok(id);
        }
    }
}