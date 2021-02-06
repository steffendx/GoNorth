using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Services.Export.NodeGraphExport;

namespace GoNorth.Services.Export.DailyRoutine
{
    /// <summary>
    /// Class for generating Export Daily routine Function Names
    /// </summary>
    public class DailyRoutineFunctionNameGenerator : NodeGraphFunctionNameGeneratorBase, IDailyRoutineFunctionNameGenerator
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
        /// Constructor
        /// </summary>
        /// <param name="functionIdDbAccess">Export Function Id Db Access</param>
        public DailyRoutineFunctionNameGenerator(IExportFunctionIdDbAccess functionIdDbAccess) : base(functionIdDbAccess, FunctionTemplate, DailyRoutineIdCounterSubCategory)
        {
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
            return await GetNewFunctionName(projectId, npcId, dailyRoutineEventId);
        }
    }
}