using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using GoNorth.Config;
using GoNorth.Data.FlexFieldDatabase;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.Kortisto
{
    /// <summary>
    /// Kortisto Npc Mongo DB Access
    /// </summary>
    public class KortistoNpcMongoDbAccess : FlexFieldObjectBaseMongoDbAccess<KortistoNpc>, IKortistoNpcDbAccess
    {
        /// <summary>
        /// Collection Name of the kortisto npcs
        /// </summary>
        public const string KortistoNpcCollectionName = "KortistoNpc";

        /// <summary>
        /// Collection Name of the kortisto npcs recycling bin
        /// </summary>
        public const string KortistoNpcRecyclingBinCollectionName = "KortistoNpcRecyclingBin";

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public KortistoNpcMongoDbAccess(IOptions<ConfigurationData> configuration) : base(KortistoNpcCollectionName, KortistoNpcRecyclingBinCollectionName, configuration)
        {
        }

        /// <summary>
        /// Returns the player npc
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Npc</returns>
        public async Task<KortistoNpc> GetPlayerNpc(string projectId)
        {
            KortistoNpc npc = await _ObjectCollection.Find(n => n.ProjectId == projectId && n.IsPlayerNpc).FirstOrDefaultAsync();
            return npc;
        }

        /// <summary>
        /// Resets the player flag to false for all npcs
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Task</returns>
        public async Task ResetPlayerFlagForAllNpcs(string projectId)
        {
            UpdateResult result = await _ObjectCollection.UpdateManyAsync(n => n.ProjectId == projectId, Builders<KortistoNpc>.Update.Set(n => n.IsPlayerNpc, false));
        }


        /// <summary>
        /// Returns the npcs which have an item in their inventory with only the main items
        /// </summary>
        /// <param name="itemId">Item id</param>
        /// <returns>Npcs</returns>
        public async Task<List<KortistoNpc>> GetNpcsByItemInInventory(string itemId)
        {
            return await _ObjectCollection.AsQueryable().Where(n => n.Inventory.Any(i => i.ItemId == itemId)).OrderBy(n => n.Name).Select(n => new KortistoNpc {
                Id = n.Id,
                Name = n.Name
            }).ToListAsync();
        }

        /// <summary>
        /// Returns the npcs which have learned a skill with only the main values
        /// </summary>
        /// <param name="skillId">Skill id</param>
        /// <returns>Npcs</returns>
        public async Task<List<KortistoNpc>> GetNpcsByLearnedSkill(string skillId)
        {
            return await _ObjectCollection.AsQueryable().Where(n => n.Skills.Any(s => s.SkillId == skillId)).OrderBy(n => n.Name).Select(n => new KortistoNpc {
                Id = n.Id,
                Name = n.Name
            }).ToListAsync();
        }


        /// <summary>
        /// Returns all npcs an object is referenced in the daily routine (not including the relatedobjectid itself)
        /// </summary>
        /// <param name="objectId">Object Id</param>
        /// <returns>All npcs the object is referenced in without detail information and the entrie with relatedobjectid = itself</returns>
        public async Task<List<KortistoNpc>> GetNpcsObjectIsReferencedInDailyRoutine(string objectId)
        {
            // Required to use non Linq syntax here as Linq does not seem to support deep enough queries for this
            List<KortistoNpc> npcs = await _ObjectCollection.Find(Builders<KortistoNpc>.Filter.Ne(n => n.Id, objectId) & Builders<KortistoNpc>.Filter.ElemMatch(n => n.DailyRoutine, 
                                                d => d.ScriptNodeGraph.Action.Any(a => a.ActionRelatedToObjectId == objectId || (a.ActionRelatedToAdditionalObjects != null && a.ActionRelatedToAdditionalObjects.Any(e => e.ObjectId == objectId))) || d.ScriptNodeGraph.Condition.Any(c => c.Conditions.Any(co => co.DependsOnObjects.Any(doo => doo.ObjectId == objectId))) ||
                                                     d.ScriptNodeGraph.Reference.Any(a => a.ReferencedObjects.Any(r => r.ObjectId == objectId)))).Project(n => new KortistoNpc {
                                                    Id = n.Id,
                                                    Name = n.Name
                                                }).ToListAsync();

            return npcs;
        }

        /// <summary>
        /// Returns all npcs that have a movement target in a map with full informations
        /// </summary>
        /// <param name="mapId">Map Id</param>
        /// <returns>All npcs that have a movement target in a map with full informations</returns>
        public async Task<List<KortistoNpc>> GetNpcsWithMovementTargetInMap(string mapId)
        {
            return await _ObjectCollection.AsQueryable().Where(n => n.DailyRoutine != null && n.DailyRoutine.Any(dr => dr.MovementTarget != null && dr.MovementTarget.MapId == mapId)).ToListAsync();
        }
                

        /// <summary>
        /// Returns the npcs which have a daily routine event that is later than a given time
        /// </summary>
        /// <param name="hours">Hours</param>
        /// <param name="minutes">Minutes</param>
        /// <returns>Npcs</returns>
        public async Task<List<KortistoNpc>> GetNpcsWithDailyRoutineAfterTime(int hours, int minutes)
        {
            return await _ObjectCollection.AsQueryable().Where(n => n.DailyRoutine != null && n.DailyRoutine.Any(d => d.EarliestTime.Hours > hours || d.EarliestTime.Minutes > minutes)).OrderBy(n => n.Name).Select(n => new KortistoNpc {
                Id = n.Id,
                Name = n.Name
            }).ToListAsync();
        }

    }
}