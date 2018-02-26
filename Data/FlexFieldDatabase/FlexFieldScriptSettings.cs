using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.FlexFieldDatabase
{
    /// <summary>
    /// Flex Field Script Settings
    /// </summary>
    public class FlexFieldScriptSettings : IImplementationComparable
    {
        /// <summary>
        /// true if the value should not be exported to a script, else false
        /// </summary>
        [ValueCompareAttribute]
        public bool DontExportToScript { get; set; }

        /// <summary>
        /// Additional Script Names
        /// </summary>
        [ValueCompareAttribute]
        public string AdditionalScriptNames { get; set; }
    }
}