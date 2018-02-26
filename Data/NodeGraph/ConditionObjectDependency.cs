using System.Collections.Generic;
using GoNorth.Data.NodeGraph;

namespace GoNorth.Data.NodeGraph
{
    /// <summary>
    /// Condition Object dependency
    /// </summary>
    public class ConditionObjectDependency
    {
        /// <summary>
        /// Type of the object
        /// </summary>
        public string ObjectType { get; set; }

        /// <summary>
        /// Id of the object
        /// </summary>
        public string ObjectId { get; set; }
    }
}
