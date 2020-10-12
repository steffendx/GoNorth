namespace GoNorth.Data.FlexFieldDatabase
{
    /// <summary>
    /// Flex Field Import value import request
    /// </summary>
    public class FlexFieldImportValueImportRequest : FlexFieldImportValuePreCheckResult
    {
        /// <summary>
        /// Target Folder Id
        /// </summary>
        public string TargetFolderId { get; set; }
    }
}