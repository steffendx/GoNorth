using System.Collections.Generic;

namespace GoNorth.Services.ImplementationStatusCompare
{
    /// <summary>
    /// Compare Difference
    /// </summary>
    public class CompareDifference
    {
        /// <summary>
        /// Name of the result
        /// </summary>
        public CompareDifferenceValue Name { get; set; }

        /// <summary>
        /// New Value
        /// </summary>
        public CompareDifferenceValue NewValue { get; set; }

        /// <summary>
        /// Old Value
        /// </summary>
        public CompareDifferenceValue OldValue { get; set; }

        /// <summary>
        /// Language Key used for label, "" to use default based on propertyname
        /// </summary>
        public string LabelKey { get; set; }

        /// <summary>
        /// Language Key used for text, "" to use default
        /// </summary>
        public string TextKey { get; set; }

        /// <summary>
        /// Differences in the field itself if its a complex object 
        /// </summary>
        public List<CompareDifference> SubDifferences { get; set; }


        /// <summary>
        /// Constructor
        /// </summary>
        public CompareDifference()
        {
            SubDifferences = new List<CompareDifference>();
        }
    };
}