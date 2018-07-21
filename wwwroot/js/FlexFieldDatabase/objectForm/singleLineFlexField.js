(function(GoNorth) {
    "use strict";
    (function(FlexFieldDatabase) {
        (function(ObjectForm) {

            /**
             * Type of the single text line field
             */
            ObjectForm.FlexFieldTypeSingleLine = 0;

            /**
             * Class for a single text line field
             * 
             * @class
             */
            ObjectForm.SingleLineFlexField = function() {
                ObjectForm.FlexFieldBase.apply(this);

                this.value = new ko.observable("");
            }

            ObjectForm.SingleLineFlexField.prototype = jQuery.extend(true, {}, ObjectForm.FlexFieldBase.prototype);

            /**
             * Returns the type of the field
             * 
             * @returns {int} Type of the field
             */
            ObjectForm.SingleLineFlexField.prototype.getType = function() { return ObjectForm.FlexFieldTypeSingleLine; }

            /**
             * Returns the template name
             * 
             * @returns {string} Template Name
             */
            ObjectForm.SingleLineFlexField.prototype.getTemplateName = function() { return "gn-singleLineField"; }

            /**
             * Returns if the field can be exported to a script
             * 
             * @returns {bool} true if the value can be exported to a script, else false
             */
            ObjectForm.SingleLineFlexField.prototype.canExportToScript = function() { return true; }

            /**
             * Serializes the value to a string
             * 
             * @returns {string} Value of the field as a string
             */
            ObjectForm.SingleLineFlexField.prototype.serializeValue = function() { return this.value(); }

            /**
             * Deserializes a value from a string
             * 
             * @param {string} value Value to Deserialize
             */
            ObjectForm.SingleLineFlexField.prototype.deserializeValue = function(value) { this.value(value); }

        }(FlexFieldDatabase.ObjectForm = FlexFieldDatabase.ObjectForm || {}));
    }(GoNorth.FlexFieldDatabase = GoNorth.FlexFieldDatabase || {}));
}(window.GoNorth = window.GoNorth || {}));