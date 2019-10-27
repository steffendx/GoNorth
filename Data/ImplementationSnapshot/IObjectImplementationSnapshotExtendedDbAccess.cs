using System.Collections.Generic;
using System.Threading.Tasks;

namespace GoNorth.Data.ImplementationSnapshot
{
    /// <summary>
    /// Interface for Database Access for Object Implementation Snapshots with extended functionality
    /// </summary>
    public interface IObjectImplementationSnapshotExtendedDbAccess<T> : IObjectImplementationSnapshotDbAccess<T> where T:IImplementationSnapshotable,IHasModifiedData,new()
    {
        /// <summary>
        /// Returns all snapshots that were modified by a user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>Snapshots modified by the user</returns>
        Task<List<T>> GetSnapshotsModifiedByUsers(string userId);

        /// <summary>
        /// Resets all snapshots that were last modified by a user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>Task</returns>
        Task ResetSnapshotsByModifiedUser(string userId);
    }
}