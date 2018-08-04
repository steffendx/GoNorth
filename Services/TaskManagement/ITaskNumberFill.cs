using System.Threading.Tasks;

namespace GoNorth.Services.TaskManagement
{
    /// <summary>
    /// Interface for generating task numbers for tasks that are missing numbers
    /// </summary>
    public interface ITaskNumberFill
    {
        /// <summary>
        /// Generates task numbers for all tasks that are missing a number
        /// </summary>
        /// <returns>Task</returns>
        Task FillTasks();
    }
}