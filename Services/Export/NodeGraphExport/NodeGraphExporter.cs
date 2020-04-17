using System.Threading.Tasks;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.NodeGraph;
using GoNorth.Services.Export.Dialog;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.NodeGraphExport
{
    /// <summary>
    /// Class for exporting a node graph
    /// </summary>
    public class NodeGraphExporter : INodeGraphExporter
    {
        /// <summary>
        /// Node graph parser
        /// </summary>
        private readonly INodeGraphParser _nodeGraphParser;

        /// <summary>
        /// Node graph function generator
        /// </summary>
        private INodeGraphFunctionGenerator _nodeGraphFunctionGenerator;

        /// <summary>
        /// Node graph renderer
        /// </summary>
        private INodeGraphRenderer _nodeGraphRenderer;

        /// <summary>
        /// Error Collection
        /// </summary>
        private ExportPlaceholderErrorCollection _errorCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="nodeGraphParser">Node graph parser</param>
        public NodeGraphExporter(INodeGraphParser nodeGraphParser)
        {
            _nodeGraphParser = nodeGraphParser;
            _nodeGraphFunctionGenerator = null;
            _nodeGraphRenderer = null;
            _errorCollection = null;
        }

        /// <summary>
        /// Sets the error collection
        /// </summary>
        /// <param name="errorCollection">Error Collection</param>
        public void SetErrorCollection(ExportPlaceholderErrorCollection errorCollection)
        {
            // Ensure to use most outer error collection
            if(_errorCollection == null)
            {
                _errorCollection = errorCollection;
            }
        }

        /// <summary>
        /// Sets the node graph function generator to use
        /// </summary>
        /// <param name="nodeGraphFunctionGenerator">Node graph function generator</param>
        public void SetNodeGraphFunctionGenerator(INodeGraphFunctionGenerator nodeGraphFunctionGenerator)
        {
            _nodeGraphFunctionGenerator = nodeGraphFunctionGenerator;
        }
        
        /// <summary>
        /// Sets the node graph renderer to use
        /// </summary>
        /// <param name="nodeGraphRenderer">Node graph renderer</param>
        public void SetNodeGraphRenderer(INodeGraphRenderer nodeGraphRenderer)
        {
            _nodeGraphRenderer = nodeGraphRenderer;
        }

        /// <summary>
        /// Renders a node graph
        /// </summary>
        /// <param name="exportNodeGraph">Node graph snippet to render</param>
        /// <param name="flexFieldObject">Flex field object to which the snippet belongs</param>
        /// <returns>Result of rendering the node graph</returns>
        public async Task<ExportNodeGraphRenderResult> RenderNodeGraph(NodeGraphSnippet exportNodeGraph, FlexFieldObject flexFieldObject)
        {
            _nodeGraphParser.SetErrorCollection(_errorCollection);
            ExportDialogData exportData = _nodeGraphParser.ParseNodeGraph(exportNodeGraph);

            ExportNodeGraphRenderResult renderResult;
            if(exportData != null)
            {
                exportData = await _nodeGraphFunctionGenerator.GenerateFunctions(flexFieldObject.ProjectId, flexFieldObject.Id, exportData, _errorCollection);

                _nodeGraphRenderer.SetErrorCollection(_errorCollection);
                renderResult = await _nodeGraphRenderer.RenderNodeGraph(exportData, flexFieldObject);
            }
            else
            {
                renderResult = new ExportNodeGraphRenderResult();
                renderResult.StartStepCode = string.Empty;
                renderResult.AdditionalFunctionsCode = string.Empty;
            }

            return renderResult;
        }
    }
}