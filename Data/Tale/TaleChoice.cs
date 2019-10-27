using System.Text.Json.Serialization;
using GoNorth.Data.NodeGraph;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.Tale
{
    /// <summary>
    /// Tale Choice
    /// </summary>
    public class TaleChoice : IImplementationListComparable
    {
        /// <summary>
        /// Id of the choice
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Text of the choice
        /// </summary>
        [ValueCompareAttribute]
        public string Text { get; set; }

        /// <summary>
        /// true if the choice can be selected multiple times, else false
        /// </summary>
        [ValueCompareAttribute]
        public bool IsRepeatable { get; set; }

        /// <summary>
        /// Optional condition of the choice
        /// </summary>
        [ValueCompareAttribute]
        public Condition Condition { get; set; }

        
        /// <summary>
        /// Id which is used in a list compare to detect deleted or new objects
        /// </summary>
        [JsonIgnore]
        public string ListComparableId { get { return Id.ToString(); } }

        /// <summary>
        /// Value which is used in a list compare for display
        /// </summary>
        [JsonIgnore]
        public CompareDifferenceValue ListComparableValue { get { return new CompareDifferenceValue("Choice", CompareDifferenceValue.ValueResolveType.LanguageKey); } }
    }
}
