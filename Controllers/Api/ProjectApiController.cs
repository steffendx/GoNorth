using System;
using System.Collections.Generic;
using System.Globalization;
using System.Net;
using System.Threading.Tasks;
using GoNorth.Data.Aika;
using GoNorth.Data.Evne;
using GoNorth.Data.Exporting;
using GoNorth.Data.Karta;
using GoNorth.Data.Kirja;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Data.ProjectConfig;
using GoNorth.Data.Styr;
using GoNorth.Data.TaskManagement;
using GoNorth.Services.Timeline;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;

namespace GoNorth.Controllers.Api
{
    /// <summary>
    /// Project Api controller
    /// </summary>
    [ApiController]
    [Authorize(Roles = RoleNames.Administrator)]
    [Route("/api/[controller]/[action]")]
    public class ProjectApiController : ControllerBase
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
        /// Evne Folder Db Access
        /// </summary>
        private readonly IEvneFolderDbAccess _evneFolderDbAccess;

        /// <summary>
        /// Skill Db Access
        /// </summary>
        private readonly IEvneSkillDbAccess _evneSkillDbAccess;

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
        /// Task Number Db Access
        /// </summary>
        private readonly ITaskNumberDbAccess _taskNumberDbAccess;

        /// <summary>
        /// User task board history db access
        /// </summary>
        private readonly IUserTaskBoardHistoryDbAccess _userTaskBoardHistoryDbAccess;

        /// <summary>
        /// Export Settings Db Access
        /// </summary>
        private readonly IExportSettingsDbAccess _exportSettingsDbAccess;

        /// <summary>
        /// Export Template Db Access
        /// </summary>
        private readonly IExportTemplateDbAccess _exportTemplateDbAccess;

        /// <summary>
        /// Include export template Db Access
        /// </summary>
        private readonly IIncludeExportTemplateDbAccess _includeExportTemplateDbAccess;

        /// <summary>
        /// Project Config Db Access
        /// </summary>
        private readonly IProjectConfigDbAccess _projectConfigDbAccess;

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
        /// <param name="evneFolderDbAccess">Evne Folder Db Access</param>
        /// <param name="skillDbAccess">Skill Db Access</param>
        /// <param name="kirjaPageDbAccess">Kirja Page Db Access</param>
        /// <param name="chapterDetailDbAccess">Chapter Detail Db Access</param>
        /// <param name="questDbAccess">Quest Db Access</param>
        /// <param name="mapDbAccess">Map Db Access</param>
        /// <param name="taskBoardDbAccess">Task Board Db Access</param>
        /// <param name="taskNumberDbAccess">Task Number Db Access</param>
        /// <param name="userTaskBoardHistoryDbAccess">User Task board history db access</param>
        /// <param name="exportSettingsDbAccess">Export Settings Db Access</param>
        /// <param name="exportTemplateDbAccess">Export Template Db Access</param>
        /// <param name="includeExportTemplateDbAccess">Include export template Db Access</param>
        /// <param name="projectConfigDbAccess">Project Config Db Access</param>
        /// <param name="timelineService">Timeline Service</param>
        /// <param name="logger">Logger</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public ProjectApiController(IProjectDbAccess projectDbAccess, IKortistoFolderDbAccess kortistoFolderDbAccess, IKortistoNpcDbAccess npcDbAccess, IStyrFolderDbAccess styrFolderDbAccess, IStyrItemDbAccess itemDbAccess, IEvneFolderDbAccess evneFolderDbAccess, IEvneSkillDbAccess skillDbAccess, 
                                    IKirjaPageDbAccess kirjaPageDbAccess, IAikaChapterDetailDbAccess chapterDetailDbAccess, IAikaQuestDbAccess questDbAccess, IKartaMapDbAccess mapDbAccess, ITaskBoardDbAccess taskBoardDbAccess, ITaskNumberDbAccess taskNumberDbAccess, 
                                    IUserTaskBoardHistoryDbAccess userTaskBoardHistoryDbAccess, IExportSettingsDbAccess exportSettingsDbAccess, IExportTemplateDbAccess exportTemplateDbAccess, IIncludeExportTemplateDbAccess includeExportTemplateDbAccess, IProjectConfigDbAccess projectConfigDbAccess, 
                                    ITimelineService timelineService, ILogger<ProjectApiController> logger,IStringLocalizerFactory localizerFactory)
        {
            _projectDbAccess = projectDbAccess;
            _kortistoFolderDbAccess = kortistoFolderDbAccess;
            _npcDbAccess = npcDbAccess;
            _styrFolderDbAccess = styrFolderDbAccess;
            _itemDbAccess = itemDbAccess;
            _evneFolderDbAccess = evneFolderDbAccess;
            _evneSkillDbAccess = skillDbAccess;
            _kirjaPageDbAccess = kirjaPageDbAccess;
            _chapterDetailDbAccess = chapterDetailDbAccess;
            _questDbAccess = questDbAccess;
            _mapDbAccess = mapDbAccess;
            _taskBoardDbAccess = taskBoardDbAccess;
            _taskNumberDbAccess = taskNumberDbAccess;
            _userTaskBoardHistoryDbAccess = userTaskBoardHistoryDbAccess;
            _exportSettingsDbAccess = exportSettingsDbAccess;
            _exportTemplateDbAccess = exportTemplateDbAccess;
            _includeExportTemplateDbAccess = includeExportTemplateDbAccess;
            _projectConfigDbAccess = projectConfigDbAccess;
            _timelineService = timelineService;
            _logger = logger;
            _localizer = localizerFactory.Create(typeof(ProjectApiController));
        }

        /// <summary>
        /// Returns all project entries
        /// </summary>
        /// <returns>Project Entries</returns>
        [ProducesResponseType(typeof(List<GoNorthProject>), StatusCodes.Status200OK)]
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
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CreateProject([FromBody]GoNorthProject project)
        {
            if(string.IsNullOrEmpty(project.Name))
            {
                return BadRequest();
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
        /// Deletes a project
        /// </summary>
        /// <param name="id">Id of the project</param>
        /// <returns>Result Status Code</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]  
        [HttpDelete]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteProject(string id)
        {
            GoNorthProject project = await _projectDbAccess.GetProjectById(id);
            if(project.IsDefault)
            {
                return BadRequest(_localizer["ProjectIsDefaultProject"].Value);
            }

            bool isProjectEmpty = await IsProjectEmpty(project);
            if(!isProjectEmpty)
            {
                _logger.LogInformation("Attempted to delete non empty project {0}.", project.Name);
                return BadRequest(_localizer["ProjectNotEmpty"].Value);
            }

            await _projectDbAccess.DeleteProject(project);
            _logger.LogInformation("Project was deleted.");

            await CleanUpAdditionalProjectData(project);
            _logger.LogInformation("Additional project data was deleted.");

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
            int rootKortistoFolderCount = await _kortistoFolderDbAccess.GetRootFolderCount(project.Id, CultureInfo.CurrentUICulture.TwoLetterISOLanguageName);
            if(rootKortistoFolderCount > 0)
            {
                return false;
            }

            int rootNpcCount = await _npcDbAccess.GetFlexFieldObjectsInRootFolderCount(project.Id, CultureInfo.CurrentUICulture.TwoLetterISOLanguageName);
            if(rootNpcCount > 0)
            {
                return false;
            }

            int rootStyrFolderCount = await _styrFolderDbAccess.GetRootFolderCount(project.Id, CultureInfo.CurrentUICulture.TwoLetterISOLanguageName);
            if(rootStyrFolderCount > 0)
            {
                return false;
            }

            int rootItemCount = await _itemDbAccess.GetFlexFieldObjectsInRootFolderCount(project.Id, CultureInfo.CurrentUICulture.TwoLetterISOLanguageName);
            if(rootItemCount > 0)
            {
                return false;
            }

            int rootEvneFolderCount = await _evneFolderDbAccess.GetRootFolderCount(project.Id, CultureInfo.CurrentUICulture.TwoLetterISOLanguageName);
            if(rootEvneFolderCount > 0)
            {
                return false;
            }

            int rootSkillCount = await _evneSkillDbAccess.GetFlexFieldObjectsInRootFolderCount(project.Id, CultureInfo.CurrentUICulture.TwoLetterISOLanguageName);
            if(rootSkillCount > 0)
            {
                return false;
            }

            int kirjaPageCount = await _kirjaPageDbAccess.SearchPagesCount(project.Id, string.Empty, string.Empty, CultureInfo.CurrentUICulture.TwoLetterISOLanguageName);
            if(kirjaPageCount > 1)
            {
                return false;
            }
            else if(kirjaPageCount == 1)
            {
                KirjaPage defaultPage = await _kirjaPageDbAccess.GetDefaultPageForProject(project.Id);
                if(defaultPage == null)
                {
                    return false;
                }
            }

            int chapterDetailCount = await _chapterDetailDbAccess.GetChapterDetailsByProjectIdCount(project.Id);
            if(chapterDetailCount > 0)
            {
                return false;
            }

            int questCount = await _questDbAccess.GetQuestsByProjectIdCount(project.Id, CultureInfo.CurrentUICulture.TwoLetterISOLanguageName);
            if(questCount > 0)
            {
                return false;
            }

            List<KartaMap> maps = await _mapDbAccess.GetAllProjectMaps(project.Id);
            if(maps != null && maps.Count > 0)
            {
                return false;
            }

            int taskBoardCount = await _taskBoardDbAccess.GetOpenTaskBoardCount(project.Id, CultureInfo.CurrentUICulture.TwoLetterISOLanguageName);
            taskBoardCount += await _taskBoardDbAccess.GetClosedTaskBoardCount(project.Id, CultureInfo.CurrentUICulture.TwoLetterISOLanguageName);
            if(taskBoardCount > 0)
            {
                return false;
            }

            return true;
        }
        
        /// <summary>
        /// Cleans up additional project settings
        /// </summary>
        /// <param name="project">Project to clean up for</param>
        /// <returns>Task</returns>
        private async Task CleanUpAdditionalProjectData(GoNorthProject project)
        {
            await _taskNumberDbAccess.DeleteCounterForProject(project.Id);
            await _userTaskBoardHistoryDbAccess.DeleteUserTaskBoardHistoryForProject(project.Id);
            await _exportTemplateDbAccess.DeleteTemplatesForProject(project.Id);
            await _includeExportTemplateDbAccess.DeleteIncludeTemplatesForProject(project.Id);
            await _exportSettingsDbAccess.DeleteExportSettings(project.Id);
            await _projectConfigDbAccess.DeleteConfigsForProject(project.Id);
            await _kirjaPageDbAccess.DeletePagesForProject(project.Id);
        }


        /// <summary>
        /// Updates a project 
        /// </summary>
        /// <param name="id">Project Id</param>
        /// <param name="project">Update project data</param>
        /// <returns>Result Status Code</returns>
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)] 
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