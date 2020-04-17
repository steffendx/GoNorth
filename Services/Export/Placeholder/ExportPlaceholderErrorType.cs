namespace GoNorth.Services.Export.Placeholder
{
    /// <summary>
    /// Export Placeholder Error Type
    /// </summary>
    public enum ExportPlaceholderErrorType 
    {
        /// <summary>
        /// Flex Field Missing
        /// </summary>
        FlexFieldMissing = 0,


        /// <summary>
        /// Dialog Root Node count is not one
        /// </summary>
        DialogRootNodeCountNotOne = 1,

        /// <summary>
        /// Unknown Dialog Type
        /// </summary>
        DialogUnknownNodeType = 2,

        /// <summary>
        /// Unknown Dialog Function Generation Condition
        /// </summary>
        DialogUnknownFunctionGenerationCondition = 3,

        /// <summary>
        /// Dialog node has no child for generating a function
        /// </summary>
        DialogNodeHasNoChildForFunction = 4,

        /// <summary>
        /// Dialog infinity loop
        /// </summary>
        DialogInfinityLoop = 5,

        /// <summary>
        /// Dialog condition missing
        /// </summary>
        DialogConditionMissing = 6,

        /// <summary>
        /// Dialog unknown condition type
        /// </summary>
        DialogUnknownConditionTypeError = 7,

        /// <summary>
        /// Dialog unknown group operator
        /// </summary>
        DialogUnknownGroupOperator = 8,

        /// <summary>
        /// Dialog unknown condition operator
        /// </summary>
        DialogUnknownConditionOperator = 9,

        /// <summary>
        /// Dialog unknown field name, default will be used
        /// </summary>
        DialogFlexFielNotFoundDefaultWillBeUsed = 10,

        /// <summary>
        /// A referenced item was not found
        /// </summary>
        DialogItemNotFoundError = 11,

        /// <summary>
        /// A referenced quest was not found
        /// </summary>
        DialogQuestNotFoundError = 12,

        /// <summary>
        /// A referenced skill was not found
        /// </summary>
        DialogSkillNotFoundError = 13,

        /// <summary>
        /// A referenced npc was not found
        /// </summary>
        DialogNpcNotFoundError = 14,

        /// <summary>
        /// A referenced dialog marker was not found
        /// </summary>
        DialogMarkerNotFoundError = 15,
        
        /// <summary>
        /// A dialog action type is unknown
        /// </summary>
        DialogUnknownActionTypeError = 16,
        
        /// <summary>
        /// A dialog action operator is unknown
        /// </summary>
        DialogUnknownActionOperator = 17,
        
        /// <summary>
        /// A referenced daily routine event was not found
        /// </summary>
        DialogDailyRoutineEventNotFoundError = 18,

        /// <summary>
        /// A wait action has only a direct continue function
        /// </summary>
        WaitActionHasOnlyDirectContinueFunction = 19,


        /// <summary>
        /// No Player Npc Exists
        /// </summary>
        NoPlayerNpcExistsError = 200,


        /// <summary>
        /// Export snippet is missing its placeholder
        /// </summary>
        ExportSnippetMissing = 500,


        /// <summary>
        /// A template has errors
        /// </summary>
        TemplateHasErrors = 1000,

        /// <summary>
        /// An exception occured
        /// </summary>
        ExceptionOccured = 1001,

        /// <summary>
        /// An invalid parameter was provided
        /// </summary>
        InvalidParameter = 1002,

        /// <summary>
        /// An include template was not found
        /// </summary>
        IncludeTemplateNotFound = 1010,

        /// <summary>
        /// A language key could not be generated
        /// </summary>
        CanNotGenerateLanguageKey = 1050
    }
}