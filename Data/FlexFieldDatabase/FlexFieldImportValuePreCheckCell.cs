namespace GoNorth.Data.FlexFieldDatabase
{
    /// <summary>
    /// Flex Field pre check cell
    /// </summary>
    public class FlexFieldImportValuePreCheckCell
    {
        /// <summary>
        /// Name of the column
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Old value
        /// </summary>
        public string OldValue { get; set; }

        /// <summary>
        /// New value
        /// </summary>
        public string NewValue { get; set; }
    }
}