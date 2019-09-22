namespace GoNorth.Services.Export.Dialog.ConditionRendering
{
    /// <summary>
    /// Possible Condition Types
    /// </summary>
    public enum ConditionType
    {
        /// <summary>
        /// Condition group (or, and)
        /// </summary>
        Group = 1,

        /// <summary>
        /// Player Value Condition
        /// </summary>
        PlayerValueCondition = 2,

        /// <summary>
        /// Npc Value Condition
        /// </summary>
        NpcValueCondition = 3,

        /// <summary>
        /// Player Inventory Condition
        /// </summary>
        PlayerInventoryCondition = 4,

        /// <summary>
        /// Npc Inventory Condition
        /// </summary>
        NpcInventoryCondition = 5,
        
        /// <summary>
        /// Choose quest Value Condition
        /// </summary>
        ChooseQuestValueCondition = 7,

        /// <summary>
        /// Quest state Condition
        /// </summary>
        QuestStateCondition = 8,

        /// <summary>
        /// Condition to check if a certain npc is alive or dead
        /// </summary>
        NpcAliveStateCondition = 9,

        /// <summary>
        /// Condition to check the current skill value
        /// </summary>
        CurrentSkillValueCondition = 11,
        
        /// <summary>
        /// Game Time Condition
        /// </summary>
        GameTimeCondition = 12,
        
        /// <summary>
        /// Player Skill Value Condition
        /// </summary>
        PlayerSkillValueCondition = 13,
                
        /// <summary>
        /// Npc Skill Value Condition
        /// </summary>
        NpcSkillValueCondition = 14,
                        
        /// <summary>
        /// Player learned skill Condition
        /// </summary>
        PlayerLearnedSkillCondition = 15,
                        
        /// <summary>
        /// Player not learned skill Condition
        /// </summary>
        PlayerNotLearnedSkillCondition = 16,
                        
        /// <summary>
        /// Npc learned skill Condition
        /// </summary>
        NpcLearnedSkillCondition = 17,
                        
        /// <summary>
        /// Npc not learned skill Condition
        /// </summary>
        NpcNotLearnedSkillCondition = 18,
        
        /// <summary>
        /// Random value compare condition
        /// </summary>
        RandomValueCondition = 19,
        
        /// <summary>
        /// Daily routine event is enabled condition
        /// </summary>
        DailyRoutineEventIsEnabledCondition = 20,
        
        /// <summary>
        /// Daily routine event is disabled condition
        /// </summary>
        DailyRoutineEventIsDisabledCondition = 21,

        /// <summary>
        /// Code condition resolver
        /// </summary>
        CodeCondition = 22,

        /// <summary>
        /// Item value condition resolver
        /// </summary>
        ItemValueCondition = 23
    }
}