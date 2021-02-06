using System;
using GoNorth.Data.NodeGraph;

namespace GoNorth.Data.StateMachines
{
    /// <summary>
    /// State machine start / end
    /// </summary>
    public class StateMachineStartEnd : BaseNode, ICloneable
    {
        /// <summary>
        /// Clones the text node
        /// </summary>
        /// <returns>Cloned object</returns>
        public object Clone()
        {
            return CloneObject<StateMachineStartEnd>();
        }
    }
}