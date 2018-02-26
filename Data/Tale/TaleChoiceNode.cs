using System.Collections.Generic;
using GoNorth.Data.NodeGraph;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.Tale
{
    /// <summary>
    /// Tale Choice Node
    /// </summary>
    public class TaleChoiceNode : BaseNode
    {
        /// <summary>
        /// Choices
        /// </summary>
        [ListCompareAttribute(LabelKey = "ChoicesChanged")]
        public List<TaleChoice> Choices { get; set; }

        /// <summary>
        /// Current Choice Id
        /// </summary>
        public int CurrentChoiceId { get; set; }
    }
}
