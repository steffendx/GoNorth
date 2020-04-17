namespace GoNorth.Data.Exporting
{
    /// <summary>
    /// Template Type
    /// </summary>
    public enum TemplateType
    {
        /// <summary>
        /// Object Npc
        /// </summary>
        ObjectNpc = 0,

        /// <summary>
        /// Object Item
        /// </summary>
        ObjectItem = 1,

        /// <summary>
        /// Object Skill
        /// </summary>
        ObjectSkill = 2,

        /// <summary>
        /// Object Attribute List
        /// </summary>
        ObjectAttributeList = 4,

        /// <summary>
        /// Object Inventory
        /// </summary>
        ObjectInventory = 5,

        /// <summary>
        /// Object SkillList
        /// </summary>
        ObjectSkillList = 6,

        /// <summary>
        /// Daily Routine Event List
        /// </summary>
        ObjectDailyRoutineEventList = 7,

        /// <summary>
        /// Daily Routine Function List
        /// </summary>
        ObjectDailyRoutineFunctionList = 8,
        
        /// <summary>
        /// Daily Routine Function
        /// </summary>
        ObjectDailyRoutineFunction = 9,

        /// <summary>
        /// Export snippet Function
        /// </summary>
        ObjectExportSnippetFunction = 10,


        /// <summary>
        /// Tale dialog function
        /// </summary>
        TaleDialogFunction = 201,

        /// <summary>
        /// Tale Npc Text Line
        /// </summary>
        TaleNpcTextLine = 202,

        /// <summary>
        /// Tale Player Text Line
        /// </summary>
        TalePlayerTextLine = 203,

        /// <summary>
        /// Tale Choice
        /// </summary>
        TaleChoice = 204,

        /// <summary>
        /// Tale Condition
        /// </summary>
        TaleCondition = 205,

        /// <summary>
        /// Tale Condition Player Value
        /// </summary>
        TaleConditionPlayerValue = 206,
        
        /// <summary>
        /// Tale Condition Npc Value
        /// </summary>
        TaleConditionNpcValue = 207,

        /// <summary>
        /// Tale Condition Player Inventory
        /// </summary>
        TaleConditionPlayerInventory = 208,

        /// <summary>
        /// Tale Condition Npc Inventory
        /// </summary>
        TaleConditionNpcInventory = 209,
        
        /// <summary>
        /// Tale Condition Quest Value
        /// </summary>
        TaleConditionQuestValue = 210,

        /// <summary>
        /// Tale Condition Quest State
        /// </summary>
        TaleConditionQuestState = 211,

        /// <summary>
        /// Tale Condition Npc Alive State
        /// </summary>
        TaleConditionNpcAliveState = 212,

        /// <summary>
        /// Tale Condition Game Time
        /// </summary>       
        TaleConditionGameTime = 213,

        /// <summary>
        /// Tale Condition player skill value
        /// </summary>   
        TaleConditionPlayerSkillValue = 214,

        /// <summary>
        /// Tale Condition npc skill value
        /// </summary>  
        TaleConditionNpcSkillValue = 215,

        /// <summary>
        /// Tale Condition player learned skill
        /// </summary>  
        TaleConditionPlayerLearnedSkill = 216,

        /// <summary>
        /// Tale Condition player not learned skill
        /// </summary>  
        TaleConditionPlayerNotLearnedSkill = 217,

        /// <summary>
        /// Tale Condition npc learned skill
        /// </summary>  
        TaleConditionNpcLearnedSkill = 218,

        /// <summary>
        /// Tale Condition npc not learned skill
        /// </summary>  
        TaleConditionNpcNotLearnedSkill = 219,

        /// <summary>
        /// Tale Condition random value
        /// </summary>  
        TaleConditionRandomValue = 220,
        
        /// <summary>
        /// Tale Condition to check if a daily routine event is disabled
        /// </summary>  
        TaleConditionDailyRoutineEventDisabled = 221,
        
        /// <summary>
        /// Tale Condition to check if a daily routine event is enabled
        /// </summary>  
        TaleConditionDailyRoutineEventEnabled = 222,
 
        /// <summary>
        /// Tale Condition to run custom code
        /// </summary>  
        TaleConditionCode = 223,
         
        /// <summary>
        /// Tale Condition to check an item value
        /// </summary>  
        TaleConditionItemValue = 224,
             
        /// <summary>
        /// Tale Condition to check the current skill value
        /// </summary> 
        TaleConditionCurrentSkillValue = 225,


        /// <summary>
        /// Tale Action node
        /// </summary>  
        TaleAction = 300,

        /// <summary>
        /// Tale Action change player value
        /// </summary>   
        TaleActionChangePlayerValue = 301,

        /// <summary>
        /// Tale Action change npc value
        /// </summary>   
        TaleActionChangeNpcValue = 302,

        /// <summary>
        /// Tale Action transfer item to player
        /// </summary>       
        TaleActionTransferItemToPlayer = 303,

        /// <summary>
        /// Tale Action spawn item in player inventory
        /// </summary>       
        TaleActionSpawnItemForPlayer = 304,
        
        /// <summary>
        /// Tale Action transfer item to npc
        /// </summary>       
        TaleActionTransferItemToNpc = 305,
        
        /// <summary>
        /// Tale Action spawn item in player inventory
        /// </summary>       
        TaleActionSpawnItemForNpc = 306,

        /// <summary>
        /// Tale Action change quest value
        /// </summary> 
        TaleActionChangeQuestValue = 307,
    
        /// <summary>
        /// Tale Action set quest state
        /// </summary> 
        TaleActionSetQuestState = 308,

        /// <summary>
        /// Tale Action add quest text
        /// </summary> 
        TaleActionAddQuestText = 309,

        /// <summary>
        /// Tale Action Wait
        /// </summary>
        TaleActionWait = 310,

        /// <summary>
        /// Tale Action set player state
        /// </summary>
        TaleActionSetPlayerState = 311,
        
        /// <summary>
        /// Tale Action set npc state
        /// </summary>
        TaleActionSetNpcState = 312,
                
        /// <summary>
        /// Tale Action player learn skill
        /// </summary>
        TaleActionPlayerLearnSkill = 313,
                
        /// <summary>
        /// Tale Action player forget skill
        /// </summary>
        TaleActionPlayerForgetSkill = 314,
        
        /// <summary>
        /// Tale Action npc learn skill
        /// </summary>
        TaleActionNpcLearnSkill = 315,
        
        /// <summary>
        /// Tale Action npc forget skill
        /// </summary>
        TaleActionNpcForgetSkill = 316,
        
        /// <summary>
        /// Tale Action change player skill value
        /// </summary>
        TaleActionChangePlayerSkillValue = 317,
        
        /// <summary>
        /// Tale Action change npc skill value
        /// </summary>
        TaleActionChangeNpcSkillValue = 318,
        
        /// <summary>
        /// Tale Action persist dialog state
        /// </summary>
        TaleActionPersistDialogState = 319,
                
        /// <summary>
        /// Tale Action open shop
        /// </summary>
        TaleActionOpenShop = 320,
                        
        /// <summary>
        /// Tale Action npc play animation
        /// </summary>
        TaleActionNpcPlayAnimation = 321,

        /// <summary>
        /// Tale Action player play animation
        /// </summary>
        TaleActionPlayerPlayAnimation = 322,
    
        /// <summary>
        /// Tale Action code action
        /// </summary>
        TaleActionCodeAction = 323,
        
        /// <summary>
        /// Tale Action show floating text above npc
        /// </summary>
        TaleActionShowFloatingTextAboveNpc = 324,
        
        /// <summary>
        /// Tale Action show floating text above player
        /// </summary>
        TaleActionShowFloatingTextAbovePlayer = 325,

        /// <summary>
        /// Tale Action show floating text above choose npc
        /// </summary>
        TaleActionShowFloatingTextAboveChooseNpc = 326,
        
        /// <summary>
        /// Tale Action to fade to black
        /// </summary>
        TaleActionFadeToBlack = 327,
        
        /// <summary>
        /// Tale Action to fade to black
        /// </summary>
        TaleActionFadeFromBlack = 328,

        /// <summary>
        /// Tale Action to remove item from npc
        /// </summary>       
        TaleActionRemoveItemFromNpc = 329,

        /// <summary>
        /// Tale Action to remove item from player
        /// </summary>       
        TaleActionRemoveItemFromPlayer = 330,
        
        /// <summary>
        /// Tale Action to set the game time
        /// </summary>       
        TaleActionSetGameTime = 331,

        /// <summary>
        /// Tale Action to disable a daily routine event
        /// </summary>   
        TaleActionDisableDailyRoutineEvent = 332,
        
        /// <summary>
        /// Tale Action to enable a daily routine event
        /// </summary>   
        TaleActionEnableDailyRoutineEvent = 333,
        
        /// <summary>
        /// Tale Action to teleport the npc
        /// </summary>   
        TaleActionTeleportNpc = 334,
        
        /// <summary>
        /// Tale Action to teleport the player
        /// </summary>   
        TaleActionTeleportPlayer = 335,
        
        /// <summary>
        /// Tale Action to teleport a choosen npc
        /// </summary>   
        TaleActionTeleportChooseNpc = 336,

        /// <summary>
        /// Tale Action to walk the npc
        /// </summary>   
        TaleActionWalkNpc = 337,

        /// <summary>
        /// Tale Action to walk a choosen npc
        /// </summary>   
        TaleActionWalkChooseNpc = 338,

        /// <summary>
        /// Tale Action to teleport an npc to an npc
        /// </summary> 
        TaleActionTeleportNpcToNpc = 339,

        /// <summary>
        /// Tale Action to teleport a choosen npc to an npc
        /// </summary> 
        TaleActionTeleportChooseNpcToNpc = 340,

        /// <summary>
        /// Tale Action to walk an npc to an npc
        /// </summary> 
        TaleActionWalkNpcToNpc = 341,

        /// <summary>
        /// Tale Action to walk a choosen npc to an npc
        /// </summary> 
        TaleActionWalkChooseNpcToNpc = 342,

        /// <summary>
        /// Tale Action to spawn an npc at a marker
        /// </summary> 
        TaleActionSpawnNpcAtMarker = 343,

        /// <summary>
        /// Tale Action to spawn an item at a marker
        /// </summary> 
        TaleActionSpawnItemAtMarker = 344,

        /// <summary>
        /// Tale Action to change an item value
        /// </summary> 
        TaleActionChangeItemValue = 345,

        /// <summary>
        /// Tale Action to change the current skill value
        /// </summary> 
        TaleActionChangeCurrentSkillValue = 346,

        /// <summary>
        /// Tale Action to change the target npc state
        /// </summary> 
        TaleActionSetTargetNpcState = 347,

        /// <summary>
        /// Tale Action to remove an item from a choosen npc
        /// </summary> 
        TaleActionRemoveItemFromChooseNpc = 348,

        /// <summary>
        /// Tale Action to spawn an item in the inventory of a choosen npc
        /// </summary> 
        TaleActionSpawnItemForChooseNpc = 349,

        /// <summary>
        /// Tale Action to have an npc use an item
        /// </summary> 
        TaleActionNpcUseItem = 350,
        
        /// <summary>
        /// Tale Action to have the player use an item
        /// </summary> 
        TaleActionPlayerUseItem = 351,
                
        /// <summary>
        /// Tale Action to have a choosen npc to use an item
        /// </summary> 
        TaleActionChooseNpcUseItem = 352,


        /// <summary>
        /// Logic Grouping Template
        /// </summary>
        GeneralLogicGroup = 1000,
        
        /// <summary>
        /// Logic And Template
        /// </summary>
        GeneralLogicAnd = 1001,

        /// <summary>
        /// Logic Or Template
        /// </summary>
        GeneralLogicOr = 1002,

        /// <summary>
        /// Compare Operator Equal Template
        /// </summary>
        GeneralCompareOperatorEqual = 1020,

        /// <summary>
        /// Compare Operator Not Equal Template
        /// </summary>
        GeneralCompareOperatorNotEqual = 1021,

        /// <summary>
        /// Compare Operator Less Than Template
        /// </summary>
        GeneralCompareOperatorLess = 1022,

        /// <summary>
        /// Compare Operator Less or Equal Template
        /// </summary>
        GeneralCompareOperatorLessOrEqual = 1023,

        /// <summary>
        /// Compare Operator Bigger Than Template
        /// </summary>
        GeneralCompareOperatorBigger = 1024,

        /// <summary>
        /// Compare Operator Bigger or Equal Template
        /// </summary>
        GeneralCompareOperatorBiggerOrEqual = 1025,

        /// <summary>
        /// Compare Operator Contains
        /// </summary>
        GeneralCompareOperatorContains = 1026,
        
        /// <summary>
        /// Compare Operator Starts With
        /// </summary>
        GeneralCompareOperatorStartsWith = 1027,
        
        /// <summary>
        /// Compare Operator Ends With
        /// </summary>
        GeneralCompareOperatorEndsWith = 1028,

        /// <summary>
        /// Change Operator Assign
        /// </summary>
        GeneralChangeOperatorAssign = 1029,

        /// <summary>
        /// Change Operator Add To
        /// </summary>
        GeneralChangeOperatorAddTo = 1030,

        /// <summary>
        /// Change Operator Substract From
        /// </summary>
        GeneralChangeOperatorSubstractFrom = 1031,
        
        /// <summary>
        /// Change Operator Multiply
        /// </summary>
        GeneralChangeOperatorMultiply = 1032,
        
        /// <summary>
        /// Change Operator Divide
        /// </summary>
        GeneralChangeOperatorDivide = 1033,


        /// <summary>
        /// Language file
        /// </summary>
        LanguageFile = 2000
    };
}