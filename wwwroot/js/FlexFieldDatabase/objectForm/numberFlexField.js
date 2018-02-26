(function(GoNorth) {
    "use strict";
    (function(FlexFieldDatabase) {
        (function(ObjectForm) {

            /**
             * Type of the number field
             */
            ObjectForm.FlexFieldTypeNumber = 2;

            /**
             * Class for a number field
             * 
             * @class
             */
            ObjectForm.NumberFlexField = function() {
                ObjectForm.IFlexField.apply(this);

                this.value = new ko.observable(0.0);
            }

            ObjectForm.NumberFlexField.prototype = jQuery.extend(true, {}, ObjectForm.IFlexField.prototype);

            /**
             * Returns the type of the field
             * 
             * @returns {int} Type of the field
             */
            ObjectForm.NumberFlexField.prototype.getType = function() { return ObjectForm.FlexFieldTypeNumber; }

            /**
             * Returns the template name
             * 
             * @returns {string} Template Name
             */
            ObjectForm.NumberFlexField.prototype.getTemplateName = function() { return "gn-numberField"; }

            /**
             * Returns if the field can be exported to a script
             * 
             * @returns {bool} true if the value can be exported to a script, else false
             */
            ObjectForm.NumberFlexField.prototype.canExportToScript = function() { return true; }

            /**
             * Serializes the value to a string
             * 
             * @returns {string} Value of the field as a string
             */
            ObjectForm.NumberFlexField.prototype.serializeValue = function() { return this.value() ? this.value().toString() : "0.0"; }

            /**
             * Deserializes a value from a string
             * 
             * @param {string} value Value to Deserialize
             */
            ObjectForm.NumberFlexField.prototype.deserializeValue = function(value) { 
                var parsedValue = parseFloat(value);
                if(!isNaN(parsedValue))
                {
                    this.value(parsedValue); 
                }
                else
                {
                    this.value(0.0);
                }
            }

        }(FlexFieldDatabase.ObjectForm = FlexFieldDatabase.ObjectForm || {}));
    }(GoNorth.FlexFieldDatabase = GoNorth.FlexFieldDatabase || {}));
}(window.GoNorth = window.GoNorth || {}));