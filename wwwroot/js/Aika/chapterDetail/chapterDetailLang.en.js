(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(Localization) {

            // ViewModel
            Localization.ViewModel = {};
            Localization.ViewModel.ChooseQuest = "Choose quest";
            Localization.ViewModel.ChooseChapterDetail = "Choose detail view";

            // Quest
            GoNorth.DefaultNodeShapes.Localization.TypeNames["aika.Quest"] = "Quest";

            Localization.QuestNode = {};
            Localization.QuestNode.IsMainQuestTooltip = "Main quest";

            // Chapter Detail
            GoNorth.DefaultNodeShapes.Localization.TypeNames["aika.ChapterDetail"] = "Detail view";

            Localization.ChapterDetail = {};
            Localization.ChapterDetail.DetailName = "Name";

        }(Aika.Localization = Aika.Localization || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));