using System.Collections.Generic;
using System.Linq;
using GoNorth.Data.NodeGraph;
using GoNorth.Data.Tale;
using GoNorth.Services.Export.Dialog;
using GoNorth.Services.Export.Dialog.ActionRendering;
using GoNorth.Services.Export.Dialog.ActionRendering.Localization;
using GoNorth.Services.Export.Dialog.ConditionRendering;
using GoNorth.Services.Export.Dialog.ConditionRendering.Localization;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.ReferenceAnalyzer
{
    /// <summary>
    /// Service to build object references
    /// </summary>
    public class ReferenceAnalyzer : IReferenceAnalyzer
    {
        /// <summary>
        /// Translation service for actions
        /// </summary>
        private readonly IActionTranslator _actionTranslator;

        /// <summary>
        /// Translation service for conditions
        /// </summary>
        private readonly IConditionTranslator _conditionTranslator;

        /// <summary>
        /// Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="actionTranslator">Translation service for actions</param>
        /// <param name="conditionTranslator">Translation service for conditions</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public ReferenceAnalyzer(IActionTranslator actionTranslator, IConditionTranslator conditionTranslator, IStringLocalizerFactory localizerFactory)
        {
            _actionTranslator = actionTranslator;
            _conditionTranslator = conditionTranslator;
            _localizer = localizerFactory.Create(typeof(ReferenceAnalyzer));
        }

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
        public ObjectReference BuildObjectReferences(string referencedObjectId, string objectId, string objectName, List<ActionNode> actions, List<ConditionNode> conditions, List<ReferenceNode> referenceNodes, List<TaleChoiceNode> choices)
        {
            ObjectReference objReference = new ObjectReference();
            objReference.ObjectId = objectId;
            objReference.ObjectName = objectName;
            if(actions != null)
            {
                objReference.DetailedReferences.AddRange(BuildActionReferences(referencedObjectId, actions));
            }
            
            if(conditions != null)
            {
                objReference.DetailedReferences.AddRange(BuildConditionsReferences(referencedObjectId, conditions));
            }

            if(referenceNodes != null)
            {
                objReference.DetailedReferences.AddRange(BuildReferenceNodeReferences(referencedObjectId, referenceNodes));
            }

            if(choices != null)
            {
                objReference.DetailedReferences.AddRange(BuildChoicesReferences(referencedObjectId, choices));
            }

            return objReference;
        }

        /// <summary>
        /// Builds a list of references in actions
        /// </summary>
        /// <param name="referencedObjectId">Id of the object that is referenced and for which the references are built</param>
        /// <param name="actions">Actions to analyze</param>
        /// <returns>References for the object</returns>
        private IEnumerable<ObjectReference> BuildActionReferences(string referencedObjectId, List<ActionNode> actions)
        {
            return actions.Where(a => a.ActionRelatedToObjectId == referencedObjectId || (a.ActionRelatedToAdditionalObjects != null && a.ActionRelatedToAdditionalObjects.Any(a => a.ObjectId == referencedObjectId))).Select(a => new ObjectReference {
                ObjectId = a.Id,
                ObjectName = _actionTranslator.TranslateActionType((ActionType)a.ActionType)
            });
        }
        
        /// <summary>
        /// Builds a list of references in conditions
        /// </summary>
        /// <param name="referencedObjectId">Id of the object that is referenced and for which the references are built</param>
        /// <param name="conditions">Conditions to analyze</param>
        /// <returns>References for the object</returns>
        private IEnumerable<ObjectReference> BuildConditionsReferences(string referencedObjectId, List<ConditionNode> conditions)
        {
            return conditions.Where(c => c.Conditions.Any(co => co.DependsOnObjects != null && co.DependsOnObjects.Any(d => d.ObjectId == referencedObjectId))).Select(c => new ObjectReference {
                ObjectId = c.Id,
                ObjectName = string.Join("; ", c.Conditions.Where(co => co.DependsOnObjects != null && co.DependsOnObjects.Any(d => d.ObjectId == referencedObjectId)).Select(co => BuildConditionName(co.ConditionElements)))
            });
        }

        /// <summary>
        /// Builds a condition name
        /// </summary>
        /// <param name="conditionElements">Condition elements</param>
        /// <returns>Condition name</returns>
        private string BuildConditionName(string conditionElements)
        {
            List<ParsedConditionData> parsedConditionData = ConditionParsingUtil.ParseConditionElements(conditionElements);
            return string.Join(",", parsedConditionData.Select(c => _conditionTranslator.TranslateConditionType((ConditionType)c.ConditionType)));
        }
        
        /// <summary>
        /// Builds a list of references in reference nodes
        /// </summary>
        /// <param name="referencedObjectId">Id of the object that is referenced and for which the references are built</param>
        /// <param name="referenceNodes">Reference nodes to analyze</param>
        /// <returns>References for the object</returns>
        private IEnumerable<ObjectReference> BuildReferenceNodeReferences(string referencedObjectId, List<ReferenceNode> referenceNodes)
        {
            return referenceNodes.Where(r => r.ReferencedObjects != null && r.ReferencedObjects.Any(ro => ro.ObjectId == referencedObjectId)).Select(r => new ObjectReference {
                ObjectId = r.Id,
                ObjectName = !string.IsNullOrEmpty(r.ReferenceText) ? r.ReferenceText : _localizer["Reference"].Value
            });
        }
        
        /// <summary>
        /// Builds a list of references in choice nodes
        /// </summary>
        /// <param name="referencedObjectId">Id of the object that is referenced and for which the references are built</param>
        /// <param name="choices">Choices to analyze</param>
        /// <returns>References for the object</returns>
        private IEnumerable<ObjectReference> BuildChoicesReferences(string referencedObjectId, List<TaleChoiceNode> choices)
        {
            return choices.Where(c => c.Choices.Any(co => co.Condition != null && co.Condition.DependsOnObjects.Any(o => o.ObjectId == referencedObjectId))).Select(c => new ObjectReference {
                ObjectId = c.Id,
                ObjectName = string.Join("; ", c.Choices.Where(co => co.Condition != null && co.Condition.DependsOnObjects.Any(o => o.ObjectId == referencedObjectId)).Select(c => !string.IsNullOrEmpty(c.Text) ? c.Text : _localizer["EmptyChoiceText"].Value))
            });
        }
    }
}