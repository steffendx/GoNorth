using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Aika;
using GoNorth.Data.Evne;
using GoNorth.Data.Exporting;
using GoNorth.Data.Karta;
using GoNorth.Data.Kirja;
using GoNorth.Data.Kortisto;
using GoNorth.Data.LockService;
using GoNorth.Data.ProjectConfig;
using GoNorth.Data.Styr;
using GoNorth.Data.Tale;
using GoNorth.Data.TaskManagement;
using GoNorth.Data.Timeline;
using GoNorth.Data.User;
using Microsoft.AspNetCore.Identity;

namespace GoNorth.Services.User
{
    /// <summary>
    /// Class for User Deleter service
    /// </summary>
    public class UserDeleter : IUserDeleter
    {
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
        /// Export Template Db Access
        /// </summary>
        private readonly IExportTemplateDbAccess _exportTemplateDbAccess;

        /// <summary>
        /// Object Export Snippet Db Access
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
        /// Tale Db Access
        /// </summary>
        private readonly ITaleDbAccess _taleDbAccess;

        /// <summary>
        /// Tale Implementation Snapshot Db Access
        /// </summary>
        private readonly ITaleDialogImplementationSnapshotDbAccess _taleImplementationSnapshotDbAccess;

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
        /// Lock Db Service
        /// </summary>
        private readonly ILockServiceDbAccess _lockDbService;

        /// <summary>
        /// Timeline Db Access
        /// </summary>
        private readonly ITimelineDbAccess _timelineDbAccess;

        /// <summary>
        /// User Task Board History Db Access
        /// </summary>
        private readonly IUserTaskBoardHistoryDbAccess _userTaskBoardHistoryDbAccess;

        /// <summary>
        /// User manager
        /// </summary>
        private readonly UserManager<GoNorthUser> _userManager;

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
        /// <param name="npcDbAccess">Npc Db Access</param>
        /// <param name="npcTemplateDbAccess">Npc Template Db Access</param>
        /// <param name="npcImplementationSnapshotDbAccess">Npc Implementation Snapshot Db Access</param>
        /// <param name="itemDbAccess">Item Db Access</param>
        /// <param name="itemTemplateDbAccess">Item Template Db Access</param>
        /// <param name="itemImplementationSnapshotDbAccess">Item Implementation Snapshot Db Access</param>
        /// <param name="exportTemplateDbAccess">Export template Db access</param>
        /// <param name="objectExportSnippetDbAccess">Object Export snippet Db Access</param>
        /// <param name="mapDbAccess">Map Db Access</param>
        /// <param name="pageDbAccess">Page Db Access</param>
        /// <param name="pageVersionDbAccess">Page Version Db Access</param>
        /// <param name="taleDbAccess">Tale Db Access</param>
        /// <param name="taleImplementationSnapshotDbAccess">Tale Implementation Snapshot Db Access</param>
        /// <param name="projectConfigDbAccess">Project Config Db Access</param>
        /// <param name="taskBoardDbAccess">Task Bord Db Access</param>
        /// <param name="taskGroupTypeDbAccess">Task Group Type Db Access</param>
        /// <param name="taskTypeDbAccess">Task Type Db Access</param>
        /// <param name="userTaskBoardHistoryDbAccess">User Task Board History</param>
        /// <param name="lockDbService">Lock Db Service</param>
        /// <param name="timelineDbAccess">Timeline Db Access</param>
        /// <param name="userManager">User manager</param>
        public UserDeleter(IAikaQuestDbAccess questDbAccess, IAikaQuestImplementationSnapshotDbAccess questImplementationSnapshotDbAccess, IAikaChapterDetailDbAccess chapterDetailDbAccess, IAikaChapterOverviewDbAccess chapterOverviewDbAccess, IEvneSkillDbAccess skillDbAccess, 
                           IEvneSkillTemplateDbAccess skillTemplateDbAccess, IEvneSkillImplementationSnapshotDbAccess skillImplementationSnapshotDbAccess, IKortistoNpcDbAccess npcDbAccess, IKortistoNpcTemplateDbAccess npcTemplateDbAccess, IKortistoNpcImplementationSnapshotDbAccess npcImplementationSnapshotDbAccess, 
                           IStyrItemDbAccess itemDbAccess, IStyrItemTemplateDbAccess itemTemplateDbAccess, IStyrItemImplementationSnapshotDbAccess itemImplementationSnapshotDbAccess, IExportTemplateDbAccess exportTemplateDbAccess, IObjectExportSnippetDbAccess objectExportSnippetDbAccess, 
                           IKartaMapDbAccess mapDbAccess, IKirjaPageDbAccess pageDbAccess, IKirjaPageVersionDbAccess pageVersionDbAccess, ITaleDbAccess taleDbAccess, ITaleDialogImplementationSnapshotDbAccess taleImplementationSnapshotDbAccess, IProjectConfigDbAccess projectConfigDbAccess, 
                           ITaskBoardDbAccess taskBoardDbAccess, ITaskGroupTypeDbAccess taskGroupTypeDbAccess, ITaskTypeDbAccess taskTypeDbAccess, IUserTaskBoardHistoryDbAccess userTaskBoardHistoryDbAccess, ILockServiceDbAccess lockDbService, ITimelineDbAccess timelineDbAccess, 
                           UserManager<GoNorthUser> userManager)
        {
            _questDbAccess = questDbAccess;
            _questImplementationSnapshotDbAccess = questImplementationSnapshotDbAccess;
            _chapterDetailDbAccess = chapterDetailDbAccess;
            _chapterOverviewDbAccess = chapterOverviewDbAccess;
            _skillDbAccess = skillDbAccess;
            _skillTemplateDbAccess = skillTemplateDbAccess;
            _skillImplementationSnapshotDbAccess = skillImplementationSnapshotDbAccess;
            _npcDbAccess = npcDbAccess;
            _npcTemplateDbAccess = npcTemplateDbAccess;
            _npcImplementationSnapshotDbAccess = npcImplementationSnapshotDbAccess;
            _itemDbAccess = itemDbAccess;
            _itemTemplateDbAccess = itemTemplateDbAccess;
            _itemImplementationSnapshotDbAccess = itemImplementationSnapshotDbAccess;
            _exportTemplateDbAccess = exportTemplateDbAccess;
            _objectExportSnippetDbAccess = objectExportSnippetDbAccess;
            _mapDbAccess = mapDbAccess;
            _pageDbAccess = pageDbAccess;
            _pageVersionDbAccess = pageVersionDbAccess;
            _taleDbAccess = taleDbAccess;
            _taleImplementationSnapshotDbAccess = taleImplementationSnapshotDbAccess;
            _projectConfigDbAccess = projectConfigDbAccess;
            _taskBoardDbAccess = taskBoardDbAccess;
            _taskGroupTypeDbAccess = taskGroupTypeDbAccess;
            _taskTypeDbAccess = taskTypeDbAccess;
            _userTaskBoardHistoryDbAccess = userTaskBoardHistoryDbAccess;
            _lockDbService = lockDbService;
            _timelineDbAccess = timelineDbAccess;
            _userManager = userManager;
        }

        /// <summary>
        /// Deletes a user and all associated data
        /// </summary>
        /// <param name="user">User</param>
        /// <returns>Deletion result</returns>
        public async Task<IdentityResult> DeleteUser(GoNorthUser user)
        {
            await DeleteModifiedData(user);
            await ResetAssignedTasks(user);
            await DeleteUserTaskBoardHistory(user);
            await DeleteTimelineEvents(user);
            await DeleteLocksOfUser(user);

            IdentityResult result = await _userManager.DeleteAsync(user);
            return result;
        }

        /// <summary>
        /// Deletes the modified data for the user
        /// </summary>
        /// <param name="user">User</param>
        /// <returns>Task</returns>
        private async Task DeleteModifiedData(GoNorthUser user)
        {
            List<AikaQuest> quests = await _questDbAccess.GetQuestsByModifiedUser(user.Id);
            foreach(AikaQuest curQuest in quests)
            {
                curQuest.ModifiedBy = Guid.Empty.ToString();
                curQuest.ModifiedOn = DateTimeOffset.UtcNow;
                await _questDbAccess.UpdateQuest(curQuest);
            }

            await _questDbAccess.ResetRecycleBinQuestByModifiedUser(user.Id);

            await _questImplementationSnapshotDbAccess.ResetSnapshotsByModifiedUser(user.Id);

            List<AikaChapterDetail> chapterDetail = await _chapterDetailDbAccess.GetChapterDetailsByModifiedUser(user.Id);
            foreach(AikaChapterDetail curChapterDetail in chapterDetail)
            {
                curChapterDetail.ModifiedBy = Guid.Empty.ToString();
                curChapterDetail.ModifiedOn = DateTimeOffset.UtcNow;
                await _chapterDetailDbAccess.UpdateChapterDetail(curChapterDetail);
            }

            await _chapterDetailDbAccess.ResetRecycleBinChapterDetailsByModifiedUser(user.Id);

            List<AikaChapterOverview> chapterOverview = await _chapterOverviewDbAccess.GetChapterOverviewByModifiedUser(user.Id);
            foreach(AikaChapterOverview curOverview in chapterOverview)
            {
                curOverview.ModifiedBy = Guid.Empty.ToString();
                curOverview.ModifiedOn = DateTimeOffset.UtcNow;
                await _chapterOverviewDbAccess.UpdateChapterOverview(curOverview);
            }

            await _chapterOverviewDbAccess.ResetRecycleBinChapterOverviewByModifiedUser(user.Id);

            List<EvneSkill> skills = await _skillDbAccess.GetFlexFieldObjectsByModifiedUser(user.Id);
            foreach(EvneSkill curSkill in skills)
            {
                curSkill.ModifiedBy = Guid.Empty.ToString();
                curSkill.ModifiedOn = DateTimeOffset.UtcNow;
                await _skillDbAccess.UpdateFlexFieldObject(curSkill);
            }

            await _skillDbAccess.ResetRecycleBinFlexFieldObjectsByModifiedUser(user.Id);

            await _skillImplementationSnapshotDbAccess.ResetSnapshotsByModifiedUser(user.Id);

            List<EvneSkill> skillTemplates = await _skillTemplateDbAccess.GetFlexFieldObjectsByModifiedUser(user.Id);
            foreach(EvneSkill curSkill in skillTemplates)
            {
                curSkill.ModifiedBy = Guid.Empty.ToString();
                curSkill.ModifiedOn = DateTimeOffset.UtcNow;
                await _skillTemplateDbAccess.UpdateFlexFieldObject(curSkill);
            }

            await _skillTemplateDbAccess.ResetRecycleBinFlexFieldObjectsByModifiedUser(user.Id);

            List<KortistoNpc> npcs = await _npcDbAccess.GetFlexFieldObjectsByModifiedUser(user.Id);
            foreach(KortistoNpc curNpc in npcs)
            {
                curNpc.ModifiedBy = Guid.Empty.ToString();
                curNpc.ModifiedOn = DateTimeOffset.UtcNow;
                await _npcDbAccess.UpdateFlexFieldObject(curNpc);
            }
            
            await _npcDbAccess.ResetRecycleBinFlexFieldObjectsByModifiedUser(user.Id);

            await _npcImplementationSnapshotDbAccess.ResetSnapshotsByModifiedUser(user.Id);
            
            List<KortistoNpc> npcTemplates = await _npcTemplateDbAccess.GetFlexFieldObjectsByModifiedUser(user.Id);
            foreach(KortistoNpc curNpc in npcTemplates)
            {
                curNpc.ModifiedBy = Guid.Empty.ToString();
                curNpc.ModifiedOn = DateTimeOffset.UtcNow;
                await _npcTemplateDbAccess.UpdateFlexFieldObject(curNpc);
            }
            
            await _npcTemplateDbAccess.ResetRecycleBinFlexFieldObjectsByModifiedUser(user.Id);

            List<StyrItem> items = await _itemDbAccess.GetFlexFieldObjectsByModifiedUser(user.Id);
            foreach(StyrItem curItem in items)
            {
                curItem.ModifiedBy = Guid.Empty.ToString();
                curItem.ModifiedOn = DateTimeOffset.UtcNow;
                await _itemDbAccess.UpdateFlexFieldObject(curItem);
            }

            await _itemDbAccess.ResetRecycleBinFlexFieldObjectsByModifiedUser(user.Id);

            await _itemImplementationSnapshotDbAccess.ResetSnapshotsByModifiedUser(user.Id);

            List<StyrItem> itemTemplates = await _itemTemplateDbAccess.GetFlexFieldObjectsByModifiedUser(user.Id);
            foreach(StyrItem curItem in itemTemplates)
            {
                curItem.ModifiedBy = Guid.Empty.ToString();
                curItem.ModifiedOn = DateTimeOffset.UtcNow;
                await _itemTemplateDbAccess.UpdateFlexFieldObject(curItem);
            }

            await _itemTemplateDbAccess.ResetRecycleBinFlexFieldObjectsByModifiedUser(user.Id);

            List<ExportTemplate> exportTemplates = await _exportTemplateDbAccess.GetExportTemplatesByModifiedUser(user.Id);
            foreach(ExportTemplate curTemplate in exportTemplates)
            {
                curTemplate.ModifiedBy = Guid.Empty.ToString();
                curTemplate.ModifiedOn = DateTimeOffset.UtcNow;
                await _exportTemplateDbAccess.UpdateTemplate(curTemplate);
            }

            await _exportTemplateDbAccess.ResetRecycleBinExportTemplatesByModifiedUser(user.Id);
            
            List<ObjectExportSnippet> objectExportSnippets = await _objectExportSnippetDbAccess.GetExportSnippetByModifiedUser(user.Id);
            foreach(ObjectExportSnippet curExportSnippet in objectExportSnippets)
            {
                curExportSnippet.ModifiedBy = Guid.Empty.ToString();
                curExportSnippet.ModifiedOn = DateTimeOffset.UtcNow;
                await _objectExportSnippetDbAccess.UpdateExportSnippet(curExportSnippet);
            }

            List<KartaMap> maps = await _mapDbAccess.GetMapsByModifiedUser(user.Id);
            foreach(KartaMap curMap in maps)
            {
                curMap.ModifiedBy = Guid.Empty.ToString();
                curMap.ModifiedOn = DateTimeOffset.UtcNow;
                await _mapDbAccess.UpdateMap(curMap);
            }

            List<KirjaPage> pages = await _pageDbAccess.GetPagesByModifiedUser(user.Id);
            foreach(KirjaPage curPage in pages)
            {
                curPage.ModifiedBy = Guid.Empty.ToString();
                curPage.ModifiedOn = DateTimeOffset.UtcNow;
                await _pageDbAccess.UpdatePage(curPage);
            }

            List<KirjaPageVersion> pageVersions = await _pageVersionDbAccess.GetPageVersionsByModifiedUser(user.Id);
            foreach(KirjaPageVersion curVersion in pageVersions)
            {
                curVersion.ModifiedBy = Guid.Empty.ToString();
                curVersion.ModifiedOn = DateTimeOffset.UtcNow;
                await _pageVersionDbAccess.UpdatePageVersion(curVersion);
            }

            List<TaleDialog> dialogs = await _taleDbAccess.GetDialogsByModifiedUser(user.Id);
            foreach(TaleDialog curDialog in dialogs)
            {
                curDialog.ModifiedBy = Guid.Empty.ToString();
                curDialog.ModifiedOn = DateTimeOffset.UtcNow;
                await _taleDbAccess.UpdateDialog(curDialog);
            }

            await _taleDbAccess.ResetRecycleBinFlexFieldObjectsByModifiedUser(user.Id);

            await _taleImplementationSnapshotDbAccess.ResetSnapshotsByModifiedUser(user.Id);

            List<JsonConfigEntry> jsonConfigEntries = await _projectConfigDbAccess.GetJsonConfigEntriesByModifiedUser(user.Id);
            foreach(JsonConfigEntry curConfig in jsonConfigEntries)
            {
                curConfig.ModifiedBy = Guid.Empty.ToString();
                curConfig.ModifiedOn = DateTimeOffset.UtcNow;
                await _projectConfigDbAccess.UpdateJsonConfig(curConfig);
            }

            List<MiscProjectConfig> miscConfigEntries = await _projectConfigDbAccess.GetMiscConfigEntriesByModifiedUser(user.Id);
            foreach(MiscProjectConfig curMiscConfig in miscConfigEntries)
            {
                curMiscConfig.ModifiedBy = Guid.Empty.ToString();
                curMiscConfig.ModifiedOn = DateTimeOffset.UtcNow;
                await _projectConfigDbAccess.UpdateMiscConfig(curMiscConfig);
            }

            List<TaskBoard> taskBoards = await _taskBoardDbAccess.GetTaskBoardsByModifiedUser(user.Id);
            foreach(TaskBoard curBoard in taskBoards)
            {
                if(curBoard.ModifiedBy == user.Id)
                {
                    curBoard.ModifiedBy = Guid.Empty.ToString();
                    curBoard.ModifiedOn = DateTimeOffset.UtcNow;
                }

                List<TaskGroup> modifiedGroups = curBoard.TaskGroups.Where(t => t.ModifiedBy == user.Id).ToList();
                foreach(TaskGroup curTaskGroup in modifiedGroups)
                {
                    curTaskGroup.ModifiedBy = Guid.Empty.ToString();
                    curTaskGroup.ModifiedOn = DateTimeOffset.UtcNow;
                }

                List<GoNorthTask> tasks = curBoard.TaskGroups.SelectMany(p => p.Tasks.Where(t => t.ModifiedBy == user.Id)).ToList();
                if(tasks.Count > 0)
                {
                    foreach(GoNorthTask curTask in tasks)
                    {
                        curTask.ModifiedBy = Guid.Empty.ToString();
                        curTask.ModifiedOn = DateTimeOffset.UtcNow;
                    }
                }

                await _taskBoardDbAccess.UpdateTaskBoard(curBoard);
            }

            List<GoNorthTaskType> taskGroupTypes = await _taskGroupTypeDbAccess.GetTaskTypesByModifiedUser(user.Id);
            foreach(GoNorthTaskType curType in taskGroupTypes)
            {
                curType.ModifiedBy = Guid.Empty.ToString();
                curType.ModifiedOn = DateTimeOffset.UtcNow;
                await _taskGroupTypeDbAccess.UpdateTaskType(curType);
            }

            List<GoNorthTaskType> taskTypes = await _taskTypeDbAccess.GetTaskTypesByModifiedUser(user.Id);
            foreach(GoNorthTaskType curType in taskTypes)
            {
                curType.ModifiedBy = Guid.Empty.ToString();
                curType.ModifiedOn = DateTimeOffset.UtcNow;
                await _taskTypeDbAccess.UpdateTaskType(curType);
            }
        }
        
        /// <summary>
        /// Resets the assigned tasks for a user
        /// </summary>
        /// <param name="user">User</param>
        /// <returns>Task</returns>
        private async Task ResetAssignedTasks(GoNorthUser user)
        {
            List<TaskBoard> taskBoards = await _taskBoardDbAccess.GetAllTaskBoardsByAssignedUser(user.Id);
            foreach(TaskBoard curBoard in taskBoards)
            {
                bool changedBoard = false;
                foreach(TaskGroup curTaskGroup in curBoard.TaskGroups)
                {
                    if(curTaskGroup.AssignedTo == user.Id)
                    {
                        curTaskGroup.AssignedTo = null;
                        changedBoard = true;
                    }

                    foreach(GoNorthTask curTask in curTaskGroup.Tasks)
                    {
                        if(curTask.AssignedTo == user.Id)
                        {
                            curTask.AssignedTo = null;
                            changedBoard = true;
                        }
                    }
                }

                if(changedBoard)
                {
                    await _taskBoardDbAccess.UpdateTaskBoard(curBoard);
                }
            }
        }
        
        /// <summary>
        /// Deletes the user task board history
        /// </summary>
        /// <param name="user">User</param>
        /// <returns>Task</returns>
        private async Task DeleteUserTaskBoardHistory(GoNorthUser user)
        {
            await _userTaskBoardHistoryDbAccess.DeleteUserTaskBoardHistoryForUser(user.Id);
        }

        /// <summary>
        /// Deletes the timeline events of a user
        /// </summary>
        /// <param name="user">User</param>
        /// <returns>Task</returns>
        private async Task DeleteTimelineEvents(GoNorthUser user)
        {
            await _timelineDbAccess.DeleteTimelineEntriesOfUser(user.UserName);
        }
        
        /// <summary>
        /// Deletes all locks of a user
        /// </summary>
        /// <param name="user">User</param>
        /// <returns>Task</returns>
        private async Task DeleteLocksOfUser(GoNorthUser user)
        {
            await _lockDbService.DeleteAllLocksOfUser(user.Id);
        }

    }
}
