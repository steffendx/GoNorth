(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for removing an item in the npc inventory of an npc that can be chosen
            var actionTypeRemoveItemFromChooseNpcInventory = 52;

            /**
             * Remove item from choose npc inventory Action
             * @class
             */
            Actions.RemoveItemFromChooseNpcInventoryAction = function()
            {
                Actions.ChangeInventoryChooseNpcAction.apply(this);
            };

            Actions.RemoveItemFromChooseNpcInventoryAction.prototype = jQuery.extend({ }, Actions.ChangeInventoryChooseNpcAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.RemoveItemFromChooseNpcInventoryAction.prototype.buildAction = function() {
                return new Actions.RemoveItemFromChooseNpcInventoryAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.RemoveItemFromChooseNpcInventoryAction.prototype.getType = function() {
                return actionTypeRemoveItemFromChooseNpcInventory;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.RemoveItemFromChooseNpcInventoryAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.RemoveItemFromChooseNpcInventoryLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.RemoveItemFromChooseNpcInventoryAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));