(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Localization) {

            // Node Display
            Localization.NodeDisplay = {};

            Localization.NodeDisplay.Position = "Position:";
            Localization.NodeDisplay.Zoom = "Zoom:";    
            Localization.NodeDisplay.ToogleMiniMap = "Click here to toogle the mini map display";        

            // Shared Messages
            Localization.DeleteNode = "Delete node";
            Localization.ErrorOccured = "An error occured";

            // Text Node
            Localization.TypeNames = {
                "default.Text": "Text"
            };

            Localization.TextPlaceHolder = "Text";

            // Quest States
            Localization.QuestStates = {};
            Localization.QuestStates.NotStarted = "Not started";
            Localization.QuestStates.InProgress = "In progress";
            Localization.QuestStates.Success = "Success";
            Localization.QuestStates.Failed = "Failed";

            // Dialog Title
            Localization.Dialogs = {};
            Localization.Dialogs.ChooseItem = "Choose item";

            // Actions
            GoNorth.DefaultNodeShapes.Localization.TypeNames["default.Action"] = "Action";

            // Conditions
            Localization.TypeNames["default.Condition"] = "Condition";

            Localization.Conditions = {};

            Localization.Conditions.MissingInformations = "<Missing information>"

            Localization.Conditions.AddCondition = "Add condition";

            Localization.Conditions.AndOperator = "And";
            Localization.Conditions.AndOperatorShort = "&&";
            Localization.Conditions.OrOperator = "Or";
            Localization.Conditions.OrOperatorShort = "||";

            Localization.Conditions.EditCondition = "<Edit condition>";
            Localization.Conditions.LoadingConditionText = "Loading condition...";
            Localization.Conditions.ErrorLoadingConditionText = "Error while loading";
            Localization.Conditions.Else = "else";

            Localization.Conditions.MoveConditionUp = "Move condition up";
            Localization.Conditions.MoveConditionDown = "Move condition down";
            Localization.Conditions.DeleteCondition = "Delete condition";

            Localization.Conditions.NumberField = "Number field";
            Localization.Conditions.TextField = "Text field";
            Localization.Conditions.FieldWasDeleted = "Field was deleted.";

            Localization.Conditions.CheckNpcValueLabel = "Check npc value";
            Localization.Conditions.NpcLabel = "Npc";
            Localization.Conditions.CheckPlayerValueLabel = "Check player value";
            Localization.Conditions.PlayerLabel = "Player";

            Localization.Conditions.ChooseQuestLabel = "<Choose quest>";

            Localization.Conditions.CheckChooseQuestValueLabel = "Check pick quest value";

            Localization.Conditions.StateLabel = "State";

            Localization.Conditions.CheckQuestStateLabel = "Check quest state";

            Localization.Conditions.ChooseNpcLabel = "<Choose npc>";

            Localization.Conditions.CheckNpcAliveStateLabel = "Check npc alive state";
            Localization.Conditions.NpcAliveStateAlive = "Alive";
            Localization.Conditions.NpcAliveStateDead = "Dead";

            Localization.Conditions.CheckGameTimeLabel = "Check game time";
            Localization.Conditions.GameTimeOperatorBefore = "before";
            Localization.Conditions.GameTimeOperatorAfter = "after";
            Localization.Conditions.GameTime = "Game time";
            
            Localization.Conditions.ChooseSkillLabel = "<Choose skill>";

            Localization.Conditions.CheckChoosePlayerSkillValueLabel = "Check player skill value";
            Localization.Conditions.PlayerSkillPrefix = "Player ";

            Localization.Conditions.CheckPlayerLearnedSkillLabel = "Player can use skill";
            Localization.Conditions.CheckPlayerLearnedSkillPrefixLabel = "Player can use ";

            Localization.Conditions.CheckPlayerNotLearnedSkillLabel = "Player can not use skill";
            Localization.Conditions.CheckPlayerNotLearnedSkillPrefixLabel = "Player can not use ";

            Localization.Conditions.CheckPlayerInventoryLabel = "Check player inventory";
            Localization.Conditions.PlayerInventoryLabel = "Player inventory";
            Localization.Conditions.CheckNpcInventoryLabel = "Check npc inventory";
            Localization.Conditions.NpcInventoryLabel = "Npc inventory";
            Localization.Conditions.ChooseItem = "<Choose item>";
            Localization.Conditions.ItemOperatorHasAtLeast = "has at least";
            Localization.Conditions.ItemOperatorHasMaximum = "hast at maximum";
            Localization.Conditions.ItemCount = "Cnt";

            Localization.Conditions.CheckChooseNpcSkillValueLabel = "Check npc skill value";
            Localization.Conditions.NpcSkillPrefix = "Npc ";

            Localization.Conditions.CheckNpcLearnedSkillLabel = "Npc can use skill";
            Localization.Conditions.CheckNpcLearnedSkillPrefixLabel = "Npc can use ";

            Localization.Conditions.CheckNpcNotLearnedSkillLabel = "Npc can not use skill";
            Localization.Conditions.CheckNpcNotLearnedSkillPrefixLabel = "Npc can not use ";

            Localization.Conditions.CheckRandomValueLabel = "Check random value";
            Localization.Conditions.Rand = "Random";

            Localization.Conditions.ChooseDailyRoutineEvent = "<Choose daily routine event>";
            Localization.Conditions.TimeFormat = "hh:mm";
            Localization.Conditions.CheckDailyRoutineIsActive = "Check daily routine event is active";
            Localization.Conditions.CheckDailyRoutineIsDisabled = "Check daily routine event is disabled";
            Localization.Conditions.DailyRoutineEventIsActive = "Daily event {0} active";
            Localization.Conditions.DailyRoutineEventIsDisabled = "Daily event {0} disabled";

            // Actions
            Localization.Actions = {};

            Localization.Actions.NumberField = "Number field";
            Localization.Actions.TextField = "Text field";

            Localization.Actions.ChangePlayerValueLabel = "Change player value";
            Localization.Actions.ChangeNpcValueLabel = "Change npc value";
            Localization.Actions.ChangeQuestValueLabel = "Change pick quest value";
            Localization.Actions.ChooseQuestLabel = "&lt;Choose quest&gt;";
            
            Localization.Actions.QuestState = "State";
            
            Localization.Actions.SetQuestStateLabel = "Change quest state";
            Localization.Actions.OpenQuestTooltip = "Opens the chosen quest";

            Localization.Actions.AddQuestTextLabel = "Add quest text";
            Localization.Actions.QuestText = "Text";

            Localization.Actions.WaitLabel = "Wait";
            Localization.Actions.WaitTypeRealTime = "Realtime";
            Localization.Actions.WaitTypeGameTime = "Gametime";
            Localization.Actions.WaitUnitMilliseconds = "Milliseconds";
            Localization.Actions.WaitUnitSeconds = "Seconds";
            Localization.Actions.WaitUnitMinutes = "Minutes";
            Localization.Actions.WaitUnitHours = "Hours";
            Localization.Actions.WaitUnitDays = "Days";

            Localization.Actions.StatePlaceholder = "State";

            Localization.Actions.SetPlayerStateLabel = "Change player state";
            Localization.Actions.SetNpcStateLabel = "Change npc state";

            Localization.Actions.ChooseSkillLabel = "&lt;Choose skill&gt;";
            Localization.Actions.OpenSkillTooltip = "Opens the chosen skill";

            Localization.Actions.PlayerLearnSkillLabel = "Player learns skill";
            Localization.Actions.PlayerForgetSkillLabel = "Player forgets skill";

            Localization.Actions.NpcLearnsSkillLabel = "Npc learns skill";
            Localization.Actions.NpcForgetSkillLabel = "Npc forgets skill";

            Localization.Actions.ChangePlayerSkillValueLabel = "Change player skill value";
            Localization.Actions.ChangeNpcSkillValueLabel = "Change npc skill value";

            Localization.Actions.AnimationPlaceholder = "Animation name";
            Localization.Actions.PlayNpcAnimationLabel = "Play npc animation";
            Localization.Actions.PlayPlayerAnimationLabel = "Play player animation";

            Localization.Actions.ChooseItem = "<Choose item>";
            Localization.Actions.OpenItemTooltip  = "Öffnet das ausgewählte Item";
            Localization.Actions.SpawnItemInPlayerInventoryLabel = "Spawn item in player inventory";
            Localization.Actions.SpawnItemInNpcInventoryLabel = "Spawn item in npc inventory";
            Localization.Actions.TransferItemToPlayerInventoryLabel = "Give item to player";
            Localization.Actions.TransferItemToNpcInventoryLabel = "Give item to npc";
            Localization.Actions.ItemQuantity = "Quantity (blank = 1):";

            Localization.Actions.CodeActionLabel = "Script Code";
            Localization.Actions.ClickHereToEditCode = "&lt;Click here to edit code&gt;";
            
            Localization.Actions.FloatingText = "Text";
            Localization.Actions.ShowFloatingTextAboveNpcLabel = "Show text above npc";
            Localization.Actions.ShowFloatingTextAbovePlayerLabel = "Show text above player";
            Localization.Actions.ShowFloatingTextAboveChooseNpcLabel = "Show text above pick npc";
            Localization.Actions.ChooseNpcLabel = "&lt;Choose npc&gt;";
            Localization.Actions.OpenNpcTooltip = "Opens the chosen npc";

            Localization.Actions.FadeTimePlaceholder = "Fade time";
            Localization.Actions.FadeToBlackLabel = "Fade to black";
            Localization.Actions.FadeFromBlackLabel = "Fade back from black";
            
            Localization.Actions.RemoveItemFromNpcInventoryLabel = "Remove item from npc inventory";
            Localization.Actions.RemoveItemFromPlayerInventoryLabel = "Remove item from player inventory";

            Localization.Actions.SetGameTimeActionLabel = "Set game time";
            Localization.Actions.TimeFormat = "hh:mm";

            Localization.Actions.ChooseDailyRoutineEvent = "&lt;Choose daily routine event&gt;";
            Localization.Actions.OpenDailyRoutineEventNpcTooltip = "Opens the npc to which the event belongs";
            Localization.Actions.DisableDailyRoutineEventLabel = "Disable daily routine event";
            Localization.Actions.EnableDailyRoutineEventLabel = "Enable daily routine event";

            Localization.Actions.ChooseMarkerLabel = "&lt;Choose marker&gt;";
            Localization.Actions.OpenMarkerTooltip = "Opens the map and zooms on the marker";
            Localization.Actions.TeleportNpcLabel = "Teleport npc";
            Localization.Actions.TeleportPlayerLabel = "Teleport player";
            Localization.Actions.TeleportChooseNpcLabel = "Teleport pick npc";
            Localization.Actions.TeleportTo = "teleport to";
            Localization.Actions.WalkNpcLabel = "Walk npc to marker";
            Localization.Actions.WalkChooseNpcLabel = "Walk pick npc to marker";
            Localization.Actions.WalkTo = "walk to";
            Localization.Actions.TeleportNpcToNpcLabel = "Teleport npc to npc";
            Localization.Actions.TeleportChooseNpcToNpcLabel = "Teleport pick npc to npc";
            Localization.Actions.TeleportToNpc = "teleport to";
            Localization.Actions.WalkNpcToNpcLabel = "Walk npc to npc";
            Localization.Actions.WalkChooseNpcToNpcLabel = "Walk pick npc to npc";
            Localization.Actions.WalkToNpc = "move to";

        }(DefaultNodeShapes.Localization = DefaultNodeShapes.Localization || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));