using System.Threading.Tasks;
using GoNorth.Data.Exporting;

namespace GoNorth.Services.Export.Dialog
{
    /// <summary>
    /// Class for generating Export Dialog Function Names
    /// </summary>
    public class ExportDialogFunctionNameGenerator : IExportDialogFunctionNameGenerator
    {
        /// <summary>
        /// Template for the function
        /// </summary>
        private const string FunctionTemplate = "DialogStep_{0}_{1}";
        

        /// <summary>
        /// Function Id Db Access
        /// </summary>
        private readonly IExportFunctionIdDbAccess _functionIdDbAccess;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="functionIdDbAccess">Export Function Id Db Access</param>
        public ExportDialogFunctionNameGenerator(IExportFunctionIdDbAccess functionIdDbAccess)
        {
            _functionIdDbAccess = functionIdDbAccess;
        }

        /// <summary>
        /// Returns a new dialog step function
        /// </summary>
        /// <param name="stepType">Stype type (Text, Choice)</param>
        /// <param name="projectId">Project id</param>
        /// <param name="objectId">Object Id</param>
        /// <param name="functionObjectId">Function object id</param>
        /// <returns>New Dialog Step Function</returns>
        public async Task<string> GetNewDialogStepFunction(string stepType, string projectId, string objectId, string functionObjectId)
        {
            ExportFunctionId functionId = await _functionIdDbAccess.GetExportFunctionId(projectId, objectId, functionObjectId);
            if(functionId == null)
            {
                functionId = new ExportFunctionId();
                functionId.ProjectId = projectId;
                functionId.ObjectId = objectId;
                functionId.FunctionObjectId = functionObjectId;
                functionId.FunctionId = await _functionIdDbAccess.GetNewExportFuntionIdForObject(projectId, objectId);
                await _functionIdDbAccess.SaveNewExportFunctionId(functionId);
            }

            return string.Format(FunctionTemplate, functionId.FunctionId, stepType);
        }
    }
}