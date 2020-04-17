using System;

namespace GoNorth.Data.Exporting
{
    /// <summary>
    /// Include Export Template
    /// </summary>
    public class IncludeExportTemplate : IHasModifiedData
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
        /// Name of the template
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Code of the template
        /// </summary>
        public string Code { get; set; }


        /// <summary>
        /// Last modify Date
        /// </summary>
        public DateTimeOffset ModifiedOn { get; set; }

        /// <summary>
        /// Id of the user who last modified the template
        /// </summary>
        public string ModifiedBy { get; set; }
    };
}