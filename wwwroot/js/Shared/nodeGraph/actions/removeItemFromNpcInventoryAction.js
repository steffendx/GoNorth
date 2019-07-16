(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for remove an item from the npc inventory
            var actionTypeRemoveItemFromNpcInventory = 34;

            /**
             * Remove item from npc inventory Action
             * @class
             */
            Actions.RemoveItemFromNpcInventoryAction = function()
            {
                Actions.ChangeInventoryAction.apply(this);
            };

            Actions.RemoveItemFromNpcInventoryAction.prototype = jQuery.extend({ }, Actions.ChangeInventoryAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.RemoveItemFromNpcInventoryAction.prototype.buildAction = function() {
                return new Actions.RemoveItemFromNpcInventoryAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.RemoveItemFromNpcInventoryAction.prototype.getType = function() {
                return actionTypeRemoveItemFromNpcInventory;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.RemoveItemFromNpcInventoryAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.RemoveItemFromNpcInventoryLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.RemoveItemFromNpcInventoryAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));