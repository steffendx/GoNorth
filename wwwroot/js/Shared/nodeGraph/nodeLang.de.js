(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Localization) {

            // Node Display
            Localization.NodeDisplay = {};

            Localization.NodeDisplay.Position = "Position:";
            Localization.NodeDisplay.Zoom = "Zoom:";       
            Localization.NodeDisplay.ToogleMiniMap = "Hier klicken um die Minimap ein und auszublenden";     

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

            Localization.Conditions.CheckPlayerValueLabel = "Spieler Wert prüfen";
            Localization.Conditions.PlayerLabel = "Spieler";

            Localization.Conditions.ChooseQuestLabel = "<Quest auswählen>";

            Localization.Conditions.CheckChooseQuestValueLabel = "Beliebigen Quest Wert prüfen";

            Localization.Conditions.StateLabel = "Status";

            Localization.Conditions.CheckQuestStateLabel = "Quest Status prüfen";

            Localization.Conditions.ChooseNpcLabel = "<Npc auswählen>";

            Localization.Conditions.CheckNpcAliveStateLabel = "Npc Überlebensstatus prüfen";
            Localization.Conditions.NpcAliveStateAlive = "Lebendig";
            Localization.Conditions.NpcAliveStateDead = "Tot";

            Localization.Conditions.CheckGameTimeLabel = "Spielzeit prüfen";
            Localization.Conditions.GameTimeOperatorBefore = "vor";
            Localization.Conditions.GameTimeOperatorAfter = "nach";
            Localization.Conditions.GameTime = "Spielzeit";

            Localization.Conditions.ChooseSkillLabel = "<Fähigkeit auswählen>";

            Localization.Conditions.CheckChoosePlayerSkillValueLabel = "Spieler Fähigkeits Wert prüfen";
            Localization.Conditions.PlayerSkillPrefix = "Spieler ";

            Localization.Conditions.CheckPlayerLearnedSkillLabel = "Spieler beherrscht Fähigkeit";
            Localization.Conditions.CheckPlayerLearnedSkillPrefixLabel = "Spieler beherrscht ";

            Localization.Conditions.CheckPlayerNotLearnedSkillLabel = "Spieler beherrscht Fähigkeit nicht";
            Localization.Conditions.CheckPlayerNotLearnedSkillPrefixLabel = "Spieler beherrscht nicht ";
            
            // Actions
            Localization.Actions = {};

            Localization.Actions.NumberField = "Zahlenfeld";
            Localization.Actions.TextField = "Textfeld";

            Localization.Actions.ChangePlayerValueLabel = "Spieler Wert ändern";
            Localization.Actions.ChangeQuestValueLabel = "Beliebigen Quest Wert ändern";
            Localization.Actions.ChooseQuestLabel = "&lt;Quest auswählen&gt;";
            
            Localization.Actions.QuestState = "Status";
            
            Localization.Actions.SetQuestStateLabel = "Quest Status ändern";
            Localization.Actions.OpenQuestTooltip = "Öffnet den ausgewählten Quest";

            Localization.Actions.AddQuestTextLabel = "Quest Text hinzufügen";
            Localization.Actions.QuestText = "Text";

            Localization.Actions.WaitLabel = "Warten";
            Localization.Actions.WaitTypeRealTime = "Echtzeit";
            Localization.Actions.WaitTypeGameTime = "Spielzeit";
            Localization.Actions.WaitUnitMilliseconds = "Millisekunden";
            Localization.Actions.WaitUnitSeconds = "Sekunden";
            Localization.Actions.WaitUnitMinutes = "Minuten";
            Localization.Actions.WaitUnitHours = "Stunden";
            Localization.Actions.WaitUnitDays = "Tage";

            Localization.Actions.StatePlaceholder = "Zustand";

            Localization.Actions.SetPlayerStateLabel = "Spielerzustand ändern";

            Localization.Actions.ChooseSkillLabel = "&lt;Fähigkeit auswählen&gt;";
            Localization.Actions.OpenSkillTooltip = "Öffnet die ausgewählte Fähigkeit";

            Localization.Actions.PlayerLearnSkillLabel = "Spieler lernt Fähigkeit";
            Localization.Actions.PlayerForgetSkillLabel = "Spieler vergisst Fähigkeit";

            Localization.Actions.ChangePlayerSkillValueLabel = "Spieler Fähigkeit Wert ändern";

        }(DefaultNodeShapes.Localization = DefaultNodeShapes.Localization || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));