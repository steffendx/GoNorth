(function(GoNorth) {
    "use strict";
    (function(FlexFieldDatabase) {
        (function(ObjectForm) {

            /**
             * Interface for flex field fields
             * 
             * @class
             */
            ObjectForm.FlexFieldBase = function() {
                this.id = new ko.observable("");
                this.createdFromTemplate = new ko.observable(false);
                this.name = new ko.observable();
                this.scriptSettings = new ObjectForm.FlexFieldScriptSettings();
            }

            ObjectForm.FlexFieldBase.prototype = {
                /**
                 * Returns the type of the field
                 * 
                 * @returns {int} Type of the field
                 */
                getType: function() { },

                /**
                 * Returns the template name
                 * 
                 * @returns {string} Template Name
                 */
                getTemplateName: function() { },

                /**
                 * Returns if the field can be exported to a script
                 * 
                 * @returns {bool} true if the value can be exported to a script, else false
                 */
                canExportToScript: function() { },

                /**
                 * Serializes the value to a string
                 * 
                 * @param {number} fieldIndex Index of the field in the final serialization
                 * @returns {string} Value of the field as a string
                 */
                serializeValue: function(fieldIndex) { },

                /**
                 * Deserializes a value from a string
                 * 
                 * @param {string} value Value to Deserialize
                 */
                deserializeValue: function(value) { },

                /**
                 * Returns all child fields
                 * 
                 * @returns {FlexFieldBase[]} Children of the field, null if no children exist
                 */
                getChildFields: function() { return null; },

                /**
                 * Returns true if the field has additional configuration, else false
                 * 
                 * @returns {bool} true if the field has additional configuration, else false
                 */
                hasAdditionalConfiguration: function() { return false; },

                /**
                 * Returns the label for additional configuration
                 * 
                 * @returns {string} Additional Configuration
                 */
                getAdditionalConfigurationLabel: function() { return ""; },

                /**
                 * Returns true if the additional configuration can be edited for fields that were created based on template fields, else false
                 * 
                 * @returns {bool} true if the additional configuration can be edited for fields that were created based on template fields, else false
                 */
                allowEditingAdditionalConfigForTemplateFields: function() { return false; },

                /**
                 * Sets additional configuration
                 * 
                 * @param {string} configuration Additional Configuration
                 */
                setAdditionalConfiguration: function(configuration) { },

                /**
                 * Returns additional configuration
                 * 
                 * @returns {string} Additional Configuration
                 */
                getAdditionalConfiguration: function() { return ""; },

                /**
                 * Serializes the additional configuration
                 * 
                 * @returns {string} Serialized additional configuration
                 */
                serializeAdditionalConfiguration: function() { return ""; },

                /**
                 * Deserializes the additional configuration
                 * 
                 * @param {string} additionalConfiguration Serialized additional configuration
                 */
                deserializeAdditionalConfiguration: function(additionalConfiguration) { },


                /**
                 * Groups fields into the field
                 * 
                 * @param {FlexFieldBase[]} fields Root List of fields
                 * @param {object} fieldsToRemoveFromRootList Object to track fields that must be removed from the root list
                 */
                groupFields: function(fields, fieldsToRemoveFromRootList) { }
            }

        }(FlexFieldDatabase.ObjectForm = FlexFieldDatabase.ObjectForm || {}));
    }(GoNorth.FlexFieldDatabase = GoNorth.FlexFieldDatabase || {}));
}(window.GoNorth = window.GoNorth || {}));