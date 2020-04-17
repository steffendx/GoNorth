namespace GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject
{
    /// <summary>
    /// Value field action data
    /// </summary>
    public class ValueFieldActionData
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
        /// Operator for the action data
        /// </summary>
        public string Operator { get; set; }

        /// <summary>
        /// Compare value
        /// </summary>
        public string ValueChange { get; set; }

        /// <summary>
        /// Selected Object Id
        /// </summary>
        public string ObjectId { get; set; }
    }
}