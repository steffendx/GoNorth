namespace GoNorth.Services.ReferenceAnalyzer
{
    /// <summary>
    /// Object Reference with a type
    /// </summary>
    public class ObjectReferenceWithType : ObjectReference
    {
        /// <summary>
        /// Type of the object
        /// </summary>
        public ObjectReferenceType ObjectType { get; set; }

        /// <summary>
        /// Creates an object reference with a type from an object reference
        /// </summary>
        /// <param name="objRef">Object reference</param>
        /// <param name="objectType">Type of the object</param>
        /// <returns>Cloned object reference</returns>
        public static ObjectReferenceWithType FromObjectReference(ObjectReference objRef, ObjectReferenceType objectType)
        {
            return new ObjectReferenceWithType {
                ObjectId = objRef.ObjectId,
                ObjectName = objRef.ObjectName,
                DetailedReferences = objRef.DetailedReferences,
                ObjectType = objectType
            };
        }
    }
}