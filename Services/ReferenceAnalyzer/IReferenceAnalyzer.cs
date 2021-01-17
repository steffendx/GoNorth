using System.Collections.Generic;
using GoNorth.Data.NodeGraph;
using GoNorth.Data.Tale;

namespace GoNorth.Services.ReferenceAnalyzer
{
    /// <summary>
    /// Interface for services to build object references
    /// </summary>
    public interface IReferenceAnalyzer
    {
        /// <summary>
        /// Builds an object reference 
        /// </summary>
        /// <param name="referencedObjectId">Id of the object that is referenced and for which the references are built</param>
        /// <param name="objectId">Id of the object</param>
        /// <param name="objectName">Name of the object</param>
        /// <param name="actions">Optional actions for detailed references</param>
        /// <param name="conditions">Optional conditions for detailed references</param>
        /// <param name="referenceNodes">Optional references for detailed references</param>
        /// <param name="choices">Optional choice nodes for detailed references</param>
        /// <returns>Object reference</returns>
        ObjectReference BuildObjectReferences(string referencedObjectId, string objectId, string objectName, List<ActionNode> actions, List<ConditionNode> conditions, List<ReferenceNode> referenceNodes, List<TaleChoiceNode> choices);
    }
}