using System.Threading.Tasks;

namespace GoNorth.Services.Export.StateMachines
{
    /// <summary>
    /// Interface for generating Export State Machine Function Names
    /// </summary>
    public interface IStateMachineFunctionNameGenerator
    {
        /// <summary>
        /// Returns a new state machine function
        /// </summary>
        /// <param name="projectId">Project id</param>
        /// <param name="npcId">Npc Id</param>
        /// <param name="stateId">State id</param>
        /// <returns>New State Machine Step Function</returns>
        Task<string> GetNewStateMachineStepFunction(string projectId, string npcId, string stateId);
    }
}