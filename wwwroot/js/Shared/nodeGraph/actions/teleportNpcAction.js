(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for teleporting an npc
            var actionTypeTeleportNpc = 39;

            /**
             * Teleport npc Action
             * @class
             */
            Actions.TeleportNpcAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.MoveObjectAction.apply(this);
            };

            Actions.TeleportNpcAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.MoveObjectAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.TeleportNpcAction.prototype.buildAction = function() {
                return new Actions.TeleportNpcAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.TeleportNpcAction.prototype.getType = function() {
                return actionTypeTeleportNpc;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.TeleportNpcAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.TeleportNpcLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.TeleportNpcAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));