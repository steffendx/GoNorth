using System.Collections.Generic;
using System.Linq;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.NodeGraph
{
    /// <summary>
    /// Action Node
    /// </summary>
    public class ActionNode : BaseNode
    {
        /// <summary>
        /// Action Type
        /// </summary>
        [ValueCompareAttribute(LabelKey = "", TextKey = "ActionTypeChanged")]
        public int ActionType { get; set; }

        /// <summary>
        /// Action related to object type
        /// </summary>
        public string ActionRelatedToObjectType { get; set; }

        /// <summary>
        /// Action related to object id
        /// </summary>
        public string ActionRelatedToObjectId { get; set; } 

        /// <summary>
        /// Additional Object dependencies for the action
        /// </summary>
        public List<NodeObjectDependency> ActionRelatedToAdditionalObjects { get; set; }

        /// <summary>
        /// Action Data
        /// </summary>
        [ValueCompareAttribute(LabelKey = "", TextKey = "ActionDataChanged")]
        public string ActionData { get; set; }

        
        /// <summary>
        /// Clones the action node
        /// </summary>
        /// <returns>Cloned object</returns>
        public object Clone()
        {
            ActionNode clonedObject = CloneObject<ActionNode>();
            clonedObject.ActionType = ActionType;
            clonedObject.ActionRelatedToObjectType = ActionRelatedToObjectType;
            clonedObject.ActionRelatedToObjectId = ActionRelatedToObjectId;
            clonedObject.ActionRelatedToAdditionalObjects = ActionRelatedToAdditionalObjects != null ? ActionRelatedToAdditionalObjects.Select(a => a.Clone()).Cast<NodeObjectDependency>().ToList() : null;
            clonedObject.ActionData = ActionData;

            return clonedObject;
        }
    }
}
