(function(GoNorth) {
    "use strict";
    (function(Export) {
        (function(FunctionGenerationCondition) {

            /// Condition Type for the current action type having a certain type
            var functionGenerationCurrentActionType = 7;

            /**
             * Current action type condition
             * @class
             */
            FunctionGenerationCondition.CurrentActionTypeCondition = function()
            {
                FunctionGenerationCondition.CheckActionTypeCondition.apply(this);
            };

            FunctionGenerationCondition.CurrentActionTypeCondition.prototype = jQuery.extend({ }, FunctionGenerationCondition.CheckActionTypeCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            FunctionGenerationCondition.CurrentActionTypeCondition.prototype.getType = function() {
                return functionGenerationCurrentActionType;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            FunctionGenerationCondition.CurrentActionTypeCondition.prototype.getLabel = function() {
                return GoNorth.Export.FunctionGenerationCondition.Localization.ConditionCurrentActionType;
            };
            
            /**
             * Returns the api condition type name
             * 
             * @returns {string} Api condition type name
             */
            FunctionGenerationCondition.CurrentActionTypeCondition.prototype.getExportApiType = function() {
                return "CurrentActionType";
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new FunctionGenerationCondition.CurrentActionTypeCondition());

        }(Export.FunctionGenerationCondition = Export.FunctionGenerationCondition || {}));
    }(GoNorth.Export = GoNorth.Export || {}));
}(window.GoNorth = window.GoNorth || {}));