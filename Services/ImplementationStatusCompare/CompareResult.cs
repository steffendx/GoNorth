using System.Collections.Generic;

namespace GoNorth.Services.ImplementationStatusCompare
{
    /// <summary>
    /// Compare Result
    /// </summary>
    public class CompareResult
    {
        /// <summary>
        /// true if the object was implemented already, else false
        /// </summary>
        public bool DoesSnapshotExist { get; set; }

        /// <summary>
        /// Compare Differences
        /// </summary>
        public List<CompareDifference> CompareDifference { get; set; }

        /// <summary>
        /// Constructor
        /// </summary>
        public CompareResult()
        {
            CompareDifference = new List<CompareDifference>();
        }
    }
}