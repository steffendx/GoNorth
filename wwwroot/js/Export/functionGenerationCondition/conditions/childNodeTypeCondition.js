(function(GoNorth) {
    "use strict";
    (function(Export) {
        (function(FunctionGenerationCondition) {

            /// Condition Type for the child node having a certain type
            var functionGenerationChildNodeType = 5;

            /**
             * Child node type condition
             * @class
             */
            FunctionGenerationCondition.ChildNodeTypeCondition = function()
            {
                FunctionGenerationCondition.CheckNodeTypeCondition.apply(this);
            };

            FunctionGenerationCondition.ChildNodeTypeCondition.prototype = jQuery.extend({ }, FunctionGenerationCondition.CheckNodeTypeCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            FunctionGenerationCondition.ChildNodeTypeCondition.prototype.getType = function() {
                return functionGenerationChildNodeType;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            FunctionGenerationCondition.ChildNodeTypeCondition.prototype.getLabel = function() {
                return GoNorth.Export.FunctionGenerationCondition.Localization.ConditionChildNodeType;
            };

            /**
             * Returns the api condition type name
             * 
             * @returns {string} Api condition type name
             */
            FunctionGenerationCondition.ChildNodeTypeCondition.prototype.getExportApiType = function() {
                return "ChildNodeType";
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new FunctionGenerationCondition.ChildNodeTypeCondition());

        }(Export.FunctionGenerationCondition = Export.FunctionGenerationCondition || {}));
    }(GoNorth.Export = GoNorth.Export || {}));
}(window.GoNorth = window.GoNorth || {}));