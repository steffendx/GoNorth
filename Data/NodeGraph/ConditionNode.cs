using System.Collections.Generic;
using System.Linq;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.NodeGraph
{
    /// <summary>
    /// Condition Node
    /// </summary>
    public class ConditionNode : BaseNode
    {
        /// <summary>
        /// Conditions
        /// </summary>
        [ListCompareAttribute(LabelKey = "ConditionsChanged")]
        public List<Condition> Conditions { get; set; }

        /// <summary>
        /// Current Condition Id
        /// </summary>
        public int CurrentConditionId { get; set; }


        /// <summary>
        /// Clones the condition node
        /// </summary>
        /// <returns>Cloned object</returns>
        public object Clone()
        {
            ConditionNode clonedObject = CloneObject<ConditionNode>();
            clonedObject.Conditions = Conditions != null ? Conditions.Select(c => c.Clone()).Cast<Condition>().ToList() : null;
            clonedObject.CurrentConditionId = CurrentConditionId;

            return clonedObject;
        }
    }
}
