using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Services.Export.NodeGraphExport;

namespace GoNorth.Services.Export.StateMachines
{
    /// <summary>
    /// State machine export node graph Function Generator
    /// </summary>
    public class StateMachineNodeGraphFunctionGenerator : ExportGraphFunctionBaseGenerator, IStateMachineNodeGraphFunctionGenerator
    {
        /// <summary>
        /// Function Name Generator
        /// </summary>
        private readonly IStateMachineFunctionNameGenerator _functionNameGenerator;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="dialogFunctionGenerationConditionProvider">Condition Provider</param>
        /// <param name="functionNameGenerator">Dialog Function Name Generaotr</param>
        public StateMachineNodeGraphFunctionGenerator(IDialogFunctionGenerationConditionProvider dialogFunctionGenerationConditionProvider, IStateMachineFunctionNameGenerator functionNameGenerator) : base(dialogFunctionGenerationConditionProvider)
        {
            _functionNameGenerator = functionNameGenerator;
        }        

        /// <summary>
        /// Returns a new step function
        /// </summary>
        /// <param name="stepType">Stype type (Text, Choice)</param>
        /// <param name="projectId">Project id</param>
        /// <param name="objectId">Object Id</param>
        /// <param name="functionObjectId">Function object id</param>
        /// <returns>New step Function</returns>
        public override async Task<string> GenerateFunctionName(string stepType, string projectId, string objectId, string functionObjectId)
        {
            return await _functionNameGenerator.GetNewStateMachineStepFunction(projectId, objectId, functionObjectId);
        }
    }
}