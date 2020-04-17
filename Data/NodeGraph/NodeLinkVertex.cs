using System;

namespace GoNorth.Data.NodeGraph
{
    /// <summary>
    /// Node Link Vertex
    /// </summary>
    public class NodeLinkVertex : ICloneable
    {
        /// <summary>
        /// X-Coordinate of the link vertex
        /// </summary>
        public float X { get; set; }

        /// <summary>
        /// Y-Coordinate of the link vertex
        /// </summary>
        public float Y { get; set; }

        /// <summary>
        /// Clones the object
        /// </summary>
        /// <returns>Cloned object</returns>
        public object Clone()
        {
            return new NodeLinkVertex {
                X = this.X,
                Y = this.Y
            };
        }
    }
}
