using System;
using System.Collections.Generic;
using System.Linq;
using GoNorth.Data.NodeGraph;
using GoNorth.Data.Tale;
using GoNorth.Services.Export.Dialog;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.NodeGraphExport
{
    /// <summary>
    /// Node Graph Base Parser
    /// </summary>
    public abstract class NodeGraphBaseParser<ParseClass>
    {
        /// <summary>
        /// Current node index
        /// </summary>
        protected int _currentNodeIndex;

        /// <summary>
        /// Error Collection
        /// </summary>
        protected ExportPlaceholderErrorCollection _errorCollection;


        /// <summary>
        /// Returns the links for a node
        /// </summary>
        /// <param name="exportable">Exportable</param>
        /// <param name="dialogDataId">Dialog data id</param>
        /// <returns>Node links</returns>
        protected abstract List<NodeLink> GetLinksForNode(ParseClass exportable, string dialogDataId);

        /// <summary>
        /// Returns the dialog data children
        /// </summary>
        /// <param name="exportable">Exportable</param>
        /// <param name="convertedDialogNodes">Converted dialog nodes</param>
        /// <param name="childLinks">Child links</param>
        /// <returns>Export dialog data children</returns>
        protected abstract List<ExportDialogDataChild> GetDialogDataChildren(ParseClass exportable, Dictionary<string, ExportDialogData> convertedDialogNodes, List<NodeLink> childLinks);


        /// <summary>
        /// Sets the error collection
        /// </summary>
        /// <param name="errorCollection">Error Collection</param>
        public void SetErrorCollection(ExportPlaceholderErrorCollection errorCollection)
        {
            _errorCollection = errorCollection;
        }

        /// <summary>
        /// Extracts the root nodes from a list
        /// </summary>
        /// <param name="nodeList">Node List</param>
        /// <param name="links">Links</param>
        /// <param name="assignExportProperty">Action to assign the nodes to the export dialog property</param>
        /// <typeparam name="T">Type of the node</typeparam>
        /// <returns>List of root nodes</returns>
        protected List<ExportDialogData> GetRootNodesFromList<T>(List<T> nodeList, List<NodeLink> links, Action<ExportDialogData, T> assignExportProperty) where T : BaseNode
        {
            if(nodeList == null || links == null)
            {
                return new List<ExportDialogData>();
            }

            List<T> rootNodes = nodeList.Where(n => !links.Any(l => l.TargetNodeId == n.Id)).ToList();
            return rootNodes.Select(n => { 
                ExportDialogData dialogData = GetNewDialogData();
                dialogData.Id = n.Id;
                assignExportProperty(dialogData, n);
                return dialogData;
            }).ToList();
        }

        
        /// <summary>
        /// Iterates the dialog tree
        /// </summary>
        /// <param name="exportDialog">Export Dialog Data at the moment</param>
        /// <param name="exportable">Exportable</param>
        protected void IterateDialogTree(ExportDialogData exportDialog, ParseClass exportable)
        {
            Dictionary<string, ExportDialogData> convertedDialogNodes = new Dictionary<string, ExportDialogData>();
            convertedDialogNodes.Add(exportDialog.Id, exportDialog);

            Queue<ExportDialogData> dialogDataToQueue = new Queue<ExportDialogData>();
            dialogDataToQueue.Enqueue(exportDialog);

            while(dialogDataToQueue.Any())
            {
                ExportDialogData curData = dialogDataToQueue.Dequeue();

                List<ExportDialogDataChild> children = FindDialogElementChildren(convertedDialogNodes, curData, exportable);
                if(curData.Choice != null)
                {
                    children = SortChildrenByChoices(children, curData.Choice);
                }
                else if(curData.Condition != null)
                {
                    children = SortChildrenByConditions(children, curData.Condition);
                }
                curData.Children.AddRange(children);

                foreach(ExportDialogDataChild curChild in children)
                {
                    curChild.Child.Parents.Add(curData);
                    if(!convertedDialogNodes.ContainsKey(curChild.Child.Id))
                    {
                        dialogDataToQueue.Enqueue(curChild.Child);
                        convertedDialogNodes.Add(curChild.Child.Id, curChild.Child);
                    }
                }
            }
        }

        /// <summary>
        /// Finds the children of da dialog element
        /// </summary>
        /// <param name="convertedDialogNodes">Already converted nodes</param>
        /// <param name="dialogData">Dialog data whichs children are searched</param>
        /// <param name="exportable">Exportable</param>
        /// <returns>Children of the element</returns>
        protected List<ExportDialogDataChild> FindDialogElementChildren(Dictionary<string, ExportDialogData> convertedDialogNodes, ExportDialogData dialogData, ParseClass exportable)
        {
            List<NodeLink> childLinks = GetLinksForNode(exportable, dialogData.Id);
            List<ExportDialogDataChild> childNodes = GetDialogDataChildren(exportable, convertedDialogNodes, childLinks);
            return childNodes;
        }

        /// <summary>
        /// Finds the children of da dialog element
        /// </summary>
        /// <param name="convertedDialogNodes">Already converted nodes</param>
        /// <param name="nodeList">Dialog data whichs children are searched</param>
        /// <param name="links">Links</param>
        /// <param name="assignExportProperty">Action to assign the nodes to the export dialog property</param>
        /// <typeparam name="T">Type of the node</typeparam>
        /// <returns>Children of the element</returns>
        protected List<ExportDialogDataChild> FindDialogElementChildrenInList<T>(Dictionary<string, ExportDialogData> convertedDialogNodes, List<T> nodeList, List<NodeLink> links, Action<ExportDialogData, T> assignExportProperty) where T : BaseNode
        {
            if(nodeList == null || links == null)
            {
                return new List<ExportDialogDataChild>();
            }

            List<T> childNodes = nodeList.Where(n => links.Any(l => l.TargetNodeId == n.Id)).ToList();
            return childNodes.Select(n => { 
                int childId = 0;
                NodeLink childNode = links.FirstOrDefault(l => l.TargetNodeId == n.Id);
                if(childNode != null && childNode.SourceNodePort != null)
                {
                    if(childNode.SourceNodePort.ToLowerInvariant() != "else")
                    {
                        string childIdStr = childNode.SourceNodePort.Replace("choice", string.Empty).Replace("condition", string.Empty);
                        int.TryParse(childIdStr, out childId);
                    }
                    else
                    {
                        childId = ExportConstants.ConditionElseNodeChildId;
                    }
                }

                if(convertedDialogNodes.ContainsKey(n.Id))
                {
                    return new ExportDialogDataChild {
                        NodeChildId = childId,
                        Child = convertedDialogNodes[n.Id]
                    };
                }

                ExportDialogData dialogData = GetNewDialogData();
                dialogData.Id = n.Id;
                assignExportProperty(dialogData, n);

                return new ExportDialogDataChild {
                    NodeChildId = childId,
                    Child = dialogData
                };
            }).ToList();
        }

        /// <summary>
        /// Sorts the children by choices for better readability
        /// </summary>
        /// <param name="children">Children to sort</param>
        /// <param name="choice">Choice node</param>
        /// <returns>Sorted Children</returns>
        protected List<ExportDialogDataChild> SortChildrenByChoices(List<ExportDialogDataChild> children, TaleChoiceNode choice)
        {
            List<ExportDialogDataChild> sortedChildren = new List<ExportDialogDataChild>();
            foreach(TaleChoice curChoide in choice.Choices)
            {
                ExportDialogDataChild curChild = children.FirstOrDefault(c => c.NodeChildId == curChoide.Id);
                if(curChild != null)
                {
                    sortedChildren.Add(curChild);
                    children.Remove(curChild);
                }
            }
            sortedChildren.AddRange(children);

            return sortedChildren;
        }

        /// <summary>
        /// Sorts the children by conditions for better readability
        /// </summary>
        /// <param name="children">Children to sort</param>
        /// <param name="condition">Condition node</param>
        /// <returns>Sorted Children</returns>
        protected List<ExportDialogDataChild> SortChildrenByConditions(List<ExportDialogDataChild> children, ConditionNode condition)
        {
            List<ExportDialogDataChild> sortedChildren = new List<ExportDialogDataChild>();
            foreach(Condition curCondition in condition.Conditions)
            {
                ExportDialogDataChild curChild = children.FirstOrDefault(c => c.NodeChildId == curCondition.Id);
                if(curChild != null)
                {
                    sortedChildren.Add(curChild);
                    children.Remove(curChild);
                }
            }
            sortedChildren.AddRange(children);

            return sortedChildren;
        }


        /// <summary>
        /// Ensures that no infinity loop exists
        /// </summary>
        /// <param name="exportDialog">Export Dialog data</param>
        protected void EnsureNoInfinityLoopExists(ExportDialogData exportDialog)
        {
            HashSet<ExportDialogData> usedDialogData = new HashSet<ExportDialogData>();
            Queue<ExportDialogData> dataToCheck = new Queue<ExportDialogData>();
            dataToCheck.Enqueue(exportDialog);
            usedDialogData.Add(exportDialog);

            while(dataToCheck.Any())
            {
                ExportDialogData curData = dataToCheck.Dequeue();
                if(!curData.NotPartOfInfinityLoop)
                {
                    HashSet<ExportDialogData> checkedNodes = new HashSet<ExportDialogData>();
                    if(!CheckIfDialogDataCanReachEndOfDialog(curData, checkedNodes))
                    {
                        _errorCollection.AddDialogInfinityLoopError();
                        break;
                    }
                }

                foreach(ExportDialogDataChild curChild in curData.Children)
                {
                    if(!usedDialogData.Contains(curChild.Child))
                    {
                        dataToCheck.Enqueue(curChild.Child);
                        usedDialogData.Add(curChild.Child);
                    }
                }
            }
        }

        /// <summary>
        /// Checks if a dialog node can reach the end of a dialog or is part of an infinity loop
        /// </summary>
        /// <param name="curData">Cur Data to check</param>
        /// <param name="checkedNodes">Checked nodes for this run</param>
        /// <returns>true if the dialog can reach the end of the dialog, else false</returns>
        protected bool CheckIfDialogDataCanReachEndOfDialog(ExportDialogData curData, HashSet<ExportDialogData> checkedNodes)
        {
            checkedNodes.Add(curData);
            if(curData.NotPartOfInfinityLoop || curData.Children == null || curData.Children.Count == 0 || ChoiceNodeHasChoiceWithNoChild(curData) || ConditionNodeHasConditionWithNoChild(curData))
            {
                curData.NotPartOfInfinityLoop = true;
                return true;
            }

            foreach(ExportDialogDataChild curChild in curData.Children)
            {
                if(checkedNodes.Contains(curChild.Child))
                {
                    continue;
                }

                if(CheckIfDialogDataCanReachEndOfDialog(curChild.Child, checkedNodes))
                {
                    // Save node is not part of an infinity loop to save performance by not having to travel the whole tree for every node again
                    curData.NotPartOfInfinityLoop = true;
                    return true;
                }
            }

            return false;
        }

        /// <summary>
        /// Checks if a choice node has a choice with no child
        /// </summary>
        /// <param name="curData">Cur Data to for choice node</param>
        /// <returns>true if the choice node has a choice with no child</returns>
        protected bool ChoiceNodeHasChoiceWithNoChild(ExportDialogData curData)
        {
            if(curData.Choice == null || curData.Choice.Choices == null)
            {
                return false;
            }

            foreach(TaleChoice curChoice in curData.Choice.Choices)
            {
                if(!curData.Children.Any(f => f.NodeChildId == curChoice.Id))
                {
                    return true;
                }
            }
            return false;
        }

        /// <summary>
        /// Checks if a condition node has a condition with no child
        /// </summary>
        /// <param name="curData">Cur Data to for condition node</param>
        /// <returns>true if the condition node has a condition with no child</returns>
        protected bool ConditionNodeHasConditionWithNoChild(ExportDialogData curData)
        {
            if(curData.Condition == null || curData.Condition.Conditions == null)
            {
                return false;
            }

            foreach(Condition curCondition in curData.Condition.Conditions)
            {
                if(!curData.Children.Any(f => f.NodeChildId == curCondition.Id))
                {
                    return true;
                }
            }
            return false;
        }


        /// <summary>
        /// Returns a new dialog datas
        /// </summary>
        /// <returns>Dialog data with assigned index</returns>
        protected ExportDialogData GetNewDialogData()
        {
            ++_currentNodeIndex;
            return new ExportDialogData {
                NodeIndex = _currentNodeIndex
            };
        }

    }
}