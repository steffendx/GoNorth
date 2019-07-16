(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for playing an npc animation
            var actionTypePlayNpcAnimation = 26;

            /**
             * Play npc animation action
             * @class
             */
            Actions.PlayNpcAnimationAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.PlayAnimationAction.apply(this);
            };

            Actions.PlayNpcAnimationAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.PlayAnimationAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.PlayNpcAnimationAction.prototype.buildAction = function() {
                return new Actions.PlayNpcAnimationAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.PlayNpcAnimationAction.prototype.getType = function() {
                return actionTypePlayNpcAnimation;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.PlayNpcAnimationAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.PlayNpcAnimationLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.PlayNpcAnimationAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));