using System.Threading.Tasks;
using GoNorth.Data.Kortisto;
using GoNorth.Services.Export.Dialog;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.NodeGraphExport
{
    /// <summary>
    /// Interface to render a node graph
    /// </summary>
    public interface INodeGraphRenderer
    {
        /// <summary>
        /// Sets the error collection
        /// </summary>
        /// <param name="errorCollection">Error Collection</param>
        void SetErrorCollection(ExportPlaceholderErrorCollection errorCollection);

        /// <summary>
        /// Renders a node graph
        /// </summary>
        /// <param name="exportNodeGraph">Node graph snippet to parse</param>
        /// <param name="npc">Npc to which the node graph belongs</param>
        /// <returns>Result of parsing the node graph</returns>
        Task<ExportNodeGraphRenderResult> RenderNodeGraph(ExportDialogData exportNodeGraph, KortistoNpc npc);
    }
}