(function(GoNorth) {
    "use strict";
    (function(Evne) {
        (function(Localization) {

            // View Model
            Localization.SkillViewModel = {};
            Localization.SkillViewModel.ChooseQuest = "Quest auswählen";
            Localization.SkillViewModel.ChooseNpc = "Npc auswählen";

            // Evne Text Node
            GoNorth.DefaultNodeShapes.Localization.TypeNames["evne.Text"] = "Text";
            
            Localization.TextNode = {};
            Localization.TextNode.Text = "Text";

            // Action
            Localization.Actions = {};

            Localization.Actions.ChangeCurrentSkillValueLabel = "Fähigkeitswert ändern";

            Localization.Actions.SetTargetNpcStateLabel = "Ziel Npc Zustand ändern";

            // Condition
            Localization.Conditions = {};
            Localization.Conditions.CheckSkillValueLabel = "Fähigkeiten Wert prüfen";
            Localization.Conditions.SkillLabel = "Skill";

        }(Evne.Localization = Evne.Localization || {}));
    }(GoNorth.Evne = GoNorth.Evne || {}));
}(window.GoNorth = window.GoNorth || {}));