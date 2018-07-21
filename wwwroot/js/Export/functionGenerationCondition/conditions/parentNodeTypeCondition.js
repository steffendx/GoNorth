(function(GoNorth) {
    "use strict";
    (function(Export) {
        (function(FunctionGenerationCondition) {

            /// Condition Type for the parent node having a certain type
            var functionGenerationParentNodeType = 3;

            /**
             * Parent node type condition
             * @class
             */
            FunctionGenerationCondition.ParentNodeTypeCondition = function()
            {
                FunctionGenerationCondition.CheckNodeTypeCondition.apply(this);
            };

            FunctionGenerationCondition.ParentNodeTypeCondition.prototype = jQuery.extend({ }, FunctionGenerationCondition.CheckNodeTypeCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            FunctionGenerationCondition.ParentNodeTypeCondition.prototype.getType = function() {
                return functionGenerationParentNodeType;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            FunctionGenerationCondition.ParentNodeTypeCondition.prototype.getLabel = function() {
                return GoNorth.Export.FunctionGenerationCondition.Localization.ConditionParentNodeType;
            };
            
            /**
             * Returns the api condition type name
             * 
             * @returns {string} Api condition type name
             */
            FunctionGenerationCondition.ParentNodeTypeCondition.prototype.getExportApiType = function() {
                return "ParentNodeType";
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new FunctionGenerationCondition.ParentNodeTypeCondition());

        }(Export.FunctionGenerationCondition = Export.FunctionGenerationCondition || {}));
    }(GoNorth.Export = GoNorth.Export || {}));
}(window.GoNorth = window.GoNorth || {}));