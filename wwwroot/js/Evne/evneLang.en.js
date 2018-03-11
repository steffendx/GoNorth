(function(GoNorth) {
    "use strict";
    (function(Evne) {
        (function(Localization) {

            // View Model
            Localization.SkillViewModel = {};
            Localization.SkillViewModel.ChooseQuest = "Choose quest";
            Localization.SkillViewModel.ChooseNpc = "Choose npc";

            // Evne Text Node
            GoNorth.DefaultNodeShapes.Localization.TypeNames["evne.Text"] = "Text";
            
            Localization.TextNode = {};
            Localization.TextNode.Text = "Text";

            // Action
            Localization.Actions = {};

            Localization.Actions.ChangeCurrentSkillValueLabel = "Change skill value";

            Localization.Actions.SetTargetNpcStateLabel = "Change target npc state";

            // Condition
            Localization.Conditions = {};
            Localization.Conditions.CheckSkillValueLabel = "Check skill value";
            Localization.Conditions.SkillLabel = "Skill";

        }(Evne.Localization = Evne.Localization || {}));
    }(GoNorth.Evne = GoNorth.Evne || {}));
}(window.GoNorth = window.GoNorth || {}));