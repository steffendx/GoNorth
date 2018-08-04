(function(GoNorth) {
    "use strict";
    (function(FlexFieldDatabase) {
        (function(ObjectForm) {

            /**
             * Type of the field group
             */
            ObjectForm.FlexFieldGroup = 100;

            /**
             * Class for a field group
             * 
             * @class
             */
            ObjectForm.FieldGroup = function() {
                ObjectForm.FlexFieldBase.apply(this);

                this.fields = new ko.observableArray();
                this.deserializingFieldIds = null;

                this.isExpandedByDefault = true;
                this.areFieldsExpanded = new ko.observable(true);
            }

            ObjectForm.FieldGroup.prototype = jQuery.extend(true, {}, ObjectForm.FlexFieldBase.prototype);

            /**
             * Returns the type of the field
             * 
             * @returns {int} Type of the field
             */
            ObjectForm.FieldGroup.prototype.getType = function() { return ObjectForm.FlexFieldGroup; }

            /**
             * Returns the template name
             * 
             * @returns {string} Template Name
             */
            ObjectForm.FieldGroup.prototype.getTemplateName = function() { return "gn-fieldGroup"; }

            /**
             * Returns if the field can be exported to a script
             * 
             * @returns {bool} true if the value can be exported to a script, else false
             */
            ObjectForm.FieldGroup.prototype.canExportToScript = function() { return false; }

            /**
             * Serializes the value to a string
             * 
             * @param {number} fieldIndex Index of the field in the final serialization
             * @returns {string} Value of the field as a string
             */
            ObjectForm.FieldGroup.prototype.serializeValue = function(fieldIndex) { 
                var fieldIds = [];
                var fields = this.fields();
                for(var curField = 0; curField < fields.length; ++curField)
                {
                    // If field id is not yet filled it will be filled on the server side
                    if(fields[curField].id())
                    {
                        fieldIds.push(fields[curField].id());
                    }
                    else
                    {
                        fieldIds.push((fieldIndex + curField + 1).toString());
                    }
                }

                return JSON.stringify(fieldIds); 
            }
            
            /**
             * Returns all child fields
             * 
             * @returns {FlexFieldBase[]} Children of the field, null if no children exist
             */
            ObjectForm.FieldGroup.prototype.getChildFields = function() { 
                return this.fields(); 
            }

            /**
             * Deserializes a value from a string
             * 
             * @param {string} value Value to Deserialize
             */
            ObjectForm.FieldGroup.prototype.deserializeValue = function(value) { 
                this.deserializingFieldIds = [];
                if(value) 
                {
                    this.deserializingFieldIds = JSON.parse(value);
                }
            }

            /**
             * Serializes the additional configuration
             * 
             * @returns {string} Serialized additional configuration
             */
            ObjectForm.FieldGroup.prototype.serializeAdditionalConfiguration = function() { 
                return JSON.stringify({
                    isExpandedByDefault: this.isExpandedByDefault
                }); 
            },

            /**
             * Deserializes the additional configuration
             * 
             * @param {string} additionalConfiguration Serialized additional configuration
             */
            ObjectForm.FieldGroup.prototype.deserializeAdditionalConfiguration = function(additionalConfiguration) { 
                if(additionalConfiguration)
                {
                    var deserializedConfig = JSON.parse(additionalConfiguration);
                    this.isExpandedByDefault = deserializedConfig.isExpandedByDefault;
                    this.areFieldsExpanded(this.isExpandedByDefault);
                }
            }
            
            /**
             * Groups fields into the field
             * 
             * @param {FlexFieldBase[]} fields Root List of fields
             * @param {object} fieldsToRemoveFromRootList Object to track fields that must be removed from the root list
             */
            ObjectForm.FieldGroup.prototype.groupFields = function(fields, fieldsToRemoveFromRootList) { 
                if(!this.deserializingFieldIds)
                {
                    return;
                }

                for(var curGroupFieldId = 0; curGroupFieldId < this.deserializingFieldIds.length; ++curGroupFieldId)
                {
                    var fieldFound = false;
                    for(var curField = 0; curField < fields.length; ++curField)
                    {
                        if(fields[curField].id() == this.deserializingFieldIds[curGroupFieldId])
                        {
                            // Check fieldsToRemoveFromRootList here to prevent duplicated fields if a new group was distributed from template 
                            // using a field which a group in the current object includes
                            if(!fieldsToRemoveFromRootList[curField])
                            {
                                this.fields.push(fields[curField]);
                                fieldsToRemoveFromRootList[curField] = true;
                            }
                            fieldFound = true;
                            break;
                        }
                    }

                    // If a user creates a folder from template the index must be used
                    if(!fieldFound && this.deserializingFieldIds[curGroupFieldId] && this.deserializingFieldIds[curGroupFieldId].indexOf("-") < 0)
                    {
                        var targetIndex = parseInt(this.deserializingFieldIds[curGroupFieldId]);
                        if(!isNaN(targetIndex) && targetIndex >= 0 && targetIndex < fields.length)
                        {
                            this.fields.push(fields[targetIndex]);
                            fieldsToRemoveFromRootList[targetIndex] = true;
                        }
                    }
                }
                this.deserializingFieldIds = null;
            }


            /**
             * Toggles the field visibility
             */
            ObjectForm.FieldGroup.prototype.toogleFieldVisibility = function() {
                this.areFieldsExpanded(!this.areFieldsExpanded());
            }

            /**
             * Deletes a field
             * 
             * @param {FlexFieldBase} field Field to delete
             */
            ObjectForm.FieldGroup.prototype.deleteField = function(field) {
                this.fields.remove(field);
            }

        }(FlexFieldDatabase.ObjectForm = FlexFieldDatabase.ObjectForm || {}));
    }(GoNorth.FlexFieldDatabase = GoNorth.FlexFieldDatabase || {}));
}(window.GoNorth = window.GoNorth || {}));