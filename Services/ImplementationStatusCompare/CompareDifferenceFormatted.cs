using System.Collections.Generic;

namespace GoNorth.Services.ImplementationStatusCompare
{
    /// <summary>
    /// Compare Difference as formatted text
    /// </summary>
    public class CompareDifferenceFormatted
    {
        /// <summary>
        /// Label of the result
        /// </summary>
        public string Label { get; set; }

        /// <summary>
        /// Text of the result
        /// </summary>
        public string Text { get; set; }

        /// <summary>
        /// Differences in the field itself if its a complex object 
        /// </summary>
        public List<CompareDifferenceFormatted> SubDifferences { get; set; }


        /// <summary>
        /// Constructor
        /// </summary>
        public CompareDifferenceFormatted()
        {
            SubDifferences = new List<CompareDifferenceFormatted>();
        }
    };
}