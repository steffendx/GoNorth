(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for spawning an item in the player inventory
            var actionTypeSpawnItemInPlayerInventory = 3;

            /**
             * Spawn item in player inventory Action
             * @class
             */
            Actions.SpawnItemInPlayerInventoryAction = function()
            {
                Actions.ChangeInventoryAction.apply(this);
            };

            Actions.SpawnItemInPlayerInventoryAction.prototype = jQuery.extend({ }, Actions.ChangeInventoryAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.SpawnItemInPlayerInventoryAction.prototype.buildAction = function() {
                return new Actions.SpawnItemInPlayerInventoryAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.SpawnItemInPlayerInventoryAction.prototype.getType = function() {
                return actionTypeSpawnItemInPlayerInventory;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.SpawnItemInPlayerInventoryAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.SpawnItemInPlayerInventoryLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.SpawnItemInPlayerInventoryAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));