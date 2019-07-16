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

            // Dialog Title
            Localization.Dialogs = {};
            Localization.Dialogs.ChooseItem = "Item auswählen";

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

            Localization.Conditions.CheckNpcValueLabel = "Npc Wert prüfen";
            Localization.Conditions.NpcLabel = "Npc";
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

            Localization.Conditions.CheckPlayerInventoryLabel = "Spieler Inventar prüfen";
            Localization.Conditions.PlayerInventoryLabel = "Inventar Spieler";
            Localization.Conditions.CheckNpcInventoryLabel = "Npc Inventar prüfen";
            Localization.Conditions.NpcInventoryLabel = "Inventar Npc";
            Localization.Conditions.ChooseItem = "<Item auswählen>";
            Localization.Conditions.ItemOperatorHasAtLeast = "hat mindestens";
            Localization.Conditions.ItemOperatorHasMaximum = "hat maximal";
            Localization.Conditions.ItemCount = "Anz";

            Localization.Conditions.CheckChooseNpcSkillValueLabel = "Npc Fähigkeits Wert prüfen";
            Localization.Conditions.NpcSkillPrefix = "Npc ";

            Localization.Conditions.CheckNpcLearnedSkillLabel = "Npc beherrscht Fähigkeit";
            Localization.Conditions.CheckNpcLearnedSkillPrefixLabel = "Npc beherrscht ";

            Localization.Conditions.CheckNpcNotLearnedSkillLabel = "Npc beherrscht Fähigkeit nicht";
            Localization.Conditions.CheckNpcNotLearnedSkillPrefixLabel = "Npc beherrscht nicht ";

            Localization.Conditions.CheckRandomValueLabel = "Zufallswert prüfen";
            Localization.Conditions.Rand = "Zufallswert";

            Localization.Conditions.ChooseDailyRoutineEvent = "<Tagesablauf Ereignis auswählen>";
            Localization.Conditions.TimeFormat = "hh:mm";
            Localization.Conditions.CheckDailyRoutineIsActive = "Tagesablauf ist aktiv prüfen";
            Localization.Conditions.CheckDailyRoutineIsDisabled = "Tagesablauf ist deaktiviert prüfen";
            Localization.Conditions.DailyRoutineEventIsActive = "Tagesablauf {0} aktiv";
            Localization.Conditions.DailyRoutineEventIsDisabled = "Tagesablauf {0} deaktiviert";

            // Actions
            Localization.Actions = {};

            Localization.Actions.NumberField = "Zahlenfeld";
            Localization.Actions.TextField = "Textfeld";

            Localization.Actions.ChangePlayerValueLabel = "Spieler Wert ändern";
            Localization.Actions.ChangeNpcValueLabel = "Npc Wert ändern";
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

            Localization.Actions.SetPlayerStateLabel = "Spieler Zustand festlegen";
            Localization.Actions.SetNpcStateLabel = "Npc Zustand festlegen";

            Localization.Actions.ChooseSkillLabel = "&lt;Fähigkeit auswählen&gt;";
            Localization.Actions.OpenSkillTooltip = "Öffnet die ausgewählte Fähigkeit";

            Localization.Actions.PlayerLearnSkillLabel = "Spieler lernt Fähigkeit";
            Localization.Actions.PlayerForgetSkillLabel = "Spieler vergisst Fähigkeit";

            Localization.Actions.NpcLearnsSkillLabel = "Npc lernt Fähigkeit";
            Localization.Actions.NpcForgetSkillLabel = "Npc vergisst Fähigkeit";

            Localization.Actions.ChangePlayerSkillValueLabel = "Spieler Fähigkeit Wert ändern";
            Localization.Actions.ChangeNpcSkillValueLabel = "Npc Fähigkeit Wert ändern";

            Localization.Actions.AnimationPlaceholder = "Animationsname";
            Localization.Actions.PlayNpcAnimationLabel = "Npc Animation abspielen";
            Localization.Actions.PlayPlayerAnimationLabel = "Spieler Animation abspielen";

            Localization.Actions.ChooseItem = "<Item auswählen>";
            Localization.Actions.OpenItemTooltip  = "Öffnet das ausgewählte Item";
            Localization.Actions.SpawnItemInPlayerInventoryLabel = "Item in Spieler inventar spawnen";
            Localization.Actions.SpawnItemInNpcInventoryLabel = "Item in Npc inventar spawnen";
            Localization.Actions.TransferItemToPlayerInventoryLabel = "Item an Spieler übergeben";
            Localization.Actions.TransferItemToNpcInventoryLabel = "Item an Npc übergeben";
            Localization.Actions.ItemQuantity = "Anzahl (leer = 1):";

            Localization.Actions.CodeActionLabel = "Scriptcode";
            Localization.Actions.ClickHereToEditCode = "&lt;Hier klicken um den Code zu editieren&gt;";
            
            Localization.Actions.FloatingText = "Text";
            Localization.Actions.ShowFloatingTextAboveNpcLabel = "Text über Npc anzeigen";
            Localization.Actions.ShowFloatingTextAbovePlayerLabel = "Text über Spieler anzeigen";
            Localization.Actions.ShowFloatingTextAboveChooseNpcLabel = "Text über beliebigen Npc anzeigen";
            Localization.Actions.ChooseNpcLabel = "&lt;Npc auswählen&gt;";
            Localization.Actions.OpenNpcTooltip = "Öffnet den ausgewählten Npc";

            Localization.Actions.FadeTimePlaceholder = "Übergangszeit";
            Localization.Actions.FadeToBlackLabel = "Zu Schwarz überblenden";
            Localization.Actions.FadeFromBlackLabel = "Zurück von Schwarz überblenden";

            Localization.Actions.RemoveItemFromNpcInventoryLabel = "Item aus Npc inventar entfernen";
            Localization.Actions.RemoveItemFromPlayerInventoryLabel = "Item aus Spieler inventar entfernen";

            Localization.Actions.SetGameTimeActionLabel = "Spielzeit festlegen";
            Localization.Actions.TimeFormat = "hh:mm";
            
            Localization.Actions.ChooseDailyRoutineEvent = "&lt;Tagesablauf Ereignis auswählen&gt;";
            Localization.Actions.OpenDailyRoutineEventNpcTooltip = "Öffnet den Npc zu dem das ausgewählte Ereignis gehört";
            Localization.Actions.DisableDailyRoutineEventLabel = "Tagesablauf Ereignis deaktivieren";
            Localization.Actions.EnableDailyRoutineEventLabel = "Tagesablauf Ereignis aktivieren";

            Localization.Actions.ChooseMarkerLabel = "&lt;Markierung auswählen&gt;";
            Localization.Actions.OpenMarkerTooltip = "Öffnet die Karte und zoomt auf den Marker";
            Localization.Actions.TeleportNpcLabel = "Npc teleportieren";
            Localization.Actions.TeleportPlayerLabel = "Spieler teleportieren";
            Localization.Actions.TeleportChooseNpcLabel = "Beliebigen Npc teleportieren";
            Localization.Actions.TeleportTo = "teleportieren nach";
            Localization.Actions.WalkNpcLabel = "Npc zu Markierung bewegen";
            Localization.Actions.WalkChooseNpcLabel = "Beliebigen Npc zu Markierung bewegen";
            Localization.Actions.WalkTo = "bewegen nach";
            Localization.Actions.TeleportNpcToNpcLabel = "Npc zu Npc teleportieren";
            Localization.Actions.TeleportChooseNpcToNpcLabel = "Beliebigen Npc zu Npc teleportieren";
            Localization.Actions.TeleportToNpc = "teleportieren zu";
            Localization.Actions.WalkNpcToNpcLabel = "Npc zu Npc bewegen";
            Localization.Actions.WalkChooseNpcToNpcLabel = "Beliebigen Npc zu Npc bewegen";
            Localization.Actions.WalkToNpc = "bewegen zu";

        }(DefaultNodeShapes.Localization = DefaultNodeShapes.Localization || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));