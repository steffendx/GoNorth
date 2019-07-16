(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking the npc inventory
            var conditionTypeCheckNpcInventory = 5;

            /**
             * Check npc inventory condition
             * @class
             */
            Conditions.CheckNpcInventoryCondition = function()
            {
                Conditions.CheckInventoryCondition.apply(this);
            };

            Conditions.CheckNpcInventoryCondition.prototype = jQuery.extend({ }, Conditions.CheckInventoryCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckNpcInventoryCondition.prototype.getType = function() {
                return conditionTypeCheckNpcInventory;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckNpcInventoryCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckNpcInventoryLabel;
            };

            /**
             * Returns the title of the inventory
             * 
             * @returns {string} Title of the inventory
             */
            Conditions.CheckNpcInventoryCondition.prototype.getInventoryTitle = function() {
                return DefaultNodeShapes.Localization.Conditions.NpcInventoryLabel;
            };


            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckNpcInventoryCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));