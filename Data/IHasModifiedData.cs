using System;

namespace GoNorth.Data
{
    /// <summary>
    /// Interface for classes that have modified data
    /// </summary>
    public interface IHasModifiedData
    {
        /// <summary>
        /// Last modify Date
        /// </summary>
        DateTimeOffset ModifiedOn { get; set; }

        /// <summary>
        /// Id of the user who last modified the page
        /// </summary>
        string ModifiedBy { get; set; }
    }
}