(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for fading from black
            var actionTypeFadeFromBlack = 33;

            /**
             * Fade from black Action
             * @class
             */
            Actions.FadeFromBlackAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.FadeToFromBlackBaseAction.apply(this);
            };

            Actions.FadeFromBlackAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.FadeToFromBlackBaseAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.FadeFromBlackAction.prototype.buildAction = function() {
                return new Actions.FadeFromBlackAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.FadeFromBlackAction.prototype.getType = function() {
                return actionTypeFadeFromBlack;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.FadeFromBlackAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.FadeFromBlackLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.FadeFromBlackAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));