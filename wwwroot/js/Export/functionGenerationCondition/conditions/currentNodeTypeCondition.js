(function(GoNorth) {
    "use strict";
    (function(Export) {
        (function(FunctionGenerationCondition) {

            /// Condition Type for the current node having a certain type
            var functionGenerationCurrentNodeType = 4;

            /**
             * Current node type condition
             * @class
             */
            FunctionGenerationCondition.CurrentNodeTypeCondition = function()
            {
                FunctionGenerationCondition.CheckNodeTypeCondition.apply(this);
            };

            FunctionGenerationCondition.CurrentNodeTypeCondition.prototype = jQuery.extend({ }, FunctionGenerationCondition.CheckNodeTypeCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            FunctionGenerationCondition.CurrentNodeTypeCondition.prototype.getType = function() {
                return functionGenerationCurrentNodeType;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            FunctionGenerationCondition.CurrentNodeTypeCondition.prototype.getLabel = function() {
                return GoNorth.Export.FunctionGenerationCondition.Localization.ConditionCurrentNodeType;
            };

            /**
             * Returns the api condition type name
             * 
             * @returns {string} Api condition type name
             */
            FunctionGenerationCondition.CurrentNodeTypeCondition.prototype.getExportApiType = function() {
                return "CurrentNodeType";
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new FunctionGenerationCondition.CurrentNodeTypeCondition());

        }(Export.FunctionGenerationCondition = Export.FunctionGenerationCondition || {}));
    }(GoNorth.Export = GoNorth.Export || {}));
}(window.GoNorth = window.GoNorth || {}));