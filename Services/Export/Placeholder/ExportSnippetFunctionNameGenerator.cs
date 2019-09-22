using System.Threading.Tasks;
using GoNorth.Data.Exporting;

namespace GoNorth.Services.Export.Placeholder
{
    /// <summary>
    /// Class for generating Export Snippet Function Names
    /// </summary>
    public class ExportSnippetFunctionNameGenerator : IExportSnippetFunctionNameGenerator
    {
        /// <summary>
        /// Template for the function
        /// </summary>
        private const string FunctionTemplate = "ExportSnippet_{0}";
        
        /// <summary>
        /// Postfix for the export snippet id counter
        /// </summary>
        private const string ExportSnippetIdCounterSubCategory = "ExportSnippet";
        

        /// <summary>
        /// Function Id Db Access
        /// </summary>
        private readonly IExportFunctionIdDbAccess _functionIdDbAccess;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="functionIdDbAccess">Export Function Id Db Access</param>
        public ExportSnippetFunctionNameGenerator(IExportFunctionIdDbAccess functionIdDbAccess)
        {
            _functionIdDbAccess = functionIdDbAccess;
        }

        /// <summary>
        /// Returns a new export snippet function
        /// </summary>
        /// <param name="projectId">Project id</param>
        /// <param name="objectId">Object Id</param>
        /// <param name="exportSnippetId">Export snippet id</param>
        /// <returns>New export snippet Step Function</returns>
        public async Task<string> GetNewExportSnippetStepFunction(string projectId, string objectId, string exportSnippetId)
        {
            ExportFunctionId functionId = await _functionIdDbAccess.GetExportFunctionId(projectId, objectId, exportSnippetId);
            if(functionId == null)
            {
                functionId = new ExportFunctionId();
                functionId.ProjectId = projectId;
                functionId.ObjectId = objectId;
                functionId.FunctionObjectId = exportSnippetId;
                functionId.FunctionId = await _functionIdDbAccess.GetNewExportFuntionIdForObjectAndSubCategory(projectId, objectId, ExportSnippetIdCounterSubCategory);
                await _functionIdDbAccess.SaveNewExportFunctionId(functionId);
            }

            return string.Format(FunctionTemplate, functionId.FunctionId);
        }
    }
}