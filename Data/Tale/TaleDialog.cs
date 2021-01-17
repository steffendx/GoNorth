using System;
using System.Collections.Generic;
using GoNorth.Data.ImplementationSnapshot;
using GoNorth.Data.NodeGraph;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.Tale
{
    /// <summary>
    /// Tale Dialog
    /// </summary>
    public class TaleDialog : IHasModifiedData, IImplementationComparable, IImplementationSnapshotable, IImplementationStatusTrackingObject
    {
        /// <summary>
        /// Id of the dialog
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Id of the project to which the dialog belongs
        /// </summary>
        public string ProjectId { get; set; }

        /// <summary>
        /// Id of the object the dialog belongs to
        /// </summary>
        public string RelatedObjectId { get; set; }

        /// <summary>
        /// Node Links
        /// </summary>
        [ListCompareAttribute(LabelKey = "NodeLinksChanged")]
        public List<NodeLink> Link { get; set; }

        /// <summary>
        /// Player Text Lines
        /// </summary>
        [ListCompareAttribute(LabelKey = "NodePlayerLinesChanged")]
        public List<TextNode> PlayerText { get; set; }

        /// <summary>
        /// Npc Text Lines
        /// </summary>
        [ListCompareAttribute(LabelKey = "NodeNpcLinesChanged")]
        public List<TextNode> NpcText { get; set; }

        /// <summary>
        /// Choices
        /// </summary>
        [ListCompareAttribute(LabelKey = "NodeChoicesChanged")]
        public List<TaleChoiceNode> Choice { get; set; }

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
        /// Reference nodes
        /// </summary>
        [ListCompareAttribute(LabelKey = "NodeReferenceChanged")]
        public List<ReferenceNode> Reference {get ; set; }


        /// <summary>
        /// true if the object is implemented, else false
        /// </summary>
        public bool IsImplemented { get; set; }


        /// <summary>
        /// Last modify Date
        /// </summary>
        public DateTimeOffset ModifiedOn { get; set; }

        /// <summary>
        /// Id of the user who last modified the page
        /// </summary>
        public string ModifiedBy { get; set; }
    }
}
