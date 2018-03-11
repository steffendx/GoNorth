(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(Localization) {

            // Start
            GoNorth.DefaultNodeShapes.Localization.TypeNames["aika.Start"] = "Start";

            // Finish
            GoNorth.DefaultNodeShapes.Localization.TypeNames["aika.Finish"] = "Abschluss";

            Localization.Finish = {};
            Localization.Finish.FinishName = "Name";
            Localization.Finish.Colors = {
                White: "Weiss",
                Red: "Rot",
                Green: "Grün",
                Blue: "Blau",
                Yellow: "Gelb",
                Purple: "Lila"
            };

            // All Done
            GoNorth.DefaultNodeShapes.Localization.TypeNames["aika.AllDone"] = "Alles abgeschlossen";

        }(Aika.Localization = Aika.Localization || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(Localization) {

            // Chapter
            GoNorth.DefaultNodeShapes.Localization.TypeNames["aika.Chapter"] = "Kapitel";

            Localization.Chapter = {};
            Localization.Chapter.ChapterName = "Kapitelname";
            Localization.Chapter.ChapterNumber = "Kapitelnummer";
            Localization.Chapter.OpenDetailView = "Detailansicht öffnen";

        }(Aika.Localization = Aika.Localization || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(Localization) {

            // ViewModel
            Localization.ViewModel = {};
            Localization.ViewModel.ChooseQuest = "Quest auswählen";
            Localization.ViewModel.ChooseChapterDetail = "Detailansicht auswählen";

            // Quest
            GoNorth.DefaultNodeShapes.Localization.TypeNames["aika.Quest"] = "Quest";

            Localization.QuestNode = {};
            Localization.QuestNode.IsMainQuestTooltip = "Hauptquest";

            // Chapter Detail
            GoNorth.DefaultNodeShapes.Localization.TypeNames["aika.ChapterDetail"] = "Detailansicht";

            Localization.ChapterDetail = {};
            Localization.ChapterDetail.DetailName = "Name";

        }(Aika.Localization = Aika.Localization || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(Localization) {

            // View Model
            Localization.QuestViewModel = {};
            Localization.QuestViewModel.ChooseQuest = "Quest auswählen";
            Localization.QuestViewModel.ChooseNpc = "Npc auswählen";
            Localization.QuestViewModel.ChooseSkill = "Fähigkeit auswählen";

            // Quest Text Node
            GoNorth.DefaultNodeShapes.Localization.TypeNames["aika.Text"] = "Text";
            
            Localization.TextNode = {};
            Localization.TextNode.Text = "Text";

            // Conditions
            Localization.Conditions = {};

            Localization.Conditions.CheckCurrentQuestValueLabel = "Aktuellen Quest Wert prüfen";
            Localization.Conditions.CurrentQuestLabel = "Aktueller Quest";

            Localization.Conditions.CheckQuestMarkerDistanceLabel = "Spieler Entfernung zu Quest Marker prüfen";
            Localization.Conditions.MarkerDistance = "Entfernung";
            Localization.Conditions.MarkerDistanceCloserThan = "näher als";
            Localization.Conditions.MarkerDistanceMoreFarThan = "weiter weg als";
            Localization.Conditions.MarkerWasDeleted = "Markierung wurde gelöscht.";

            // Actions
            Localization.Actions = {};

            Localization.Actions.ChangeCurrentQuestValueLabel = "Aktuellen Quest Wert ändern";

            Localization.Actions.NpcDialogCheckMissingPermissions = "Du hast unzureichende Rechte um die Daten für die Überprüfung abzufragen.";
            Localization.Actions.ChooseNpcLabel = "<Npc auswählen>";
            Localization.Actions.OpenDialogTooltip = "Öffnet den ausgewählten Dialog";
            Localization.Actions.ChangeQuestStateInNpcDialogActionLabel = "Quest Status wird in Npc Dialog geändert";
            Localization.Actions.ChangeQuestStateDialogValidationFailed = "Der Quest wird im ausgewählten Dialog nicht auf den ausgewählten Status festgelegt. Bitte prüfe den Dialog.";
            Localization.Actions.ChangeQuestTextInNpcDialogActionLabel = "Quest Text wird in Npc Dialog geändert";
            Localization.Actions.ChangeQuestTextDialogValidationFailed = "Der Quest Text wird im ausgewählten Dialog nicht geändert. Bitte prüfe den Dialog.";

        }(Aika.Localization = Aika.Localization || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));