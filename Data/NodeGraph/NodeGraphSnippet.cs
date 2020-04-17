using System;
using System.Collections.Generic;
using System.Linq;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.NodeGraph
{
    /// <summary>
    /// Node Graph Snippet
    /// </summary>
    public class NodeGraphSnippet : IImplementationComparable, ICloneable
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

        /// <summary>
        /// Clones the node graph snippet
        /// </summary>
        /// <returns>Cloned node graph snippet</returns>
        public object Clone()
        {
            return new NodeGraphSnippet {
                Link = this.Link != null ? this.Link.Select(l => l.Clone()).Cast<NodeLink>().ToList() : null,
                Action = this.Action != null ? this.Action.Select(l => l.Clone()).Cast<ActionNode>().ToList() : null,
                Condition = this.Condition != null ? this.Condition.Select(l => l.Clone()).Cast<ConditionNode>().ToList() : null
            };
        }
    }
}