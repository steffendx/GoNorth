(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for showing a floating text above the player
            var actionTypeShowFloatingTextAbovePlayer = 30;

            /**
             * Show floating text above player Action
             * @class
             */
            Actions.ShowFloatingTextAbovePlayerAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.ShowFloatingTextAboveObjectAction.apply(this);
            };

            Actions.ShowFloatingTextAbovePlayerAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.ShowFloatingTextAboveObjectAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.ShowFloatingTextAbovePlayerAction.prototype.buildAction = function() {
                return new Actions.ShowFloatingTextAbovePlayerAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.ShowFloatingTextAbovePlayerAction.prototype.getType = function() {
                return actionTypeShowFloatingTextAbovePlayer;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.ShowFloatingTextAbovePlayerAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.ShowFloatingTextAbovePlayerLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.ShowFloatingTextAbovePlayerAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));