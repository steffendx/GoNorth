using System.Threading.Tasks;

namespace GoNorth.Data.ImplementationSnapshot
{
    /// <summary>
    /// Interface for Objects that can be saved as implementation snapshots
    /// </summary>
    public interface IImplementationSnapshotable
    {
        /// <summary>
        /// Id of the object
        /// </summary>
        string Id { get; set; }
    }
}