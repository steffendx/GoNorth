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
        /// Change the current skill value
        /// </summary>
        ChangeCurrentSkillValue = 13,
        
        /// <summary>
        /// Wait
        /// </summary>
        Wait = 14,

        /// <summary>
        /// Change Player State
        /// </summary>
        ChangePlayerState = 15,

        /// <summary>
        /// Change target npc State
        /// </summary>
        ChangeTargetNpcState = 16,

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
        PlayPlayerAnimation = 27,

        /// <summary>
        /// Code action
        /// </summary>
        CodeAction = 28,
        
        /// <summary>
        /// Show floating text above npc
        /// </summary>
        ShowFloatingTextAboveNpc = 29,
        
        /// <summary>
        /// Show floating text above player
        /// </summary>
        ShowFloatingTextAbovePlayer = 30,
        
        /// <summary>
        /// Show floating text above choose npc
        /// </summary>
        ShowFloatingTextAboveChooseNpc = 31,

        /// <summary>
        /// Fade to black
        /// </summary>
        FadeToBlack = 32,

        /// <summary>
        /// Fade from black
        /// </summary>
        FadeFromBlack = 33,

        /// <summary>
        /// Remove an item from the npc inventory
        /// </summary>
        RemoveItemFromNpcInventory = 34,

        /// <summary>
        /// Remove an item from the player inventory
        /// </summary>
        RemoveItemFromPlayerInventory = 35,

        /// <summary>
        /// Sets the game time
        /// </summary>
        SetGameTime = 36,

        /// <summary>
        /// Disables a daily routine event
        /// </summary>
        DisableDailyRoutineEvent = 37,

        /// <summary>
        /// Enables a daily routine event
        /// </summary>
        EnableDailyRoutineEvent = 38,

        /// <summary>
        /// Teleport npc
        /// </summary>
        TeleportNpc = 39,

        /// <summary>
        /// Teleport player
        /// </summary>
        TeleportPlayer = 40,

        /// <summary>
        /// Teleport choose npc
        /// </summary>
        TeleportChooseNpc = 41,
        
        /// <summary>
        /// Walk npc to marker
        /// </summary>
        WalkNpcToMarker = 42,

        /// <summary>
        /// Walk choose npc to marker
        /// </summary>
        WalkChooseNpcToMarker = 43,

        /// <summary>
        /// Teleport npc to npc
        /// </summary>
        TeleportNpcToNpc = 44,

        /// <summary>
        /// Teleport choose npc to npc
        /// </summary>
        TeleportChooseNpcToNpc = 45,

        /// <summary>
        /// Walk npc to npc
        /// </summary>
        WalkNpcToNpc = 46,

        /// <summary>
        /// Walk choose npc to npc
        /// </summary>
        WalkChooseNpcToNpc = 47,

        /// <summary>
        /// Spawn an npc at marker
        /// </summary>
        SpawnNpcAtMarker = 48,
        
        /// <summary>
        /// Spawn an item at marker
        /// </summary>
        SpawnItemAtMarker = 49,
        
        /// <summary>
        /// Change an item value
        /// </summary>
        ChangeItemValue = 50,
        
        /// <summary>
        /// Spawn item in the inventory of a chosen npc
        /// </summary>
        SpawnItemInChooseNpcInventory = 51,
        
        /// <summary>
        /// Remove item from the inventory of a chosen npc
        /// </summary>
        RemoveItemFromChooseNpcInventory = 52,
        
        /// <summary>
        /// Npc uses an it em
        /// </summary>
        NpcUseItem = 53,
        
        /// <summary>
        /// Player uses an item
        /// </summary>
        PlayerUseItem = 54,
        
        /// <summary>
        /// A chosen npc uses an item
        /// </summary>
        ChooseNpcUseItem = 55
    }
}