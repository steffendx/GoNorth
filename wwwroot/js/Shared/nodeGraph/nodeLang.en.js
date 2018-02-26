(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Localization) {

            // Node Display
            Localization.NodeDisplay = {};

            Localization.NodeDisplay.Position = "Position:";
            Localization.NodeDisplay.Zoom = "Zoom:";            

            // Shared Messages
            Localization.DeleteNode = "Delete node";
            Localization.ErrorOccured = "An error occured";

            // Text Node
            Localization.TypeNames = {
                "default.Text": "Text"
            };

            Localization.TextPlaceHolder = "Text";

            // Quest States
            Localization.QuestStates = {};
            Localization.QuestStates.NotStarted = "Not started";
            Localization.QuestStates.InProgress = "In progress";
            Localization.QuestStates.Success = "Success";
            Localization.QuestStates.Failed = "Failed";

            // Actions
            GoNorth.DefaultNodeShapes.Localization.TypeNames["default.Action"] = "Action";

            // Conditions
            Localization.TypeNames["default.Condition"] = "Condition";

            Localization.Conditions = {};

            Localization.Conditions.MissingInformations = "<Missing information>"

            Localization.Conditions.AddCondition = "Add condition";

            Localization.Conditions.AndOperator = "And";
            Localization.Conditions.AndOperatorShort = "&&";
            Localization.Conditions.OrOperator = "Or";
            Localization.Conditions.OrOperatorShort = "||";

            Localization.Conditions.EditCondition = "<Edit condition>";
            Localization.Conditions.LoadingConditionText = "Loading condition...";
            Localization.Conditions.ErrorLoadingConditionText = "Error while loading";
            Localization.Conditions.Else = "else";

            Localization.Conditions.MoveConditionUp = "Move condition up";
            Localization.Conditions.MoveConditionDown = "Move condition down";
            Localization.Conditions.DeleteCondition = "Delete condition";

            Localization.Conditions.NumberField = "Number field";
            Localization.Conditions.TextField = "Text field";
            Localization.Conditions.FieldWasDeleted = "Field was deleted.";

            Localization.Conditions.ChooseQuestLabel = "<Choose quest>";

            Localization.Conditions.CheckChooseQuestValueLabel = "Check pick quest value";

            Localization.Conditions.StateLabel = "State";

            Localization.Conditions.CheckQuestStateLabel = "Check quest state";

            Localization.Conditions.ChooseNpcLabel = "<Choose npc>";

            Localization.Conditions.CheckNpcAliveStateLabel = "Check npc alive state";
            Localization.Conditions.NpcAliveStateAlive = "Alive";
            Localization.Conditions.NpcAliveStateDead = "Dead";
            
            // Actions
            Localization.Actions = {};

            Localization.Actions.NumberField = "Number field";
            Localization.Actions.TextField = "Text field";

            Localization.Actions.ChangeQuestValueLabel = "Change pick quest value";
            Localization.Actions.ChooseQuestLabel = "&lt;Choose quest&gt;";
            
            Localization.Actions.QuestState = "State";
            
            Localization.Actions.SetQuestStateLabel = "Change quest state";
            Localization.Actions.OpenQuestTooltip = "Opens the chosen quest";

            Localization.Actions.AddQuestTextLabel = "Add quest text";
            Localization.Actions.QuestText = "Text";

        }(DefaultNodeShapes.Localization = DefaultNodeShapes.Localization || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));