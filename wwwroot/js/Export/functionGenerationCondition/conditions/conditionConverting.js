(function(GoNorth) {
    "use strict";
    (function(Export) {
        (function(FunctionGenerationCondition) {

            /**
             * Converts a list of condition elements from the condition dialog to a version compatible with the api
             * 
             * @param {object} conditionElements Dialog Condition elements
             * @returns {object} Converted condition elements compatible with the api
             */
            FunctionGenerationCondition.convertConditionElementsFromDialog = function(conditionElements) {
                var finalConditionElements = [];
                for(var curElement = 0; curElement < conditionElements.length; ++curElement)
                {
                    var targetType = GoNorth.DefaultNodeShapes.Conditions.getConditionManager().getConditionType(conditionElements[curElement].conditionType);
                    var convertedElement = targetType.convertDataForExportApi(conditionElements[curElement].conditionData);
                    if(convertedElement == null)
                    {
                        return null;
                    }

                    convertedElement.conditionType = targetType.getExportApiType();
                    finalConditionElements.push(convertedElement);
                }

                return finalConditionElements;
            }

            /**
             * Converts a list of condition elements from the api to a version compatible with the condition dialog
             * 
             * @param {object} conditionElements Api condition elements
             * @returns {object} Converted condition elements compatible with the dialog
             */
            FunctionGenerationCondition.convertConditionElementsToDialog = function(conditionElements) {
                var conditionTypeMapping = {};
                var conditionTypes = GoNorth.DefaultNodeShapes.Conditions.getConditionManager().getConditionTypes();
                for(var curConditionType = 0; curConditionType < conditionTypes.length; ++curConditionType)
                {
                    if(!conditionTypes[curConditionType].getExportApiType)
                    {
                        continue;
                    }

                    conditionTypeMapping[conditionTypes[curConditionType].getExportApiType()] = conditionTypes[curConditionType];
                }

                var finalConditionElements = [];
                for(var curElement = 0; curElement < conditionElements.length; ++curElement)
                {
                    var targetType = conditionTypeMapping[conditionElements[curElement].conditionType];
                    if(!targetType)
                    {
                        return null;
                    }

                    var convertedConditionData = targetType.convertDataForDialog(conditionElements[curElement]);
                    if(!convertedConditionData)
                    {
                        return null;
                    }

                    var convertedElement = {
                        conditionType: targetType.getType(),
                        conditionData: convertedConditionData
                    }
                    finalConditionElements.push(convertedElement);
                }

                return finalConditionElements;
            };

        }(Export.FunctionGenerationCondition = Export.FunctionGenerationCondition || {}));
    }(GoNorth.Export = GoNorth.Export || {}));
}(window.GoNorth = window.GoNorth || {}));