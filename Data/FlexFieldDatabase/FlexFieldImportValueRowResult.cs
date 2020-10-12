namespace GoNorth.Data.FlexFieldDatabase
{
    /// <summary>
    /// Result of a row import
    /// </summary>
    public enum FlexFieldImportValueRowResult
    {
        /// <summary>
        /// Successful import
        /// </summary>
        Success = 0,

        /// <summary>
        /// Failed import
        /// </summary>
        Failed = 1,

        /// <summary>
        /// No change
        /// </summary>
        NoChange = 2
    }
}