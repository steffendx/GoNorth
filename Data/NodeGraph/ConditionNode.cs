using System.Collections.Generic;
using GoNorth.Data.NodeGraph;
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
    }
}
