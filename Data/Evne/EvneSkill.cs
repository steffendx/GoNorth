using System;
using System.Collections.Generic;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.NodeGraph;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.Evne
{
    /// <summary>
    /// Evne Skill
    /// </summary>
    public class EvneSkill : FlexFieldObject
    {
        
        /// <summary>
        /// Text Nodes
        /// </summary>
        [ListCompareAttribute(LabelKey = "NodeTextChanged")]
        public List<TextNode> Text { get; set; } 

        /// <summary>
        /// Conditions
        /// </summary>
        [ListCompareAttribute(LabelKey = "NodeConditionsChanged")]
        public List<ConditionNode> Condition { get; set; } 

        /// <summary>
        /// Actions
        /// </summary>
        [ListCompareAttribute(LabelKey = "NodeActionsChanged")]
        public List<ActionNode> Action { get; set; } 

        /// <summary>
        /// Node Links
        /// </summary>
        [ListCompareAttribute(LabelKey = "NodeLinksChanged")]
        public List<NodeLink> Link { get; set; }

    }
}