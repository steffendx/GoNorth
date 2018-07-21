(function(GoNorth) {
    "use strict";
    (function(Export) {
        (function(FunctionGenerationCondition) {

            /// Condition Type for the child action type having a certain type
            var functionGenerationChildActionType = 8;

            /**
             * Child action type condition
             * @class
             */
            FunctionGenerationCondition.ChildActionTypeCondition = function()
            {
                FunctionGenerationCondition.CheckActionTypeCondition.apply(this);
            };

            FunctionGenerationCondition.ChildActionTypeCondition.prototype = jQuery.extend({ }, FunctionGenerationCondition.CheckActionTypeCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            FunctionGenerationCondition.ChildActionTypeCondition.prototype.getType = function() {
                return functionGenerationChildActionType;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            FunctionGenerationCondition.ChildActionTypeCondition.prototype.getLabel = function() {
                return GoNorth.Export.FunctionGenerationCondition.Localization.ConditionChildActionType;
            };
            
            /**
             * Returns the api condition type name
             * 
             * @returns {string} Api condition type name
             */
            FunctionGenerationCondition.ChildActionTypeCondition.prototype.getExportApiType = function() {
                return "ChildActionType";
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new FunctionGenerationCondition.ChildActionTypeCondition());

        }(Export.FunctionGenerationCondition = Export.FunctionGenerationCondition || {}));
    }(GoNorth.Export = GoNorth.Export || {}));
}(window.GoNorth = window.GoNorth || {}));