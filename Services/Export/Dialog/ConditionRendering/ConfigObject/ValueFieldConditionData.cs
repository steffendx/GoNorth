namespace GoNorth.Services.Export.Dialog.ConditionRendering.ConfigObject
{
    /// <summary>
    /// Value Field Condition Data
    /// </summary>
    public class ValueFieldConditionData
    {
        /// <summary>
        /// Field Id
        /// </summary>
        public string FieldId { get; set; }

        /// <summary>
        /// Field Name
        /// </summary>
        public string FieldName { get; set; }

        /// <summary>
        /// Operator for the condition data
        /// </summary>
        public string Operator { get; set; }

        /// <summary>
        /// Compare value
        /// </summary>
        public string CompareValue { get; set; }

        /// <summary>
        /// Selected Object Id
        /// </summary>
        public string SelectedObjectId { get; set; }
    }
}