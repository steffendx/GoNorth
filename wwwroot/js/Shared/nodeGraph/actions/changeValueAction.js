(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /**
             * Change Value Action
             * @class
             */
            Actions.ChangeValueAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);

                this.contentElement = null;
                this.filteredFields = [];

                this.isNumberValueSelected = false;
            };

            Actions.ChangeValueAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);
            Actions.ChangeValueAction.prototype = jQuery.extend(Actions.ChangeValueAction.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Actions.ChangeValueAction.prototype.getObjectTypeName = function() {
            };

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.ChangeValueAction.prototype.getContent = function() {
                return  "<select class='gn-actionNodeAttributeSelect'></select>" +
                        "<select class='gn-actionNodeAttributeOperator'></select>" +
                        "<input type='text' class='gn-actionNodeAttributeChange'/>";
            };

            /**
             * Returns true if the action is using an individual object id for each object since the user can choose an object instead of having a fixed one, else false
             * 
             * @returns {bool} true if the action is using an individual object id for each object since the user can choose an object instead of having a fixed one, else false
             */
            Actions.ChangeValueAction.prototype.isUsingIndividualObjectId = function() {
                return false;
            };

            /**
             * Returns the object id
             * 
             * @returns {string} Object Id
             */
            Actions.ChangeValueAction.prototype.getObjectId = function(existingData) {
                return null;
            };

            /**
             * Returns true if the object can be loaded, else false
             * 
             * @returns {bool} true if the object can be loaded, else false
             */
            Actions.ChangeValueAction.prototype.canLoadObject = function(existingData) {
                return true;
            };

            /**
             * Runs additional initialize actions
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.ChangeValueAction.prototype.onInitializeAdditional = function(contentElement, actionNode) {

            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.ChangeValueAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;

                this.deserializePreLoadData();

                if(this.canLoadObject())
                {
                    this.loadFields(contentElement, actionNode);
                }

                var self = this;
                contentElement.find(".gn-actionNodeAttributeSelect").on("change", function() {
                    self.syncOperators();
                    self.saveData();
                });

                contentElement.find(".gn-actionNodeAttributeOperator").on("change", function() {
                    self.saveData();
                });

                var attributeCompare = contentElement.find(".gn-actionNodeAttributeChange");
                attributeCompare.keydown(function(e) {
                    if(self.isNumberValueSelected)
                    {
                        GoNorth.Util.validateNumberKeyPress(attributeCompare, e);
                    }
                });

                attributeCompare.change(function(e) {
                    if(self.isNumberValueSelected)
                    {
                        self.ensureNumberValue();
                    }

                    self.saveData();
                });

                this.onInitializeAdditional(contentElement, actionNode);
            };

            /**
             * Parses additional data
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             * @param {object} fieldObject Loaded Field object
             */
            Actions.ChangeValueAction.prototype.parseAdditionalData = function(contentElement, actionNode, fieldObject) {
            };

            /**
             * Loads the fields
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.ChangeValueAction.prototype.loadFields = function(contentElement, actionNode) {
                actionNode.showLoading();
                actionNode.hideError();

                var self = this;
                this.loadObjectShared().then(function(fieldObject) {
                    // Set related object data
                    self.nodeModel.set("actionRelatedToObjectType", self.getObjectTypeName());
                    self.nodeModel.set("actionRelatedToObjectId", fieldObject.id);

                    // Fill field array
                    var attributeSelect = contentElement.find(".gn-actionNodeAttributeSelect");
                    self.filteredFields = GoNorth.Util.getFilteredFieldsForScript(fieldObject.fields);
                    
                    GoNorth.Util.fillSelectFromArray(attributeSelect, self.filteredFields, function(field, index) { return index; }, function(field) { 
                        var label = field.name + " ("; 
                        if(field.fieldType == GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldTypeNumber)
                        {
                            label += DefaultNodeShapes.Localization.Actions.NumberField;
                        }
                        else
                        {
                            label += DefaultNodeShapes.Localization.Actions.TextField;
                        }
                        label += ")";

                        return label;
                    });

                    // Parse additional data
                    self.parseAdditionalData(contentElement, actionNode, fieldObject);
                    
                    var dataExists = self.deserializeData();
                    if(!dataExists)
                    {
                        self.syncOperators();
                        self.saveData();
                    }
                    
                    actionNode.hideLoading();
                }, function() {
                    actionNode.hideLoading();
                    actionNode.showError();
                });
            };

            /**
             * Syncs the operators
             */
            Actions.ChangeValueAction.prototype.syncOperators = function() {
                var selectedField = this.contentElement.find(".gn-actionNodeAttributeSelect").val();
                var operatorSelect = this.contentElement.find(".gn-actionNodeAttributeOperator");
                var curField = this.filteredFields[selectedField];
                if(!curField)
                {
                    GoNorth.Util.fillSelectFromArray(operatorSelect, [], function(operator) { return operator; }, function(operator) { return operator; });
                    return;
                }

                var operators = [];
                if(curField.fieldType == GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldTypeNumber)
                {
                    operators = [ "=", "+=", "-=", "*=", "/=" ];
                    this.isNumberValueSelected = true;

                    this.ensureNumberValue();
                }
                else
                {
                    operators = [ "=" ];
                    this.isNumberValueSelected = false;
                }

                GoNorth.Util.fillSelectFromArray(operatorSelect, operators, function(operator) { return operator; }, function(operator) { return operator; });
            }

            /**
             * Ensures the user entered a number if a number field was selected
             */
            Actions.ChangeValueAction.prototype.ensureNumberValue = function() {
                var parsedValue = parseFloat(this.contentElement.find(".gn-actionNodeAttributeChange").val());
                if(isNaN(parsedValue))
                {
                    this.contentElement.find(".gn-actionNodeAttributeChange").val("0");
                }
            }

            /**
             * Deserializes data before loading data
             */
            Actions.ChangeValueAction.prototype.deserializePreLoadData = function() {
                
            };

            /**
             * Deserializes the data
             */
            Actions.ChangeValueAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return false;
                }

                var data = JSON.parse(actionData);
                var selectedFieldIndex = 0;
                for(var curField = 0; curField < this.filteredFields.length; ++curField)
                {
                    if(this.filteredFields[curField].id == data.fieldId)
                    {
                        selectedFieldIndex = curField;
                        
                        if(this.filteredFields[curField].name == data.fieldName)
                        {
                            break;
                        }
                    }
                }

                this.contentElement.find(".gn-actionNodeAttributeSelect").find("option[value='" + selectedFieldIndex + "']").prop("selected", true);
                this.syncOperators();
                this.contentElement.find(".gn-actionNodeAttributeOperator").find("option[value='" + data.operator + "']").prop("selected", true);
                this.contentElement.find(".gn-actionNodeAttributeChange").val(data.valueChange);

                return true;
            };

            /**
             * Serializes additional data
             * 
             * @param {object} serializeData Existing Serialize Data
             */
            Actions.ChangeValueAction.prototype.serializeAdditionalData = function(serializeData) {

            };

            /**
             * Saves the data
             */
            Actions.ChangeValueAction.prototype.saveData = function() {
                var selectedField = this.contentElement.find(".gn-actionNodeAttributeSelect").val();
                var curField = this.filteredFields[selectedField];
                var operator = this.contentElement.find(".gn-actionNodeAttributeOperator").val();
                var valueChange = this.contentElement.find(".gn-actionNodeAttributeChange").val();

                var serializeData = {
                    fieldId: curField ? curField.id : null,
                    fieldName: curField ? curField.name : null,
                    operator: operator,
                    valueChange: valueChange
                };

                this.serializeAdditionalData(serializeData);

                this.nodeModel.set("actionData", JSON.stringify(serializeData));
            }

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));