using System.Collections.Generic;
using GoNorth.Data.NodeGraph;
using GoNorth.Services.Export.Json;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.NodeGraph
{
    /// <summary>
    /// Condition
    /// </summary>
    public class Condition : IImplementationListComparable
    {
        /// <summary>
        /// Condition Id
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Object dependencies for the condition
        /// </summary>
        public List<ConditionObjectDependency> DependsOnObjects { get; set; }

        /// <summary>
        /// Serialized condition elements
        /// </summary>
        [ValueCompareAttribute(LabelKey = "", TextKey = "ConditionDataChanged")]
        public string ConditionElements { get; set; }


        /// <summary>
        /// Id which is used in a list compare to detect deleted or new objects
        /// </summary>
        [JsonExportIgnoreAttribute]
        public string ListComparableId { get { return Id.ToString(); } }

        /// <summary>
        /// Value which is used in a list compare for display
        /// </summary>
        [JsonExportIgnoreAttribute]
        public CompareDifferenceValue ListComparableValue { get { return new CompareDifferenceValue("Condition", CompareDifferenceValue.ValueResolveType.LanguageKey); } }
    }
}
