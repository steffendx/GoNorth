(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for enabling a daily routine event
            var actionTypeEnableDailyRoutineEvent = 38;

            /**
             * Enable daily routine event action
             * @class
             */
            Actions.EnableDailyRoutineEventAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.SetDailyRoutineEventStateAction.apply(this);
            };

            Actions.EnableDailyRoutineEventAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.SetDailyRoutineEventStateAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.EnableDailyRoutineEventAction.prototype.buildAction = function() {
                return new Actions.EnableDailyRoutineEventAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.EnableDailyRoutineEventAction.prototype.getType = function() {
                return actionTypeEnableDailyRoutineEvent;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.EnableDailyRoutineEventAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.EnableDailyRoutineEventLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.EnableDailyRoutineEventAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));