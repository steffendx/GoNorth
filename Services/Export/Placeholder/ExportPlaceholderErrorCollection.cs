using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Placeholder
{
    /// <summary>
    /// Export Placeholder Error Collection
    /// </summary>
    public class ExportPlaceholderErrorCollection 
    {
        /// <summary>
        /// Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Current Error Context
        /// </summary>
        public string CurrentErrorContext { get; set; }

        /// <summary>
        /// Error Messages
        /// </summary>
        private List<ExportPlaceholderError> _errorMessages { get; set; }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="localizerFactory">Localizer Factory</param>
        public ExportPlaceholderErrorCollection(IStringLocalizerFactory localizerFactory)
        {
            _localizer = localizerFactory.Create(typeof(ExportPlaceholderErrorCollection));

            CurrentErrorContext = string.Empty;
            _errorMessages = new List<ExportPlaceholderError>();
        }


        /// <summary>
        /// Adds an error that a flex field is missing
        /// </summary>
        /// <param name="flexFieldName">Name of the field that was missing</param>
        /// <param name="flexFieldObject">Flex Field object</param>
        public void AddErrorFlexField(string flexFieldName, string flexFieldObject) 
        {
            AddErrorMessage(ExportPlaceholderErrorType.FlexFieldMissing, _localizer[ExportPlaceholderErrorType.FlexFieldMissing.ToString(), flexFieldName, flexFieldObject].Value);
        }

        /// <summary>
        /// Adds an error that the root node count is not one for a dialog
        /// </summary>
        /// <param name="rootNodeCount">Root node count</param>
        public void AddDialogRootNodeCountNotOne(int rootNodeCount) 
        {
            AddErrorMessage(ExportPlaceholderErrorType.DialogRootNodeCountNotOne, _localizer[ExportPlaceholderErrorType.DialogRootNodeCountNotOne.ToString(), rootNodeCount].Value);
        }

        /// <summary>
        /// Adds an error that an unknown dialog node type occured
        /// </summary>
        public void AddUnknownDialogStepError() 
        {
            AddErrorMessage(ExportPlaceholderErrorType.DialogUnknownNodeType, _localizer[ExportPlaceholderErrorType.DialogUnknownNodeType.ToString()].Value);
        }

        /// <summary>
        /// Adds an error for an unknown function generation condition
        /// </summary>
        public void AddDialogUnknownFunctionGenerationCondition()
        {
            AddErrorMessage(ExportPlaceholderErrorType.DialogUnknownFunctionGenerationCondition, _localizer[ExportPlaceholderErrorType.DialogUnknownFunctionGenerationCondition.ToString()].Value);
        }

        /// <summary>
        /// Adds an error that an unknown dialog node type occured
        /// </summary>
        public void AddNodeHasNoChildForFunction() 
        {
            AddErrorMessage(ExportPlaceholderErrorType.DialogNodeHasNoChildForFunction, _localizer[ExportPlaceholderErrorType.DialogNodeHasNoChildForFunction.ToString()].Value);
        }

        /// <summary>
        /// Adds a dialog infinity loop error
        /// </summary>
        public void AddDialogInfinityLoopError()
        {
            AddErrorMessage(ExportPlaceholderErrorType.DialogInfinityLoop, _localizer[ExportPlaceholderErrorType.DialogInfinityLoop.ToString()].Value);
        }

        /// <summary>
        /// Adds a condition missing dialog
        /// </summary>
        public void AddDialogConditionMissing()
        {
            AddErrorMessage(ExportPlaceholderErrorType.DialogConditionMissing, _localizer[ExportPlaceholderErrorType.DialogConditionMissing.ToString()].Value);
        }

        /// <summary>
        /// Adds an unknown condition type error
        /// </summary>
        /// <param name="conditionType">Unknown condition type</param>
        public void AddDialogUnknownConditionTypeError(int conditionType)
        {
            AddErrorMessage(ExportPlaceholderErrorType.DialogUnknownConditionTypeError, _localizer[ExportPlaceholderErrorType.DialogUnknownConditionTypeError.ToString(), conditionType].Value);
        }

        /// <summary>
        /// Adds an unknown group operator error
        /// </summary>
        /// <param name="groupOperator">Unknown group operator</param>
        public void AddDialogUnknownGroupOperator(int groupOperator)
        {
            AddErrorMessage(ExportPlaceholderErrorType.DialogUnknownGroupOperator, _localizer[ExportPlaceholderErrorType.DialogUnknownGroupOperator.ToString(), groupOperator].Value);
        }

        /// <summary>
        /// Adds an unknown condition operator error
        /// </summary>
        /// <param name="conditionOperator">Unknown condition operator</param>
        public void AddDialogUnknownConditionOperator(string conditionOperator)
        {
            AddErrorMessage(ExportPlaceholderErrorType.DialogUnknownConditionOperator, _localizer[ExportPlaceholderErrorType.DialogUnknownConditionOperator.ToString(), conditionOperator].Value);
        }

        /// <summary>
        /// Adds an field not found error
        /// </summary>
        /// <param name="searchedFieldName">Field name that was searched</param>
        /// <param name="defaultName">Default field name that will be used</param>
        public void AddDialogFlexFieldErrorNotFoundDefaultWillBeUsed(string searchedFieldName, string defaultName)
        {
            AddErrorMessage(ExportPlaceholderErrorType.DialogFlexFielNotFoundDefaultWillBeUsed, _localizer[ExportPlaceholderErrorType.DialogFlexFielNotFoundDefaultWillBeUsed.ToString(), searchedFieldName, defaultName].Value);
        }

        /// <summary>
        /// Adds an item not found error
        /// </summary>
        public void AddDialogItemNotFoundError()
        {
            AddErrorMessage(ExportPlaceholderErrorType.DialogItemNotFoundError, _localizer[ExportPlaceholderErrorType.DialogItemNotFoundError.ToString()].Value);
        }

        /// <summary>
        /// Adds a quest not found error
        /// </summary>
        public void AddDialogQuestNotFoundError()
        {
            AddErrorMessage(ExportPlaceholderErrorType.DialogQuestNotFoundError, _localizer[ExportPlaceholderErrorType.DialogQuestNotFoundError.ToString()].Value);
        }
        
        /// <summary>
        /// Adds a skill not found error
        /// </summary>        
        public void AddDialogSkillNotFoundError()
        {
            AddErrorMessage(ExportPlaceholderErrorType.DialogSkillNotFoundError, _localizer[ExportPlaceholderErrorType.DialogSkillNotFoundError.ToString()].Value);
        }

        /// <summary>
        /// Adds a npc not found error
        /// </summary>        
        public void AddDialogNpcNotFoundError()
        {
            AddErrorMessage(ExportPlaceholderErrorType.DialogNpcNotFoundError, _localizer[ExportPlaceholderErrorType.DialogNpcNotFoundError.ToString()].Value);
        }

        /// <summary>
        /// Adds a marker not found error
        /// </summary>        
        public void AddDialogMarkerNotFoundError()
        {
            AddErrorMessage(ExportPlaceholderErrorType.DialogMarkerNotFoundError, _localizer[ExportPlaceholderErrorType.DialogMarkerNotFoundError.ToString()].Value);
        }

        /// <summary>
        /// Adds a daily routine event not found
        /// </summary>        
        /// <param name="npcName">Name of the npc</param>
        public void AddDialogDailyRoutineEventNotFoundError(string npcName)
        {
            AddErrorMessage(ExportPlaceholderErrorType.DialogDailyRoutineEventNotFoundError, _localizer[ExportPlaceholderErrorType.DialogDailyRoutineEventNotFoundError.ToString(), npcName].Value);
        }

        /// <summary>
        /// Adds an unknown action type error
        /// </summary>
        /// <param name="actionType">Unknown action type</param>
        public void AddDialogUnknownActionTypeError(int actionType)
        {
            AddErrorMessage(ExportPlaceholderErrorType.DialogUnknownActionTypeError, _localizer[ExportPlaceholderErrorType.DialogUnknownActionTypeError.ToString(), actionType.ToString()].Value);
        }

        /// <summary>
        /// Adds an unknown action operator error
        /// </summary>
        /// <param name="actionOperator">Unknown action operator</param>
        public void AddDialogUnknownActionOperator(string actionOperator)
        {
            AddErrorMessage(ExportPlaceholderErrorType.DialogUnknownActionOperator, _localizer[ExportPlaceholderErrorType.DialogUnknownActionOperator.ToString(), actionOperator].Value);
        }

        /// <summary>
        /// Adds an error if a wait function has only a direct continue function
        /// </summary>
        public void AddWaitActionHasOnlyDirectContinueFunction()
        {
            AddErrorMessage(ExportPlaceholderErrorType.WaitActionHasOnlyDirectContinueFunction, _localizer[ExportPlaceholderErrorType.WaitActionHasOnlyDirectContinueFunction.ToString()].Value);
        }


        /// <summary>
        /// Adds an no player npc exists error
        /// </summary>
        public void AddNoPlayerNpcExistsError()
        {
            AddErrorMessage(ExportPlaceholderErrorType.NoPlayerNpcExistsError, _localizer[ExportPlaceholderErrorType.NoPlayerNpcExistsError.ToString()].Value);
        }


        /// <summary>
        /// Adds an error if an export snippet is missing its placeholder
        /// </summary>
        public void AddExportSnippetMissingPlaceholder()
        {
            AddErrorMessage(ExportPlaceholderErrorType.ExportSnippetMissing, _localizer[ExportPlaceholderErrorType.ExportSnippetMissing.ToString()].Value);
        }

        
        /// <summary>
        /// Adds an error that a template has errors
        /// </summary>
        public void AddTemplateHasErrors() 
        {
            AddErrorMessage(ExportPlaceholderErrorType.TemplateHasErrors, _localizer[ExportPlaceholderErrorType.TemplateHasErrors.ToString()].Value);
        }

        /// <summary>
        /// Adds an error that a template has errors
        /// </summary>
        /// <param name="ex">Exception that occured</param>
        public void AddException(Exception ex) 
        {
            AddErrorMessage(ExportPlaceholderErrorType.ExceptionOccured, _localizer[ExportPlaceholderErrorType.ExceptionOccured.ToString(), ex.Message].Value);
        }

        /// <summary>
        /// Adds an error that a language key can not be generated
        /// </summary>
        /// <param name="spanLocation">Location of the error that occured</param>
        public void AddCanNotGenerateLanguageKey(string spanLocation) 
        {
            AddErrorMessage(ExportPlaceholderErrorType.CanNotGenerateLanguageKey, _localizer[ExportPlaceholderErrorType.CanNotGenerateLanguageKey.ToString(), spanLocation].Value);
        }

        /// <summary>
        /// Adds an error that an invalid parameter was provided
        /// </summary>
        /// <param name="spanLocation">Location of the error that occured</param>
        public void AddInvalidParameter(string spanLocation)
        {
            AddErrorMessage(ExportPlaceholderErrorType.InvalidParameter, _localizer[ExportPlaceholderErrorType.InvalidParameter.ToString(), spanLocation].Value);
        }

        /// <summary>
        /// Adds an error that an invalid parameter was provided
        /// </summary>
        /// <param name="templateName">Name of the missing template</param>
        /// <param name="spanLocation">Location of the error that occured</param>
        public void AddIncludeTemplateNotFoundError(string templateName, string spanLocation)
        {
            AddErrorMessage(ExportPlaceholderErrorType.IncludeTemplateNotFound, _localizer[ExportPlaceholderErrorType.IncludeTemplateNotFound.ToString(), templateName, spanLocation].Value);
        }

        /// <summary>
        /// Adds an error message
        /// </summary>
        /// <param name="errorType">Error Type</param>
        /// <param name="message">Message</param>
        private void AddErrorMessage(ExportPlaceholderErrorType errorType, string message)
        {
            ExportPlaceholderError existingError = _errorMessages.FirstOrDefault(e => e.ErrorType == errorType && e.Message == message && e.ErrorContext == CurrentErrorContext);
            if(existingError != null)
            {
                ++existingError.Count;
                return;
            }

            _errorMessages.Add(new ExportPlaceholderError() {
                ErrorType = errorType,
                ErrorContext = CurrentErrorContext,
                Message = message,
                Count = 1
            });
        }

        /// <summary>
        /// Merges an error list into this error list
        /// </summary>
        /// <param name="errors">Error list</param>
        public void Merge(ExportPlaceholderErrorCollection errors)
        {
            if(errors == null)
            {
                return;
            }

            foreach(ExportPlaceholderError curError in errors._errorMessages)
            {
                AddErrorMessage(curError.ErrorType, curError.Message);
            }
        }

        
        /// <summary>
        /// Returns the error list
        /// </summary>
        /// <returns>Error List</returns>
        public List<ExportPlaceholderError> ToErrorList()
        {
            return _errorMessages;
        }
    }
}