(function(GoNorth) {
    "use strict";
    (function(FlexFieldDatabase) {
        (function(ObjectForm) {

            /**
             * Type of the multi text line field
             */
            ObjectForm.FlexFieldTypeMultiLine = 1;

            /**
             * Class for a multi text line field
             * 
             * @class
             */
            ObjectForm.MultiLineFlexField = function() {
                ObjectForm.IFlexField.apply(this);

                this.value = new ko.observable("");
            }

            ObjectForm.MultiLineFlexField.prototype = jQuery.extend(true, {}, ObjectForm.IFlexField.prototype);

            /**
             * Returns the type of the field
             * 
             * @returns {int} Type of the field
             */
            ObjectForm.MultiLineFlexField.prototype.getType = function() { return ObjectForm.FlexFieldTypeMultiLine; }

            /**
             * Returns the template name
             * 
             * @returns {string} Template Name
             */
            ObjectForm.MultiLineFlexField.prototype.getTemplateName = function() { return "gn-multiLineField"; }

            /**
             * Returns if the field can be exported to a script
             * 
             * @returns {bool} true if the value can be exported to a script, else false
             */
            ObjectForm.MultiLineFlexField.prototype.canExportToScript = function() { return false; }

            /**
             * Serializes the value to a string
             * 
             * @returns {string} Value of the field as a string
             */
            ObjectForm.MultiLineFlexField.prototype.serializeValue = function() { return this.value(); }

            /**
             * Deserializes a value from a string
             * 
             * @param {string} value Value to Deserialize
             */
            ObjectForm.MultiLineFlexField.prototype.deserializeValue = function(value) { this.value(value); }

        }(FlexFieldDatabase.ObjectForm = FlexFieldDatabase.ObjectForm || {}));
    }(GoNorth.FlexFieldDatabase = GoNorth.FlexFieldDatabase || {}));
}(window.GoNorth = window.GoNorth || {}));