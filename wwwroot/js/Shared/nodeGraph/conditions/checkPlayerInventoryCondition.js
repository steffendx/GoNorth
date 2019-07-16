(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking the player inventory
            var conditionTypeCheckPlayerInventory = 4;

            /**
             * Check player inventory condition
             * @class
             */
            Conditions.CheckPlayerInventoryCondition = function()
            {
                Conditions.CheckInventoryCondition.apply(this);
            };

            Conditions.CheckPlayerInventoryCondition.prototype = jQuery.extend({ }, Conditions.CheckInventoryCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckPlayerInventoryCondition.prototype.getType = function() {
                return conditionTypeCheckPlayerInventory;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckPlayerInventoryCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckPlayerInventoryLabel;
            };

            /**
             * Returns the title of the inventory
             * 
             * @returns {string} Title of the inventory
             */
            Conditions.CheckPlayerInventoryCondition.prototype.getInventoryTitle = function() {
                return DefaultNodeShapes.Localization.Conditions.PlayerInventoryLabel;
            };


            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckPlayerInventoryCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));