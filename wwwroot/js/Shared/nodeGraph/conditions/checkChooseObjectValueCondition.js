(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /**
             * Check current quest value condition
             * @class
             */
            Conditions.CheckChooseObjectValueCondition = function()
            {
                DefaultNodeShapes.Conditions.CheckValueCondition.apply(this);
            };

            Conditions.CheckChooseObjectValueCondition.prototype = jQuery.extend({ }, DefaultNodeShapes.Conditions.CheckValueCondition.prototype);

            /**
             * Opens the object search dialog
             * 
             * @returns {jQuery.Deferred} Deferred for the choosing process
             */
            Conditions.CheckChooseObjectValueCondition.prototype.openObjectSearchDialog = function() {

            };

            /**
             * Returns the label used if no object name is selected to prompt the user to choose an object
             * 
             * @returns {string} Label used if no object name is selected to prompt the user to choose an object
             */
            Conditions.CheckChooseObjectValueCondition.prototype.getChooseObjectLabel = function() {

            };

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            Conditions.CheckChooseObjectValueCondition.prototype.getTemplateName = function() {
                return "gn-nodeConditionChooseObjectValueCheck";
            };

            /**
             * Returns true if the field object can be loaded, else false
             * 
             * @param {object} existingData Existing data
             * @returns {bool} true if the object can be loaded, else false
             */
            Conditions.CheckChooseObjectValueCondition.prototype.canLoadFieldObject = function(existingData) {
                return existingData && existingData.selectedObjectId;
            }

            /**
             * Function to allow additional object condition data to be processed after loading
             * 
             * @param {object} conditionData Condition data build by calling buildConditionData before
             * @param {object} loadedObject Loaded object
             */
            Conditions.CheckChooseObjectValueCondition.prototype.processAditionalLoadedObjectConditionData = function(conditionData, loadedObject) {
                conditionData.selectedObjectName(loadedObject.name);                
            };

            /**
             * Returns the object id for dependency checks
             * 
             * @param {object} existingData Existing condition data
             * @returns {string} Object Id on which the condition depends
             */
            Conditions.CheckChooseObjectValueCondition.prototype.getDependsOnObjectId = function(existingData) {
                return this.getObjectId(existingData);
            };

            /**
             * Returns the object id from existing condition data for request caching
             * 
             * @param {object} existingData Existing condition data
             * @returns {string} Object Id for caching
             */
            Conditions.CheckChooseObjectValueCondition.prototype.getObjectId = function(existingData) {
                return existingData.selectedObjectId;
            };

            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.CheckChooseObjectValueCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = Conditions.CheckValueCondition.prototype.buildConditionDataNoLoad.apply(this, [existingData, element]);

                conditionData.selectedObjectId = new ko.observable("");
                conditionData.selectedObjectName = new ko.observable(this.getChooseObjectLabel());

                if(existingData)
                {
                    conditionData.selectedObjectId(existingData.selectedObjectId);
                }

                var self = this;
                conditionData.chooseObject = function() {
                    self.openObjectSearchDialog().then(function(chosenObject) {
                        conditionData.selectedObjectId(chosenObject.id);
                        conditionData.selectedObjectName(chosenObject.name);

                        var updatedExistingData = self.serializeConditionData(conditionData);
                        self.loadAndParseFields(conditionData, updatedExistingData, element);
                    });
                };

                // Load field data
                if(this.canLoadFieldObject(existingData))
                {
                    this.loadAndParseFields(conditionData, existingData, element);
                }

                return conditionData;
            };

            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            Conditions.CheckChooseObjectValueCondition.prototype.serializeConditionData = function(conditionData) {
                var serializedData = Conditions.CheckValueCondition.prototype.serializeConditionData.apply(this, [conditionData]);
                
                serializedData.selectedObjectId = conditionData.selectedObjectId();

                return serializedData;
            };

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));