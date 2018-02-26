using System;

namespace GoNorth.Data.LockService
{
    /// <summary>
    /// Lock Entry
    /// </summary>
    public class LockEntry
    {
        /// <summary>
        /// Id of the lock
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Category of the lock
        /// </summary>
        public string Category { get; set; }

        /// <summary>
        /// Resource Id
        /// </summary>
        public string ResourceId { get; set; }

        /// <summary>
        /// Id of the user who owns the lock
        /// </summary>
        public string UserId { get; set; }

        /// <summary>
        /// Expire Date
        /// </summary>
        public DateTimeOffset ExpireDate { get; set; }
    }
}