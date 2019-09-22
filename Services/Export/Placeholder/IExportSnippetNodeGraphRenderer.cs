using System.Collections.Generic;
using GoNorth.Services.Export.NodeGraphExport;

namespace GoNorth.Services.Export.Placeholder
{
    /// <summary>
    /// Interface for a export snippet node graph renderer
    /// </summary>
    public interface IExportSnippetNodeGraphRenderer : INodeGraphRenderer
    {
        /// <summary>
        /// Returns the export template placeholders
        /// </summary>
        /// <returns>Export Template placeholders</returns>
        List<ExportTemplatePlaceholder> GetExportTemplatePlaceholders();
    }
}