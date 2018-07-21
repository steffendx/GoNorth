using System.Threading.Tasks;

namespace GoNorth.Data.Exporting
{
    /// <summary>
    /// Interface for reading dialog node function generation conditions from the database
    /// </summary>
    public interface IDialogFunctionGenerationConditionDbAccess
    {
        /// <summary>
        /// Returns the dialog node function generation conditions
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Dialog node function generation condition collection</returns>
        Task<DialogFunctionGenerationConditionCollection> GetDialogFunctionGenerationConditions(string projectId);

        /// <summary>
        /// Saves the dialog function generation condition
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="dialogFunctionGenerationCondition">Dialog function generation condition</param>
        /// <returns>Task</returns>
        Task SaveDialogFunctionGenerationCondition(string projectId, DialogFunctionGenerationConditionCollection dialogFunctionGenerationCondition);
    }
}