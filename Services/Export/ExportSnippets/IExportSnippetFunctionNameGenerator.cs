using System.Threading.Tasks;

namespace GoNorth.Services.Export.ExportSnippets
{
    /// <summary>
    /// Interface for generating Export Snippet Function Names
    /// </summary>
    public interface IExportSnippetFunctionNameGenerator
    {
        /// <summary>
        /// Returns a new export snippet function
        /// </summary>
        /// <param name="projectId">Project id</param>
        /// <param name="objectId">Object Id</param>
        /// <param name="exportSnippetId">Export snippet id</param>
        /// <returns>New export snippet Step Function</returns>
        Task<string> GetNewExportSnippetStepFunction(string projectId, string objectId, string exportSnippetId);
    }
}