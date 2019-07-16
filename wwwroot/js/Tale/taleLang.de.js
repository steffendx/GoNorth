(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Localization) {

            Localization.ViewModel = {};
            Localization.ViewModel.ChooseQuest = "Quest auswählen";
            Localization.ViewModel.ChooseNpc = "Npc auswählen";
            Localization.ViewModel.ChooseSkill = "Fähigkeit auswählen";
            Localization.ViewModel.ChooseDailyRoutineEvent = "Tagesablauf Ereignis auswählen";
            Localization.ViewModel.ChooseMarker = "Markierung auswählen";

            // Text Lines
            GoNorth.DefaultNodeShapes.Localization.TypeNames["tale.PlayerText"] = "Spieler Zeile";
            GoNorth.DefaultNodeShapes.Localization.TypeNames["tale.NpcText"] = "Npc Zeile";

            Localization.PlayerTextPlaceHolder = "Spieler Zeile";
            Localization.NpcTextPlaceHolder = "Npc Zeile";

            // Choice
            GoNorth.DefaultNodeShapes.Localization.TypeNames["tale.Choice"] = "Auswahl";

            Localization.Choices = {};

            Localization.Choices.ChoiceText = "Auswahltext";

            Localization.Choices.AddNewChoice = "Auswahl hinzufügen";
            Localization.Choices.MoveUpToolTip = "Auswahl nach oben bewegen";
            Localization.Choices.MoveDownToolTip = "Auswahl nach unten bewegen";
            Localization.Choices.EditConditionToolTip = "Bedingung editieren";
            Localization.Choices.AllowMultipleSelectionToolTip = "Dem Spieler erlauben die Antwort mehrfach auszuwählen";
            Localization.Choices.DeleteToolTip = "Auswahl Löschen";

            // Action
            Localization.Actions = {};

            Localization.Actions.PersistDialogStateLabel = "Dialogzustand speichern";
            Localization.Actions.PersistDialogStateWillContinueOnThisPointNextTalk = "Der Dialog wird an diesem Punkt forgesetzt wenn der Npc das nächste mal angesprochen wird.";

            Localization.Actions.OpenShopLabel = "Handel öffnen";
            Localization.Actions.WillOpenAShopForTheCurrentNpc = "Es wird ein Handel mit dem aktuellen Npc gestartet.";

            // Condition
            Localization.Conditions = {};

        }(Tale.Localization = Tale.Localization || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));