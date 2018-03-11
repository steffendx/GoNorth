using System;
using System.Collections.Generic;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.ImplementationSnapshot;
using GoNorth.Data.NodeGraph;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.Aika
{
    /// <summary>
    /// Aika Quest
    /// </summary>
    public class AikaQuest : IHasModifiedData, IImplementationComparable, IImplementationSnapshotable, IImplementationStatusTrackingObject
    {

        /// <summary>
        /// Id of the quest
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Project Id of the quest
        /// </summary>
        public string ProjectId { get; set; }

        /// <summary>
        /// Name of the quest
        /// </summary>
        [ValueCompareAttribute]
        public string Name { get; set; }

        /// <summary>
        /// Description of the quest
        /// </summary>
        [ValueCompareAttribute]
        public string Description { get; set; }

        /// <summary>
        /// true if the quest is a main quest, else false
        /// </summary>
        [ValueCompareAttribute]
        public bool IsMainQuest { get; set; }


        /// <summary>
        /// Fields
        /// </summary>
        [ListCompareAttribute(LabelKey = "FlexFieldObjectFieldsChanged")]
        public List<FlexField> Fields { get; set; }


        /// <summary>
        /// Start
        /// </summary>
        public List<AikaStart> Start { get; set; }

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
        /// All Done Nodes
        /// </summary>
        [ListCompareAttribute(LabelKey = "NodeAllDoneChanged")]
        public List<AikaAllDone> AllDone { get; set; }

        /// <summary>
        /// Finish Nodes
        /// </summary>
        [ListCompareAttribute(LabelKey = "NodeFinishChanged")]
        public List<AikaFinish> Finish { get; set; }

        /// <summary>
        /// Node Links
        /// </summary>
        [ListCompareAttribute(LabelKey = "NodeLinksChanged")]
        public List<NodeLink> Link { get; set; }


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