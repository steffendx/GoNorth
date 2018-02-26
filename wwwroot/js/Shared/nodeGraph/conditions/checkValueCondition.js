(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /**
             * Check value condition
             * @class
             */
            Conditions.CheckValueCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.BaseCondition.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);

                this.fieldObjectId = "";
            };

            Conditions.CheckValueCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.BaseCondition.prototype);
            Conditions.CheckValueCondition.prototype = jQuery.extend(Conditions.CheckValueCondition.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            Conditions.CheckValueCondition.prototype.getTemplateName = function() {
                return "gn-nodeConditionValueCheck";
            };
            
            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            Conditions.CheckValueCondition.prototype.canBeSelected = function() {
                return true;
            };

            /**
             * Function to allow additional object condition data to be processed after loading
             * 
             * @param {object} conditionData Condition data build by calling buildConditionData before
             * @param {object} loadedObject Loaded object
             */
            Conditions.CheckValueCondition.prototype.processAditionalLoadedObjectConditionData = function(conditionData, loadedObject) {
                
            };

            /**
             * Returns the selected field, null if no field was found
             * 
             * @param {object} existingData Existing condition data
             * @param {objec[]} fields Flex fields
             * @returns {object} Selected field
             */
            Conditions.CheckValueCondition.prototype.getSelectedField = function(existingData, fields) {
                var selectedField = null;
                for(var curField = 0; curField < fields.length; ++curField)
                {
                    if(fields[curField].id == existingData.fieldId)
                    {
                        selectedField = fields[curField];
                        
                        if(fields[curField].name == existingData.fieldName)
                        {
                            break;
                        }
                    }
                }
                return selectedField;
            };

            
            /**
             * Returns the data for the condition without trying to load field data
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.CheckValueCondition.prototype.buildConditionDataNoLoad = function(existingData, element) {
                var conditionData = {
                    selectedField: new ko.observable(),
                    operator: new ko.observable(),
                    compareValue: new ko.observable(),
                    availableFields: new ko.observable()
                };
                if(existingData)
                {
                    conditionData.compareValue(existingData.compareValue ? existingData.compareValue : null);
                }

                conditionData.validateInput = function(data, e) {
                    if(conditionData.selectedField().fieldType != GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldTypeNumber)
                    {
                        return true;
                    }

                    var keypressValid = GoNorth.Util.validateNumberKeyPress(e.target, e);
                    return keypressValid;
                };

                conditionData.availableOperators = new ko.computed(function() {
                    if(!this.selectedField())
                    {
                        return [];
                    }

                    var operators = [ "=", "!=", "contains", "startsWith", "endsWith" ];
                    if(this.selectedField().fieldType == GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldTypeNumber)
                    {
                        operators = [ "=", "!=", "<=", "<", ">=", ">" ];
                    }
                    return operators;
                }, conditionData);

                conditionData.selectedField.subscribe(function() {
                    if(conditionData.selectedField().fieldType != GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldTypeNumber)
                    {
                        return;
                    }

                    var parsedValue =  parseFloat(conditionData.compareValue());
                    if(isNaN(parsedValue))
                    {
                        conditionData.compareValue("0");
                    }
                });

                return conditionData;
            };

            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.CheckValueCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = this.buildConditionDataNoLoad(existingData, element);

                // Load field data
                if(this.canLoadFieldObject(existingData))
                {
                    this.loadAndParseFields(conditionData, existingData, element);
                }

                return conditionData;
            };
            
            /**
             * Returns true if the field object can be loaded, else false
             * 
             * @param {object} existingData Existing data
             * @returns {bool} true if the object can be loaded, else false
             */
            Conditions.CheckValueCondition.prototype.canLoadFieldObject = function(existingData) {
                return true;
            }

            /**
             * Loads and parses the fields for the condition dialog
             * 
             * @param {object} conditionData Condition Data 
             * @param {object} existingData Existing Data
             * @param {object} element Element
             */
            Conditions.CheckValueCondition.prototype.loadAndParseFields = function(conditionData, existingData, element)
            {
                var self = this;
                this.loadObjectShared(existingData).then(function(fieldObject) {
                    self.fieldObjectId = fieldObject.id;
                    var filteredFields = GoNorth.Util.getFilteredFieldsForScript(fieldObject.fields);
                    for(var curField = 0; curField < filteredFields.length; ++curField)
                    {
                        var displayName = filteredFields[curField].name + " (";
                        if(filteredFields[curField].fieldType == GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldTypeNumber)
                        {
                            displayName += DefaultNodeShapes.Localization.Conditions.NumberField;
                        }
                        else
                        {
                            displayName += DefaultNodeShapes.Localization.Conditions.TextField;
                        }
                        displayName += ")";
                        filteredFields[curField].displayName = displayName;
                    }

                    conditionData.availableFields(filteredFields);
                    
                    // Load old data
                    if(existingData)
                    {
                        var selectedField = self.getSelectedField(existingData, filteredFields);
                        if(selectedField)
                        {
                            conditionData.selectedField(selectedField);
                        }
                        conditionData.operator(existingData.operator ? existingData.operator : null);
                    }

                    // Additional processing
                    self.processAditionalLoadedObjectConditionData(conditionData, fieldObject);
                }, function(err) {
                    element.errorOccured(true);
                });
            }

            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            Conditions.CheckValueCondition.prototype.serializeConditionData = function(conditionData) {
                return {
                    fieldId: conditionData.selectedField() ? conditionData.selectedField().id : null,
                    fieldName: conditionData.selectedField() ? conditionData.selectedField().name : null,
                    operator: conditionData.operator(),
                    compareValue: conditionData.compareValue() ? conditionData.compareValue() : null
                };
            };

            /**
             * Returns the object id for dependency checks
             * 
             * @param {object} existingData Existing condition data
             * @returns {string} Object Id on which the condition depends
             */
            Conditions.CheckValueCondition.prototype.getDependsOnObjectId = function(existingData) {
                return this.fieldObjectId;
            };

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            Conditions.CheckValueCondition.prototype.getConditionDependsOnObject = function(existingData) {
                var objectId = this.getDependsOnObjectId(existingData);

                return [{
                    objectType: this.getObjectTypeName(),
                    objectId: objectId
                }];
            }

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Conditions.CheckValueCondition.prototype.getObjectTypeName = function() {

            };

            /**
             * Returns the title of the field object used in the string representation
             * 
             * @param {object} loadedFieldObject Loaded Field object for returning name if necessary
             * @returns {string} Title of the field object
             */
            Conditions.CheckValueCondition.prototype.getObjectTitle = function(loadedFieldObject) {
                
            };

            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialzied condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckValueCondition.prototype.getConditionString = function(existingData) {
                var def = new jQuery.Deferred();
                
                // Check if data is valid
                if(!this.canLoadFieldObject(existingData) || existingData.fieldId == null)
                {
                    def.resolve(DefaultNodeShapes.Localization.Conditions.MissingInformations);
                    return def.promise();
                }

                // Load data and build string
                var self = this;
                this.loadObjectShared(existingData).then(function(fieldObject) {
                    self.fieldObjectId = fieldObject.id;
                    var filteredFields = GoNorth.Util.getFilteredFieldsForScript(fieldObject.fields);
                    var selectedField = self.getSelectedField(existingData, filteredFields);
                    if(!selectedField)
                    {
                        def.reject(DefaultNodeShapes.Localization.Conditions.FieldWasDeleted);
                        return;
                    }

                    var conditionText = self.getObjectTitle(fieldObject) + "(\"" + selectedField.name + "\") " + existingData.operator + " ";
                    var isNumberField = selectedField.fieldType == GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldTypeNumber;
                    var emptyValue = "0";
                    if(!isNumberField)
                    {
                        conditionText += "\"";
                        emptyValue = "";
                    }
                    conditionText += existingData.compareValue ? existingData.compareValue : emptyValue;
                    if(!isNumberField)
                    {
                        conditionText += "\"";
                    }

                    def.resolve(conditionText);
                }, function() {
                    def.reject();
                });

                return def.promise();
            };

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));