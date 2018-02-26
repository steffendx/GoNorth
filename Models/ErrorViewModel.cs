using System;

namespace GoNorth.Models
{
    /// <summary>
    /// Error View Model
    /// </summary>
    public class ErrorViewModel
    {
        /// <summary>
        /// Request Id
        /// </summary>
        public string RequestId { get; set; }

        /// <summary>
        /// Returns if the request id should be shown
        /// </summary>
        /// <returns>True if the request id should be shown</returns>
        public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);
    }
}