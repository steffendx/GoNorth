(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for running a condition
            var conditionTypeCheckCodeCondition = 22;

            /**
             * Check code condition
             * @class
             */
            Conditions.CheckCodeCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.BaseCondition.apply(this);
            };

            Conditions.CheckCodeCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.BaseCondition.prototype);

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            Conditions.CheckCodeCondition.prototype.getTemplateName = function() {
                return "gn-nodeCheckCode";
            };
            
            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            Conditions.CheckCodeCondition.prototype.canBeSelected = function() {
                return true;
            };

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckCodeCondition.prototype.getType = function() {
                return conditionTypeCheckCodeCondition;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckCodeCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckCodeLabel;
            };

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            Conditions.CheckCodeCondition.prototype.getConditionDependsOnObject = function(existingData) {
                return [];
            };

            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.CheckCodeCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = {
                    scriptName: new ko.observable(""),
                    scriptCode: new ko.observable("")                
                };

                var self = this;
                conditionData.editScript = function() {
                    self.editScript(conditionData);
                };

                // Load existing data
                if(existingData)
                {
                    conditionData.scriptName(existingData.scriptName);
                    conditionData.scriptCode(existingData.scriptCode);
                }

                return conditionData;
            };

            /**
             * Edits the condition script
             * 
             * @param {object} conditionData Condition data
             */
            Conditions.CheckCodeCondition.prototype.editScript = function(conditionData) {
                GoNorth.DefaultNodeShapes.openCodeEditor(conditionData.scriptName(), conditionData.scriptCode()).then(function(result) {
                    conditionData.scriptName(result.name);
                    conditionData.scriptCode(result.code);
                });
            };

            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            Conditions.CheckCodeCondition.prototype.serializeConditionData = function(conditionData) {
                return {
                    scriptName: conditionData.scriptName(),
                    scriptCode: conditionData.scriptCode()
                };
            };

            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialzied condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckCodeCondition.prototype.getConditionString = function(existingData) {
                var def = new jQuery.Deferred();
                
                def.resolve(existingData.scriptName ? existingData.scriptName : DefaultNodeShapes.Localization.Conditions.CheckCodeConditionPlaceholderString);

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckCodeCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));