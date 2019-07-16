using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.NodeGraph;
using GoNorth.Services.Export.Dialog;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.NodeGraphExport
{
    /// <summary>
    /// Interface for parsing a node graph
    /// </summary>
    public interface INodeGraphParser
    {
        /// <summary>
        /// Sets the error collection
        /// </summary>
        /// <param name="errorCollection">Error Collection</param>
        void SetErrorCollection(ExportPlaceholderErrorCollection errorCollection);

        /// <summary>
        /// Parses a node graph
        /// </summary>
        /// <param name="exportNodeGraph">Node graph snippet to parse</param>
        /// <returns>Result of parsing the node graph</returns>
        ExportDialogData ParseNodeGraph(NodeGraphSnippet exportNodeGraph);
    }
}