using System.Threading.Tasks;

namespace GoNorth.Data.ImplementationSnapshot
{
    /// <summary>
    /// Interface for Database Access for Object Implementation Snapshots
    /// </summary>
    public interface IObjectImplementationSnapshotDbAccess<T>
    {
        /// <summary>
        /// Returns an implementation snapshot of an object
        /// </summary>
        /// <param name="id">Id of the object</param>
        /// <returns>Implementation snapshot</returns>
        Task<T> GetSnapshotById(string id);

        /// <summary>
        /// Saves a snapshot
        /// </summary>
        /// <param name="snapshot">Snapshot to save</param>
        /// <returns>Task</returns>
        Task SaveSnapshot(T snapshot);

        /// <summary>
        /// Deletes a snapshot
        /// </summary>
        /// <param name="id">Id of the snapshot</param>
        /// <returns>Task</returns>
        Task DeleteSnapshot(string id);
    }
}