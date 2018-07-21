(function(GoNorth) {
    "use strict";
    (function(FlexFieldDatabase) {
        (function(ObjectForm) {

            /**
             * Type of the object field
             */
            ObjectForm.FlexFieldTypeOption = 3;

            /**
             * Class for an option field
             * 
             * @class
             */
            ObjectForm.OptionFlexField = function() {
                ObjectForm.FlexFieldBase.apply(this);

                this.value = new ko.observable(null);
                this.options = new ko.observableArray();
            }

            ObjectForm.OptionFlexField.prototype = jQuery.extend(true, {}, ObjectForm.FlexFieldBase.prototype);

            /**
             * Returns the type of the field
             * 
             * @returns {int} Type of the field
             */
            ObjectForm.OptionFlexField.prototype.getType = function() { return ObjectForm.FlexFieldTypeOption; }

            /**
             * Returns the template name
             * 
             * @returns {string} Template Name
             */
            ObjectForm.OptionFlexField.prototype.getTemplateName = function() { return "gn-optionField"; }

            /**
             * Returns if the field can be exported to a script
             * 
             * @returns {bool} true if the value can be exported to a script, else false
             */
            ObjectForm.OptionFlexField.prototype.canExportToScript = function() { return true; }

            /**
             * Serializes the value to a string
             * 
             * @returns {string} Value of the field as a string
             */
            ObjectForm.OptionFlexField.prototype.serializeValue = function() { return this.value(); }

            /**
             * Deserializes a value from a string
             * 
             * @param {string} value Value to Deserialize
             */
            ObjectForm.OptionFlexField.prototype.deserializeValue = function(value) { this.value(value); }


            /**
             * Returns true if the field has additional configuration, else false
             * 
             * @returns {bool} true if the field has additional configuration, else false
             */
            ObjectForm.OptionFlexField.prototype.hasAdditionalConfiguration = function() { return true; }

            /**
             * Returns the label for additional configuration
             * 
             * @returns {string} Additional Configuration
             */
            ObjectForm.OptionFlexField.prototype.getAdditionalConfigurationLabel = function() { return GoNorth.FlexFieldDatabase.Localization.OptionFieldAdditionalConfigurationLabel; }

            /**
             * Returns true if the additional configuration can be edited for fields that were created based on template fields, else false
             * 
             * @returns {bool} true if the additional configuration can be edited for fields that were created based on template fields, else false
             */
            ObjectForm.OptionFlexField.prototype.allowEditingAdditionalConfigForTemplateFields = function() { return false; }

            /**
             * Sets additional configuration
             * 
             * @param {string} configuration Additional Configuration
             */
            ObjectForm.OptionFlexField.prototype.setAdditionalConfiguration = function(configuration) { 
                var availableOptions = [];
                if(configuration)
                {
                    availableOptions = configuration.split("\n");
                }
                
                this.options(availableOptions)
            }

            /**
             * Returns additional configuration
             * 
             * @returns {string} Additional Configuration
             */
            ObjectForm.OptionFlexField.prototype.getAdditionalConfiguration = function() { return this.options().join("\n"); }
        
            /**
             * Serializes the additional configuration
             * 
             * @returns {string} Serialized additional configuration
             */
            ObjectForm.OptionFlexField.prototype.serializeAdditionalConfiguration = function() { return JSON.stringify(this.options()); },

            /**
             * Deserializes the additional configuration
             * 
             * @param {string} additionalConfiguration Serialized additional configuration
             */
            ObjectForm.OptionFlexField.prototype.deserializeAdditionalConfiguration = function(additionalConfiguration) { 
                var options = [];
                if(additionalConfiguration)
                {
                    options = JSON.parse(additionalConfiguration);
                }

                this.options(options);
            }

        }(FlexFieldDatabase.ObjectForm = FlexFieldDatabase.ObjectForm || {}));
    }(GoNorth.FlexFieldDatabase = GoNorth.FlexFieldDatabase || {}));
}(window.GoNorth = window.GoNorth || {}));