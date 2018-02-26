using System;
using System.Threading.Tasks;
using GoNorth.Models;

namespace GoNorth.Data.LockService
{
    /// <summary>
    /// Interface for Database Access for roles
    /// </summary>
    public interface ILockServiceDbAccess
    {
        /// <summary>
        /// Returns the lock entry for a resource
        /// </summary>
        /// <param name="category">Category</param>
        /// <param name="id">Id of the resource</param>
        /// <returns>Lock Entry, null if none exists</returns>
        Task<LockEntry> GetResourceLockEntry(string category, string id);

        /// <summary>
        /// Locks a resource
        /// </summary>
        /// <param name="category">Category</param>
        /// <param name="id">Id of the resource</param>
        /// <param name="userId">Id of the user who acquires the lock</param>
        /// <param name="expireDate">Date at which  the lock expires</param>
        /// <returns>Task</returns>
        Task LockResource(string category, string id, string userId, DateTimeOffset expireDate);
    }
}