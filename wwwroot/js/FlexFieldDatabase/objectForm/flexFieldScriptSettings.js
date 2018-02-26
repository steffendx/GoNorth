(function(GoNorth) {
    "use strict";
    (function(FlexFieldDatabase) {
        (function(ObjectForm) {

            /// Seperator for the additional name field values
            ObjectForm.FlexFieldScriptSettingsAdditionalScriptNameSeperator = ",";

            /**
             * Class for a flex field script settings
             * 
             * @class
             */
            ObjectForm.FlexFieldScriptSettings = function() {
                this.dontExportToScript = false;
                this.additionalScriptNames = "";
            }

            ObjectForm.FlexFieldScriptSettings.prototype = {
                /**
                 * Serializes the values to an object
                 * 
                 * @returns {object} Object to deserialize
                 */
                serialize: function() {
                    return {
                        dontExportToScript: this.dontExportToScript,
                        additionalScriptNames: this.additionalScriptNames
                    };
                },

                /**
                 * Deserialize the values from a serialized entry
                 * @param {object} serializedValue Serialized entry
                 */
                deserialize: function(serializedValue) {
                    this.dontExportToScript = serializedValue.dontExportToScript;
                    this.additionalScriptNames = serializedValue.additionalScriptNames;
                }
            }

        }(FlexFieldDatabase.ObjectForm = FlexFieldDatabase.ObjectForm || {}));
    }(GoNorth.FlexFieldDatabase = GoNorth.FlexFieldDatabase || {}));
}(window.GoNorth = window.GoNorth || {}));