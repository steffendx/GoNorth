using System.Threading.Tasks;
using GoNorth.Data.User;
using Microsoft.AspNetCore.Identity;

namespace GoNorth.Services.DataMigration
{
    /// <summary>
    /// Interface for Data Migrator
    /// </summary>
    public interface IDataMigrator
    {
        /// <summary>
        /// Checks for migratable data
        /// </summary>
        /// <returns>Task for the async task</returns>
        Task UpdateMigratableData();
    }
}
