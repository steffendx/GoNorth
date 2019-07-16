(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for disabling a daily routine event
            var actionTypeDisableDailyRoutineEvent = 37;

            /**
             * Disable daily routine event action
             * @class
             */
            Actions.DisableDailyRoutineEventAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.SetDailyRoutineEventStateAction.apply(this);
            };

            Actions.DisableDailyRoutineEventAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.SetDailyRoutineEventStateAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.DisableDailyRoutineEventAction.prototype.buildAction = function() {
                return new Actions.DisableDailyRoutineEventAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.DisableDailyRoutineEventAction.prototype.getType = function() {
                return actionTypeDisableDailyRoutineEvent;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.DisableDailyRoutineEventAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.DisableDailyRoutineEventLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.DisableDailyRoutineEventAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));