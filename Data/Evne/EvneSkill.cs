using System;
using System.Collections.Generic;
using System.Linq;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.NodeGraph;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.Evne
{
    /// <summary>
    /// Evne Skill
    /// </summary>
    public class EvneSkill : FlexFieldObject, IExportSnippetExportable, ICloneable
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
        /// Reference nodes
        /// </summary>
        [ListCompareAttribute(LabelKey = "NodeReferenceChanged")]
        public List<ReferenceNode> Reference {get ; set; }

        /// <summary>
        /// Node Links
        /// </summary>
        [ListCompareAttribute(LabelKey = "NodeLinksChanged")]
        public List<NodeLink> Link { get; set; }


        /// <summary>
        /// Clones the skill
        /// </summary>
        /// <returns>Cloned Skill</returns>
        public object Clone()
        {
            EvneSkill clonedSkill = CloneObject<EvneSkill>();
            clonedSkill.Text = Text.Select(t => t.Clone()).Cast<TextNode>().ToList();
            clonedSkill.Condition = Condition.Select(t => t.Clone()).Cast<ConditionNode>().ToList();
            clonedSkill.Action = Action.Select(t => t.Clone()).Cast<ActionNode>().ToList();
            clonedSkill.Link = Link.Select(t => t.Clone()).Cast<NodeLink>().ToList();
            clonedSkill.Reference = Reference != null ? Reference.Select(t => t.Clone()).Cast<ReferenceNode>().ToList() : new List<ReferenceNode>();

            return clonedSkill;
        }
    }
}