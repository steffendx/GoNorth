(function(GoNorth) {
    "use strict";
    (function(Export) {
        (function(FunctionGenerationCondition) {

            /// Condition Type for a node having multiple parents
            var functionGenerationTypeMultipleParents = 2;

            /**
             * Node has multiple parents condition
             * @class
             */
            FunctionGenerationCondition.MultipleParentsCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.BaseCondition.apply(this);
            };

            FunctionGenerationCondition.MultipleParentsCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.BaseCondition.prototype);

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            FunctionGenerationCondition.MultipleParentsCondition.prototype.getTemplateName = function() {
                return "gn-functionGenerationCondition-multipleParents";
            };
            
            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            FunctionGenerationCondition.MultipleParentsCondition.prototype.canBeSelected = function() {
                return true;
            };

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            FunctionGenerationCondition.MultipleParentsCondition.prototype.getType = function() {
                return functionGenerationTypeMultipleParents;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            FunctionGenerationCondition.MultipleParentsCondition.prototype.getLabel = function() {
                return GoNorth.Export.FunctionGenerationCondition.Localization.ConditionMultipleParents;
            };

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            FunctionGenerationCondition.MultipleParentsCondition.prototype.getConditionDependsOnObject = function(existingData) {
                return [];
            };

            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            FunctionGenerationCondition.MultipleParentsCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = { };

                return conditionData;
            };

            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            FunctionGenerationCondition.MultipleParentsCondition.prototype.serializeConditionData = function(conditionData) {
                return { };
            };

            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialzied condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            FunctionGenerationCondition.MultipleParentsCondition.prototype.getConditionString = function(existingData) {
                var def = new jQuery.Deferred();
                
                def.resolve(GoNorth.Export.FunctionGenerationCondition.Localization.ConditionMultipleParents);

                return def.promise();
            };


            /**
             * Returns the api condition type name
             * 
             * @returns {string} Api condition type name
             */
            FunctionGenerationCondition.MultipleParentsCondition.prototype.getExportApiType = function() {
                return "MultipleParents";
            }

            /**
             * Converts the condition data for the api without the type
             * 
             * @param {object} conditionData Serialized Condition Data
             * @returns {object} Condition Data ready for the api
             */
            FunctionGenerationCondition.MultipleParentsCondition.prototype.convertDataForExportApi = function(conditionData) {
                return { };
            };

            /**
             * Converts the condition data for the dialog
             * 
             * @param {object} conditionData Serialized Condition Data
             * @returns {object} Condition Data ready for the dialog
             */
            FunctionGenerationCondition.MultipleParentsCondition.prototype.convertDataForDialog = function(conditionData) {
                return { };
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new FunctionGenerationCondition.MultipleParentsCondition());

        }(Export.FunctionGenerationCondition = Export.FunctionGenerationCondition || {}));
    }(GoNorth.Export = GoNorth.Export || {}));
}(window.GoNorth = window.GoNorth || {}));