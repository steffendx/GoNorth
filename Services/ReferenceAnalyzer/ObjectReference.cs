using System.Collections.Generic;

namespace GoNorth.Services.ReferenceAnalyzer
{
    /// <summary>
    /// Object Reference
    /// </summary>
    public class ObjectReference 
    {
        /// <summary>
        /// Id of the object
        /// </summary>
        public string ObjectId { get; set; }

        /// <summary>
        /// Name of the object
        /// </summary>
        public string ObjectName { get; set; }

        /// <summary>
        /// Detailed references where the object is referenced. These are nodes for example
        /// </summary>
        public List<ObjectReference> DetailedReferences { get; set; }

        /// <summary>
        /// Constructor
        /// </summary>
        public ObjectReference()
        {
            DetailedReferences = new List<ObjectReference>();
        }
    }
}