using System.Threading.Tasks;

namespace GoNorth.Data.Exporting
{
    /// <summary>
    /// Interface for reading dialog node function generation conditions
    /// </summary>
    public interface IDialogFunctionGenerationConditionProvider
    {
        /// <summary>
        /// Returns the dialog node function generation conditions
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Dialog node function generation condition collection</returns>
        Task<DialogFunctionGenerationConditionCollection> GetDialogFunctionGenerationConditions(string projectId);
    }
}