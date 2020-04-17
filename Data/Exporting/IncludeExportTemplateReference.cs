using System;

namespace GoNorth.Data.Exporting
{
    /// <summary>
    /// Include Export Template reference
    /// </summary>
    public class IncludeExportTemplateReference
    {
        /// <summary>
        /// Id of the include template
        /// </summary>
        public string IncludeTemplateId { get; set; }

        /// <summary>
        /// Name of the include template that was used
        /// </summary>
        public string Name { get; set; }
    };
}