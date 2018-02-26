using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.FlexFieldDatabase
{
    /// <summary>
    /// Flex Field
    /// </summary>
    public class FlexField : IImplementationListComparable
    {
        /// <summary>
        /// Id of the field
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Field Type
        /// </summary>
        public int FieldType { get; set; }

        /// <summary>
        /// Name
        /// </summary>
        [ValueCompareAttribute]
        public string Name { get; set; }

        /// <summary>
        /// Value
        /// </summary>
        [ValueCompareAttribute]
        public string Value { get; set; }

        /// <summary>
        /// Script Settings
        /// </summary>
        [ValueCompareAttribute]
        public FlexFieldScriptSettings ScriptSettings { get; set; }


        /// <summary>
        /// Id which is used in a list compare to detect deleted or new objects
        /// </summary>
        public string ListComparableId { get { return Id; } }

        /// <summary>
        /// Value which is used in a list compare for display
        /// </summary>
        public CompareDifferenceValue ListComparableValue { get { return new CompareDifferenceValue(Name, CompareDifferenceValue.ValueResolveType.None); } }
    }
}