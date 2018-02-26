using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.NodeGraph
{
    /// <summary>
    /// Node Graph Base Node
    /// </summary>
    public class BaseNode : IImplementationListComparable
    {
        /// <summary>
        /// Id of the dialog
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// X-Coordinate
        /// </summary>
        public float X { get; set; }

        /// <summary>
        /// Y-Coordinate
        /// </summary>
        public float Y { get; set; }


        /// <summary>
        /// Id which is used in a list compare to detect deleted or new objects
        /// </summary>
        public string ListComparableId { get { return Id; } }

        /// <summary>
        /// Value which is used in a list compare for display
        /// </summary>
        public CompareDifferenceValue ListComparableValue { get { return new CompareDifferenceValue("Node", CompareDifferenceValue.ValueResolveType.LanguageKey); } }
    }
}
