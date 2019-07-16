(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for teleporting an npc to an npc
            var actionTypeTeleportNpcToNpc = 44;

            /**
             * Teleport npc to npc Action
             * @class
             */
            Actions.TeleportNpcToNpcAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.MoveObjectToNpcAction.apply(this);
            };

            Actions.TeleportNpcToNpcAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.MoveObjectToNpcAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.TeleportNpcToNpcAction.prototype.buildAction = function() {
                return new Actions.TeleportNpcToNpcAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.TeleportNpcToNpcAction.prototype.getType = function() {
                return actionTypeTeleportNpcToNpc;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.TeleportNpcToNpcAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.TeleportNpcToNpcLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.TeleportNpcToNpcAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));