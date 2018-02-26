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
        Task SetupDatabaseAsync();
    }
}