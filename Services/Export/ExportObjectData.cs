using System.Collections.Generic;

namespace GoNorth.Services.Export
{
    /// <summary>
    /// Data of an object to export
    /// </summary>
    public class ExportObjectData
    {
        /// <summary>
        /// Export Data
        /// </summary>
        public Dictionary<string, object> ExportData { get; set; }

        /// <summary>
        /// Constructor
        /// </summary>
        public ExportObjectData()
        {
            ExportData = new Dictionary<string, object>();
        }
    }
}