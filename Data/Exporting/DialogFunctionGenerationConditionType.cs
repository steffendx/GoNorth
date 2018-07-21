namespace GoNorth.Data.Exporting
{
    /// <summary>
    /// Dialog Function Generation Condition Types
    /// </summary>
    public enum DialogFunctionGenerationConditionType
    {
        /// <summary>
        /// Condition group
        /// </summary>
        Group = 0,

        /// <summary>
        /// Multiple parents
        /// </summary>
        MultipleParents = 1,
        
        /// <summary>
        /// Parent node type
        /// </summary>
        ParentNodeType = 2,
        
        /// <summary>
        /// Current node type
        /// </summary>
        CurrentNodeType = 3,
        
        /// <summary>
        /// Childe node type
        /// </summary>
        ChildNodeType = 4,
        
        /// <summary>
        /// Parent action type
        /// </summary>
        ParentActionType = 5,
        
        /// <summary>
        /// Current action type
        /// </summary>
        CurrentActionType = 6,
        
        /// <summary>
        /// Child action type
        /// </summary>
        ChildActionType = 7
    }
}