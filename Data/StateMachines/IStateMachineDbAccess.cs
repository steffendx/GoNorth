using System.Collections.Generic;
using System.Threading.Tasks;

namespace GoNorth.Data.StateMachines
{
    /// <summary>
    /// Interface for State Machine Db Access
    /// </summary>
    public interface IStateMachineDbAccess
    {
        /// <summary>
        /// Creates a state machine
        /// </summary>
        /// <param name="stateMachine">State machine</param>
        /// <returns>Created state machine, filled with id</returns>
        Task<StateMachine> CreateStateMachine(StateMachine stateMachine);

        /// <summary>
        /// Finds a state machine by id
        /// </summary>
        /// <param name="id">State machine Id</param>
        /// <returns>State machine</returns>
        Task<StateMachine> GetStateMachineById(string id);

        /// <summary>
        /// Finds a state machine by related object id
        /// </summary>
        /// <param name="id">Related object id of the state machine</param>
        /// <returns>State machine</returns>
        Task<StateMachine> GetStateMachineByRelatedObjectId(string id);

        /// <summary>
        /// Returns all state machines an object is referenced in (not including the relatedobjectid itself)
        /// </summary>
        /// <param name="objectId">Object Id</param>
        /// <returns>All state machines object is referenced in without detail information and the entrie with relatedobjectid = itself</returns>
        Task<List<StateMachine>> GetStateMachinesObjectIsReferenced(string objectId);

        /// <summary>
        /// Returns all state machines which related objects are part of a list of ids
        /// </summary>
        /// <param name="objectIds">List of object ids</param>
        /// <returns>State machines without detail information</returns>
        Task<List<StateMachine>> GetStateMachineByRelatedObjectIds(List<string> objectIds);

        /// <summary>
        /// Updates a state machine
        /// </summary>
        /// <param name="stateMachine">State machine</param>
        /// <returns>Task</returns>
        Task UpdateStateMachine(StateMachine stateMachine);

        /// <summary>
        /// Deletes a state machine
        /// </summary>
        /// <param name="stateMachine">State machine</param>
        /// <returns>Task</returns>
        Task DeleteStateMachine(StateMachine stateMachine);

        
        /// <summary>
        /// Returns all state machiens that were last modified by a user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>List of State machines</returns>
        Task<List<StateMachine>> GetStateMachinesByModifiedUser(string userId);

        /// <summary>
        /// Resets all state machines that were modified by a user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Task</returns>
        Task ResetStateMachinesByModifiedUser(string userId);
    }
}