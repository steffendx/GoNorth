(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking if a daily routine event is disabled
            var conditionTypeCheckDailyRoutineEventIsDisabled = 21;

            /**
             * Check if a daily routine event is disabled condition
             * @class
             */
            Conditions.CheckDailyRoutineEventIsDisabledCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.CheckDailyRoutineEventStateCondition.apply(this);
            };

            Conditions.CheckDailyRoutineEventIsDisabledCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.CheckDailyRoutineEventStateCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckDailyRoutineEventIsDisabledCondition.prototype.getType = function() {
                return conditionTypeCheckDailyRoutineEventIsDisabled;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckDailyRoutineEventIsDisabledCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckDailyRoutineIsDisabled;
            };
            
            /**
             * Returns the condition string text template
             * 
             * @returns {string} Condition string text template
             */
            Conditions.CheckDailyRoutineEventIsDisabledCondition.prototype.getConditionStringText = function() {
                return DefaultNodeShapes.Localization.Conditions.DailyRoutineEventIsDisabled;
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckDailyRoutineEventIsDisabledCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));