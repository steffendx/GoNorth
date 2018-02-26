(function(GoNorth) {
    "use strict";
    (function(Tale) {
        (function(Actions) {

            /// Action Type for transfering an item from the player inventory to the npc inventory
            var actionTypeTransferItemToNpcInventory = 6;

            /**
             * Transfer item from the player inventory to the npc inventory Action
             * @class
             */
            Actions.TransferItemNpcInventoryAction = function()
            {
                Actions.ChangeInventoryAction.apply(this);
            };

            Actions.TransferItemNpcInventoryAction.prototype = jQuery.extend({ }, Actions.ChangeInventoryAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.TransferItemNpcInventoryAction.prototype.buildAction = function() {
                return new Actions.TransferItemNpcInventoryAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.TransferItemNpcInventoryAction.prototype.getType = function() {
                return actionTypeTransferItemToNpcInventory;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.TransferItemNpcInventoryAction.prototype.getLabel = function() {
                return Tale.Localization.Actions.TransferItemToNpcInventoryLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.TransferItemNpcInventoryAction());

        }(Tale.Actions = Tale.Actions || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));