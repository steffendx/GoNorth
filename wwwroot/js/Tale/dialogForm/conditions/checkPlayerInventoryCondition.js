(function(GoNorth) {
    "use strict";
    (function(Tale) {
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
                return Tale.Localization.Conditions.CheckPlayerInventoryLabel;
            };

            /**
             * Returns the title of the inventory
             * 
             * @returns {string} Title of the inventory
             */
            Conditions.CheckPlayerInventoryCondition.prototype.getInventoryTitle = function() {
                return Tale.Localization.Conditions.PlayerInventoryLabel;
            };


            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckPlayerInventoryCondition());

        }(Tale.Conditions = Tale.Conditions || {}));
    }(GoNorth.Tale = GoNorth.Tale || {}));
}(window.GoNorth = window.GoNorth || {}));