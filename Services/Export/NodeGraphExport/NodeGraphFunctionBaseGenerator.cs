using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Services.Export.Dialog;
using GoNorth.Services.Export.Dialog.ActionRendering;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.NodeGraphExport
{
    /// <summary>
    /// Export Dialog Function Generator
    /// </summary>
    public abstract class ExportGraphFunctionBaseGenerator
    {
        /// <summary>
        /// Condition Provider
        /// </summary>
        protected readonly IDialogFunctionGenerationConditionProvider _dialogFunctionGenerationConditionProvider;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="dialogFunctionGenerationConditionProvider">Condition Provider</param>
        public ExportGraphFunctionBaseGenerator(IDialogFunctionGenerationConditionProvider dialogFunctionGenerationConditionProvider)
        {
            _dialogFunctionGenerationConditionProvider = dialogFunctionGenerationConditionProvider;
        }        

        /// <summary>
        /// Returns a new step function
        /// </summary>
        /// <param name="stepType">Stype type (Text, Choice)</param>
        /// <param name="projectId">Project id</param>
        /// <param name="objectId">Object Id</param>
        /// <param name="functionObjectId">Function object id</param>
        /// <returns>New step Function</returns>
        public abstract Task<string> GenerateFunctionName(string stepType, string projectId, string objectId, string functionObjectId);

        /// <summary>
        /// Parses a dialog for exporting
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="objectId">Object Id</param>
        /// <param name="dialog">Dialog to parse</param>
        /// <param name="errorCollection">Error Collection to send errors to</param>
        /// <returns>Parsed dialog</returns>
        public async Task<ExportDialogData> GenerateFunctions(string projectId, string objectId, ExportDialogData dialog, ExportPlaceholderErrorCollection errorCollection)
        {
            DialogFunctionGenerationConditionCollection dialogFunctionGenerationConditions = await _dialogFunctionGenerationConditionProvider.GetDialogFunctionGenerationConditions(projectId);

            HashSet<string> usedDialogSteps = new HashSet<string>();
            Queue<ExportDialogData> dialogDataToQueue = new Queue<ExportDialogData>();
            dialogDataToQueue.Enqueue(dialog);

            while(dialogDataToQueue.Any())
            {
                ExportDialogData curData = dialogDataToQueue.Dequeue();

                await CheckAndBuildFunctionForDialogStep(curData, dialogFunctionGenerationConditions, projectId, objectId, errorCollection);

                foreach(ExportDialogDataChild curChild in curData.Children)
                {
                    if(!usedDialogSteps.Contains(curChild.Child.Id))
                    {
                        dialogDataToQueue.Enqueue(curChild.Child);
                        usedDialogSteps.Add(curChild.Child.Id);
                    }
                }
            }

            return dialog;
        }

        /// <summary>
        /// Checks and builds the function for a dialog step
        /// </summary>
        /// <param name="dialogData">Dialog data for the step</param>
        /// <param name="dialogFunctionGenerationConditions">Dialog Function Generation Conditions</param>
        /// <param name="projectId">Project Id</param>
        /// <param name="objectId">Object Id</param>
        /// <param name="errorCollection">Error Collection to send errors to</param>
        protected async Task CheckAndBuildFunctionForDialogStep(ExportDialogData dialogData, DialogFunctionGenerationConditionCollection dialogFunctionGenerationConditions, string projectId, string objectId, ExportPlaceholderErrorCollection errorCollection)
        {
            if(EvaluateConditions(dialogData, dialogFunctionGenerationConditions.PreventGenerationRules, errorCollection))
            {
                return;
            }

            if(EvaluateConditions(dialogData, dialogFunctionGenerationConditions.GenerateRules, errorCollection))
            {
                dialogData.DialogStepFunctionName = await GenerateFunctionName(GetNodeType(dialogData, errorCollection), projectId, objectId, dialogData.Id);
            }
        }

        /// <summary>
        /// Evaluates a list of conditions
        /// </summary>
        /// <param name="dialogData">Dialog data for the step</param>
        /// <param name="functionGenerationConditions">Function generation conditions</param>
        /// <param name="errorCollection">Error Collection to send errors to</param>
        /// <returns>true if one of the conditions are true, else false</returns>
        protected bool EvaluateConditions(ExportDialogData dialogData, List<DialogFunctionGenerationCondition> functionGenerationConditions, ExportPlaceholderErrorCollection errorCollection)
        {
            foreach(DialogFunctionGenerationCondition curCondition in functionGenerationConditions)
            {
                if(EvaluateConditionList(dialogData, DialogFunctionGenerationConditionGroupOperator.And, curCondition.ConditionElements, errorCollection))
                {
                    return true;
                }
            }

            return false;
        }

        /// <summary>
        /// Evaluates a list of condition elements
        /// </summary>
        /// <param name="dialogData">Dialog data for the step</param>
        /// <param name="groupOperator">Group operator</param>
        /// <param name="conditionElements">Condition Elements</param>
        /// <param name="errorCollection">Error Collection to send errors to</param>
        /// <returns>true if the condition list evaluates to true, else false</returns>
        protected bool EvaluateConditionList(ExportDialogData dialogData, DialogFunctionGenerationConditionGroupOperator groupOperator, List<DialogFunctionGenerationConditionElement> conditionElements, ExportPlaceholderErrorCollection errorCollection)
        {
            foreach(DialogFunctionGenerationConditionElement curElement in conditionElements)
            {
                bool isElementTrue = EvaluateConditionElement(dialogData, curElement, errorCollection);
                if(!isElementTrue && groupOperator == DialogFunctionGenerationConditionGroupOperator.And)
                {
                    return false;
                }
                else if(isElementTrue && groupOperator == DialogFunctionGenerationConditionGroupOperator.Or)
                {
                    return true;
                }
            }

            return groupOperator == DialogFunctionGenerationConditionGroupOperator.And;
        }

        /// <summary>
        /// Evaluates a single condition element
        /// </summary>
        /// <param name="dialogData">Dialog Data</param>
        /// <param name="conditionElement">Condition Element</param>
        /// <param name="errorCollection">Error Collection to send errors to</param>
        /// <returns>true if the condition is true, else false</returns>
        protected bool EvaluateConditionElement(ExportDialogData dialogData, DialogFunctionGenerationConditionElement conditionElement, ExportPlaceholderErrorCollection errorCollection)
        {
            if(dialogData == null)
            {
                return false;
            }

            if(conditionElement.ConditionType == DialogFunctionGenerationConditionType.Group)
            {
                return EvaluateConditionList(dialogData, conditionElement.GroupOperator, conditionElement.ConditionElements, errorCollection);
            }
            else if(conditionElement.ConditionType == DialogFunctionGenerationConditionType.MultipleParents)
            {
                return dialogData.Parents != null && dialogData.Parents.Count > 1;
            }
            else if(conditionElement.ConditionType == DialogFunctionGenerationConditionType.CurrentNodeType)
            {
                return IsNodeOfType(dialogData, conditionElement.NodeType, errorCollection);
            }
            else if(conditionElement.ConditionType == DialogFunctionGenerationConditionType.ChildNodeType)
            {
                return IsAnyNodeOfType(dialogData.Children != null ? dialogData.Children.Select(c => c.Child).ToList() : null, conditionElement.NodeType, errorCollection);
            }
            else if(conditionElement.ConditionType == DialogFunctionGenerationConditionType.ParentNodeType)
            {
                return IsAnyNodeOfType(dialogData.Parents, conditionElement.NodeType, errorCollection);
            }
            else if(conditionElement.ConditionType == DialogFunctionGenerationConditionType.CurrentActionType)
            {
                return IsNodeOfActionType(dialogData, conditionElement.ActionType, errorCollection);
            }
            else if(conditionElement.ConditionType == DialogFunctionGenerationConditionType.ParentActionType)
            {
                return IsAnyNodeOfActionType(dialogData.Parents, conditionElement.ActionType, errorCollection);
            }
            else if(conditionElement.ConditionType == DialogFunctionGenerationConditionType.ChildActionType)
            {
                return IsAnyNodeOfActionType(dialogData.Children != null ? dialogData.Children.Select(c => c.Child).ToList() : null, conditionElement.ActionType, errorCollection);
            }

            errorCollection.AddDialogUnknownFunctionGenerationCondition();
            return false;
        }

        /// <summary>
        /// Returns true if any node in a list is of a certain type
        /// </summary>
        /// <param name="nodes">Dialog Nodes</param>
        /// <param name="nodeType">Node Type</param>
        /// <param name="errorCollection">Error Collection to send errors to</param>
        /// <returns>true if any node is of the searched type</returns>
        protected bool IsAnyNodeOfType(List<ExportDialogData> nodes, string nodeType, ExportPlaceholderErrorCollection errorCollection)
        {
            if(nodes == null)
            {
                return false;
            }

            foreach(ExportDialogData curNode in nodes)
            {
                if(IsNodeOfType(curNode, nodeType, errorCollection))
                {
                    return true;
                }
            }

            return false;
        }

        /// <summary>
        /// Returns true if a node is of a certain type
        /// </summary>
        /// <param name="dialogData">Dialog Data</param>
        /// <param name="nodeType">Node Type</param>
        /// <param name="errorCollection">Error Collection to send errors to</param>
        /// <returns>true if node is of searched type</returns>
        protected bool IsNodeOfType(ExportDialogData dialogData, string nodeType, ExportPlaceholderErrorCollection errorCollection)
        {
            if(string.IsNullOrEmpty(nodeType))
            {
                return false;
            }

            return nodeType.ToLowerInvariant() == GetNodeType(dialogData, errorCollection).ToLowerInvariant();
        }


        /// <summary>
        /// Returns true if any action node in a list is of a certain action type
        /// </summary>
        /// <param name="nodes">Dialog Nodes</param>
        /// <param name="actionType">Action Type</param>
        /// <param name="errorCollection">Error Collection to send errors to</param>
        /// <returns>true if any action node is of the searched type</returns>
        protected bool IsAnyNodeOfActionType(List<ExportDialogData> nodes, ActionType actionType, ExportPlaceholderErrorCollection errorCollection)
        {
            if(nodes == null)
            {
                return false;
            }

            foreach(ExportDialogData curNode in nodes)
            {
                if(IsNodeOfActionType(curNode, actionType, errorCollection))
                {
                    return true;
                }
            }

            return false;
        }

        /// <summary>
        /// Returns true if an action node is of a certain action type
        /// </summary>
        /// <param name="dialogData">Dialog Data</param>
        /// <param name="actionType">Action Type</param>
        /// <param name="errorCollection">Error Collection to send errors to</param>
        /// <returns>true if node is of searched type</returns>
        protected bool IsNodeOfActionType(ExportDialogData dialogData, ActionType actionType, ExportPlaceholderErrorCollection errorCollection)
        {
            int parsedActionType = 0;
            if(dialogData.Action == null || !int.TryParse(dialogData.Action.ActionType, out parsedActionType))
            {
                return false;
            }

            return (int)actionType == parsedActionType;
        }


        /// <summary>
        /// Returns the node type of dailog step
        /// </summary>
        /// <param name="dialogData">Dialog data to check</param>
        /// <param name="errorCollection">Error Collection to send errors to</param>
        /// <returns>Node type</returns>
        protected string GetNodeType(ExportDialogData dialogData, ExportPlaceholderErrorCollection errorCollection)
        {
            string nodeType = dialogData.GetNodeType();
            if(!string.IsNullOrEmpty(nodeType))
            {
                return nodeType;
            }
            
            errorCollection.AddUnknownDialogStepError();
            return "unknown";
        }
    }
}