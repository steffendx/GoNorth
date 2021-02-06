namespace GoNorth.Data.ImplementationSnapshot
{
    /// <summary>
    /// Interface for Objects that can be saved as implementation snapshots
    /// </summary>
    public interface IImplementationStatusTrackingObject
    {
        /// <summary>
        /// true if the object is implemented, else false
        /// </summary>
        bool IsImplemented { get; set; }
    }
}