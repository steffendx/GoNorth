using System.Collections.Generic;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export
{
    /// <summary>
    /// Result of an export operation
    /// </summary>
    public class ExportObjectResult
    {
        /// <summary>
        /// Object Filename
        /// </summary>
        public string ObjectFilename { get; set; }

        /// <summary>
        /// File Extension
        /// </summary>
        public string FileExtension { get; set; }

        /// <summary>
        /// Code result
        /// </summary>
        public string Code { get; set; }

        /// <summary>
        /// Errors
        /// </summary>
        public List<ExportPlaceholderError> Errors { get; set; }
    }
}