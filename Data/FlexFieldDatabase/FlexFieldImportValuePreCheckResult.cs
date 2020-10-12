using System.Collections.Generic;

namespace GoNorth.Data.FlexFieldDatabase
{
    /// <summary>
    /// Flex Field Import value precheck result
    /// </summary>
    public class FlexFieldImportValuePreCheckResult
    {
        /// <summary>
        /// Import Filename
        /// </summary>
        public string Filename { get; set; }

        /// <summary>
        /// Template Id
        /// </summary>
        public string TemplateId { get; set; }

        /// <summary>
        /// Columns
        /// </summary>
        public List<string> Columns { get; set; }

        /// <summary>
        /// Rows that exist
        /// </summary>
        public List<FlexFieldImportValuePreCheckRow> ExistingRows { get; set; }

        /// <summary>
        /// Rows that are new
        /// </summary>
        public List<FlexFieldImportValuePreCheckRow> NewRows { get; set; }

        /// <summary>
        /// Constructor
        /// </summary>
        public FlexFieldImportValuePreCheckResult()
        {
            Columns = new List<string>();
            ExistingRows = new List<FlexFieldImportValuePreCheckRow>();
            NewRows = new List<FlexFieldImportValuePreCheckRow>();
        }
    }
}