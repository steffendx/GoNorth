(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for fading to black
            var actionTypeFadeToBlack = 32;

            /**
             * Fade to black Action
             * @class
             */
            Actions.FadeToBlackAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.FadeToFromBlackBaseAction.apply(this);
            };

            Actions.FadeToBlackAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.FadeToFromBlackBaseAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.FadeToBlackAction.prototype.buildAction = function() {
                return new Actions.FadeToBlackAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.FadeToBlackAction.prototype.getType = function() {
                return actionTypeFadeToBlack;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.FadeToBlackAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.FadeToBlackLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.FadeToBlackAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));