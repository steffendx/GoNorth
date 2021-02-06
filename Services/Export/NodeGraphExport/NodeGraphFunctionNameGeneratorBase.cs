using System.Threading.Tasks;
using GoNorth.Data.Exporting;

namespace GoNorth.Services.Export.NodeGraphExport
{
    /// <summary>
    /// Base Class for generating node graph function names
    /// </summary>
    public class NodeGraphFunctionNameGeneratorBase
    {
        /// <summary>
        /// Template for the function
        /// </summary>
        private readonly string _functionTemplate;
        
        /// <summary>
        /// Postfix for the id counter
        /// </summary>
        private readonly string _idCounterSubCategory;
        

        /// <summary>
        /// Function Id Db Access
        /// </summary>
        private readonly IExportFunctionIdDbAccess _functionIdDbAccess;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="functionIdDbAccess">Export Function Id Db Access</param>
        /// <param name="functionTemplate">Function Template</param>
        /// <param name="idCounterSubCategory">Id Counter Sub Category</param>
        public NodeGraphFunctionNameGeneratorBase(IExportFunctionIdDbAccess functionIdDbAccess, string functionTemplate, string idCounterSubCategory)
        {
            _functionIdDbAccess = functionIdDbAccess;

            _functionTemplate = functionTemplate;
            _idCounterSubCategory = idCounterSubCategory;
        }

        /// <summary>
        /// Returns a new function
        /// </summary>
        /// <param name="projectId">Project id</param>
        /// <param name="npcId">Npc Id</param>
        /// <param name="functionObjectId">Function object id</param>
        /// <returns>New Step Function</returns>
        protected async Task<string> GetNewFunctionName(string projectId, string npcId, string functionObjectId)
        {
            ExportFunctionId functionId = await _functionIdDbAccess.GetExportFunctionId(projectId, npcId, functionObjectId);
            if(functionId == null)
            {
                functionId = new ExportFunctionId();
                functionId.ProjectId = projectId;
                functionId.ObjectId = npcId;
                functionId.FunctionObjectId = functionObjectId;
                functionId.FunctionId = await _functionIdDbAccess.GetNewExportFuntionIdForObjectAndSubCategory(projectId, npcId, _idCounterSubCategory);
                await _functionIdDbAccess.SaveNewExportFunctionId(functionId);
            }

            return string.Format(_functionTemplate, functionId.FunctionId);
        }
    }
}