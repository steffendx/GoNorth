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
        /// A dialog action type is unknown
        /// </summary>
        DialogUnknownActionTypeError = 14,
        
        /// <summary>
        /// A dialog action operator is unknown
        /// </summary>
        DialogUnknownActionOperator = 15,


        /// <summary>
        /// No Player Npc Exists
        /// </summary>
        NoPlayerNpcExistsError = 200
    }
}