(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(Localization) {

            // View Model
            Localization.QuestViewModel = {};
            Localization.QuestViewModel.ChooseQuest = "Choose quest";
            Localization.QuestViewModel.ChooseNpc = "Choose npc";
            Localization.QuestViewModel.ChooseSkill = "Choose skill";

            // Quest Text Node
            GoNorth.DefaultNodeShapes.Localization.TypeNames["aika.Text"] = "Text";
            
            Localization.TextNode = {};
            Localization.TextNode.Text = "Text";

            // Conditions
            Localization.Conditions = {};

            Localization.Conditions.CheckCurrentQuestValueLabel = "Check current quest value";
            Localization.Conditions.CurrentQuestLabel = "Current quest";

            Localization.Conditions.CheckQuestMarkerDistanceLabel = "Check player distance to quest marker";
            Localization.Conditions.MarkerDistance = "Distance";
            Localization.Conditions.MarkerDistanceCloserThan = "closer than";
            Localization.Conditions.MarkerDistanceMoreFarThan = "further than";
            Localization.Conditions.MarkerWasDeleted = "Marker was deleted.";

            // Actions
            Localization.Actions = {};

            Localization.Actions.ChangeCurrentQuestValueLabel = "Change current quest value";

            Localization.Actions.NpcDialogCheckMissingPermissions = "You are missing permissions to request the data for checking.";
            Localization.Actions.ChooseNpcLabel = "<Choose npc>";
            Localization.Actions.OpenDialogTooltip = "Opens the chosen dialog";
            Localization.Actions.ChangeQuestStateInNpcDialogActionLabel = "Quest status will be changed in npc dialog";
            Localization.Actions.ChangeQuestStateDialogValidationFailed = "The quest is not changed to the chosen status in the chosen dialog. Please check the dialog.";
            Localization.Actions.ChangeQuestTextInNpcDialogActionLabel = "Quest text will be changed in npc dialog";
            Localization.Actions.ChangeQuestTextDialogValidationFailed = "The quest text is not changed in the chose ndialog. Please check the dialog.";

        }(Aika.Localization = Aika.Localization || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));