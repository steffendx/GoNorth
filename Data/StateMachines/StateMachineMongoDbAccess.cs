using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Config;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.StateMachines
{
    /// <summary>
    /// State machine DB Access
    /// </summary>
    public class StateMachineMongoDbAccess : BaseMongoDbAccess, IStateMachineDbAccess
    {
        /// <summary>
        /// Collection Name of the state machines
        /// </summary>
        public const string StateMachineCollectionName = "StateMachine";

        /// <summary>
        /// State machine Collection
        /// </summary>
        private IMongoCollection<StateMachine> _StateMachineCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public StateMachineMongoDbAccess(IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _StateMachineCollection = _Database.GetCollection<StateMachine>(StateMachineCollectionName);
        }

        /// <summary>
        /// Creates a state machine
        /// </summary>
        /// <param name="stateMachine">State machine</param>
        /// <returns>Created state machine, filled with id</returns>
        public async Task<StateMachine> CreateStateMachine(StateMachine stateMachine)
        {
            if(string.IsNullOrEmpty(stateMachine.RelatedObjectId))
            {
                throw new InvalidOperationException("Can not create a new state machine without related object");
            }

            stateMachine.Id = Guid.NewGuid().ToString();
            await _StateMachineCollection.InsertOneAsync(stateMachine);

            return stateMachine;
        }

        /// <summary>
        /// Finds a state machine by id
        /// </summary>
        /// <param name="id">State machine Id</param>
        /// <returns>State machine</returns>
        public async Task<StateMachine> GetStateMachineById(string id)
        {
            StateMachine stateMachine = await _StateMachineCollection.Find(p => p.Id == id).FirstOrDefaultAsync();
            return stateMachine;
        }

        /// <summary>
        /// Finds a state machine by related object id
        /// </summary>
        /// <param name="id">Related object id of the state machine</param>
        /// <returns>State machine</returns>
        public async Task<StateMachine> GetStateMachineByRelatedObjectId(string id)
        {
            StateMachine stateMachine = await _StateMachineCollection.Find(p => p.RelatedObjectId == id).FirstOrDefaultAsync();
            return stateMachine;
        }

        /// <summary>
        /// Returns all state machines an object is referenced in (not including the relatedobjectid itself)
        /// </summary>
        /// <param name="objectId">Object Id</param>
        /// <returns>All state machines object is referenced in without detail information and the entrie with relatedobjectid = itself</returns>
        public async Task<List<StateMachine>> GetStateMachinesObjectIsReferenced(string objectId)
        {
            List<StateMachine> stateMachines = await _StateMachineCollection.AsQueryable().Where(t => t.RelatedObjectId != objectId && t.State != null && t.State.Any(s => s.ScriptNodeGraph != null && (s.ScriptNodeGraph.Action.Any(a => a.ActionRelatedToObjectId == objectId || (a.ActionRelatedToAdditionalObjects != null && a.ActionRelatedToAdditionalObjects.Any(e => e.ObjectId == objectId))) || s.ScriptNodeGraph.Condition.Any(c => c.Conditions.Any(ce => ce.DependsOnObjects.Any(o => o.ObjectId == objectId))) ||
                                                                                                      s.ScriptNodeGraph.Reference.Any(a => a.ReferencedObjects.Any(r => r.ObjectId == objectId))))).Select(t => new StateMachine() {
                Id = t.Id,
                RelatedObjectId = t.RelatedObjectId,
                State = t.State
            }).ToListAsync();
            return stateMachines;
        }

        /// <summary>
        /// Returns all state machines which related objects are part of a list of ids
        /// </summary>
        /// <param name="objectIds">List of object ids</param>
        /// <returns>State machines without detail information</returns>
        public async Task<List<StateMachine>> GetStateMachineByRelatedObjectIds(List<string> objectIds)
        {
            List<StateMachine> stateMachines = await _StateMachineCollection.AsQueryable().Where(t => objectIds.Contains(t.RelatedObjectId)).Select(t => new StateMachine() {
                Id = t.Id,
                RelatedObjectId = t.RelatedObjectId,
                State = t.State
            }).ToListAsync();
            return stateMachines;
        }

        /// <summary>
        /// Updates a state machine
        /// </summary>
        /// <param name="stateMachine">State machine</param>
        /// <returns>Task</returns>
        public async Task UpdateStateMachine(StateMachine stateMachine)
        {
            ReplaceOneResult result = await _StateMachineCollection.ReplaceOneAsync(p => p.Id == stateMachine.Id, stateMachine);
        }

        /// <summary>
        /// Deletes a state machine
        /// </summary>
        /// <param name="stateMachine">State machine</param>
        /// <returns>Task</returns>
        public async Task DeleteStateMachine(StateMachine stateMachine)
        {
            DeleteResult result = await _StateMachineCollection.DeleteOneAsync(p => p.Id == stateMachine.Id);
        }
        

        /// <summary>
        /// Returns all state machiens that were last modified by a user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>List of State machines</returns>
        public async Task<List<StateMachine>> GetStateMachinesByModifiedUser(string userId)
        {
            return await _StateMachineCollection.AsQueryable().Where(t => t.ModifiedBy == userId).ToListAsync();
        }

        /// <summary>
        /// Resets all state machines that were modified by a user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Task</returns>
        public async Task ResetStateMachinesByModifiedUser(string userId)
        {
            await _StateMachineCollection.UpdateManyAsync(n => n.ModifiedBy == userId, Builders<StateMachine>.Update.Set(n => n.ModifiedBy, Guid.Empty.ToString()).Set(n => n.ModifiedOn, DateTimeOffset.UtcNow));
        }
    }
}