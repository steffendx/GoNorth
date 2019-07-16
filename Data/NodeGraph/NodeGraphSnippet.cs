using System.Collections.Generic;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.NodeGraph
{
    /// <summary>
    /// Node Graph Snippet
    /// </summary>
    public class NodeGraphSnippet : IImplementationComparable
    {
        /// <summary>
        /// Node Links
        /// </summary>
        [ListCompareAttribute(LabelKey = "NodeLinksChanged")]
        public List<NodeLink> Link { get; set; }
        
        /// <summary>
        /// Actions
        /// </summary>
        [ListCompareAttribute(LabelKey = "NodeActionsChanged")]
        public List<ActionNode> Action { get; set; } 

        /// <summary>
        /// Conditions
        /// </summary>
        [ListCompareAttribute(LabelKey = "NodeConditionsChanged")]
        public List<ConditionNode> Condition { get; set; } 


    }
}