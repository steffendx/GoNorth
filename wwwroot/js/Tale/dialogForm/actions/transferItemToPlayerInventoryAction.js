(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Actions) {

            /// Action Type for transfering an item from the npc inventory to the player inventory
            var actionTypeTransferItemToPlayerInventory = 5;

            /**
             * Transfer item from the npc inventory to the player inventory Action
             * @class
             */
            Actions.TransferItemToPlayerInventoryAction = function()
            {
                Actions.ChangeInventoryAction.apply(this);
            };

            Actions.TransferItemToPlayerInventoryAction.prototype = jQuery.extend({ }, Actions.ChangeInventoryAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.TransferItemToPlayerInventoryAction.prototype.buildAction = function() {
                return new Actions.TransferItemToPlayerInventoryAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.TransferItemToPlayerInventoryAction.prototype.getType = function() {
                return actionTypeTransferItemToPlayerInventory;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.TransferItemToPlayerInventoryAction.prototype.getLabel = function() {
                return Tale.Localization.Actions.TransferItemToPlayerInventoryLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.TransferItemToPlayerInventoryAction());

        }(Tale.Actions = Tale.Actions || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));