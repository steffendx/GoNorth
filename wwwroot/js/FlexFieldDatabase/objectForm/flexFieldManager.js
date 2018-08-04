(function(GoNorth) {
    "use strict";
    (function(FlexFieldDatabase) {
        (function(ObjectForm) {

            /**
             * Class for managing flex fields
             * 
             * @class
             */
            ObjectForm.FlexFieldManager = function() {
                this.fields = new ko.observableArray();
            }

            ObjectForm.FlexFieldManager.prototype = {
                /**
                 * Adds a single line field to the manager
                 * 
                 * @param {string} name Name of the field
                 */
                addSingleLineField: function(name) {
                    return this.addField(ObjectForm.FlexFieldTypeSingleLine, name);
                },

                /**
                 * Adds a multi line field to the manager
                 * 
                 * @param {string} name Name of the field
                 * @returns {FlexFieldBase} New field
                 */
                addMultiLineField: function(name) {
                    return this.addField(ObjectForm.FlexFieldTypeMultiLine, name);
                },

                /**
                 * Adds a number field to the manager
                 * 
                 * @param {string} name Name of the field
                 * @returns {FlexFieldBase} New field
                 */
                addNumberField: function(name) {
                    return this.addField(ObjectForm.FlexFieldTypeNumber, name);
                },
                
                /**
                 * Adds a option field to the manager
                 * 
                 * @param {string} name Name of the field
                 * @returns {FlexFieldBase} New field
                 */
                addOptionField: function(name) {
                    return this.addField(ObjectForm.FlexFieldTypeOption, name);
                },

                /**
                 * Adds a field group to the manager
                 * 
                 * @param {string} name Name of the group
                 * @returns {FlexFieldBase} New field
                 */
                addFieldGroup: function(name) {
                    return this.addField(ObjectForm.FlexFieldGroup, name);
                },

                /**
                 * Adds a field to the manager
                 * 
                 * @param {int} fieldType Type of the field
                 * @param {string} name Name of the field
                 * @returns {FlexFieldBase} New field
                 */
                addField: function(fieldType, name) {
                    var field = this.resolveFieldByType(fieldType);
                    if(!field)
                    {
                        throw "Unknown field type";
                    }

                    field.name(name);
                    this.fields.push(field);
                    return field;
                },

                /**
                 * Resolves a field by a type
                 * 
                 * @param {int} fieldType Field Type
                 */
                resolveFieldByType: function(fieldType) {
                    switch(fieldType)
                    {
                    case ObjectForm.FlexFieldTypeSingleLine:
                        return new ObjectForm.SingleLineFlexField();
                    case ObjectForm.FlexFieldTypeMultiLine:
                        return new ObjectForm.MultiLineFlexField();
                    case ObjectForm.FlexFieldTypeNumber:
                        return new ObjectForm.NumberFlexField();
                    case ObjectForm.FlexFieldTypeOption:
                        return new ObjectForm.OptionFlexField();
                    case ObjectForm.FlexFieldGroup:
                        return new ObjectForm.FieldGroup();
                    }

                    return null;
                },


                /**
                 * Deletes a field
                 * 
                 * @param {FlexFieldBase} field Field to delete
                 */
                deleteField: function(field) {
                    this.fields.remove(field);
                },

                /**
                 * Deletes a field group
                 * 
                 * @param {FieldGroup} fieldGroup Field group to delete
                 */
                deleteFieldGroup: function(field) {
                    if(field.fields) {
                        var targetPushIndex = this.fields.indexOf(field);
                        var fieldsInGroup = field.fields();
                        for(var curField = 0; curField < fieldsInGroup.length; ++curField)
                        {
                            if(targetPushIndex < 0)
                            {
                                this.fields.push(fieldsInGroup[curField]);
                            }
                            else
                            {
                                this.fields.splice(targetPushIndex + curField, 0, fieldsInGroup[curField]);
                            }
                        }
                    }
                    
                    this.fields.remove(field);
                },


                /**
                 * Serializes the fields to an array with values
                 * 
                 * @returns {object[]} Serialized values
                 */
                serializeFields: function() {
                    var serializedValues = [];
                    var fields = this.fields();
                    for(var curField = 0; curField < fields.length; ++curField)
                    {
                        serializedValues.push(this.serializeSingleField(fields[curField], serializedValues));

                        var childFields = fields[curField].getChildFields();
                        if(childFields)
                        {
                            for(var curChild = 0; curChild < childFields.length; ++curChild)
                            {
                                serializedValues.push(this.serializeSingleField(childFields[curChild], serializedValues));
                            }
                        }
                    }

                    return serializedValues;
                },

                /**
                 * Serializes a single field
                 * 
                 * @param {FlexFieldBase} field Field to serialize
                 * @param {object[]} serializedValues Already serialized values
                 * @returns {object} Serialized field
                 */
                serializeSingleField: function(field, serializedValues) {
                    return {
                        id: field.id(),
                        createdFromTemplate: field.createdFromTemplate(),
                        fieldType: field.getType(),
                        name: field.name(),
                        value: field.serializeValue(serializedValues.length),
                        additionalConfiguration: field.serializeAdditionalConfiguration(),
                        scriptSettings: field.scriptSettings.serialize()
                    };
                },

                /**
                 * Deserializes saved fields fields
                 * 
                 * @param {objec[]} serializedValues Serialized values 
                 */
                deserializeFields: function(serializedValues) {
                    var fields = [];
                    for(var curField = 0; curField < serializedValues.length; ++curField)
                    {
                        var deserializedField = this.resolveFieldByType(serializedValues[curField].fieldType);
                        deserializedField.id(serializedValues[curField].id);
                        deserializedField.createdFromTemplate(serializedValues[curField].createdFromTemplate);
                        deserializedField.name(serializedValues[curField].name);
                        deserializedField.deserializeValue(serializedValues[curField].value);
                        deserializedField.deserializeAdditionalConfiguration(serializedValues[curField].additionalConfiguration);
                        deserializedField.scriptSettings.deserialize(serializedValues[curField].scriptSettings);
                        fields.push(deserializedField);
                    }

                    var fieldsToRemoveFromRootList = {};
                    for(var curField = 0; curField < fields.length; ++curField)
                    {
                        fields[curField].groupFields(fields, fieldsToRemoveFromRootList);
                    }

                    for(var curField = fields.length - 1; curField >= 0; --curField)
                    {
                        if(fieldsToRemoveFromRootList[curField])
                        {
                            fields.splice(curField, 1);
                        }
                    }

                    this.fields(fields);
                },

                /**
                 * Syncs the field ids back after save
                 * 
                 * @param {object} flexFieldObjectData Response flex field object data after save
                 */
                syncFieldIds: function(flexFieldObjectData) {
                    var fieldLookup = {};
                    for(var curField = 0; curField < flexFieldObjectData.fields.length; ++curField)
                    {
                        fieldLookup[flexFieldObjectData.fields[curField].name] = flexFieldObjectData.fields[curField].id;
                    }

                    var fields = this.fields();
                    for(var curField = 0; curField < fields.length; ++curField)
                    {
                        fields[curField].id(fieldLookup[fields[curField].name()]);
                    }
                },

                /**
                 * Flags all fields as created from template
                 */
                flagFieldsAsCreatedFromTemplate: function() {
                    var fields = this.fields();
                    for(var curField = 0; curField < fields.length; ++curField)
                    {
                        fields[curField].createdFromTemplate(true);
                        var children = fields[curField].getChildFields();
                        if(!children)
                        {
                            continue;
                        }

                        for(var curChild = 0; curChild < children.length; ++curChild)
                        {
                            children[curChild].createdFromTemplate(true);
                        }
                    }
                },


                /**
                 * Checks if a field name is in used
                 * 
                 * @param {string} fieldName Name of the field to check
                 * @param {string} fieldToIgnore Field to ignore during the check (important for rename)
                 */
                isFieldNameInUse: function(fieldName, fieldToIgnore) {
                    fieldName = fieldName.toLowerCase();

                    var fields = this.fields();
                    for(var curField = 0; curField < fields.length; ++curField)
                    {
                        if(fields[curField] != fieldToIgnore && fields[curField].name() && fields[curField].name().toLowerCase() == fieldName)
                        {
                            return true;
                        }

                        var children = fields[curField].getChildFields();
                        if(!children)
                        {
                            continue;
                        }

                        for(var curChild = 0; curChild < children.length; ++curChild)
                        {
                            if(children[curChild] != fieldToIgnore && children[curChild].name() && children[curChild].name().toLowerCase() == fieldName)
                            {
                                return true;
                            }
                        }
                    }
                }
            }

        }(FlexFieldDatabase.ObjectForm = FlexFieldDatabase.ObjectForm || {}));
    }(GoNorth.FlexFieldDatabase = GoNorth.FlexFieldDatabase || {}));
}(window.GoNorth = window.GoNorth || {}));