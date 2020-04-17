using System.Collections.Generic;

namespace GoNorth.Services.Export
{
    /// <summary>
    /// Result of an export operation
    /// </summary>
    public class ExportTemplateValidationResult
    {
        /// <summary>
        /// true if the template is valid
        /// </summary>
        public bool IsValid { get; set; }

        /// <summary>
        /// Errors
        /// </summary>
        public List<string> Errors { get; set; }

        /// <summary>
        /// Constructor
        /// </summary>
        public ExportTemplateValidationResult()
        {
            Errors = new List<string>();
        }
    }
}