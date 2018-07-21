(function(GoNorth) {
    "use strict";
    (function(Export) {
        (function(FunctionGenerationCondition) {

            /**
             * Returns the api condition type name
             * 
             * @returns {string} Api condition type name
             */
            GoNorth.DefaultNodeShapes.Conditions.GroupCondition.prototype.getExportApiType = function() {
                return "Group";
            }

            /**
             * Converts the condition data for the api without the type
             * 
             * @param {object} conditionData Serialized Condition Data
             * @returns {object} Condition Data ready for the api
             */
            GoNorth.DefaultNodeShapes.Conditions.GroupCondition.prototype.convertDataForExportApi = function(conditionData) {
                var conditionElements = FunctionGenerationCondition.convertConditionElementsFromDialog(conditionData.conditionElements);
                if(!conditionElements) {
                    return null;
                }

                return { 
                    groupOperator: conditionData.operator,
                    conditionElements: conditionElements
                };
            };

            /**
             * Converts the condition data for the dialog
             * 
             * @param {object} conditionData Serialized Condition Data
             * @returns {object} Condition Data ready for the dialog
             */
            GoNorth.DefaultNodeShapes.Conditions.GroupCondition.prototype.convertDataForDialog = function(conditionData) {
                var conditionElements = FunctionGenerationCondition.convertConditionElementsToDialog(conditionData.conditionElements);
                if(!conditionElements) {
                    return null;
                }

                return { 
                    operator: conditionData.groupOperator,
                    conditionElements: conditionElements
                };
            };

        }(Export.FunctionGenerationCondition = Export.FunctionGenerationCondition || {}));
    }(GoNorth.Export = GoNorth.Export || {}));
}(window.GoNorth = window.GoNorth || {}));