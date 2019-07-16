using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Services.Export.NodeGraphExport;

namespace GoNorth.Services.Export.Dialog
{
    /// <summary>
    /// Export Dialog Function Generator
    /// </summary>
    public class ExportDialogFunctionGenerator : ExportGraphFunctionBaseGenerator, IExportDialogFunctionGenerator
    {
        /// <summary>
        /// Function Name Generator
        /// </summary>
        private readonly IExportDialogFunctionNameGenerator _functionNameGenerator;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="dialogFunctionGenerationConditionProvider">Condition Provider</param>
        /// <param name="functionNameGenerator">Dialog Function Name Generaotr</param>
        public ExportDialogFunctionGenerator(IDialogFunctionGenerationConditionProvider dialogFunctionGenerationConditionProvider, IExportDialogFunctionNameGenerator functionNameGenerator) : base(dialogFunctionGenerationConditionProvider)
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
            return await _functionNameGenerator.GetNewDialogStepFunction(stepType, projectId, objectId, functionObjectId);
        }
    }
}