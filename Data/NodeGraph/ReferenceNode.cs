using System.Collections.Generic;
using System.Linq;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.NodeGraph
{
    /// <summary>
    /// Reference Node
    /// </summary>
    public class ReferenceNode : BaseNode
    {
        /// <summary>
        /// Referenced object
        /// </summary>
        [ListCompareAttribute(LabelKey = "ReferencedObjectChanged")]
        public List<NodeObjectDependency> ReferencedObjects { get; set; }

        /// <summary>
        /// In case of a reference on a marker, the type of marker is saved here
        /// </summary>
        public string ReferencedMarkerType { get; set; }

        /// <summary>
        /// Reference text
        /// </summary>
        [ValueCompareAttribute]
        public string ReferenceText { get; set; }

        
        /// <summary>
        /// Clones the reference node
        /// </summary>
        /// <returns>Cloned object</returns>
        public object Clone()
        {
            ReferenceNode clonedObject = CloneObject<ReferenceNode>();
            clonedObject.ReferencedObjects = ReferencedObjects != null ? ReferencedObjects.Select(r => (NodeObjectDependency)r.Clone()).ToList() : null;
            clonedObject.ReferencedMarkerType = ReferencedMarkerType;
            clonedObject.ReferenceText = ReferenceText;

            return clonedObject;
        }
    }
}
