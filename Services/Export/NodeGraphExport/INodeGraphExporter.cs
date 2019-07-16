using System.Threading.Tasks;
using GoNorth.Data.Kortisto;
using GoNorth.Data.NodeGraph;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.NodeGraphExport
{
    /// <summary>
    /// Interface for Rendering a node graph
    /// </summary>
    public interface INodeGraphExporter
    {
        /// <summary>
        /// Sets the error collection
        /// </summary>
        /// <param name="errorCollection">Error Collection</param>
        void SetErrorCollection(ExportPlaceholderErrorCollection errorCollection);

        /// <summary>
        /// Sets the node graph function generator to use
        /// </summary>
        /// <param name="nodeGraphFunctionGenerator">Node graph function generator</param>
        void SetNodeGraphFunctionGenerator(INodeGraphFunctionGenerator nodeGraphFunctionGenerator);

        /// <summary>
        /// Sets the node graph renderer to use
        /// </summary>
        /// <param name="nodeGraphRenderer">Node graph renderer</param>
        void SetNodeGraphRenderer(INodeGraphRenderer nodeGraphRenderer);

        /// <summary>
        /// Renders a node graph
        /// </summary>
        /// <param name="exportNodeGraph">Node graph snippet to render</param>
        /// <param name="npc">Npc to which the snippet belongs</param>
        /// <returns>Result of rendering the node graph</returns>
        Task<ExportNodeGraphRenderResult> RenderNodeGraph(NodeGraphSnippet exportNodeGraph, KortistoNpc npc);
    }
}