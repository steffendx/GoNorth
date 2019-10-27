(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for the npc using an item
            var actionTypeNpcUseItem = 53;

            /**
             * Npc uses an item action
             * @class
             */
            Actions.NpcUseItemAction = function()
            {
                Actions.ObjectUseItemAction.apply(this);
            };

            Actions.NpcUseItemAction.prototype = jQuery.extend({ }, Actions.ObjectUseItemAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.NpcUseItemAction.prototype.buildAction = function() {
                return new Actions.NpcUseItemAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.NpcUseItemAction.prototype.getType = function() {
                return actionTypeNpcUseItem;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.NpcUseItemAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.NpcUseItemLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.NpcUseItemAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));