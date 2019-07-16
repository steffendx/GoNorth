(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking if a daily routine event is active
            var conditionTypeCheckDailyRoutineEventIsActive = 20;

            /**
             * Check if a daily routine event is active condition
             * @class
             */
            Conditions.CheckDailyRoutineEventIsActiveCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.CheckDailyRoutineEventStateCondition.apply(this);
            };

            Conditions.CheckDailyRoutineEventIsActiveCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.CheckDailyRoutineEventStateCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckDailyRoutineEventIsActiveCondition.prototype.getType = function() {
                return conditionTypeCheckDailyRoutineEventIsActive;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckDailyRoutineEventIsActiveCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckDailyRoutineIsActive;
            };
            
            /**
             * Returns the condition string text template
             * 
             * @returns {string} Condition string text template
             */
            Conditions.CheckDailyRoutineEventIsActiveCondition.prototype.getConditionStringText = function() {
                return DefaultNodeShapes.Localization.Conditions.DailyRoutineEventIsActive;
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckDailyRoutineEventIsActiveCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));