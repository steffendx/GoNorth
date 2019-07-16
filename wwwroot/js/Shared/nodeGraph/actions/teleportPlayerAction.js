(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for teleporting the player
            var actionTypeTeleportPlayer = 40;

            /**
             * Teleport player Action
             * @class
             */
            Actions.TeleportPlayerAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.MoveObjectAction.apply(this);
            };

            Actions.TeleportPlayerAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.MoveObjectAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.TeleportPlayerAction.prototype.buildAction = function() {
                return new Actions.TeleportPlayerAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.TeleportPlayerAction.prototype.getType = function() {
                return actionTypeTeleportPlayer;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.TeleportPlayerAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.TeleportPlayerLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.TeleportPlayerAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));