(function(GoNorth) {
    "use strict";
    (function(Export) {
        (function(FunctionGenerationCondition) {

            /// Condition Type for the parent action type having a certain type
            var functionGenerationParentActionType = 6;

            /**
             * Parent action type condition
             * @class
             */
            FunctionGenerationCondition.ParentActionTypeCondition = function()
            {
                FunctionGenerationCondition.CheckActionTypeCondition.apply(this);
            };

            FunctionGenerationCondition.ParentActionTypeCondition.prototype = jQuery.extend({ }, FunctionGenerationCondition.CheckActionTypeCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            FunctionGenerationCondition.ParentActionTypeCondition.prototype.getType = function() {
                return functionGenerationParentActionType;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            FunctionGenerationCondition.ParentActionTypeCondition.prototype.getLabel = function() {
                return GoNorth.Export.FunctionGenerationCondition.Localization.ConditionParentActionType;
            };
            
            /**
             * Returns the api condition type name
             * 
             * @returns {string} Api condition type name
             */
            FunctionGenerationCondition.ParentActionTypeCondition.prototype.getExportApiType = function() {
                return "ParentActionType";
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new FunctionGenerationCondition.ParentActionTypeCondition());

        }(Export.FunctionGenerationCondition = Export.FunctionGenerationCondition || {}));
    }(GoNorth.Export = GoNorth.Export || {}));
}(window.GoNorth = window.GoNorth || {}));