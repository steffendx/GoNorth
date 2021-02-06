using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Services.Export.NodeGraphExport;

namespace GoNorth.Services.Export.StateMachines
{
    /// <summary>
    /// Class for generating Export State Machine Function Names
    /// </summary>
    public class StateMachineFunctionNameGenerator : NodeGraphFunctionNameGeneratorBase, IStateMachineFunctionNameGenerator
    {
        /// <summary>
        /// Template for the function
        /// </summary>
        private const string FunctionTemplate = "State_{0}";
        
        /// <summary>
        /// Postfix for the npc state machine id counter
        /// </summary>
        private const string StateMachineIdCounterSubCategory = "StateMachine";
        

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="functionIdDbAccess">Export Function Id Db Access</param>
        public StateMachineFunctionNameGenerator(IExportFunctionIdDbAccess functionIdDbAccess) : base(functionIdDbAccess, FunctionTemplate, StateMachineIdCounterSubCategory)
        {
        }

        /// <summary>
        /// Returns a new state machine function
        /// </summary>
        /// <param name="projectId">Project id</param>
        /// <param name="npcId">Npc Id</param>
        /// <param name="stateId">State id</param>
        /// <returns>New State Machine Step Function</returns>
        public async Task<string> GetNewStateMachineStepFunction(string projectId, string npcId, string stateId)
        {
            return await GetNewFunctionName(projectId, npcId, stateId);
        }
    }
}