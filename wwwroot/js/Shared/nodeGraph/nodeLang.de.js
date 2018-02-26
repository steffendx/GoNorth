(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Localization) {

            // Node Display
            Localization.NodeDisplay = {};

            Localization.NodeDisplay.Position = "Position:";
            Localization.NodeDisplay.Zoom = "Zoom:";            

            // Shared Messages
            Localization.DeleteNode = "Knoten löschen";
            Localization.ErrorOccured = "Ein Fehler ist aufgetreten";

            // Text Node
            Localization.TypeNames = {
                "default.Text": "Text"
            };

            Localization.TextPlaceHolder = "Text";

            // Quest States
            Localization.QuestStates = {};
            Localization.QuestStates.NotStarted = "Nicht begonnen";
            Localization.QuestStates.InProgress = "In Arbeit";
            Localization.QuestStates.Success = "Abgeschlossen";
            Localization.QuestStates.Failed = "Fehlgeschlagen";

            // Actions
            GoNorth.DefaultNodeShapes.Localization.TypeNames["default.Action"] = "Aktion";

            // Conditions
            Localization.TypeNames["default.Condition"] = "Bedingung";

            Localization.Conditions = {};

            Localization.Conditions.MissingInformations = "<Fehlende Daten>"

            Localization.Conditions.AddCondition = "Bedingung hinzufügen";

            Localization.Conditions.AndOperator = "Und";
            Localization.Conditions.AndOperatorShort = "&&";
            Localization.Conditions.OrOperator = "Oder";
            Localization.Conditions.OrOperatorShort = "||";

            Localization.Conditions.EditCondition = "<Bedingung bearbeiten>";
            Localization.Conditions.LoadingConditionText = "Lade Bedingung...";
            Localization.Conditions.ErrorLoadingConditionText = "Fehler beim Laden";
            Localization.Conditions.Else = "else";

            Localization.Conditions.MoveConditionUp = "Bedingung nach oben verschieben";
            Localization.Conditions.MoveConditionDown = "Bedingung nach unten verschieben";
            Localization.Conditions.DeleteCondition = "Bedingung löschen";

            Localization.Conditions.NumberField = "Zahlenfeld";
            Localization.Conditions.TextField = "Textfeld";
            Localization.Conditions.FieldWasDeleted = "Feld wurde gelöscht.";

            Localization.Conditions.ChooseQuestLabel = "<Quest auswählen>";

            Localization.Conditions.CheckChooseQuestValueLabel = "Beliebigen Quest Wert prüfen";

            Localization.Conditions.StateLabel = "Status";

            Localization.Conditions.CheckQuestStateLabel = "Quest Status prüfen";

            Localization.Conditions.ChooseNpcLabel = "<Npc auswählen>";

            Localization.Conditions.CheckNpcAliveStateLabel = "Npc Überlebensstatus prüfen";
            Localization.Conditions.NpcAliveStateAlive = "Lebendig";
            Localization.Conditions.NpcAliveStateDead = "Tot";
            
            // Actions
            Localization.Actions = {};

            Localization.Actions.NumberField = "Zahlenfeld";
            Localization.Actions.TextField = "Textfeld";

            Localization.Actions.ChangeQuestValueLabel = "Beliebigen Quest Wert ändern";
            Localization.Actions.ChooseQuestLabel = "&lt;Quest auswählen&gt;";
            
            Localization.Actions.QuestState = "Status";
            
            Localization.Actions.SetQuestStateLabel = "Quest Status ändern";
            Localization.Actions.OpenQuestTooltip = "Öffnet den ausgewählten Quest";

            Localization.Actions.AddQuestTextLabel = "Quest Text hinzufügen";
            Localization.Actions.QuestText = "Text";

        }(DefaultNodeShapes.Localization = DefaultNodeShapes.Localization || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));