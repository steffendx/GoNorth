using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Services.Export.NodeGraphExport;

namespace GoNorth.Services.Export.DailyRoutine
{
    /// <summary>
    /// Daily routine export node graph Function Generator
    /// </summary>
    public class DailyRoutineNodeGraphFunctionGenerator : ExportGraphFunctionBaseGenerator, IDailyRoutineNodeGraphFunctionGenerator
    {
        /// <summary>
        /// Function Name Generator
        /// </summary>
        private readonly IDailyRoutineFunctionNameGenerator _functionNameGenerator;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="dialogFunctionGenerationConditionProvider">Condition Provider</param>
        /// <param name="functionNameGenerator">Dialog Function Name Generaotr</param>
        public DailyRoutineNodeGraphFunctionGenerator(IDialogFunctionGenerationConditionProvider dialogFunctionGenerationConditionProvider, IDailyRoutineFunctionNameGenerator functionNameGenerator) : base(dialogFunctionGenerationConditionProvider)
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
            return await _functionNameGenerator.GetNewDailyRoutineStepFunction(projectId, objectId, functionObjectId);
        }
    }
}