using System.Threading.Tasks;

namespace GoNorth.Data
{
    /// <summary>
    /// Interface for the database setup
    /// </summary>
    public interface IDbSetup
    {
        /// <summary>
        /// Sets the database up
        /// </summary>
        /// <returns>Task</returns>
        Task SetupDatabaseAsync();

        /// <summary>
        /// Checks if there are migration tasks required for the database
        /// </summary>
        /// <returns>Task</returns>
        Task CheckForNeededMigrations();
    }
}