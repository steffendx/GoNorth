(function(GoNorth) {
    "use strict";
    (function(Export) {
        (function(FunctionGenerationCondition) {

            /**
             * Action type condition
             * @class
             */
            FunctionGenerationCondition.CheckActionTypeCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.BaseCondition.apply(this);
            };

            FunctionGenerationCondition.CheckActionTypeCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.BaseCondition.prototype);

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            FunctionGenerationCondition.CheckActionTypeCondition.prototype.getTemplateName = function() {
                return "gn-functionGenerationCondition-actionType";
            };
            
            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            FunctionGenerationCondition.CheckActionTypeCondition.prototype.canBeSelected = function() {
                return true;
            };

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            FunctionGenerationCondition.CheckActionTypeCondition.prototype.getConditionDependsOnObject = function(existingData) {
                return [];
            };

            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            FunctionGenerationCondition.CheckActionTypeCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = {
                    selectedActionType: new ko.observable(),
                    actionTypes: GoNorth.Export.FunctionGenerationCondition.actionTypes
                };

                if(existingData)
                {
                    var selectedActionType = null;
                    for(var curActionType = 0; curActionType < conditionData.actionTypes.length; ++curActionType)
                    {
                        if(conditionData.actionTypes[curActionType].actionType == existingData.actionType)
                        {
                            selectedActionType = conditionData.actionTypes[curActionType];
                        }
                    }
                    conditionData.selectedActionType(selectedActionType);
                }

                return conditionData;
            };

            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            FunctionGenerationCondition.CheckActionTypeCondition.prototype.serializeConditionData = function(conditionData) {
                return { 
                    actionType: conditionData.selectedActionType().actionType
                };
            };

            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialzied condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            FunctionGenerationCondition.CheckActionTypeCondition.prototype.getConditionString = function(existingData) {
                var def = new jQuery.Deferred();
                
                def.resolve(this.getLabel() + "(" + GoNorth.Export.FunctionGenerationCondition.localizedActionTypes[existingData.actionType] + ")");

                return def.promise();
            };


            /**
             * Returns the api condition type name
             * 
             * @returns {string} Api condition type name
             */
            FunctionGenerationCondition.CheckActionTypeCondition.prototype.getExportApiType = function() {
                return "";
            }

            /**
             * Converts the condition data for the api without the type
             * 
             * @param {object} conditionData Serialized Condition Data
             * @returns {object} Condition Data ready for the api
             */
            FunctionGenerationCondition.CheckActionTypeCondition.prototype.convertDataForExportApi = function(conditionData) {
                return {
                    actionType: conditionData.actionType
                };
            };

            /**
             * Converts the condition data for the dialog
             * 
             * @param {object} conditionData Serialized Condition Data
             * @returns {object} Condition Data ready for the dialog
             */
            FunctionGenerationCondition.CheckActionTypeCondition.prototype.convertDataForDialog = function(conditionData) {
                return { 
                    actionType: conditionData.actionType
                };
            };

        }(Export.FunctionGenerationCondition = Export.FunctionGenerationCondition || {}));
    }(GoNorth.Export = GoNorth.Export || {}));
}(window.GoNorth = window.GoNorth || {}));