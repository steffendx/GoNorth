using System.Collections.Generic;

namespace GoNorth.Services.CsvHandling
{
    /// <summary>
    /// Reading result for a csv
    /// </summary>
    public class CsvReadResult
    {
        /// <summary>
        /// Read Columns
        /// </summary>
        public List<string> Columns { get; set; }

        /// <summary>
        /// Read Rows
        /// </summary>
        public List<Dictionary<string, string>> Rows { get; set; }

        /// <summary>
        /// Constructor
        /// </summary>
        public CsvReadResult()
        {
            Columns = new List<string>();
            Rows = new List<Dictionary<string, string>>();
        }
    }
}
