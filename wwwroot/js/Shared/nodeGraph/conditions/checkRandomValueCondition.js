(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking a random game value
            var conditionTypeCheckRandomValue = 19;

            /**
             * Check random value condition
             * @class
             */
            Conditions.CheckRandomValueCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.BaseCondition.apply(this);
            };

            Conditions.CheckRandomValueCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.BaseCondition.prototype);

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            Conditions.CheckRandomValueCondition.prototype.getTemplateName = function() {
                return "gn-nodeCheckRandomValue";
            };
            
            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            Conditions.CheckRandomValueCondition.prototype.canBeSelected = function() {
                return true;
            };

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckRandomValueCondition.prototype.getType = function() {
                return conditionTypeCheckRandomValue;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckRandomValueCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckRandomValueLabel;
            };

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            Conditions.CheckRandomValueCondition.prototype.getConditionDependsOnObject = function(existingData) {
                return [];
            };

            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.CheckRandomValueCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = {
                    selectedOperator: new ko.observable(),
                    minValue: new ko.observable(),
                    maxValue: new ko.observable(),
                    compareValue: new ko.observable(),
                    availableOperators: [ "=", "!=", "<=", "<", ">=", ">" ]
                };

                // Load existing data
                if(existingData)
                {
                    conditionData.selectedOperator(existingData.operator);
                    conditionData.minValue(existingData.minValue);
                    conditionData.maxValue(existingData.maxValue);
                    conditionData.compareValue(existingData.compareValue);
                }

                return conditionData;
            };

            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            Conditions.CheckRandomValueCondition.prototype.serializeConditionData = function(conditionData) {
                return {
                    operator: conditionData.selectedOperator(),
                    minValue: conditionData.minValue() ? conditionData.minValue() : 0,
                    maxValue: conditionData.maxValue() ? conditionData.maxValue() : 0,
                    compareValue: conditionData.compareValue() ? conditionData.compareValue() : 0
                };
            };

            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialzied condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckRandomValueCondition.prototype.getConditionString = function(existingData) {
                var def = new jQuery.Deferred();
                
                var conditionString = DefaultNodeShapes.Localization.Conditions.Rand;
                conditionString += "(" + existingData.minValue + "," + existingData.maxValue + ")";
                conditionString += " " + existingData.operator + " " + existingData.compareValue;
                def.resolve(conditionString);

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckRandomValueCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));