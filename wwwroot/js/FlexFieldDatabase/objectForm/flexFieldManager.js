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
                    this.addField(ObjectForm.FlexFieldTypeSingleLine, name);
                },

                /**
                 * Adds a multi line field to the manager
                 * 
                 * @param {string} name Name of the field
                 */
                addMultiLineField: function(name) {
                    this.addField(ObjectForm.FlexFieldTypeMultiLine, name);
                },

                /**
                 * Adds a number field to the manager
                 * 
                 * @param {string} name Name of the field
                 */
                addNumberField: function(name) {
                    this.addField(ObjectForm.FlexFieldTypeNumber, name);
                },

                /**
                 * Adds a field to the manager
                 * 
                 * @param {int} fieldType Type of the field
                 * @param {string} name Name of the field
                 */
                addField: function(fieldType, name) {
                    var field = this.resolveFieldByType(fieldType);
                    if(!field)
                    {
                        throw "Unknown field type";
                    }

                    field.name(name);
                    this.fields.push(field);
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
                    }

                    return null;
                },


                /**
                 * Deletes a field
                 * 
                 * @param {IFlexField} field Field to delete
                 */
                deleteField: function(field) {
                    this.fields.remove(field);
                },


                /**
                 * Moves a field up
                 * 
                 * @param {IFlexField} field Field to move up
                 */
                moveFieldUp: function(field) {
                    var fieldIndex = this.fields.indexOf(field);
                    if(fieldIndex >= this.fields().length - 1 || fieldIndex < 0)
                    {
                        return;
                    }

                    this.swapFields(fieldIndex, fieldIndex + 1);
                },

                /**
                 * Moves a field down
                 * 
                 * @param {IFlexField} field Field to move down
                 */
                moveFieldDown: function(field) {
                    var fieldIndex = this.fields.indexOf(field);
                    if(fieldIndex <= 0)
                    {
                        return;
                    }

                    this.swapFields(fieldIndex, fieldIndex - 1);
                },

                /**
                 * Swaps to fields
                 * 
                 * @param {int} index1 Index of the first field
                 * @param {int} index2 Index of the second field
                 */
                swapFields: function(index1, index2) {
                    // Needs to remove and add again for multiline field
                    var fieldValue1 = this.fields()[index1];
                    var fieldValue2 = this.fields()[index2];
                    this.fields.remove(fieldValue1);
                    this.fields.remove(fieldValue2);

                    var firstIndex = index1;
                    var firstItem = fieldValue2;
                    var secondIndex = index2;
                    var secondItem = fieldValue1;
                    if(index1 > index2)
                    {
                        firstIndex = index2;
                        firstItem = fieldValue1;
                        secondIndex = index1;
                        secondItem = fieldValue2;
                    }

                    if(firstIndex >= this.fields().length)
                    {
                        this.fields.push(firstItem);
                    }
                    else
                    {
                        this.fields.splice(firstIndex, 0, firstItem);
                    }

                    if(secondIndex >= this.fields().length)
                    {
                        this.fields.push(secondItem);
                    }
                    else
                    {
                        this.fields.splice(secondIndex, 0, secondItem);
                    }
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
                        var serializedValue = {
                            id: fields[curField].id(),
                            fieldType: fields[curField].getType(),
                            name: fields[curField].name(),
                            value: fields[curField].serializeValue(),
                            scriptSettings: fields[curField].scriptSettings.serialize()
                        };
                        serializedValues.push(serializedValue);
                    }

                    return serializedValues;
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
                        deserializedField.name(serializedValues[curField].name);
                        deserializedField.deserializeValue(serializedValues[curField].value);
                        deserializedField.scriptSettings.deserialize(serializedValues[curField].scriptSettings);
                        fields.push(deserializedField);
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
            }

        }(FlexFieldDatabase.ObjectForm = FlexFieldDatabase.ObjectForm || {}));
    }(GoNorth.FlexFieldDatabase = GoNorth.FlexFieldDatabase || {}));
}(window.GoNorth = window.GoNorth || {}));