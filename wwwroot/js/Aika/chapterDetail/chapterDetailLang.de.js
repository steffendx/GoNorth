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