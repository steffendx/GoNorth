(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for remove an item from the player inventory
            var actionTypeRemoveItemFromPlayerInventory = 35;

            /**
             * Remove item from player inventory Action
             * @class
             */
            Actions.RemoveItemFromPlayerInventoryAction = function()
            {
                Actions.ChangeInventoryAction.apply(this);
            };

            Actions.RemoveItemFromPlayerInventoryAction.prototype = jQuery.extend({ }, Actions.ChangeInventoryAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.RemoveItemFromPlayerInventoryAction.prototype.buildAction = function() {
                return new Actions.RemoveItemFromPlayerInventoryAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.RemoveItemFromPlayerInventoryAction.prototype.getType = function() {
                return actionTypeRemoveItemFromPlayerInventory;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.RemoveItemFromPlayerInventoryAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.RemoveItemFromPlayerInventoryLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.RemoveItemFromPlayerInventoryAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));