(function(GoNorth) {
    "use strict";
    (function(Export) {
        (function(FunctionGenerationCondition) {

            /**
             * Node type condition
             * @class
             */
            FunctionGenerationCondition.CheckNodeTypeCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.BaseCondition.apply(this);
            };

            FunctionGenerationCondition.CheckNodeTypeCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.BaseCondition.prototype);

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            FunctionGenerationCondition.CheckNodeTypeCondition.prototype.getTemplateName = function() {
                return "gn-functionGenerationCondition-nodeType";
            };
            
            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            FunctionGenerationCondition.CheckNodeTypeCondition.prototype.canBeSelected = function() {
                return true;
            };

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            FunctionGenerationCondition.CheckNodeTypeCondition.prototype.getConditionDependsOnObject = function(existingData) {
                return [];
            };

            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            FunctionGenerationCondition.CheckNodeTypeCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = {
                    selectedNodeType: new ko.observable(),
                    nodeTypes: GoNorth.Export.FunctionGenerationCondition.nodeTypes
                };

                if(existingData)
                {
                    var selectedNodeType = null;
                    for(var curNodeType = 0; curNodeType < conditionData.nodeTypes.length; ++curNodeType)
                    {
                        if(conditionData.nodeTypes[curNodeType].nodeType == existingData.nodeType)
                        {
                            selectedNodeType = conditionData.nodeTypes[curNodeType];
                        }
                    }
                    conditionData.selectedNodeType(selectedNodeType);
                }

                return conditionData;
            };

            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            FunctionGenerationCondition.CheckNodeTypeCondition.prototype.serializeConditionData = function(conditionData) {
                return { 
                    nodeType: conditionData.selectedNodeType().nodeType
                };
            };

            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialzied condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            FunctionGenerationCondition.CheckNodeTypeCondition.prototype.getConditionString = function(existingData) {
                var def = new jQuery.Deferred();
                
                def.resolve(this.getLabel() + "(" + GoNorth.Export.FunctionGenerationCondition.localizedNodeTypes[existingData.nodeType] + ")");

                return def.promise();
            };


            /**
             * Returns the api condition type name
             * 
             * @returns {string} Api condition type name
             */
            FunctionGenerationCondition.CheckNodeTypeCondition.prototype.getExportApiType = function() {
                return "";
            }

            /**
             * Converts the condition data for the api without the type
             * 
             * @param {object} conditionData Serialized Condition Data
             * @returns {object} Condition Data ready for the api
             */
            FunctionGenerationCondition.CheckNodeTypeCondition.prototype.convertDataForExportApi = function(conditionData) {
                return {
                    nodeType: conditionData.nodeType
                };
            };

            /**
             * Converts the condition data for the dialog
             * 
             * @param {object} conditionData Serialized Condition Data
             * @returns {object} Condition Data ready for the dialog
             */
            FunctionGenerationCondition.CheckNodeTypeCondition.prototype.convertDataForDialog = function(conditionData) {
                return { 
                    nodeType: conditionData.nodeType
                };
            };

        }(Export.FunctionGenerationCondition = Export.FunctionGenerationCondition || {}));
    }(GoNorth.Export = GoNorth.Export || {}));
}(window.GoNorth = window.GoNorth || {}));