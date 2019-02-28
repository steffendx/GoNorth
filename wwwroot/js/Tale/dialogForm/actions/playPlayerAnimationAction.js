(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Actions) {

            /// Action Type for playing a player animation
            var actionTypePlayPlayerAnimation = 27;

            /**
             * Play player animation action
             * @class
             */
            Actions.PlayPlayerAnimationAction = function()
            {
                GoNorth.Tale.Actions.PlayAnimationAction.apply(this);
            };

            Actions.PlayPlayerAnimationAction.prototype = jQuery.extend({ }, GoNorth.Tale.Actions.PlayAnimationAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.PlayPlayerAnimationAction.prototype.buildAction = function() {
                return new Actions.PlayPlayerAnimationAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.PlayPlayerAnimationAction.prototype.getType = function() {
                return actionTypePlayPlayerAnimation;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.PlayPlayerAnimationAction.prototype.getLabel = function() {
                return Tale.Localization.Actions.PlayPlayerAnimationLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.PlayPlayerAnimationAction());

        }(Tale.Actions = Tale.Actions || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));