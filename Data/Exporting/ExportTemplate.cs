using System;
using System.Collections.Generic;

namespace GoNorth.Data.Exporting
{
    /// <summary>
    /// Export Template
    /// </summary>
    public class ExportTemplate : IHasModifiedData
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
        /// Id of the object for which this template is a customized template
        /// </summary>
        public string CustomizedObjectId { get; set; }

        /// <summary>
        /// Category to which this template belongs
        /// </summary>
        public TemplateCategory Category { get; set; }

        /// <summary>
        /// Type of the template
        /// </summary>
        public TemplateType TemplateType { get; set; }

        /// <summary>
        /// Export Snippets of the template
        /// </summary>
        public List<ExportTemplateSnippet> ExportSnippets { get; set; }

        /// <summary>
        /// References to include export templates
        /// </summary>
        public List<IncludeExportTemplateReference> UsedIncludeTemplates { get; set; }

        /// <summary>
        /// Code of the template
        /// </summary>
        public string Code { get; set; }

        /// <summary>
        /// Rendering engine
        /// </summary>
        public ExportTemplateRenderingEngine RenderingEngine { get; set; }


        /// <summary>
        /// Last modify Date
        /// </summary>
        public DateTimeOffset ModifiedOn { get; set; }

        /// <summary>
        /// Id of the user who last modified the template
        /// </summary>
        public string ModifiedBy { get; set; }


        /// <summary>
        /// Constructor
        /// </summary>
        public ExportTemplate()
        {
            // Support for old templates
            RenderingEngine = ExportTemplateRenderingEngine.Legacy;
        }
    };
}