(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(Localization) {

            // Start
            GoNorth.DefaultNodeShapes.Localization.TypeNames["aika.Start"] = "Start";

            // Finish
            GoNorth.DefaultNodeShapes.Localization.TypeNames["aika.Finish"] = "Finish";

            Localization.Finish = {};
            Localization.Finish.FinishName = "Name";
            Localization.Finish.Colors = {
                White: "White",
                Red: "Red",
                Green: "Green",
                Blue: "Blue",
                Yellow: "Yellow",
                Purple: "Purple"
            };

            // All Done
            GoNorth.DefaultNodeShapes.Localization.TypeNames["aika.AllDone"] = "All done";

        }(Aika.Localization = Aika.Localization || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(Localization) {

            // Chapter
            GoNorth.DefaultNodeShapes.Localization.TypeNames["aika.Chapter"] = "Chapter";

            Localization.Chapter = {};
            Localization.Chapter.ChapterName = "Chapter name";
            Localization.Chapter.ChapterNumber = "Chapter number";
            Localization.Chapter.OpenDetailView = "Open detail view";

        }(Aika.Localization = Aika.Localization || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));
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