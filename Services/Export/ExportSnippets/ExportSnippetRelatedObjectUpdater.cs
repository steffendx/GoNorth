using System;
using System.Threading.Tasks;
using GoNorth.Data.Evne;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Styr;
using GoNorth.Services.ImplementationStatusCompare;
using GoNorth.Services.Timeline;

namespace GoNorth.Services.Export.ExportSnippets
{
    /// <summary>
    /// Interface for Services that update the related object of an export snippet
    /// </summary>
    public class ExportSnippetRelatedObjectUpdater : IExportSnippetRelatedObjectUpdater
    {
        /// <summary>
        /// Npc Db Access
        /// </summary>
        private readonly IKortistoNpcDbAccess _npcDbAccess; 
        
        /// <summary>
        /// Item Db Access
        /// </summary>
        private readonly IStyrItemDbAccess _itemDbAccess;
        
        /// <summary>
        /// Skill Db Access
        /// </summary>
        private readonly IEvneSkillDbAccess _skillDbAccess;
        
        /// <summary>
        /// Implementation status comparer
        /// </summary>
        private readonly IImplementationStatusComparer _implementationStatusComparer;

        /// <summary>
        /// Timeline Service
        /// </summary>
        private readonly ITimelineService _timelineService;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="npcDbAccess">Npc Db Access</param>
        /// <param name="itemDbAccess">Item Db Access</param>
        /// <param name="skillDbAccess">Skill Db Access</param>
        /// <param name="implementationStatusComparer">Implementation Status comparer</param>
        /// <param name="timelineService">Timeline Service</param>
        public ExportSnippetRelatedObjectUpdater(IKortistoNpcDbAccess npcDbAccess, IStyrItemDbAccess itemDbAccess, IEvneSkillDbAccess skillDbAccess, IImplementationStatusComparer implementationStatusComparer, ITimelineService timelineService)
        {
            _npcDbAccess = npcDbAccess;
            _itemDbAccess = itemDbAccess;
            _skillDbAccess = skillDbAccess;
            _implementationStatusComparer = implementationStatusComparer;
            _timelineService = timelineService;
        }

        /// <summary>
        /// Checks the related object of an export snippet for updates
        /// </summary>
        /// <param name="exportSnippet">Export Snippet</param>
        /// <param name="objectType">Object Type</param>
        /// <param name="objectId">Object Id</param>
        /// <returns>Result of update</returns>
        public async Task<FlexFieldObject> CheckExportSnippetRelatedObjectOnUpdate(ObjectExportSnippet exportSnippet, string objectType, string objectId)
        {
            if(string.IsNullOrEmpty(objectType))
            {
                return null;
            }

            objectType = objectType.ToLowerInvariant();
            if(objectType == "npc")
            {
                return await CheckNpcForUpdate(exportSnippet, objectId, TimelineEvent.KortistoNpcExportSnippetChanged);
            }
            else if(objectType == "item")
            {
                return await CheckItemForUpdate(exportSnippet, objectId, TimelineEvent.StyrItemExportSnippetChanged);
            }
            else if(objectType == "skill")
            {
                return await CheckSkillForUpdate(exportSnippet, objectId, TimelineEvent.EvneSkillExportSnippetChanged);
            }

            return null;
        }

        /// <summary>
        /// Checks the related object of an export snippet on deletion
        /// </summary>
        /// <param name="exportSnippet">Export Snippet</param>
        /// <param name="objectType">Object Type</param>
        /// <param name="objectId">Object Id</param>
        /// <returns>Result of the deletion check</returns>
        public async Task<FlexFieldObject> CheckExportSnippetRelatedObjectOnDelete(ObjectExportSnippet exportSnippet, string objectType, string objectId)
        {
            if(string.IsNullOrEmpty(objectType))
            {
                return null;
            }

            objectType = objectType.ToLowerInvariant();
            if(objectType == "npc")
            {
                return await CheckNpcForUpdate(exportSnippet, objectId, TimelineEvent.KortistoNpcExportSnippetDeleted);
            }
            else if(objectType == "item")
            {
                return await CheckItemForUpdate(exportSnippet, objectId, TimelineEvent.StyrItemExportSnippetDeleted);
            }
            else if(objectType == "skill")
            {
                return await CheckSkillForUpdate(exportSnippet, objectId, TimelineEvent.EvneSkillExportSnippetDeleted);
            }

            return null;
        }

        /// <summary>
        /// Checks an npc for update
        /// </summary>
        /// <param name="exportSnippet">Export Snippet</param>
        /// <param name="objectId">Object Id</param>
        /// <param name="timelineEvent">Timeline Event</param>
        /// <returns>Result of update</returns>
        private async Task<FlexFieldObject> CheckNpcForUpdate(ObjectExportSnippet exportSnippet, string objectId, TimelineEvent timelineEvent)
        {
            KortistoNpc npc = await _npcDbAccess.GetFlexFieldObjectById(objectId);
            if(npc == null)
            {
                return null;
            }

            await _timelineService.AddTimelineEntry(timelineEvent, exportSnippet.SnippetName, npc.Name, npc.Id);

            CompareResult result = await _implementationStatusComparer.CompareNpc(npc.Id, npc);
            if(result.CompareDifference != null && result.CompareDifference.Count > 0)
            {
                npc.IsImplemented = false;
                await _npcDbAccess.UpdateFlexFieldObject(npc);
            }

            return npc;
        }

        /// <summary>
        /// Checks an item for update
        /// </summary>
        /// <param name="exportSnippet">Export Snippet</param>
        /// <param name="objectId">Object Id</param>
        /// <param name="timelineEvent">Timeline Event</param>
        /// <returns>Result of update</returns>
        private async Task<FlexFieldObject> CheckItemForUpdate(ObjectExportSnippet exportSnippet, string objectId, TimelineEvent timelineEvent)
        {
            StyrItem item = await _itemDbAccess.GetFlexFieldObjectById(objectId);
            if(item == null)
            {
                return null;
            }

            await _timelineService.AddTimelineEntry(timelineEvent, exportSnippet.SnippetName, item.Name, item.Id);

            CompareResult result = await _implementationStatusComparer.CompareItem(item.Id, item);
            if(result.CompareDifference != null && result.CompareDifference.Count > 0)
            {
                item.IsImplemented = false;
                await _itemDbAccess.UpdateFlexFieldObject(item);
            }

            return item;
        }

        /// <summary>
        /// Checks an skill for update
        /// </summary>
        /// <param name="exportSnippet">Export Snippet</param>
        /// <param name="objectId">Object Id</param>
        /// <param name="timelineEvent">Timeline Event</param>
        /// <returns>Result of update</returns>
        private async Task<FlexFieldObject> CheckSkillForUpdate(ObjectExportSnippet exportSnippet, string objectId, TimelineEvent timelineEvent)
        {
            EvneSkill skill = await _skillDbAccess.GetFlexFieldObjectById(objectId);
            if(skill == null)
            {
                return null;
            }

            await _timelineService.AddTimelineEntry(timelineEvent, exportSnippet.SnippetName, skill.Name, skill.Id);

            CompareResult result = await _implementationStatusComparer.CompareSkill(skill.Id, skill);
            if(result.CompareDifference != null && result.CompareDifference.Count > 0)
            {
                skill.IsImplemented = false;
                await _skillDbAccess.UpdateFlexFieldObject(skill);
            }

            return skill;
        }
    }
}