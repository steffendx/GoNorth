(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for spawning an item in the npc inventory of an npc that can be chosen
            var actionTypeSpawnItemInChooseNpcInventory = 51;

            /**
             * Spawn item in choose npc inventory Action
             * @class
             */
            Actions.SpawnItemInChooseNpcInventoryAction = function()
            {
                Actions.ChangeInventoryChooseNpcAction.apply(this);
            };

            Actions.SpawnItemInChooseNpcInventoryAction.prototype = jQuery.extend({ }, Actions.ChangeInventoryChooseNpcAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.SpawnItemInChooseNpcInventoryAction.prototype.buildAction = function() {
                return new Actions.SpawnItemInChooseNpcInventoryAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.SpawnItemInChooseNpcInventoryAction.prototype.getType = function() {
                return actionTypeSpawnItemInChooseNpcInventory;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.SpawnItemInChooseNpcInventoryAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.SpawnItemInChooseNpcInventoryLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.SpawnItemInChooseNpcInventoryAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));