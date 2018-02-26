(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Localization) {

            Localization.ViewModel = {};
            Localization.ViewModel.ChooseItem = "Choose item";
            Localization.ViewModel.ChooseQuest = "Choose quest";
            Localization.ViewModel.ChooseNpc = "Choose npc";

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

            Localization.Actions.ChangePlayerValueLabel = "Change player value";
            Localization.Actions.ChangeNpcValueLabel = "Change npc value";

            Localization.Actions.ChooseItem = "<Choose item>";
            Localization.Actions.SpawnItemInPlayerInventoryLabel = "Spawn item in player inventory";
            Localization.Actions.SpawnItemInNpcInventoryLabel = "Spawn item in npc inventory";
            Localization.Actions.TransferItemToPlayerInventoryLabel = "Give item to player";
            Localization.Actions.TransferItemToNpcInventoryLabel = "Give item to npc";
            Localization.Actions.ItemQuantity = "Quantity (blank = 1):"

            // Condition
            Localization.Conditions = {};
            Localization.Conditions.CheckPlayerValueLabel = "Check player value";
            Localization.Conditions.PlayerLabel = "Player";
            Localization.Conditions.CheckNpcValueLabel = "Check npc value";
            Localization.Conditions.NpcLabel = "Npc";

            Localization.Conditions.CheckPlayerInventoryLabel = "Check player inventory";
            Localization.Conditions.PlayerInventoryLabel = "Player inventory";
            Localization.Conditions.CheckNpcInventoryLabel = "Check npc inventory";
            Localization.Conditions.NpcInventoryLabel = "Npc inventory";
            Localization.Conditions.ChooseItem = "<Choose item>";
            Localization.Conditions.ItemOperatorHasAtLeast = "has at least";
            Localization.Conditions.ItemOperatorHasMaximum = "hast at maximum";
            Localization.Conditions.ItemCount = "Cnt";

        }(Tale.Localization = Tale.Localization || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));