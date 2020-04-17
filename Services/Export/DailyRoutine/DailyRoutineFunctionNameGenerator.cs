using System.Threading.Tasks;
using GoNorth.Data.Exporting;

namespace GoNorth.Services.Export.DailyRoutine
{
    /// <summary>
    /// Class for generating Export Daily routine Function Names
    /// </summary>
    public class DailyRoutineFunctionNameGenerator : IDailyRoutineFunctionNameGenerator
    {
        /// <summary>
        /// Template for the function
        /// </summary>
        private const string FunctionTemplate = "DailyRoutine_{0}";
        
        /// <summary>
        /// Postfix for the npc daily routine id counter
        /// </summary>
        private const string DailyRoutineIdCounterSubCategory = "DailyRoutine";
        

        /// <summary>
        /// Function Id Db Access
        /// </summary>
        private readonly IExportFunctionIdDbAccess _functionIdDbAccess;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="functionIdDbAccess">Export Function Id Db Access</param>
        public DailyRoutineFunctionNameGenerator(IExportFunctionIdDbAccess functionIdDbAccess)
        {
            _functionIdDbAccess = functionIdDbAccess;
        }

        /// <summary>
        /// Returns a new daily routine function
        /// </summary>
        /// <param name="projectId">Project id</param>
        /// <param name="npcId">Npc Id</param>
        /// <param name="dailyRoutineEventId">Daily routine event id</param>
        /// <returns>New Daily Routine Step Function</returns>
        public async Task<string> GetNewDailyRoutineStepFunction(string projectId, string npcId, string dailyRoutineEventId)
        {
            ExportFunctionId functionId = await _functionIdDbAccess.GetExportFunctionId(projectId, npcId, dailyRoutineEventId);
            if(functionId == null)
            {
                functionId = new ExportFunctionId();
                functionId.ProjectId = projectId;
                functionId.ObjectId = npcId;
                functionId.FunctionObjectId = dailyRoutineEventId;
                functionId.FunctionId = await _functionIdDbAccess.GetNewExportFuntionIdForObjectAndSubCategory(projectId, npcId, DailyRoutineIdCounterSubCategory);
                await _functionIdDbAccess.SaveNewExportFunctionId(functionId);
            }

            return string.Format(FunctionTemplate, functionId.FunctionId);
        }
    }
}