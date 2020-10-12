namespace GoNorth.Data.FlexFieldDatabase
{
    /// <summary>
    /// Flex Field pre check row
    /// </summary>
    public class FlexFieldImportValueRow : FlexFieldImportValuePreCheckRow
    {
        /// <summary>
        /// Result of the import
        /// </summary>
        public FlexFieldImportValueRowResult Result { get; set; }

        /// <summary>
        /// Error message
        /// </summary>
        public string ErrorMessage { get; set; }
    }
}