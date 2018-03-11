using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using GoNorth.Data.Project;
using GoNorth.Data.Timeline;
using GoNorth.Data.User;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;

namespace GoNorth.Services.Timeline
{
    /// <summary>
    /// Service to work with timeline entries
    /// </summary>
    public class TimelineService : ITimelineService
    {
        /// <summary>
        /// Timeline Db Access
        /// </summary>
        private ITimelineDbAccess _timelineDbAccess;

        /// <summary>
        /// Project Db Accesss
        /// </summary>
        private IProjectDbAccess _projectDbAccess;

        /// <summary>
        /// Template Service
        /// </summary>
        private ITimelineTemplateService _templateService;

        /// <summary>
        /// User Manager
        /// </summary>
        private UserManager<GoNorthUser> _userManager;

        /// <summary>
        /// Http Context
        /// </summary>
        private IHttpContextAccessor _httpContext;

        /// <summary>
        /// Entry Role Filters
        /// </summary>
        private Dictionary<TimelineEvent, List<string>> _entryRoleFilter;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="timelineDbAccess">Timeline Db Access</param>
        /// <param name="projectDbAccess">Project Db Access</param>
        /// <param name="templateService">Template Service</param>
        /// <param name="userManager">User Manager</param>
        /// <param name="httpContext">Http Context</param>
        public TimelineService(ITimelineDbAccess timelineDbAccess, IProjectDbAccess projectDbAccess, ITimelineTemplateService templateService, UserManager<GoNorthUser> userManager, IHttpContextAccessor httpContext)
        {
            _timelineDbAccess = timelineDbAccess;
            _projectDbAccess = projectDbAccess;
            _templateService = templateService;
            _userManager = userManager;
            _httpContext = httpContext;

            SetupFilters();
        }

        /// <summary>
        /// Setups the role filters
        /// </summary>
        private void SetupFilters()
        {
            _entryRoleFilter = new Dictionary<TimelineEvent, List<string>>();

            // User
            _entryRoleFilter.Add(TimelineEvent.NewUser, new List<string>() { RoleNames.Administrator });
            _entryRoleFilter.Add(TimelineEvent.UserDeleted, new List<string>() { RoleNames.Administrator });
            _entryRoleFilter.Add(TimelineEvent.UserRolesSet, new List<string>() { RoleNames.Administrator });

            // Kortisto
            _entryRoleFilter.Add(TimelineEvent.KortistoFolderCreated, new List<string>() { RoleNames.Kortisto });
            _entryRoleFilter.Add(TimelineEvent.KortistoFolderDeleted, new List<string>() { RoleNames.Kortisto });
            _entryRoleFilter.Add(TimelineEvent.KortistoFolderUpdated, new List<string>() { RoleNames.Kortisto });

            _entryRoleFilter.Add(TimelineEvent.KortistoNpcTemplateCreated, new List<string>() { RoleNames.Kortisto });
            _entryRoleFilter.Add(TimelineEvent.KortistoNpcTemplateDeleted, new List<string>() { RoleNames.Kortisto });
            _entryRoleFilter.Add(TimelineEvent.KortistoNpcTemplateUpdated, new List<string>() { RoleNames.Kortisto });
            _entryRoleFilter.Add(TimelineEvent.KortistoNpcTemplateImageUpload, new List<string>() { RoleNames.Kortisto });
            _entryRoleFilter.Add(TimelineEvent.KortistoNpcTemplateFieldsDistributed, new List<string>() { RoleNames.Kortisto });

            _entryRoleFilter.Add(TimelineEvent.KortistoNpcCreated, new List<string>() { RoleNames.Kortisto });
            _entryRoleFilter.Add(TimelineEvent.KortistoNpcDeleted, new List<string>() { RoleNames.Kortisto });
            _entryRoleFilter.Add(TimelineEvent.KortistoNpcUpdated, new List<string>() { RoleNames.Kortisto });
            _entryRoleFilter.Add(TimelineEvent.KortistoNpcImageUpload, new List<string>() { RoleNames.Kortisto });

            // Styr
            _entryRoleFilter.Add(TimelineEvent.StyrFolderCreated, new List<string>() { RoleNames.Styr });
            _entryRoleFilter.Add(TimelineEvent.StyrFolderDeleted, new List<string>() { RoleNames.Styr });
            _entryRoleFilter.Add(TimelineEvent.StyrFolderUpdated, new List<string>() { RoleNames.Styr });

            _entryRoleFilter.Add(TimelineEvent.StyrItemTemplateCreated, new List<string>() { RoleNames.Styr });
            _entryRoleFilter.Add(TimelineEvent.StyrItemTemplateDeleted, new List<string>() { RoleNames.Styr });
            _entryRoleFilter.Add(TimelineEvent.StyrItemTemplateUpdated, new List<string>() { RoleNames.Styr });
            _entryRoleFilter.Add(TimelineEvent.StyrItemTemplateImageUpload, new List<string>() { RoleNames.Styr });
            _entryRoleFilter.Add(TimelineEvent.StyrItemTemplateFieldsDistributed, new List<string>() { RoleNames.Styr });

            _entryRoleFilter.Add(TimelineEvent.StyrItemCreated, new List<string>() { RoleNames.Styr });
            _entryRoleFilter.Add(TimelineEvent.StyrItemDeleted, new List<string>() { RoleNames.Styr });
            _entryRoleFilter.Add(TimelineEvent.StyrItemUpdated, new List<string>() { RoleNames.Styr });
            _entryRoleFilter.Add(TimelineEvent.StyrItemImageUpload, new List<string>() { RoleNames.Styr }); 
            
            // Evne
            _entryRoleFilter.Add(TimelineEvent.EvneFolderCreated, new List<string>() { RoleNames.Evne });
            _entryRoleFilter.Add(TimelineEvent.EvneFolderDeleted, new List<string>() { RoleNames.Evne });
            _entryRoleFilter.Add(TimelineEvent.EvneFolderUpdated, new List<string>() { RoleNames.Evne });

            _entryRoleFilter.Add(TimelineEvent.EvneSkillTemplateCreated, new List<string>() { RoleNames.Evne });
            _entryRoleFilter.Add(TimelineEvent.EvneSkillTemplateDeleted, new List<string>() { RoleNames.Evne });
            _entryRoleFilter.Add(TimelineEvent.EvneSkillTemplateUpdated, new List<string>() { RoleNames.Evne });
            _entryRoleFilter.Add(TimelineEvent.EvneSkillTemplateImageUpload, new List<string>() { RoleNames.Evne });
            _entryRoleFilter.Add(TimelineEvent.EvneSkillTemplateFieldsDistributed, new List<string>() { RoleNames.Evne });

            _entryRoleFilter.Add(TimelineEvent.EvneSkillCreated, new List<string>() { RoleNames.Evne });
            _entryRoleFilter.Add(TimelineEvent.EvneSkillDeleted, new List<string>() { RoleNames.Evne });
            _entryRoleFilter.Add(TimelineEvent.EvneSkillUpdated, new List<string>() { RoleNames.Evne });
            _entryRoleFilter.Add(TimelineEvent.EvneSkillImageUpload, new List<string>() { RoleNames.Evne }); 
            
            // Kirja
            _entryRoleFilter.Add(TimelineEvent.KirjaPageCreated, new List<string>() { RoleNames.Kirja });
            _entryRoleFilter.Add(TimelineEvent.KirjaPageDeleted, new List<string>() { RoleNames.Kirja });
            _entryRoleFilter.Add(TimelineEvent.KirjaPageUpdated, new List<string>() { RoleNames.Kirja });
            _entryRoleFilter.Add(TimelineEvent.KirjaAttachmentAdded, new List<string>() { RoleNames.Kirja });
            _entryRoleFilter.Add(TimelineEvent.KirjaAttachmentDeleted, new List<string>() { RoleNames.Kirja });

            // Karta
            _entryRoleFilter.Add(TimelineEvent.KartaMapCreated, new List<string>() { RoleNames.Karta });
            _entryRoleFilter.Add(TimelineEvent.KartaMapDeleted, new List<string>() { RoleNames.Karta });
            _entryRoleFilter.Add(TimelineEvent.KartaMapUpdated, new List<string>() { RoleNames.Karta });
            _entryRoleFilter.Add(TimelineEvent.KartaMapMarkerUpdated, new List<string>() { RoleNames.Karta });
            _entryRoleFilter.Add(TimelineEvent.KartaMapMarkerDeleted, new List<string>() { RoleNames.Karta });
            
            // Tale
            _entryRoleFilter.Add(TimelineEvent.TaleDialogCreated, new List<string>() { RoleNames.Tale });
            _entryRoleFilter.Add(TimelineEvent.TaleDialogUpdated, new List<string>() { RoleNames.Tale });

            // Aika
            _entryRoleFilter.Add(TimelineEvent.AikaChapterOverviewUpdated, new List<string>() { RoleNames.Aika });
            _entryRoleFilter.Add(TimelineEvent.AikaChapterDetailCreated, new List<string>() { RoleNames.Aika });
            _entryRoleFilter.Add(TimelineEvent.AikaChapterDetailUpdated, new List<string>() { RoleNames.Aika });
            _entryRoleFilter.Add(TimelineEvent.AikaChapterDetailDeleted, new List<string>() { RoleNames.Aika });
            _entryRoleFilter.Add(TimelineEvent.AikaQuestCreated, new List<string>() { RoleNames.Aika });
            _entryRoleFilter.Add(TimelineEvent.AikaQuestUpdated, new List<string>() { RoleNames.Aika });
            _entryRoleFilter.Add(TimelineEvent.AikaQuestDeleted, new List<string>() { RoleNames.Aika });

            // Tasks
            _entryRoleFilter.Add(TimelineEvent.TaskBoardCreated, new List<string>() { RoleNames.Task });
            _entryRoleFilter.Add(TimelineEvent.TaskBoardUpdated, new List<string>() { RoleNames.Task });
            _entryRoleFilter.Add(TimelineEvent.TaskBoardClosed, new List<string>() { RoleNames.Task });
            _entryRoleFilter.Add(TimelineEvent.TaskBoardReopened, new List<string>() { RoleNames.Task });
            _entryRoleFilter.Add(TimelineEvent.TaskBoardDeleted, new List<string>() { RoleNames.Task });
            
            _entryRoleFilter.Add(TimelineEvent.TaskGroupCreated, new List<string>() { RoleNames.Task });
            _entryRoleFilter.Add(TimelineEvent.TaskGroupUpdated, new List<string>() { RoleNames.Task });
            _entryRoleFilter.Add(TimelineEvent.TaskGroupDeleted, new List<string>() { RoleNames.Task });

            _entryRoleFilter.Add(TimelineEvent.TaskCreated, new List<string>() { RoleNames.Task });
            _entryRoleFilter.Add(TimelineEvent.TaskUpdated, new List<string>() { RoleNames.Task });
            _entryRoleFilter.Add(TimelineEvent.TaskDeleted, new List<string>() { RoleNames.Task });

            // Implementation Status
            _entryRoleFilter.Add(TimelineEvent.ImplementedNpc, new List<string>() { RoleNames.ImplementationStatusTracker, RoleNames.Kortisto });
            _entryRoleFilter.Add(TimelineEvent.ImplementedItem, new List<string>() { RoleNames.ImplementationStatusTracker, RoleNames.Styr });
            _entryRoleFilter.Add(TimelineEvent.ImplementedSkill, new List<string>() { RoleNames.ImplementationStatusTracker, RoleNames.Evne });
            _entryRoleFilter.Add(TimelineEvent.ImplementedQuest, new List<string>() { RoleNames.ImplementationStatusTracker, RoleNames.Aika });
            _entryRoleFilter.Add(TimelineEvent.ImplementedDialog, new List<string>() { RoleNames.ImplementationStatusTracker, RoleNames.Tale });
            _entryRoleFilter.Add(TimelineEvent.ImplementedMarker, new List<string>() { RoleNames.ImplementationStatusTracker, RoleNames.Karta });
        }

        /// <summary>
        /// Adds a timeline event
        /// </summary>
        /// <param name="timelineEvent">Timeline Event</param>
        /// <param name="additionalValues">Additional Values</param>
        /// <returns>Task</returns>
        public async Task AddTimelineEntry(TimelineEvent timelineEvent, params string[] additionalValues)
        {
            Task<GoNorthUser> currentUserTask = _userManager.GetUserAsync(_httpContext.HttpContext.User);
            Task<GoNorthProject> projectTask = _projectDbAccess.GetDefaultProject();
            Task.WaitAll(currentUserTask, projectTask);
            GoNorthUser currentUser = currentUserTask.Result;
            GoNorthProject project = projectTask.Result;

            TimelineEntry entry = new TimelineEntry();
            entry.ProjectId = project != null ? project.Id : string.Empty;
            entry.Event = timelineEvent;
            entry.Timestamp = DateTimeOffset.UtcNow;
            entry.AdditionalValues = additionalValues;
            entry.Username = currentUser.UserName;
            entry.UserDisplayName = currentUser.DisplayName;

            await _timelineDbAccess.CreateTimelineEntry(entry);
        }

        /// <summary>
        /// Returns the timeline entries for a paged view
        /// </summary>
        /// <param name="start">Start for the page</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Query result</returns>
        public async Task<TimelineEntriesQueryResult> GetTimelineEntriesPaged(int start, int pageSize)
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();
            string projectId = project != null ? project.Id : string.Empty;

            Task<GoNorthUser> currentUserTask = _userManager.GetUserAsync(_httpContext.HttpContext.User);
            Task<int> totalCountTask = _timelineDbAccess.GetTimelineEntriesCount(projectId);
            Task.WaitAll(currentUserTask, totalCountTask);
            GoNorthUser currentUser = currentUserTask.Result;
            int totalCount = totalCountTask.Result;

            TimelineEntriesQueryResult result = new TimelineEntriesQueryResult();
            result.Entries = new List<FormattedTimelineEntry>();
            result.HasMore = false;
            do
            {
                TimelinePagedEntries pagedEntries = await _timelineDbAccess.GetTimelineEntriesPaged(projectId, start, pageSize);
                pagedEntries.Entries = pagedEntries.Entries.Where(e => FilterEntry(e, currentUser.Roles)).ToList();

                if(result.Entries.Count < pageSize)
                {
                    result.Entries.AddRange(pagedEntries.Entries.Take(pageSize - result.Entries.Count).Select(e => _templateService.FormatTimelineEntry(e)));
                }
                else if(pagedEntries.Entries.Count > 0)
                {
                    result.ContinueStart = start;
                    result.HasMore = true;
                    break;
                }

                start += pageSize;
            }
            while(start + pageSize <= totalCount);            

            return result;
        }

        /// <summary>
        /// Filters an entry
        /// </summary>
        /// <param name="entry">Entry</param>
        /// <param name="roles">Roles</param>
        /// <returns>true if the role is valid, false to filter it</returns>
        private bool FilterEntry(TimelineEntry entry, IList<string> roles)
        {
            if(!_entryRoleFilter.ContainsKey(entry.Event))
            {
                return true;
            }

            return _entryRoleFilter[entry.Event].All(s => roles.Contains(s));
        }
    }
}
