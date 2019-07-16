(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for spawning an item in the npc inventory
            var actionTypeSpawnItemInNpcInventory = 4;

            /**
             * Spawn item in npc inventory Action
             * @class
             */
            Actions.SpawnItemInNpcInventoryAction = function()
            {
                Actions.ChangeInventoryAction.apply(this);
            };

            Actions.SpawnItemInNpcInventoryAction.prototype = jQuery.extend({ }, Actions.ChangeInventoryAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.SpawnItemInNpcInventoryAction.prototype.buildAction = function() {
                return new Actions.SpawnItemInNpcInventoryAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.SpawnItemInNpcInventoryAction.prototype.getType = function() {
                return actionTypeSpawnItemInNpcInventory;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.SpawnItemInNpcInventoryAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.SpawnItemInNpcInventoryLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.SpawnItemInNpcInventoryAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));