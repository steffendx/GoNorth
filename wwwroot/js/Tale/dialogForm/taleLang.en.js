(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Localization) {

            Localization.ViewModel = {};
            Localization.ViewModel.ChooseGeneralObject = "Choose object";
            Localization.ViewModel.ChooseQuest = "Choose quest";
            Localization.ViewModel.ChooseNpc = "Choose npc";
            Localization.ViewModel.ChooseSkill = "Choose skill";
            Localization.ViewModel.ChooseDailyRoutineEvent = "Choose daily routine event";
            Localization.ViewModel.ChooseMarker = "Choose marker";

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

            Localization.Actions.PersistDialogStateLabel = "Save dialog state";
            Localization.Actions.PersistDialogStateWillContinueOnThisPointNextTalk = "The dialog will be continued from this node the next time the player talks to the npc.";
            Localization.Actions.PersistDialogStateEndDialog = "End dialog";

            Localization.Actions.OpenShopLabel = "Open shop";
            Localization.Actions.WillOpenAShopForTheCurrentNpc = "A trade will be started with the current npc.";

            // Condition
            Localization.Conditions = {};

        }(Tale.Localization = Tale.Localization || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));