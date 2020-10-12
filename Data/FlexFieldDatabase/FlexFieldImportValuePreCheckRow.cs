using System.Collections.Generic;

namespace GoNorth.Data.FlexFieldDatabase
{
    /// <summary>
    /// Flex Field pre check row
    /// </summary>
    public class FlexFieldImportValuePreCheckRow
    {
        /// <summary>
        /// Id of the row
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Column values
        /// </summary>
        public List<FlexFieldImportValuePreCheckCell> ColumnValues { get; set; }

        /// <summary>
        /// Constructor
        /// </summary>
        public FlexFieldImportValuePreCheckRow()
        {
            ColumnValues = new List<FlexFieldImportValuePreCheckCell>();
        }
    }
}