using System;
using System.Collections.Generic;

namespace GoNorth.Data.FlexFieldDatabase
{
    /// <summary>
    /// Flex Field import field values result log
    /// </summary>
    public class FlexFieldImportFieldValuesResultLog : IHasModifiedData
    {
        /// <summary>
        /// Id
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Project Id
        /// </summary>
        public string ProjectId { get; set; }

        /// <summary>
        /// Filename of the import file
        /// </summary>
        public string FileName { get; set; }

        /// <summary>
        /// Columns
        /// </summary>
        public List<string> Columns { get; set; }

        /// <summary>
        /// Rows that exist
        /// </summary>
        public List<FlexFieldImportValueRow> ExistingRows { get; set; }

        /// <summary>
        /// Rows that are new
        /// </summary>
        public List<FlexFieldImportValueRow> NewRows { get; set; }

        /// <summary>
        /// Last modify Date
        /// </summary>
        public DateTimeOffset ModifiedOn { get; set; }

        /// <summary>
        /// Id of the user who last modified the object
        /// </summary>
        public string ModifiedBy { get; set; }

        /// <summary>
        /// Constructor
        /// </summary>
        public FlexFieldImportFieldValuesResultLog()
        {
            ExistingRows = new List<FlexFieldImportValueRow>();
            NewRows = new List<FlexFieldImportValueRow>();
        }
    }
}