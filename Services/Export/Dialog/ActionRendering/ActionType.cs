namespace GoNorth.Services.Export.Dialog.ActionRendering
{
    /// <summary>
    /// Possible Action Types
    /// </summary>
    public enum ActionType
    {
        /// <summary>
        /// Change the player value
        /// </summary>
        ChangePlayerValue = 1,

        /// <summary>
        /// Change the npc value
        /// </summary>
        ChangeNpcValue = 2,
        
        /// <summary>
        /// Spawn an item in the player inventory
        /// </summary>
        SpawnItemInPlayerInventory = 3,
                
        /// <summary>
        /// Spawn an item in the npc inventory
        /// </summary>
        SpawnItemInNpcInventory = 4,
                
        /// <summary>
        /// Transfer an item to the player inventory
        /// </summary>
        TransferItemToPlayerInventory = 5,
                
        /// <summary>
        /// Transfer an item to the npc inventory
        /// </summary>
        TransferItemToNpcInventory = 6,

        /// <summary>
        /// Change quest value
        /// </summary>
        ChangeQuestValue = 8,

        /// <summary>
        /// Change quest state
        /// </summary>
        ChangeQuestState = 9,
        
        /// <summary>
        /// Add quest text
        /// </summary>
        AddQuestText = 10,
        
        /// <summary>
        /// Wait
        /// </summary>
        Wait = 14,

        /// <summary>
        /// Change Player State
        /// </summary>
        ChangePlayerState = 15,

        /// <summary>
        /// Change Npc State
        /// </summary>
        ChangeNpcState = 17,

        /// <summary>
        /// Player learn skill
        /// </summary>
        PlayerLearnSkill = 18,

        /// <summary>
        /// Player forget skill
        /// </summary>
        PlayerForgetSkill = 19,

        /// <summary>
        /// Npc learn skill
        /// </summary>
        NpcLearnSkill = 20,

        /// <summary>
        /// Npc forget skill
        /// </summary>
        NpcForgetSkill = 21,
        
        /// <summary>
        /// Change player skill value
        /// </summary>
        ChangePlayerSkillValue = 22,
        
        /// <summary>
        /// Change npc skill value
        /// </summary>
        ChangeNpcSkillValue = 23,
        
        /// <summary>
        /// Persist Dialog state
        /// </summary>
        PersistDialogState = 24,
        
        /// <summary>
        /// Open shop
        /// </summary>
        OpenShop = 25,
        
        /// <summary>
        /// Play npc animation
        /// </summary>
        PlayNpcAnimation = 26,
        
        /// <summary>
        /// Play player animation
        /// </summary>
        PlayPlayerAnimation = 27
    }
}