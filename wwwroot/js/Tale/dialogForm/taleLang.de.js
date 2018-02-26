(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Localization) {

            Localization.ViewModel = {};
            Localization.ViewModel.ChooseItem = "Item auswählen";
            Localization.ViewModel.ChooseQuest = "Quest auswählen";
            Localization.ViewModel.ChooseNpc = "Npc auswählen";

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

            Localization.Actions.ChangePlayerValueLabel = "Spieler Wert ändern";
            Localization.Actions.ChangeNpcValueLabel = "Npc Wert ändern";

            Localization.Actions.ChooseItem = "<Item auswählen>";
            Localization.Actions.SpawnItemInPlayerInventoryLabel = "Item in Spieler inventar spawnen";
            Localization.Actions.SpawnItemInNpcInventoryLabel = "Item in Npc inventar spawnen";
            Localization.Actions.TransferItemToPlayerInventoryLabel = "Item an Spieler übergeben";
            Localization.Actions.TransferItemToNpcInventoryLabel = "Item an Npc übergeben";
            Localization.Actions.ItemQuantity = "Anzahl (leer = 1):"

            // Condition
            Localization.Conditions = {};
            Localization.Conditions.CheckPlayerValueLabel = "Spieler Wert prüfen";
            Localization.Conditions.PlayerLabel = "Spieler";
            Localization.Conditions.CheckNpcValueLabel = "Npc Wert prüfen";
            Localization.Conditions.NpcLabel = "Npc";

            Localization.Conditions.CheckPlayerInventoryLabel = "Spieler Inventar prüfen";
            Localization.Conditions.PlayerInventoryLabel = "Inventar Spieler";
            Localization.Conditions.CheckNpcInventoryLabel = "Npc Inventar prüfen";
            Localization.Conditions.NpcInventoryLabel = "Inventar Npc";
            Localization.Conditions.ChooseItem = "<Item auswählen>";
            Localization.Conditions.ItemOperatorHasAtLeast = "hat mindestens";
            Localization.Conditions.ItemOperatorHasMaximum = "hat maximal";
            Localization.Conditions.ItemCount = "Anz";

        }(Tale.Localization = Tale.Localization || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));