using System.Collections.Generic;
using System.Linq;
using GoNorth.Data.NodeGraph;
using GoNorth.Data.Tale;
using GoNorth.Services.Export.NodeGraphExport;

namespace GoNorth.Services.Export.Dialog
{
    /// <summary>
    /// Export Dialog Parser
    /// </summary>
    public class ExportDialogParser : NodeGraphBaseParser<TaleDialog>, IExportDialogParser
    {
        /// <summary>
        /// Parses a dialog for exporting
        /// </summary>
        /// <param name="dialog">Dialog to parse</param>
        /// <returns>Parsed dialog</returns>
        public ExportDialogData ParseDialog(TaleDialog dialog)
        {
            _currentNodeIndex = 0;
            ExportDialogData exportDialog = SearchDialogRootNode(dialog);
            if(exportDialog == null)
            {
                return null;
            }

            IterateDialogTree(exportDialog, dialog);

            EnsureNoInfinityLoopExists(exportDialog);

            return exportDialog;
        }

        /// <summary>
        /// Searches the dialog root node
        /// </summary>
        /// <param name="dialog">Dialog to search</param>
        /// <returns>Dialog root node</returns>
        protected ExportDialogData SearchDialogRootNode(TaleDialog dialog)
        {
            List<ExportDialogData> rootNodes = new List<ExportDialogData>();
            rootNodes.AddRange(GetRootNodesFromList(dialog.PlayerText, dialog.Link, (e, n) => e.PlayerText = n));
            rootNodes.AddRange(GetRootNodesFromList(dialog.NpcText, dialog.Link, (e, n) => e.NpcText = n));
            rootNodes.AddRange(GetRootNodesFromList(dialog.Choice, dialog.Link, (e, n) => e.Choice = n));
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
        protected override List<NodeLink> GetLinksForNode(TaleDialog exportable, string dialogDataId)
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
        protected override List<ExportDialogDataChild> GetDialogDataChildren(TaleDialog exportable, Dictionary<string, ExportDialogData> convertedDialogNodes, List<NodeLink> childLinks)
        {
            List<ExportDialogDataChild> childNodes = new List<ExportDialogDataChild>();
            childNodes.AddRange(FindDialogElementChildrenInList(convertedDialogNodes, exportable.PlayerText, childLinks, (e, n) => e.PlayerText = n));
            childNodes.AddRange(FindDialogElementChildrenInList(convertedDialogNodes, exportable.NpcText, childLinks, (e, n) => e.NpcText = n));
            childNodes.AddRange(FindDialogElementChildrenInList(convertedDialogNodes, exportable.Choice, childLinks, (e, n) => e.Choice = n));
            childNodes.AddRange(FindDialogElementChildrenInList(convertedDialogNodes, exportable.Action, childLinks, (e, n) => e.Action = n));
            childNodes.AddRange(FindDialogElementChildrenInList(convertedDialogNodes, exportable.Condition, childLinks, (e, n) => e.Condition = n));
            return childNodes;
        }

    }
}