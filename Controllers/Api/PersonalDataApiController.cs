using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Threading.Tasks;
using GoNorth.Data.Aika;
using GoNorth.Data.Evne;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Karta;
using GoNorth.Data.Kirja;
using GoNorth.Data.Kortisto;
using GoNorth.Data.LockService;
using GoNorth.Data.Project;
using GoNorth.Data.ProjectConfig;
using GoNorth.Data.StateMachines;
using GoNorth.Data.Styr;
using GoNorth.Data.Tale;
using GoNorth.Data.TaskManagement;
using GoNorth.Data.Timeline;
using GoNorth.Data.User;
using GoNorth.Services.Timeline;
using GoNorth.Services.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace GoNorth.Controllers.Api
{
    /// <summary>
    /// Personal data Api controller
    /// </summary>
    [ApiController]
    [Authorize]
    [Route("/api/[controller]/[action]")]
    public class PersonalDataApiController : ControllerBase
    {
        /// <summary>
        /// Trimmed response user
        /// </summary>
        public class TrimmedUser
        {
            /// <summary>
            /// Id
            /// </summary>
            public string Id { get; set; }

            /// <summary>
            /// Username
            /// </summary>
            public string Username { get; set; }

            /// <summary>
            /// Email
            /// </summary>
            public string Email { get; set; }

            /// <summary>
            /// true if the email is confirmed, else false
            /// </summary>
            public bool EmailIsConfirmed { get; set; }

            /// <summary>
            /// Display Name
            /// </summary>
            public string DisplayName { get; set; }

            /// <summary>
            /// Roles
            /// </summary>
            public List<string> Roles { get; set; }
        }

        /// <summary>
        /// Trimmed task
        /// </summary>
        public class TrimmedTask
        {
            /// <summary>
            /// Name
            /// </summary>
            public string Name { get; set; }

            /// <summary>
            /// Description
            /// </summary>
            public string Description { get; set; }

            /// <summary>
            /// true if the trimmed task is a task group, else false
            /// </summary>
            public bool IsTaskGroup { get; set; }
        }

        /// <summary>
        /// Trimmed timeline entries
        /// </summary>
        public class TrimmedTimelineEntry
        {
            /// <summary>
            /// Event
            /// </summary>
            public string Event { get; set; }

            /// <summary>
            /// Date of the entry
            /// </summary>
            public DateTimeOffset Date { get; set; }
        }

        /// <summary>
        /// Modified data
        /// </summary>
        public class TrimmedModifiedData
        {
            /// <summary>
            /// Object type
            /// </summary>
            public string ObjectType { get; set; }

            /// <summary>
            /// Name
            /// </summary>
            public string Name { get; set; }

            /// <summary>
            /// Modified date
            /// </summary>
            public DateTimeOffset ModifiedDate { get; set; }
        }

        /// <summary>
        /// Task Board History of the user
        /// </summary>
        public class TrimmedTaskBoardHistory
        {
            /// <summary>
            /// Project Name
            /// </summary>
            public string Project { get; set; }

            /// <summary>
            /// Board Name
            /// </summary>
            public string BoardName { get; set; }
        }

        /// <summary>
        /// Trimmed Lock Entry
        /// </summary>
        public class TrimmedLockEntry
        {
            /// <summary>
            /// Id of the lock
            /// </summary>
            public string Id { get; set; }

            /// <summary>
            /// Category of the lock
            /// </summary>
            public string Category { get; set; }

            /// <summary>
            /// Resource Id
            /// </summary>
            public string ResourceId { get; set; }

            /// <summary>
            /// Expire Date
            /// </summary>
            public DateTimeOffset ExpireDate { get; set; }
        }

        /// <summary>
        /// Personal data response
        /// </summary>
        public class PersonalDataResponse
        {
            /// <summary>
            /// User
            /// </summary>
            public TrimmedUser User { get; set; }

            /// <summary>
            /// Assigned tasks of the user
            /// </summary>
            public List<TrimmedTask> AssignedTasks { get; set; }

            /// <summary>
            /// Timeline entries
            /// </summary>
            public List<TrimmedTimelineEntry> TimelineEntries { get; set; }

            /// <summary>
            /// Task Board history
            /// </summary>
            public List<TrimmedTaskBoardHistory> TaskBoardHistory { get; set; }

            /// <summary>
            /// Modified data
            /// </summary>
            public List<TrimmedModifiedData> ModifiedData { get; set; }

            /// <summary>
            /// Lock Entries
            /// </summary>
            public List<TrimmedLockEntry> LockEntries { get; set; }

            /// <summary>
            /// Selected project of the user
            /// </summary>
            /// <value></value>
            public UserSelectedProject SelectedProject { get; set; }
        }

        /// <summary>
        /// Quest Db Access
        /// </summary>
        private readonly IAikaQuestDbAccess _questDbAccess;

        /// <summary>
        /// Quest Implementation Snapshot Db Access
        /// </summary>
        private readonly IAikaQuestImplementationSnapshotDbAccess _questImplementationSnapshotDbAccess;

        /// <summary>
        /// Chapter Detail Db Access
        /// </summary>
        private readonly IAikaChapterDetailDbAccess _chapterDetailDbAccess;

        /// <summary>
        /// Chapter Overview Db Access
        /// </summary>
        private readonly IAikaChapterOverviewDbAccess _chapterOverviewDbAccess;

        /// <summary>
        /// Skill Db Access
        /// </summary>
        private readonly IEvneSkillDbAccess _skillDbAccess;

        /// <summary>
        /// Skill Template Db Access
        /// </summary>
        private readonly IEvneSkillTemplateDbAccess _skillTemplateDbAccess;

        /// <summary>
        /// Skill Implementation Snapshot Db Access
        /// </summary>
        private readonly IEvneSkillImplementationSnapshotDbAccess _skillImplementationSnapshotDbAccess;

        /// <summary>
        /// Skill import field values log Db access
        /// </summary>
        private readonly IEvneImportFieldValuesLogDbAccess _skillImportFieldValuesLogDbAccess;

        /// <summary>
        /// Npc Db Access
        /// </summary>
        private readonly IKortistoNpcDbAccess _npcDbAccess;

        /// <summary>
        /// Npc Template Db Access
        /// </summary>
        private readonly IKortistoNpcTemplateDbAccess _npcTemplateDbAccess;

        /// <summary>
        /// Npc Implementation Snapshot Db Access
        /// </summary>
        private readonly IKortistoNpcImplementationSnapshotDbAccess _npcImplementationSnapshotDbAccess;

        /// <summary>
        /// Npc import field values log Db access
        /// </summary>
        private readonly IKortistoImportFieldValuesLogDbAccess _npcImportFieldValuesLogDbAccess;

        /// <summary>
        /// Item Db Access
        /// </summary>
        private readonly IStyrItemDbAccess _itemDbAccess;
        
        /// <summary>
        /// Item Template Db Access
        /// </summary>
        private readonly IStyrItemTemplateDbAccess _itemTemplateDbAccess;

        /// <summary>
        /// Item Implementation Snapshot Db Access
        /// </summary>
        private readonly IStyrItemImplementationSnapshotDbAccess _itemImplementationSnapshotDbAccess;

        /// <summary>
        /// Item import field values log Db access
        /// </summary>
        private readonly IStyrImportFieldValuesLogDbAccess _itemImportFieldValuesLogDbAccess;

        /// <summary>
        /// Export Template Db Access
        /// </summary>
        private readonly IExportTemplateDbAccess _exportTemplateDbAccess;

        /// <summary>
        /// Include export template Db Access
        /// </summary>
        private readonly IIncludeExportTemplateDbAccess _includeExportTemplateDbAccess;

        /// <summary>
        /// Object Export snippet Db Access
        /// </summary>
        private readonly IObjectExportSnippetDbAccess _objectExportSnippetDbAccess;

        /// <summary>
        /// Map Db Access
        /// </summary>
        private readonly IKartaMapDbAccess _mapDbAccess;

        /// <summary>
        /// Page Db Access
        /// </summary>
        private readonly IKirjaPageDbAccess _pageDbAccess;

        /// <summary>
        /// Page Version Db Access
        /// </summary>
        private readonly IKirjaPageVersionDbAccess _pageVersionDbAccess;

        /// <summary>
        /// Page Review Db Access
        /// </summary>
        private readonly IKirjaPageReviewDbAccess _pageReviewDbAccess;

        /// <summary>
        /// Tale Db Access
        /// </summary>
        private readonly ITaleDbAccess _taleDbAccess;

        /// <summary>
        /// Tale Implementation Snapshot Db Access
        /// </summary>
        private readonly ITaleDialogImplementationSnapshotDbAccess _taleImplementationSnapshotDbAccess;

        /// <summary>
        /// State Machine Db Access
        /// </summary>
        private readonly IStateMachineDbAccess _stateMachineDbAccess;

        /// <summary>
        /// State Machine Implementation Snapshot Db Access
        /// </summary>
        private readonly IStateMachineImplementationSnapshotDbAccess _stateMachineSnapsshotDbAccess;

        /// <summary>
        /// Project Config Db Access
        /// </summary>
        private readonly IProjectConfigDbAccess _projectConfigDbAccess;

        /// <summary>
        /// Task Board Db Access
        /// </summary>
        private readonly ITaskBoardDbAccess _taskBoardDbAccess;

        /// <summary>
        /// Task group type Db Access
        /// </summary>
        private readonly ITaskGroupTypeDbAccess _taskGroupTypeDbAccess;

        /// <summary>
        /// Task type Db Access
        /// </summary>
        private readonly ITaskTypeDbAccess _taskTypeDbAccess;

        /// <summary>
        /// User Task Board History Db Access
        /// </summary>
        private readonly IUserTaskBoardHistoryDbAccess _userTaskBoardHistoryDbAccess;

        /// <summary>
        /// Project Db Access
        /// </summary>
        private readonly IProjectDbAccess _projectDbAccess;

        /// <summary>
        /// Timeline Db Access
        /// </summary>
        private readonly ITimelineDbAccess _timelineDbAccess;

        /// <summary>
        /// Lock Db Access
        /// </summary>
        private readonly ILockServiceDbAccess _lockDbAccess;

        /// <summary>
        /// User manager
        /// </summary>
        private readonly UserManager<GoNorthUser> _userManager;

        /// <summary>
        /// Sign In Manager
        /// </summary>
        private readonly SignInManager<GoNorthUser> _signInManager;

        /// <summary>
        /// User Deleter
        /// </summary>
        private readonly IUserDeleter _userDeleter;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="questDbAccess">Quest Db Access</param>
        /// <param name="questImplementationSnapshotDbAccess">Quest Implementation Snapshot Db Access</param>
        /// <param name="chapterDetailDbAccess">Chapter Detail Db Access</param>
        /// <param name="chapterOverviewDbAccess">Chapter Overview Db Access</param>
        /// <param name="skillDbAccess">Skill Db Access</param>
        /// <param name="skillTemplateDbAccess">Skill Template Db Access</param>
        /// <param name="skillImplementationSnapshotDbAccess">Skill Implementation Snapshot Db Access</param>
        /// <param name="skillImportFieldValuesLogDbAccess">Skill import field values log Db access</param>
        /// <param name="npcDbAccess">Npc Db Access</param>
        /// <param name="npcTemplateDbAccess">Npc Template Db Access</param>
        /// <param name="npcImplementationSnapshotDbAccess">Npc Implementation Snapshot Db Access</param>
        /// <param name="npcImportFieldValuesLogDbAccess">Npc import field values log Db access</param>
        /// <param name="itemDbAccess">Item Db Access</param>
        /// <param name="itemTemplateDbAccess">Item Template Db Access</param>
        /// <param name="itemImplementationSnapshotDbAccess">Item Implementation Snapshot Db Access</param>
        /// <param name="itemImportFieldValuesLogDbAccess">Item import field values log Db access</param>
        /// <param name="exportTemplateDbAccess">Export template Db access</param>
        /// <param name="includeExportTemplateDbAccess">Include export template Db Access</param>
        /// <param name="objectExportSnippetDbAccess">Object Export snippet Db Access</param>
        /// <param name="mapDbAccess">Map Db Access</param>
        /// <param name="pageDbAccess">Page Db Access</param>
        /// <param name="pageReviewDbAccess">Page Review Db Access</param>
        /// <param name="pageVersionDbAccess">Page Version Db Access</param>
        /// <param name="taleDbAccess">Tale Db Access</param>
        /// <param name="taleImplementationSnapshotDbAccess">Tale Implementation Snapshot Db Access</param>
        /// <param name="projectConfigDbAccess">Project Config Db Access</param>
        /// <param name="stateMachineDbAccess">State Machine Db Access</param>
        /// <param name="stateMachineSnapsshotDbAccess">State Machine Implementation Snapshot Db Access</param>
        /// <param name="taskBoardDbAccess">Task Bord Db Access</param>
        /// <param name="taskGroupTypeDbAccess">Task Group Type Db Access</param>
        /// <param name="taskTypeDbAccess">Task Type Db Access</param>
        /// <param name="userTaskBoardHistoryDbAccess">User Task Board History Db Access</param>
        /// <param name="projectDbAccess">Project Db Access</param>
        /// <param name="timelineDbAccess">Timeline Db Access</param>
        /// <param name="lockDbAccess">Lock Db Access</param>
        /// <param name="userManager">User manager</param>
        /// <param name="signInManager">Signin Manager</param>
        /// <param name="userDeleter">User Deleter</param>
        public PersonalDataApiController(IAikaQuestDbAccess questDbAccess, IAikaQuestImplementationSnapshotDbAccess questImplementationSnapshotDbAccess, IAikaChapterDetailDbAccess chapterDetailDbAccess, IAikaChapterOverviewDbAccess chapterOverviewDbAccess, IEvneSkillDbAccess skillDbAccess, 
                                         IEvneSkillTemplateDbAccess skillTemplateDbAccess, IEvneSkillImplementationSnapshotDbAccess skillImplementationSnapshotDbAccess, IEvneImportFieldValuesLogDbAccess skillImportFieldValuesLogDbAccess, IKortistoNpcDbAccess npcDbAccess, IKortistoNpcTemplateDbAccess npcTemplateDbAccess, 
                                         IKortistoNpcImplementationSnapshotDbAccess npcImplementationSnapshotDbAccess, IKortistoImportFieldValuesLogDbAccess npcImportFieldValuesLogDbAccess, IStyrItemDbAccess itemDbAccess, IStyrItemTemplateDbAccess itemTemplateDbAccess, 
                                         IStyrItemImplementationSnapshotDbAccess itemImplementationSnapshotDbAccess, IStyrImportFieldValuesLogDbAccess itemImportFieldValuesLogDbAccess, IExportTemplateDbAccess exportTemplateDbAccess, IIncludeExportTemplateDbAccess includeExportTemplateDbAccess, 
                                         IObjectExportSnippetDbAccess objectExportSnippetDbAccess, IKartaMapDbAccess mapDbAccess, IKirjaPageDbAccess pageDbAccess, IKirjaPageVersionDbAccess pageVersionDbAccess, IKirjaPageReviewDbAccess pageReviewDbAccess, ITaleDbAccess taleDbAccess, 
                                         ITaleDialogImplementationSnapshotDbAccess taleImplementationSnapshotDbAccess, IStateMachineDbAccess stateMachineDbAccess, IStateMachineImplementationSnapshotDbAccess stateMachineSnapsshotDbAccess, IProjectConfigDbAccess projectConfigDbAccess, ITaskBoardDbAccess taskBoardDbAccess, 
                                         ITaskGroupTypeDbAccess taskGroupTypeDbAccess, ITaskTypeDbAccess taskTypeDbAccess, IUserTaskBoardHistoryDbAccess userTaskBoardHistoryDbAccess, IProjectDbAccess projectDbAccess, ITimelineDbAccess timelineDbAccess, ILockServiceDbAccess lockDbAccess, UserManager<GoNorthUser> userManager, 
                                         SignInManager<GoNorthUser> signInManager, IUserDeleter userDeleter)
        {
            _questDbAccess = questDbAccess;
            _questImplementationSnapshotDbAccess = questImplementationSnapshotDbAccess;
            _chapterDetailDbAccess = chapterDetailDbAccess;
            _chapterOverviewDbAccess = chapterOverviewDbAccess;
            _skillDbAccess = skillDbAccess;
            _skillTemplateDbAccess = skillTemplateDbAccess;
            _skillImplementationSnapshotDbAccess = skillImplementationSnapshotDbAccess;
            _skillImportFieldValuesLogDbAccess = skillImportFieldValuesLogDbAccess;
            _npcDbAccess = npcDbAccess;
            _npcTemplateDbAccess = npcTemplateDbAccess;
            _npcImplementationSnapshotDbAccess = npcImplementationSnapshotDbAccess;
            _npcImportFieldValuesLogDbAccess = npcImportFieldValuesLogDbAccess;
            _itemDbAccess = itemDbAccess;
            _itemTemplateDbAccess = itemTemplateDbAccess;
            _itemImplementationSnapshotDbAccess = itemImplementationSnapshotDbAccess;
            _itemImportFieldValuesLogDbAccess = itemImportFieldValuesLogDbAccess;
            _exportTemplateDbAccess = exportTemplateDbAccess;
            _includeExportTemplateDbAccess = includeExportTemplateDbAccess;
            _objectExportSnippetDbAccess = objectExportSnippetDbAccess;
            _mapDbAccess = mapDbAccess;
            _pageDbAccess = pageDbAccess;
            _pageVersionDbAccess = pageVersionDbAccess;
            _pageReviewDbAccess = pageReviewDbAccess;
            _taleDbAccess = taleDbAccess;
            _taleImplementationSnapshotDbAccess = taleImplementationSnapshotDbAccess;
            _stateMachineDbAccess = stateMachineDbAccess;
            _stateMachineSnapsshotDbAccess = stateMachineSnapsshotDbAccess;
            _projectConfigDbAccess = projectConfigDbAccess;
            _taskBoardDbAccess = taskBoardDbAccess;
            _taskGroupTypeDbAccess = taskGroupTypeDbAccess;
            _taskTypeDbAccess = taskTypeDbAccess;
            _userTaskBoardHistoryDbAccess = userTaskBoardHistoryDbAccess;
            _projectDbAccess = projectDbAccess;
            _timelineDbAccess = timelineDbAccess;
            _lockDbAccess = lockDbAccess;
            _userManager = userManager;
            _signInManager = signInManager;
            _userDeleter = userDeleter;
        }

        /// <summary>
        /// Downloads the personal data of the current user
        /// </summary>
        /// <returns>Personal Data</returns>
        [ProducesResponseType(StatusCodes.Status200OK)]
        [HttpGet]
        public async Task<IActionResult> DownloadPersonalData()
        {
            PersonalDataResponse response = new PersonalDataResponse();

            GoNorthUser currentUser = await _userManager.GetUserAsync(User);
            response.User = MapUser(currentUser);
            await FillModifiedData(response, currentUser);
            await FillAssignedTasks(response, currentUser);
            await FillTimelineEvents(response, currentUser);
            await FillTaskBoardHistory(response, currentUser);
            await FillLockEntries(response, currentUser);

            JsonSerializerOptions options = new JsonSerializerOptions
            {
                WriteIndented = true,
                Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            };

            MemoryStream returnStream = new MemoryStream();
            StreamWriter writer = new StreamWriter(returnStream);
            string serializedResponse = JsonSerializer.Serialize(response, options);
            await writer.WriteAsync(serializedResponse);
            await writer.FlushAsync();

            returnStream.Seek(0, SeekOrigin.Begin);

            return File(returnStream, "application/json", "UserData.json");
        }

        /// <summary>
        /// Maps a user to a return user
        /// </summary>
        /// <param name="user">User</param>
        /// <returns>Trimmed user</returns>
        private TrimmedUser MapUser(GoNorthUser user)
        {
            TrimmedUser returnUser = new TrimmedUser {
                Id = user.Id,
                Username = user.UserName,
                Email = user.Email,
                EmailIsConfirmed = user.EmailConfirmed,
                DisplayName = user.DisplayName,
                Roles = user.Roles.ToList()
            };

            return returnUser;
        }

        /// <summary>
        /// Fills the modified data for the response
        /// </summary>
        /// <param name="response">Response to send</param>
        /// <param name="currentUser">Current user</param>
        /// <returns>Task</returns>    
        private async Task FillModifiedData(PersonalDataResponse response, GoNorthUser currentUser)
        {
            response.ModifiedData = new List<TrimmedModifiedData>();

            List<AikaQuest> quests = await _questDbAccess.GetQuestsByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(quests.Select(p => new TrimmedModifiedData {
                ObjectType = "Quest",
                Name = p.Name,
                ModifiedDate = p.ModifiedOn
            }));

            List<AikaQuest> questRecycleBin = await _questDbAccess.GetRecycleBinQuestsByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(questRecycleBin.Select(p => new TrimmedModifiedData {
                ObjectType = "QuestRecycleBin",
                Name = p.Name,
                ModifiedDate = p.ModifiedOn
            }));

            List<AikaQuest> questImplementationSnapshots = await _questImplementationSnapshotDbAccess.GetSnapshotsModifiedByUsers(currentUser.Id);
            response.ModifiedData.AddRange(questImplementationSnapshots.Select(p => new TrimmedModifiedData {
                ObjectType = "QuestImplementationSnapshot",
                Name = p.Name,
                ModifiedDate = p.ModifiedOn
            }));

            List<AikaChapterDetail> chapterDetail = await _chapterDetailDbAccess.GetChapterDetailsByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(chapterDetail.Select(p => new TrimmedModifiedData {
                ObjectType = "ChapterDetail",
                Name = p.Name,
                ModifiedDate = p.ModifiedOn
            }));
            
            List<AikaChapterDetail> chapterDetailRecycleBin = await _chapterDetailDbAccess.GetRecycleBinChapterDetailsByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(chapterDetailRecycleBin.Select(p => new TrimmedModifiedData {
                ObjectType = "ChapterDetailRecycleBin",
                Name = p.Name,
                ModifiedDate = p.ModifiedOn
            }));

            List<AikaChapterOverview> chapterOverview = await _chapterOverviewDbAccess.GetChapterOverviewByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(chapterOverview.Select(p => new TrimmedModifiedData {
                ObjectType = "ChapterOverview",
                Name = "ChapterOverview",
                ModifiedDate = p.ModifiedOn
            }));

            List<AikaChapterOverview> chapterOverviewRecycleBin = await _chapterOverviewDbAccess.GetRecycleBinChapterOverviewByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(chapterOverviewRecycleBin.Select(p => new TrimmedModifiedData {
                ObjectType = "ChapterOverviewRecycleBin",
                Name = "ChapterOverview",
                ModifiedDate = p.ModifiedOn
            }));

            List<EvneSkill> skills = await _skillDbAccess.GetFlexFieldObjectsByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(skills.Select(p => new TrimmedModifiedData {
                ObjectType = "Skill",
                Name = p.Name,
                ModifiedDate = p.ModifiedOn
            }));

            List<EvneSkill> skillsRecyleBin = await _skillDbAccess.GetRecycleBinFlexFieldObjectsByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(skillsRecyleBin.Select(p => new TrimmedModifiedData {
                ObjectType = "SkillRecycleBin",
                Name = p.Name,
                ModifiedDate = p.ModifiedOn
            }));

            List<EvneSkill> skillsImplementationSnapshots = await _skillImplementationSnapshotDbAccess.GetSnapshotsModifiedByUsers(currentUser.Id);
            response.ModifiedData.AddRange(skillsImplementationSnapshots.Select(p => new TrimmedModifiedData {
                ObjectType = "SkillImplementationSnapshot",
                Name = p.Name,
                ModifiedDate = p.ModifiedOn
            }));

            List<FlexFieldImportFieldValuesResultLog> skillsFieldValuesLogs = await _skillImportFieldValuesLogDbAccess.GetImportLogsByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(skillsFieldValuesLogs.Select(p => new TrimmedModifiedData {
                ObjectType = "SkillFieldValueImportLog",
                Name = p.FileName,
                ModifiedDate = p.ModifiedOn
            }));

            List<EvneSkill> skillTemplates = await _skillTemplateDbAccess.GetFlexFieldObjectsByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(skillTemplates.Select(p => new TrimmedModifiedData {
                ObjectType = "SkillTemplate",
                Name = p.Name,
                ModifiedDate = p.ModifiedOn
            }));

            List<EvneSkill> skillsTemplateRecyleBin = await _skillTemplateDbAccess.GetRecycleBinFlexFieldObjectsByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(skillsTemplateRecyleBin.Select(p => new TrimmedModifiedData {
                ObjectType = "SkillTemplateRecycleBin",
                Name = p.Name,
                ModifiedDate = p.ModifiedOn
            }));

            List<KortistoNpc> npcs = await _npcDbAccess.GetFlexFieldObjectsByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(npcs.Select(p => new TrimmedModifiedData {
                ObjectType = "Npc",
                Name = p.Name,
                ModifiedDate = p.ModifiedOn
            }));

            List<KortistoNpc> npcsRecycleBin = await _npcDbAccess.GetRecycleBinFlexFieldObjectsByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(npcsRecycleBin.Select(p => new TrimmedModifiedData {
                ObjectType = "NpcRecycleBin",
                Name = p.Name,
                ModifiedDate = p.ModifiedOn
            }));
                        
            List<KortistoNpc> npcImplementationSnapshots = await _npcImplementationSnapshotDbAccess.GetSnapshotsModifiedByUsers(currentUser.Id);
            response.ModifiedData.AddRange(npcImplementationSnapshots.Select(p => new TrimmedModifiedData {
                ObjectType = "NpcImplementationSnapshot",
                Name = p.Name,
                ModifiedDate = p.ModifiedOn
            }));

            List<FlexFieldImportFieldValuesResultLog> npcsFieldValuesLogs = await _npcImportFieldValuesLogDbAccess.GetImportLogsByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(npcsFieldValuesLogs.Select(p => new TrimmedModifiedData {
                ObjectType = "NpcFieldValueImportLog",
                Name = p.FileName,
                ModifiedDate = p.ModifiedOn
            }));
                       
            List<KortistoNpc> npcTemplates = await _npcTemplateDbAccess.GetFlexFieldObjectsByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(npcTemplates.Select(p => new TrimmedModifiedData {
                ObjectType = "NpcTemplate",
                Name = p.Name,
                ModifiedDate = p.ModifiedOn
            }));

            List<KortistoNpc> npcTemplatesRecycleBin = await _npcTemplateDbAccess.GetRecycleBinFlexFieldObjectsByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(npcTemplatesRecycleBin.Select(p => new TrimmedModifiedData {
                ObjectType = "NpcTemplateRecycleBin",
                Name = p.Name,
                ModifiedDate = p.ModifiedOn
            }));

            List<StyrItem> items = await _itemDbAccess.GetFlexFieldObjectsByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(items.Select(p => new TrimmedModifiedData {
                ObjectType = "Item",
                Name = p.Name,
                ModifiedDate = p.ModifiedOn
            }));

            List<StyrItem> itemsRecyleBin = await _itemDbAccess.GetRecycleBinFlexFieldObjectsByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(itemsRecyleBin.Select(p => new TrimmedModifiedData {
                ObjectType = "ItemReycleBin",
                Name = p.Name,
                ModifiedDate = p.ModifiedOn
            }));

            List<StyrItem> itemImplementationSnapshots = await _itemImplementationSnapshotDbAccess.GetSnapshotsModifiedByUsers(currentUser.Id);
            response.ModifiedData.AddRange(itemImplementationSnapshots.Select(p => new TrimmedModifiedData {
                ObjectType = "ItemImplementationSnapshot",
                Name = p.Name,
                ModifiedDate = p.ModifiedOn
            }));
            
            List<FlexFieldImportFieldValuesResultLog> itemsFieldValuesLogs = await _itemImportFieldValuesLogDbAccess.GetImportLogsByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(itemsFieldValuesLogs.Select(p => new TrimmedModifiedData {
                ObjectType = "ItemFieldValueImportLog",
                Name = p.FileName,
                ModifiedDate = p.ModifiedOn
            }));

            List<StyrItem> itemTemplates = await _itemTemplateDbAccess.GetFlexFieldObjectsByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(itemTemplates.Select(p => new TrimmedModifiedData {
                ObjectType = "ItemTemplate",
                Name = p.Name,
                ModifiedDate = p.ModifiedOn
            }));

            List<StyrItem> itemTemplatesRecyleBin = await _itemTemplateDbAccess.GetRecycleBinFlexFieldObjectsByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(itemTemplatesRecyleBin.Select(p => new TrimmedModifiedData {
                ObjectType = "ItemTemplateReycleBin",
                Name = p.Name,
                ModifiedDate = p.ModifiedOn
            }));

            List<ExportTemplate> exportTemplates = await _exportTemplateDbAccess.GetExportTemplatesByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(exportTemplates.Select(p => new TrimmedModifiedData {
                ObjectType = "ExportTemplate",
                Name = "Template " + p.TemplateType.ToString() + " " + p.Category.ToString(),
                ModifiedDate = p.ModifiedOn
            }));

            List<ExportTemplate> exportTemplatesRecycleBin = await _exportTemplateDbAccess.GetRecycleBinExportTemplatesByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(exportTemplatesRecycleBin.Select(p => new TrimmedModifiedData {
                ObjectType = "ExportTemplateRecycleBin",
                Name = "Template " + p.TemplateType.ToString() + " " + p.Category.ToString(),
                ModifiedDate = p.ModifiedOn
            }));


            List<IncludeExportTemplate> includeExportTemplates = await _includeExportTemplateDbAccess.GetIncludeTemplatesByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(includeExportTemplates.Select(p => new TrimmedModifiedData {
                ObjectType = "IncludeExportTemplate",
                Name = p.Name,
                ModifiedDate = p.ModifiedOn
            }));

            List<IncludeExportTemplate> includeExportTemplatesRecycleBin = await _includeExportTemplateDbAccess.GetRecycleBinIncludeTemplatesByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(includeExportTemplatesRecycleBin.Select(p => new TrimmedModifiedData {
                ObjectType = "IncludeExportTemplateRecycleBin",
                Name = p.Name,
                ModifiedDate = p.ModifiedOn
            }));


            List<ObjectExportSnippet> objectExportSnippets = await _objectExportSnippetDbAccess.GetExportSnippetByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(objectExportSnippets.Select(p => new TrimmedModifiedData {
                ObjectType = "ObjectExportSnippet",
                Name = p.SnippetName,
                ModifiedDate = p.ModifiedOn
            }));

            List<KartaMap> maps = await _mapDbAccess.GetMapsByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(maps.Select(p => new TrimmedModifiedData {
                ObjectType = "Map",
                Name = p.Name,
                ModifiedDate = p.ModifiedOn
            }));

            List<KirjaPage> pages = await _pageDbAccess.GetPagesByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(pages.Select(p => new TrimmedModifiedData {
                ObjectType = "WikiPage",
                Name = p.Name,
                ModifiedDate = p.ModifiedOn
            }));

            List<KirjaPageVersion> pageVersions = await _pageVersionDbAccess.GetPageVersionsByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(pageVersions.Select(p => new TrimmedModifiedData {
                ObjectType = "WikiPageVersion",
                Name = string.Format("{0} #{1}", p.Name, p.VersionNumber),
                ModifiedDate = p.ModifiedOn
            }));
            
            List<KirjaPageReview> pageReviews = await _pageReviewDbAccess.GetReviewsByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(pageReviews.Select(p => new TrimmedModifiedData {
                ObjectType = "WikiPageReview",
                Name = p.Name,
                ModifiedDate = p.ModifiedOn
            }));

            List<TaleDialog> dialogs = await _taleDbAccess.GetDialogsByModifiedUser(currentUser.Id);
            Dictionary<string, KortistoNpc> dialogNpcs = (await _npcDbAccess.ResolveFlexFieldObjectNames(dialogs.Select(n => n.RelatedObjectId).ToList())).ToDictionary(n => n.Id);
            foreach(TaleDialog curDialog in dialogs)
            {
                string npcName = "DELETED";
                if(dialogNpcs.ContainsKey(curDialog.RelatedObjectId))
                {
                    npcName = dialogNpcs[curDialog.RelatedObjectId].Name;
                }
                response.ModifiedData.Add(new TrimmedModifiedData {
                    ObjectType = "Dialog",
                    Name = npcName,
                    ModifiedDate = curDialog.ModifiedOn
                });
            }

            List<TaleDialog> dialogsRecyleBin = await _taleDbAccess.GetRecycleBinDialogsByModifiedUser(currentUser.Id);
            Dictionary<string, KortistoNpc> dialogRecyleBinNpcs = (await _npcDbAccess.ResolveRecycleBinFlexFieldObjectNames(dialogsRecyleBin.Select(n => n.RelatedObjectId).ToList())).ToDictionary(n => n.Id);
            foreach(TaleDialog curDialog in dialogsRecyleBin)
            {
                string npcName = "DELETED";
                if(dialogRecyleBinNpcs.ContainsKey(curDialog.RelatedObjectId))
                {
                    npcName = dialogRecyleBinNpcs[curDialog.RelatedObjectId].Name;
                }
                response.ModifiedData.Add(new TrimmedModifiedData {
                    ObjectType = "DialogRecyleBin",
                    Name = npcName,
                    ModifiedDate = curDialog.ModifiedOn
                });
            }

            List<TaleDialog> dialogsSnapshots = await _taleImplementationSnapshotDbAccess.GetSnapshotsModifiedByUsers(currentUser.Id);
            Dictionary<string, KortistoNpc> dialogSnapshotNpcs = (await _npcDbAccess.ResolveFlexFieldObjectNames(dialogsSnapshots.Select(n => n.RelatedObjectId).ToList())).ToDictionary(n => n.Id);
            foreach(TaleDialog curDialogSnapshot in dialogsSnapshots)
            {
                string npcName = "DELETED";
                if(dialogNpcs.ContainsKey(curDialogSnapshot.RelatedObjectId))
                {
                    npcName = dialogNpcs[curDialogSnapshot.RelatedObjectId].Name;
                }
                response.ModifiedData.Add(new TrimmedModifiedData {
                    ObjectType = "DialogSnapshot",
                    Name = npcName,
                    ModifiedDate = curDialogSnapshot.ModifiedOn
                });
            }

            List<StateMachine> stateMachines = await _stateMachineDbAccess.GetStateMachinesByModifiedUser(currentUser.Id);
            Dictionary<string, KortistoNpc> stateMachineNpcs = (await _npcDbAccess.ResolveFlexFieldObjectNames(stateMachines.Select(n => n.RelatedObjectId).ToList())).ToDictionary(n => n.Id);
            foreach(StateMachine curStateMachine in stateMachines)
            {
                string npcName = "DELETED";
                if(stateMachineNpcs.ContainsKey(curStateMachine.RelatedObjectId))
                {
                    npcName = stateMachineNpcs[curStateMachine.RelatedObjectId].Name;
                }
                response.ModifiedData.Add(new TrimmedModifiedData {
                    ObjectType = "StateMachine",
                    Name = npcName,
                    ModifiedDate = curStateMachine.ModifiedOn
                });
            }
            
            List<StateMachine> stateMachineSnapshots = await _stateMachineSnapsshotDbAccess.GetSnapshotsModifiedByUsers(currentUser.Id);
            Dictionary<string, KortistoNpc> stateMachineSnapshotNpcs = (await _npcDbAccess.ResolveFlexFieldObjectNames(stateMachineSnapshots.Select(n => n.RelatedObjectId).ToList())).ToDictionary(n => n.Id);
            foreach(StateMachine curStateMachine in stateMachineSnapshots)
            {
                string npcName = "DELETED";
                if(stateMachineSnapshotNpcs.ContainsKey(curStateMachine.RelatedObjectId))
                {
                    npcName = stateMachineSnapshotNpcs[curStateMachine.RelatedObjectId].Name;
                }
                response.ModifiedData.Add(new TrimmedModifiedData {
                    ObjectType = "StateMachineSnapshot",
                    Name = npcName,
                    ModifiedDate = curStateMachine.ModifiedOn
                });
            }
            

            List<JsonConfigEntry> jsonConfigEntries = await _projectConfigDbAccess.GetJsonConfigEntriesByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(jsonConfigEntries.Select(p => new TrimmedModifiedData {
                ObjectType = "JsonConfig",
                Name = p.Key,
                ModifiedDate = p.ModifiedOn
            }));

            List<MiscProjectConfig> miscConfigEntries = await _projectConfigDbAccess.GetMiscConfigEntriesByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(miscConfigEntries.Select(p => new TrimmedModifiedData {
                ObjectType = "MiscConfig",
                Name = "Miscellaneous Config",
                ModifiedDate = p.ModifiedOn
            }));

            List<TaskBoard> taskBoards = await _taskBoardDbAccess.GetTaskBoardsByModifiedUser(currentUser.Id);
            foreach(TaskBoard curBoard in taskBoards)
            {
                if(curBoard.ModifiedBy == currentUser.Id)
                {
                    response.ModifiedData.Add(new TrimmedModifiedData {
                        ObjectType = "TaskBoard",
                        Name = curBoard.Name,
                        ModifiedDate = curBoard.ModifiedOn
                    });
                }

                List<TaskGroup> modifiedGroups = curBoard.TaskGroups.Where(t => t.ModifiedBy == currentUser.Id).ToList();
                if(modifiedGroups.Count > 0)
                {
                    response.ModifiedData.AddRange(modifiedGroups.Select(p => new TrimmedModifiedData {
                        ObjectType = "TaskGroup",
                        Name = p.Name,
                        ModifiedDate = p.ModifiedOn
                    }));
                }

                List<GoNorthTask> tasks = curBoard.TaskGroups.SelectMany(p => p.Tasks.Where(t => t.ModifiedBy == currentUser.Id)).ToList();
                if(tasks.Count > 0)
                {
                    response.ModifiedData.AddRange(tasks.Select(p => new TrimmedModifiedData {
                        ObjectType = "Task",
                        Name = p.Name,
                        ModifiedDate = p.ModifiedOn
                    }));
                }
            }

            List<GoNorthTaskType> taskGroupTypes = await _taskGroupTypeDbAccess.GetTaskTypesByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(taskGroupTypes.Select(p => new TrimmedModifiedData {
                ObjectType = "TaskGroupType",
                Name = p.Name,
                ModifiedDate = p.ModifiedOn
            }));

            List<GoNorthTaskType> taskTypes = await _taskTypeDbAccess.GetTaskTypesByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(taskTypes.Select(p => new TrimmedModifiedData {
                ObjectType = "TaskType",
                Name = p.Name,
                ModifiedDate = p.ModifiedOn
            }));

            response.SelectedProject = await _projectDbAccess.GetUserSelectedProject(currentUser.Id);
        }

        /// <summary>
        /// Fills the assigned tasks of the user
        /// </summary>
        /// <param name="response">Response to send</param>
        /// <param name="currentUser">Current user</param>
        /// <returns>Task</returns>    
        private async Task FillAssignedTasks(PersonalDataResponse response, GoNorthUser currentUser)
        {
            List<TaskBoard> taskBoards = await _taskBoardDbAccess.GetAllTaskBoardsByAssignedUser(currentUser.Id);
            response.AssignedTasks = taskBoards.SelectMany(t => t.TaskGroups.Where(tg => tg.AssignedTo == currentUser.Id)).Select(t => new TrimmedTask {
                Name = t.Name,
                Description = t.Description,
                IsTaskGroup = true
            }).ToList();
            response.AssignedTasks.AddRange(taskBoards.SelectMany(t => t.TaskGroups.SelectMany(tg => tg.Tasks.Where(ta => ta.AssignedTo == currentUser.Id))).Select(t => new TrimmedTask {
                Name = t.Name,
                Description = t.Description,
                IsTaskGroup = false
            }).ToList());
        }

        /// <summary>
        /// Fills the task board history
        /// </summary>
        /// <param name="response">Response to send</param>
        /// <param name="currentUser">Current user</param>
        /// <returns>Task</returns>    
        private async Task FillTaskBoardHistory(PersonalDataResponse response, GoNorthUser currentUser)
        {
            response.TaskBoardHistory = new List<TrimmedTaskBoardHistory>();

            List<UserTaskBoardHistory> taskBoardHistory = await _userTaskBoardHistoryDbAccess.GetAllOpenedBoardsOfUser(currentUser.Id);
            foreach(UserTaskBoardHistory curTaskBoard in taskBoardHistory)
            {
                TrimmedTaskBoardHistory curTaskBoardHistory = new TrimmedTaskBoardHistory();
                curTaskBoardHistory.BoardName = "DELETED";
                curTaskBoardHistory.Project = "DELETED";

                TaskBoard taskBoard = await _taskBoardDbAccess.GetTaskBoardById(curTaskBoard.LastOpenBoardId);
                if(taskBoard != null)
                {
                    curTaskBoardHistory.BoardName = taskBoard.Name;
                }

                GoNorthProject project = await _projectDbAccess.GetProjectById(curTaskBoard.ProjectId);
                if(project != null)
                {
                    curTaskBoardHistory.Project = project.Name;
                }

                response.TaskBoardHistory.Add(curTaskBoardHistory);
            }
        }

        /// <summary>
        /// Fills the timeline events for a user
        /// </summary>
        /// <param name="response">Response to send</param>
        /// <param name="currentUser">Current user</param>
        /// <returns>Task</returns>    
        private async Task FillTimelineEvents(PersonalDataResponse response, GoNorthUser currentUser)
        {
            List<TimelineEntry> timelineEntries = await _timelineDbAccess.GetTimelineEntriesByUser(currentUser.UserName);
            response.TimelineEntries = timelineEntries.Select(t => new TrimmedTimelineEntry {
                Event = t.Event.ToString(),
                Date = t.Timestamp
            }).ToList();
        }

        /// <summary>
        /// Lock entries
        /// </summary>
        /// <param name="response">Response to send</param>
        /// <param name="currentUser">Current user</param>
        /// <returns>Task</returns>   
        private async Task FillLockEntries(PersonalDataResponse response, GoNorthUser currentUser)
        {
            List<LockEntry> locks = await _lockDbAccess.GetAllLocksOfUser(currentUser.Id);
            response.LockEntries = locks.Select(l => new TrimmedLockEntry {
                Id = l.Id,
                Category = l.Category,
                ResourceId = l.ResourceId,
                ExpireDate = l.ExpireDate
            }).ToList();
        }

        /// <summary>
        /// Deletes the user data
        /// </summary>
        /// <returns>Result</returns>
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [ValidateAntiForgeryToken]
        [HttpPost]
        public async Task<IActionResult> DeleteUserData()
        {
            GoNorthUser currentUser = await _userManager.GetUserAsync(User);

            IdentityResult result = await _userDeleter.DeleteUser(currentUser);
            if(result.Succeeded)
            {
                await _signInManager.SignOutAsync();
                return RedirectToAction("SignedOut", "Account");
            }
            else
            {
                return StatusCode((int)HttpStatusCode.InternalServerError);
            }
        }
    }
}