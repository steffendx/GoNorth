using System.Threading.Tasks;

namespace GoNorth.Services.Export.DailyRoutine
{
    /// <summary>
    /// Interface for generating Export Daily Routine Function Names
    /// </summary>
    public interface IDailyRoutineFunctionNameGenerator
    {
        /// <summary>
        /// Returns a new daily routine function
        /// </summary>
        /// <param name="projectId">Project id</param>
        /// <param name="npcId">Npc Id</param>
        /// <param name="dailyRoutineEventId">Daily routine event id</param>
        /// <returns>New Daily Routine Step Function</returns>
        Task<string> GetNewDailyRoutineStepFunction(string projectId, string npcId, string dailyRoutineEventId);
    }
}