using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using GoNorth.Data.Aika;
using GoNorth.Data.Evne;
using GoNorth.Data.Exporting;
using GoNorth.Data.Karta;
using GoNorth.Data.Kirja;
using GoNorth.Data.Kortisto;
using GoNorth.Data.LockService;
using GoNorth.Data.Project;
using GoNorth.Data.Styr;
using GoNorth.Data.Tale;
using GoNorth.Data.TaskManagement;
using GoNorth.Data.Timeline;
using GoNorth.Data.User;
using GoNorth.Services.Timeline;
using GoNorth.Services.User;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace GoNorth.Controllers.Api
{
    /// <summary>
    /// Personal data Api controller
    /// </summary>
    [Authorize]
    [Route("/api/[controller]/[action]")]
    public class PersonalDataApiController : Controller
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
        }

        /// <summary>
        /// Quest Db Access
        /// </summary>
        private readonly IAikaQuestDbAccess _questDbAccess;

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
        /// Npc Db Access
        /// </summary>
        private readonly IKortistoNpcDbAccess _npcDbAccess;

        /// <summary>
        /// Item Db Access
        /// </summary>
        private readonly IStyrItemDbAccess _itemDbAccess;

        /// <summary>
        /// Export Template Db Access
        /// </summary>
        private readonly IExportTemplateDbAccess _exportTemplateDbAccess;

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
        /// Tale Db Access
        /// </summary>
        private readonly ITaleDbAccess _taleDbAccess;

        /// <summary>
        /// Tale Config Db Access
        /// </summary>
        private readonly ITaleConfigDbAccess _taleConfigDbAccess;

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
        /// <param name="chapterDetailDbAccess">Chapter Detail Db Access</param>
        /// <param name="chapterOverviewDbAccess">Chapter Overview Db Access</param>
        /// <param name="skillDbAccess">Skill Db Access</param>
        /// <param name="npcDbAccess">Npc Db Access</param>
        /// <param name="itemDbAccess">Item Db Access</param>
        /// <param name="exportTemplateDbAccess">Export template Db access</param>
        /// <param name="mapDbAccess">Map Db Access</param>
        /// <param name="pageDbAccess">Page Db Access</param>
        /// <param name="pageVersionDbAccess">Page Version Db Access</param>
        /// <param name="taleConfigDbAccess">Tale Config Db Access</param>
        /// <param name="taleDbAccess">Tale Db Access</param>
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
        public PersonalDataApiController(IAikaQuestDbAccess questDbAccess, IAikaChapterDetailDbAccess chapterDetailDbAccess, IAikaChapterOverviewDbAccess chapterOverviewDbAccess, IEvneSkillDbAccess skillDbAccess, IKortistoNpcDbAccess npcDbAccess, 
                                         IStyrItemDbAccess itemDbAccess, IExportTemplateDbAccess exportTemplateDbAccess, IKartaMapDbAccess mapDbAccess, IKirjaPageDbAccess pageDbAccess, IKirjaPageVersionDbAccess pageVersionDbAccess, ITaleDbAccess taleDbAccess, 
                                         ITaleConfigDbAccess taleConfigDbAccess, ITaskBoardDbAccess taskBoardDbAccess, ITaskGroupTypeDbAccess taskGroupTypeDbAccess, ITaskTypeDbAccess taskTypeDbAccess, IUserTaskBoardHistoryDbAccess userTaskBoardHistoryDbAccess, 
                                         IProjectDbAccess projectDbAccess, ITimelineDbAccess timelineDbAccess, ILockServiceDbAccess lockDbAccess, UserManager<GoNorthUser> userManager, SignInManager<GoNorthUser> signInManager, IUserDeleter userDeleter)
        {
            _questDbAccess = questDbAccess;
            _chapterDetailDbAccess = chapterDetailDbAccess;
            _chapterOverviewDbAccess = chapterOverviewDbAccess;
            _skillDbAccess = skillDbAccess;
            _npcDbAccess = npcDbAccess;
            _itemDbAccess = itemDbAccess;
            _exportTemplateDbAccess = exportTemplateDbAccess;
            _mapDbAccess = mapDbAccess;
            _pageDbAccess = pageDbAccess;
            _pageVersionDbAccess = pageVersionDbAccess;
            _taleDbAccess = taleDbAccess;
            _taleConfigDbAccess = taleConfigDbAccess;
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

            MemoryStream returnStream = new MemoryStream();
            StreamWriter writer = new StreamWriter(returnStream);
            string serializedResponse = JsonConvert.SerializeObject(response);
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

            List<AikaChapterDetail> chapterDetail = await _chapterDetailDbAccess.GetChapterDetailsByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(chapterDetail.Select(p => new TrimmedModifiedData {
                ObjectType = "ChapterDetail",
                Name = p.Name,
                ModifiedDate = p.ModifiedOn
            }));

            List<AikaChapterOverview> chapterOverview = await _chapterOverviewDbAccess.GetChapterOverviewByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(chapterOverview.Select(p => new TrimmedModifiedData {
                ObjectType = "ChapterOverview",
                Name = "ChapterOverview",
                ModifiedDate = p.ModifiedOn
            }));

            List<EvneSkill> skills = await _skillDbAccess.GetFlexFieldObjectsByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(skills.Select(p => new TrimmedModifiedData {
                ObjectType = "Skill",
                Name = p.Name,
                ModifiedDate = p.ModifiedOn
            }));

            List<KortistoNpc> npcs = await _npcDbAccess.GetFlexFieldObjectsByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(npcs.Select(p => new TrimmedModifiedData {
                ObjectType = "Npc",
                Name = p.Name,
                ModifiedDate = p.ModifiedOn
            }));

            List<StyrItem> items = await _itemDbAccess.GetFlexFieldObjectsByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(items.Select(p => new TrimmedModifiedData {
                ObjectType = "Item",
                Name = p.Name,
                ModifiedDate = p.ModifiedOn
            }));

            List<ExportTemplate> exportTemplates = await _exportTemplateDbAccess.GetExportTemplatesByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(exportTemplates.Select(p => new TrimmedModifiedData {
                ObjectType = "ExportTemplate",
                Name = "Template " + p.TemplateType.ToString() + " " + p.Category.ToString(),
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

            List<TaleConfigEntry> taleConfigEntries = await _taleConfigDbAccess.GetConfigEntriesByModifiedUser(currentUser.Id);
            response.ModifiedData.AddRange(taleConfigEntries.Select(p => new TrimmedModifiedData {
                ObjectType = "TaleConfig",
                Name = p.Key,
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