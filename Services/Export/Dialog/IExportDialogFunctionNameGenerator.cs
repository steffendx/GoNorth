using System.Threading.Tasks;

namespace GoNorth.Services.Export.Dialog
{
    /// <summary>
    /// Interface for generating Export Dialog Function Names
    /// </summary>
    public interface IExportDialogFunctionNameGenerator
    {
        /// <summary>
        /// Returns a new dialog step function
        /// </summary>
        /// <param name="stepType">Stype type (Text, Choice)</param>
        /// <param name="projectId">Project id</param>
        /// <param name="objectId">Object Id</param>
        /// <param name="functionObjectId">Function object id</param>
        /// <returns>New Dialog Step Function</returns>
        Task<string> GetNewDialogStepFunction(string stepType, string projectId, string objectId, string functionObjectId);
    }
}