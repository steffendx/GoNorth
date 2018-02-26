using System;

namespace GoNorth.Logging
{
    /// <summary>
    /// Log Message
    /// </summary>
    public struct LogMessage
    {
        /// <summary>
        /// Timestamp
        /// </summary>
        public DateTimeOffset Timestamp { get; set; }

        /// <summary>
        /// Message
        /// </summary>
        public string Message { get; set; }
    }
}