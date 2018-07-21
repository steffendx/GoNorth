(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Localization) {

            Localization.ViewModel = {};
            Localization.ViewModel.ChooseItem = "Choose item";
            Localization.ViewModel.ChooseQuest = "Choose quest";
            Localization.ViewModel.ChooseNpc = "Choose npc";
            Localization.ViewModel.ChooseSkill = "Choose skill";

            // Text Lines
            GoNorth.DefaultNodeShapes.Localization.TypeNames["tale.PlayerText"] = "Player line";
            GoNorth.DefaultNodeShapes.Localization.TypeNames["tale.NpcText"] = "Npc line";

            Localization.PlayerTextPlaceHolder = "Player line";
            Localization.NpcTextPlaceHolder = "Npc line";

            // Choice
            GoNorth.DefaultNodeShapes.Localization.TypeNames["tale.Choice"] = "Choice";

            Localization.Choices = {};

            Localization.Choices.ChoiceText = "Choice text";

            Localization.Choices.AddNewChoice = "Add choice";
            Localization.Choices.MoveUpToolTip = "Move choice up";
            Localization.Choices.MoveDownToolTip = "Move choice down";
            Localization.Choices.EditConditionToolTip = "Edit condition";
            Localization.Choices.AllowMultipleSelectionToolTip = "Allow player to use the answer multiple time";
            Localization.Choices.DeleteToolTip = "Delete choice";

            // Action
            Localization.Actions = {};

            Localization.Actions.ChangeNpcValueLabel = "Change npc value";

            Localization.Actions.ChooseItem = "<Choose item>";
            Localization.Actions.SpawnItemInPlayerInventoryLabel = "Spawn item in player inventory";
            Localization.Actions.SpawnItemInNpcInventoryLabel = "Spawn item in npc inventory";
            Localization.Actions.TransferItemToPlayerInventoryLabel = "Give item to player";
            Localization.Actions.TransferItemToNpcInventoryLabel = "Give item to npc";
            Localization.Actions.ItemQuantity = "Quantity (blank = 1):"

            Localization.Actions.SetNpcStateLabel = "Change npc state";

            Localization.Actions.NpcLearnsSkillLabel = "Npc learns skill";
            Localization.Actions.NpcForgetSkillLabel = "Npc forgets skill";

            Localization.Actions.ChangeNpcSkillValueLabel = "Change npc skill value";
            
            Localization.Actions.PersistDialogStateLabel = "Save dialog state";
            Localization.Actions.PersistDialogStateWillContinueOnThisPointNextTalk = "The dialog will be continued from this node the next time the player talks to the npc.";

            Localization.Actions.OpenShopLabel = "Open shop";
            Localization.Actions.WillOpenAShopForTheCurrentNpc = "A trade will be started with the current npc.";

            // Condition
            Localization.Conditions = {};
            Localization.Conditions.CheckNpcValueLabel = "Check npc value";
            Localization.Conditions.NpcLabel = "Npc";

            Localization.Conditions.CheckPlayerInventoryLabel = "Check player inventory";
            Localization.Conditions.PlayerInventoryLabel = "Player inventory";
            Localization.Conditions.CheckNpcInventoryLabel = "Check npc inventory";
            Localization.Conditions.NpcInventoryLabel = "Npc inventory";
            Localization.Conditions.ChooseItem = "<Choose item>";
            Localization.Conditions.OpenItemTooltip  = "Opens the chosen item";
            Localization.Conditions.ItemOperatorHasAtLeast = "has at least";
            Localization.Conditions.ItemOperatorHasMaximum = "hast at maximum";
            Localization.Conditions.ItemCount = "Cnt";

            Localization.Conditions.CheckChooseNpcSkillValueLabel = "Check npc skill value";
            Localization.Conditions.NpcSkillPrefix = "Npc ";

            Localization.Conditions.CheckNpcLearnedSkillLabel = "Npc can use skill";
            Localization.Conditions.CheckNpcLearnedSkillPrefixLabel = "Npc can use ";

            Localization.Conditions.CheckNpcNotLearnedSkillLabel = "Npc can not use skill";
            Localization.Conditions.CheckNpcNotLearnedSkillPrefixLabel = "Npc can not use ";

        }(Tale.Localization = Tale.Localization || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));