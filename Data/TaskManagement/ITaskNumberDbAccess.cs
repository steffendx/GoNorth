using System.Threading.Tasks;

namespace GoNorth.Data.TaskManagement
{
    /// <summary>
    /// Interface for Database Access for task numbers
    /// </summary>
    public interface ITaskNumberDbAccess
    {
        /// <summary>
        /// Returns the next task number for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Next task number</returns>
        Task<int> GetNextTaskNumber(string projectId);

        /// <summary>
        /// Deletes the counter for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Task</returns>
        Task DeleteCounterForProject(string projectId);
    }
}