using System;

namespace GoNorth.Data.NodeGraph
{
    /// <summary>
    /// Node Object dependency
    /// </summary>
    public class NodeObjectDependency : ICloneable
    {
        /// <summary>
        /// Type of the object
        /// </summary>
        public string ObjectType { get; set; }

        /// <summary>
        /// Id of the object
        /// </summary>
        public string ObjectId { get; set; }

        /// <summary>
        /// Clones the object
        /// </summary>
        /// <returns>Cloned object</returns>
        public object Clone()
        {
            return new NodeObjectDependency {
                ObjectType = this.ObjectType,
                ObjectId = this.ObjectId
            };
        }
    }
}
