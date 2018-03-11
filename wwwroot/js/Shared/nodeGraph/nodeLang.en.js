(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Localization) {

            // Node Display
            Localization.NodeDisplay = {};

            Localization.NodeDisplay.Position = "Position:";
            Localization.NodeDisplay.Zoom = "Zoom:";    
            Localization.NodeDisplay.ToogleMiniMap = "Click here to toogle the mini map display";        

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

            Localization.Conditions.CheckPlayerValueLabel = "Check player value";
            Localization.Conditions.PlayerLabel = "Player";

            Localization.Conditions.ChooseQuestLabel = "<Choose quest>";

            Localization.Conditions.CheckChooseQuestValueLabel = "Check pick quest value";

            Localization.Conditions.StateLabel = "State";

            Localization.Conditions.CheckQuestStateLabel = "Check quest state";

            Localization.Conditions.ChooseNpcLabel = "<Choose npc>";

            Localization.Conditions.CheckNpcAliveStateLabel = "Check npc alive state";
            Localization.Conditions.NpcAliveStateAlive = "Alive";
            Localization.Conditions.NpcAliveStateDead = "Dead";

            Localization.Conditions.CheckGameTimeLabel = "Check game time";
            Localization.Conditions.GameTimeOperatorBefore = "before";
            Localization.Conditions.GameTimeOperatorAfter = "after";
            Localization.Conditions.GameTime = "Game time";
            
            Localization.Conditions.ChooseSkillLabel = "<Choose skill>";

            Localization.Conditions.CheckChoosePlayerSkillValueLabel = "Check player skill value";
            Localization.Conditions.PlayerSkillPrefix = "Player ";

            Localization.Conditions.CheckPlayerLearnedSkillLabel = "Player can use skill";
            Localization.Conditions.CheckPlayerLearnedSkillPrefixLabel = "Player can use ";

            Localization.Conditions.CheckPlayerNotLearnedSkillLabel = "Player can not use skill";
            Localization.Conditions.CheckPlayerNotLearnedSkillPrefixLabel = "Player can not use ";

            // Actions
            Localization.Actions = {};

            Localization.Actions.NumberField = "Number field";
            Localization.Actions.TextField = "Text field";

            Localization.Actions.ChangePlayerValueLabel = "Change player value";
            Localization.Actions.ChangeQuestValueLabel = "Change pick quest value";
            Localization.Actions.ChooseQuestLabel = "&lt;Choose quest&gt;";
            
            Localization.Actions.QuestState = "State";
            
            Localization.Actions.SetQuestStateLabel = "Change quest state";
            Localization.Actions.OpenQuestTooltip = "Opens the chosen quest";

            Localization.Actions.AddQuestTextLabel = "Add quest text";
            Localization.Actions.QuestText = "Text";

            Localization.Actions.WaitLabel = "Wait";
            Localization.Actions.WaitTypeRealTime = "Realtime";
            Localization.Actions.WaitTypeGameTime = "Gametime";
            Localization.Actions.WaitUnitMilliseconds = "Milliseconds";
            Localization.Actions.WaitUnitSeconds = "Seconds";
            Localization.Actions.WaitUnitMinutes = "Minutes";
            Localization.Actions.WaitUnitHours = "Hours";
            Localization.Actions.WaitUnitDays = "Days";

            Localization.Actions.StatePlaceholder = "State";

            Localization.Actions.SetPlayerStateLabel = "Change player state";

            Localization.Actions.ChooseSkillLabel = "&lt;Choose skill&gt;";
            Localization.Actions.OpenSkillTooltip = "Opens the chosen skill";

            Localization.Actions.PlayerLearnSkillLabel = "Player learns skill";
            Localization.Actions.PlayerForgetSkillLabel = "Player forgets skill";

            Localization.Actions.ChangePlayerSkillValueLabel = "Change player skill value";

        }(DefaultNodeShapes.Localization = DefaultNodeShapes.Localization || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));