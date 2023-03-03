(function(GoNorth) {
    "use strict";
    (function(Util) {
        
        /**
         * Filters a list of fields for fields which can be used in a script
         * @param {object[]} fields Unfiltered fields
         * @returns {object[]} Filtered fields
         */
        Util.getFilteredFieldsForScript = function(fields) {
            if(!fields)
            {
                return [];
            }

            var filteredFields = [];
            for(var curField = 0; curField < fields.length; ++curField)
            {
                if(fields[curField].fieldType == GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldTypeMultiLine ||
                   fields[curField].fieldType == GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldGroup)
                {
                    continue;
                }
                filteredFields.push(fields[curField]);

                if(!fields[curField].scriptSettings || !fields[curField].scriptSettings.additionalScriptNames)
                {
                    continue;
                }

                // Add additional names
                var additionalNames = fields[curField].scriptSettings.additionalScriptNames.split(GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldScriptSettingsAdditionalScriptNameSeperator); 
                for(var curAdditionalName = 0; curAdditionalName < additionalNames.length; ++curAdditionalName)
                {
                    var additionalField = jQuery.extend({ }, fields[curField]);
                    additionalField.name = additionalNames[curAdditionalName];
                    filteredFields.push(additionalField);
                }
            }

            return filteredFields;
        }

        /**
         * Checks if an object exists in a flex field array
         * 
         * @param {ko.observableArray} searchArray Array to search
         * @param {object} objectToSearch Flex Field object to search
         */
        Util.doesObjectExistInFlexFieldArray = function(searchArray, objectToSearch) {
            var searchObjects = searchArray();
            for(var curObject = 0; curObject < searchObjects.length; ++curObject)
            {
                if(searchObjects[curObject].id == objectToSearch.id)
                {
                    return true;
                }
            }

            return false;
        }

    }(GoNorth.Util = GoNorth.Util || {}));
}(window.GoNorth = window.GoNorth || {}));