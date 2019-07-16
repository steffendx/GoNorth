using System.Collections.Generic;
using System.Linq;
using GoNorth.Data.NodeGraph;
using GoNorth.Services.Export.Dialog;

namespace GoNorth.Services.Export.NodeGraphExport
{
    /// <summary>
    /// Class for parsing a node graph
    /// </summary>
    public class NodeGraphParser : NodeGraphBaseParser<NodeGraphSnippet>, INodeGraphParser 
    {
        /// <summary>
        /// Constructor
        /// </summary>
        public NodeGraphParser()
        {
        }

        /// <summary>
        /// Searches the dialog root node
        /// </summary>
        /// <param name="dialog">Dialog to search</param>
        /// <returns>Dialog root node</returns>
        protected ExportDialogData SearchDialogRootNode(NodeGraphSnippet dialog)
        {
            List<ExportDialogData> rootNodes = new List<ExportDialogData>();
            rootNodes.AddRange(GetRootNodesFromList(dialog.Action, dialog.Link, (e, n) => e.Action = n));
            rootNodes.AddRange(GetRootNodesFromList(dialog.Condition, dialog.Link, (e, n) => e.Condition = n));

            if(rootNodes.Count != 1)
            {
                _errorCollection.AddDialogRootNodeCountNotOne(rootNodes.Count);
                return null;
            }

            return rootNodes.First();
        }

        /// <summary>
        /// Returns the links for a node
        /// </summary>
        /// <param name="exportable">Exportable</param>
        /// <param name="dialogDataId">Dialog data id</param>
        /// <returns>Node links</returns>
        protected override List<NodeLink> GetLinksForNode(NodeGraphSnippet exportable, string dialogDataId)
        {
            return exportable.Link.Where(l => l.SourceNodeId == dialogDataId).ToList();
        }

        /// <summary>
        /// Returns the dialog data children
        /// </summary>
        /// <param name="exportable">Exportable</param>
        /// <param name="convertedDialogNodes">Converted dialog nodes</param>
        /// <param name="childLinks">Child links</param>
        /// <returns>Export dialog data children</returns>
        protected override List<ExportDialogDataChild> GetDialogDataChildren(NodeGraphSnippet exportable, Dictionary<string, ExportDialogData> convertedDialogNodes, List<NodeLink> childLinks)
        {
            List<ExportDialogDataChild> childNodes = new List<ExportDialogDataChild>();
            childNodes.AddRange(FindDialogElementChildrenInList(convertedDialogNodes, exportable.Action, childLinks, (e, n) => e.Action = n));
            childNodes.AddRange(FindDialogElementChildrenInList(convertedDialogNodes, exportable.Condition, childLinks, (e, n) => e.Condition = n));
            return childNodes;
        }

        /// <summary>
        /// Parses a node graph
        /// </summary>
        /// <param name="exportNodeGraph">Node graph snippet to parse</param>
        /// <returns>Result of parsing the node graph</returns>
        public ExportDialogData ParseNodeGraph(NodeGraphSnippet exportNodeGraph)
        {
            _currentNodeIndex = 0;
            ExportDialogData exportDialog = SearchDialogRootNode(exportNodeGraph);
            if(exportDialog == null)
            {
                return null;
            }

            IterateDialogTree(exportDialog, exportNodeGraph);

            EnsureNoInfinityLoopExists(exportDialog);

            return exportDialog;
        }
    }
}