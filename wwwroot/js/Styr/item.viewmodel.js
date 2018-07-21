(function(GoNorth) {
    "use strict";
    (function(ImplementationStatus) {
        (function(CompareDialog) {

            /**
             * Compare Dialog View Model
             * @class
             */
            CompareDialog.ViewModel = function()
            {
                this.isOpen = new ko.observable(false);
                this.objectName = new ko.observable("");

                this.isLoading = new ko.observable(false);
                this.errorOccured = new ko.observable(false);

                this.markAsImplementedPromise = null;
                this.flagAsImplementedMethodUrlPostfix = null;

                this.doesSnapshotExists = new ko.observable(false);
                this.difference = new ko.observableArray();
            };

            CompareDialog.ViewModel.prototype = {
                /**
                 * Opens the compare dialog for an npc compare call
                 * 
                 * @param {string} id Id of the npc
                 * @param {string} npcName Name of the npc to display in the title
                 * @returns {jQuery.Deferred} Deferred that will get resolved after the object was marked as implemented
                 */
                openNpcCompare: function(id, npcName) {
                    this.isOpen(true);
                    this.objectName(npcName ? npcName : "");
                    this.flagAsImplementedMethodUrlPostfix = "FlagNpcAsImplemented?npcId=" + id;

                    return this.loadCompareResult("CompareNpc?npcId=" + id);
                },

                /**
                 * Opens the compare dialog for an item compare call
                 * 
                 * @param {string} id Id of the item
                 * @param {string} itemName Name of the item to display in the title
                 * @returns {jQuery.Deferred} Deferred that will get resolved after the object was marked as implemented
                 */
                openItemCompare: function(id, itemName) {
                    this.isOpen(true);
                    this.objectName(itemName ? itemName : "");
                    this.flagAsImplementedMethodUrlPostfix = "FlagItemAsImplemented?itemId=" + id;

                    return this.loadCompareResult("CompareItem?itemId=" + id);
                },

                /**
                 * Opens the compare dialog for a skill compare call
                 * 
                 * @param {string} id Id of the skill
                 * @param {string} skillName Name of the skill to display in the title
                 * @returns {jQuery.Deferred} Deferred that will get resolved after the object was marked as implemented
                 */
                openSkillCompare: function(id, skillName) {
                    this.isOpen(true);
                    this.objectName(skillName ? skillName : "");
                    this.flagAsImplementedMethodUrlPostfix = "FlagSkillAsImplemented?skillId=" + id;

                    return this.loadCompareResult("CompareSkill?skillId=" + id);
                },

                /**
                 * Opens the compare dialog for a dialog compare call
                 * 
                 * @param {string} id Id of the dialog
                 * @param {string} dialogName Name of the dialog to display in the title
                 * @returns {jQuery.Deferred} Deferred that will get resolved after the object was marked as implemented
                 */
                openDialogCompare: function(id, dialogName) {
                    this.isOpen(true);
                    this.objectName(dialogName ? dialogName : "");
                    this.flagAsImplementedMethodUrlPostfix = "FlagDialogAsImplemented?dialogId=" + id;

                    return this.loadCompareResult("CompareDialog?dialogId=" + id);
                },

                /**
                 * Opens the compare dialog for a quest compare call
                 * 
                 * @param {string} id Id of the quest
                 * @param {string} questName Name of the quest to display in the title
                 * @returns {jQuery.Deferred} Deferred that will get resolved after the object was marked as implemented
                 */
                openQuestCompare: function(id, questName) {
                    this.isOpen(true);
                    this.objectName(questName ? questName : "");
                    this.flagAsImplementedMethodUrlPostfix = "FlagQuestAsImplemented?questId=" + id;

                    return this.loadCompareResult("CompareQuest?questId=" + id);
                },
                
                /**
                 * Opens the compare dialog for a marker compare call
                 * 
                 * @param {string} mapId Id of the map
                 * @param {string} markerId Id of the marker
                 * @param {string} markerType Type of the marker
                 * @returns {jQuery.Deferred} Deferred that will get resolved after the object was marked as implemented
                 */
                openMarkerCompare: function(mapId, markerId, markerType) {
                    this.isOpen(true);
                    this.objectName("");
                    this.flagAsImplementedMethodUrlPostfix = "FlagMarkerAsImplemented?mapId=" + mapId + "&markerId=" + markerId + "&markerType=" + markerType;

                    return this.loadCompareResult("CompareMarker?mapId=" + mapId + "&markerId=" + markerId + "&markerType=" + markerType);
                },


                /**
                 * Loads a compare result
                 * 
                 * @param {string} urlPostfix Postfix for the url
                 */
                loadCompareResult: function(urlPostfix) {
                    this.isLoading(true);
                    this.errorOccured(false);
                    this.difference([]);
                    var self = this;
                    jQuery.ajax({ 
                        url: "/api/ImplementationStatusApi/" + urlPostfix, 
                        type: "GET"
                    }).done(function(compareResult) {
                        self.isLoading(false);
                        self.addExpandedObservable(compareResult.compareDifference);
                        self.doesSnapshotExists(compareResult.doesSnapshotExist);
                        if(compareResult.compareDifference)
                        {
                            self.difference(compareResult.compareDifference);
                        }
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });

                    this.markAsImplementedPromise = new jQuery.Deferred();
                    return this.markAsImplementedPromise.promise();
                },

                /**
                 * Adds the expanded observable to all compare results
                 * 
                 * @param {object[]} compareResults Compare REsults to which the expanded observable must be added
                 */
                addExpandedObservable: function(compareResults) {
                    if(!compareResults)
                    {
                        return;
                    }

                    for(var curResult = 0; curResult < compareResults.length; ++curResult)
                    {
                        compareResults[curResult].isExpanded = new ko.observable(true);
                        this.addExpandedObservable(compareResults[curResult].subDifferences);
                    }
                },

                /**
                 * Toggles a compare result to be epanded or not
                 * 
                 * @param {object} compareResult Compare Result
                 */
                toggleCompareResultExpanded: function(compareResult) {
                    compareResult.isExpanded(!compareResult.isExpanded());
                },


                /**
                 * Marks the object for which the dialog is opened as implemented
                 */
                markAsImplemented: function() {
                    this.isLoading(true);
                    this.errorOccured(false);
                    var self = this;
                    jQuery.ajax({ 
                        url: "/api/ImplementationStatusApi/" + this.flagAsImplementedMethodUrlPostfix, 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        type: "POST"
                    }).done(function() {
                        self.isLoading(false);
                        self.isOpen(false);

                        if(window.refreshImplementationStatusList)
                        {
                            window.refreshImplementationStatusList();
                        }

                        self.markAsImplementedPromise.resolve();
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Closes the dialog
                 */
                closeDialog: function() {
                    this.isOpen(false);
                }
            };

        }(ImplementationStatus.CompareDialog = ImplementationStatus.CompareDialog || {}));
    }(GoNorth.ImplementationStatus = GoNorth.ImplementationStatus || {}));
}(window.GoNorth = window.GoNorth || {}));
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
                 * @returns {string} Value of the field as a string
                 */
                serializeValue: function() { },

                /**
                 * Deserializes a value from a string
                 * 
                 * @param {string} value Value to Deserialize
                 */
                deserializeValue: function(value) { },

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
                deserializeAdditionalConfiguration: function(additionalConfiguration) { }
            }

        }(FlexFieldDatabase.ObjectForm = FlexFieldDatabase.ObjectForm || {}));
    }(GoNorth.FlexFieldDatabase = GoNorth.FlexFieldDatabase || {}));
}(window.GoNorth = window.GoNorth || {}));
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
                ObjectForm.FlexFieldBase.apply(this);

                this.value = new ko.observable("");
            }

            ObjectForm.MultiLineFlexField.prototype = jQuery.extend(true, {}, ObjectForm.FlexFieldBase.prototype);

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
                ObjectForm.FlexFieldBase.apply(this);

                this.value = new ko.observable(0.0);
            }

            ObjectForm.NumberFlexField.prototype = jQuery.extend(true, {}, ObjectForm.FlexFieldBase.prototype);

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
                 * Moves a field up
                 * 
                 * @param {FlexFieldBase} field Field to move up
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
                 * @param {FlexFieldBase} field Field to move down
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
                            createdFromTemplate: fields[curField].createdFromTemplate(),
                            fieldType: fields[curField].getType(),
                            name: fields[curField].name(),
                            value: fields[curField].serializeValue(),
                            additionalConfiguration: fields[curField].serializeAdditionalConfiguration(),
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
                        deserializedField.createdFromTemplate(serializedValues[curField].createdFromTemplate);
                        deserializedField.name(serializedValues[curField].name);
                        deserializedField.deserializeValue(serializedValues[curField].value);
                        deserializedField.deserializeAdditionalConfiguration(serializedValues[curField].additionalConfiguration);
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

                /**
                 * Flags all fields as created from template
                 */
                flagFieldsAsCreatedFromTemplate: function() {
                    var fields = this.fields();
                    for(var curField = 0; curField < fields.length; ++curField)
                    {
                        fields[curField].createdFromTemplate(true);
                    }
                }
            }

        }(FlexFieldDatabase.ObjectForm = FlexFieldDatabase.ObjectForm || {}));
    }(GoNorth.FlexFieldDatabase = GoNorth.FlexFieldDatabase || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(FlexFieldDatabase) {
        (function(ObjectForm) {

            /**
             * Flex Field Handling Viewmodel with pure field handling
             * @class
             */
            ObjectForm.FlexFieldHandlingViewModel = function()
            {
                this.fieldManager = new GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldManager();

                this.showFieldCreateEditDialog = new ko.observable(false);
                this.isEditingField = new ko.observable(false);
                this.createEditFieldName = new ko.observable("");
                this.createEditFieldAdditionalConfigurationDisabled = new ko.observable(false);
                this.createEditFieldHasAdditionalConfiguration = new ko.observable(false);
                this.createEditFieldAdditionalConfiguration = new ko.observable("");
                this.createEditFieldAdditionalConfigurationLabel = new ko.observable("");
                this.createEditFieldDeferred = null;

                this.showConfirmFieldDeleteDialog = new ko.observable(false);
                this.fieldToDelete = null;

                this.showFieldScriptSettingsDialog = new ko.observable(false);
                this.dontExportFieldToScript = new ko.observable();
                this.additionalFieldScriptNames = new ko.observable();
                this.scriptSettingsField = null;
            };

            ObjectForm.FlexFieldHandlingViewModel.prototype = {
                /**
                 * Function gets called after a new field was added
                 */
                onFieldAdded: function() {

                },

                /**
                 * Adds a single line field to the object
                 */
                addSingleLineField: function() {
                    var self = this;
                    this.openCreateEditFieldDialog(false, "").done(function(name) {
                        self.fieldManager.addSingleLineField(name);
                        self.onFieldAdded();
                    });
                },

                /**
                 * Adds a multi line field to the object
                 */
                addMultiLineField: function() {
                    var self = this;
                    this.openCreateEditFieldDialog(false, "").done(function(name) {
                        self.fieldManager.addMultiLineField(name);
                        self.onFieldAdded();
                    });
                },

                /**
                 * Adds a number field to the object
                 */
                addNumberField: function() {
                    var self = this;
                    this.openCreateEditFieldDialog(false, "").done(function(name) {
                        self.fieldManager.addNumberField(name);
                        self.onFieldAdded();
                    });
                },

                /**
                 * Adds an option field to the object
                 */
                addOptionField: function() {
                    var self = this;
                    this.openCreateEditFieldDialog(false, "", true, "", GoNorth.FlexFieldDatabase.Localization.OptionFieldAdditionalConfigurationLabel, false).done(function(name, additionalConfiguration) {
                        var optionField = self.fieldManager.addOptionField(name);
                        optionField.setAdditionalConfiguration(additionalConfiguration);
                        self.onFieldAdded();
                    });
                },


                /**
                 * Edits a field
                 * 
                 * @param {FlexFieldBase} field Object Field
                 */
                editField: function(field) {
                    var disableAdditionalConfig = !field.allowEditingAdditionalConfigForTemplateFields() && field.createdFromTemplate();
                    this.openCreateEditFieldDialog(true, field.name(), field.hasAdditionalConfiguration(), field.getAdditionalConfiguration(), field.getAdditionalConfigurationLabel(), disableAdditionalConfig).done(function(name, additionalConfiguration) {
                        field.name(name);

                        if(field.hasAdditionalConfiguration())
                        {
                            field.setAdditionalConfiguration(additionalConfiguration);
                        }
                    });
                },


                /**
                 * Opens the create/edit field dialog
                 * 
                 * @param {bool} isEdit true if its an edit operation, else false
                 * @param {string} existingName Existing name of the field
                 * @param {bool} hasAdditionalConfiguration true if additional configuration is required for the field
                 * @param {string} existingAdditionalConfiguration Existing additional Configuration
                 * @param {string} additionalConfigurationLabel Label for the additional configuration
                 * @param {bool} disableAdditionalConfiguration true if the additional configuration should be disabled, else false
                 * @returns {jQuery.Deferred} Deferred which will be resolved once the user presses save
                 */
                openCreateEditFieldDialog: function(isEdit, existingName, hasAdditionalConfiguration, existingAdditionalConfiguration, additionalConfigurationLabel, disableAdditionalConfiguration) {
                    this.createEditFieldDeferred = new jQuery.Deferred();

                    this.isEditingField(isEdit);
                    if(existingName)
                    {
                        this.createEditFieldName(existingName);
                    }
                    else
                    {
                        this.createEditFieldName("");
                    }

                    this.createEditFieldHasAdditionalConfiguration(hasAdditionalConfiguration ? true : false);
                    if(hasAdditionalConfiguration)
                    {
                        this.createEditFieldAdditionalConfigurationDisabled(disableAdditionalConfiguration)
                        this.createEditFieldAdditionalConfigurationLabel(additionalConfigurationLabel);
                        this.createEditFieldAdditionalConfiguration(existingAdditionalConfiguration ? existingAdditionalConfiguration : "");
                    }

                    GoNorth.Util.setupValidation("#gn-fieldCreateEditForm");
                    this.showFieldCreateEditDialog(true);

                    return this.createEditFieldDeferred.promise();
                },

                /**
                 * Saves the field
                 */
                saveField: function() {
                    if(!jQuery("#gn-fieldCreateEditForm").valid())
                    {
                        return;
                    }

                    if(this.createEditFieldDeferred)
                    {
                        var additionalConfiguration = null;
                        if(this.createEditFieldHasAdditionalConfiguration())
                        {
                            additionalConfiguration = this.createEditFieldAdditionalConfiguration();
                        }
                        this.createEditFieldDeferred.resolve(this.createEditFieldName(), additionalConfiguration);
                    }
                    this.createEditFieldDeferred = null;
                    this.showFieldCreateEditDialog(false);
                },

                /**
                 * Cancels the field dialog
                 */
                cancelFieldDialog: function() {
                    if(this.createEditFieldDeferred)
                    {
                        this.createEditFieldDeferred.reject();
                    }
                    this.createEditFieldDeferred = null; 
                    this.showFieldCreateEditDialog(false);
                },


                /**
                 * Moves a field up
                 * 
                 * @param {FlexFieldBase} field Field to move up
                 */
                moveFieldUp: function(field) {
                    this.fieldManager.moveFieldUp(field);
                },

                /**
                 * Moves a field down
                 * 
                 * @param {FlexFieldBase} field Field to move down
                 */
                moveFieldDown: function(field) {
                    this.fieldManager.moveFieldDown(field);
                },


                /**
                 * Opens the delete field dialog
                 * 
                 * @param {FlexFieldBase} field Field to delete
                 */
                openConfirmDeleteFieldDialog: function(field) {
                    this.showConfirmFieldDeleteDialog(true);
                    this.fieldToDelete = field;
                },

                /**
                 * Closes the confirm field delete dialog
                 */
                closeConfirmFieldDeleteDialog: function() {
                    this.showConfirmFieldDeleteDialog(false);
                    this.fieldToDelete = null;
                },

                /**
                 * Deletes the field for which the dialog is opened
                 */
                deleteField: function() {
                    this.fieldManager.deleteField(this.fieldToDelete);
                    this.closeConfirmFieldDeleteDialog();
                },


                /**
                 * Opens the script settings for a field
                 * 
                 * @param {FlexFieldBase} field Field for which the settings should be opened
                 */
                openScriptSettings: function(field) {
                    this.showFieldScriptSettingsDialog(true);
                    this.dontExportFieldToScript(field.scriptSettings.dontExportToScript);
                    this.additionalFieldScriptNames(field.scriptSettings.additionalScriptNames);
                    this.scriptSettingsField = field;
                },

                /**
                 * Saves the field script settings
                 */
                saveFieldScriptSettings: function() {
                    this.scriptSettingsField.scriptSettings.dontExportToScript = this.dontExportFieldToScript();
                    this.scriptSettingsField.scriptSettings.additionalScriptNames = this.additionalFieldScriptNames();
                    this.closeFieldScriptSettingsDialog();
                },

                /**
                 * Closes the field script settings dialog
                 */
                closeFieldScriptSettingsDialog: function() {
                    this.showFieldScriptSettingsDialog(false);
                    this.scriptSettingsField = null;
                }
            };

        }(FlexFieldDatabase.ObjectForm = FlexFieldDatabase.ObjectForm || {}));
    }(GoNorth.FlexFieldDatabase = GoNorth.FlexFieldDatabase || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(FlexFieldDatabase) {
        (function(ObjectForm) {

            /**
             * Object Form Base View Model
             * @param {string} rootPage Root Page
             * @param {string} apiControllerName Api Controller name
             * @param {string} lockName Name of the resource used for the lock for an object of this type
             * @param {string} templateLockName Name of the resource used for the lock for a template of this type
             * @param {string} kirjaApiMentionedMethod Method of the kirja api which is used to load the pages in which the object is mentioned
             * @param {string} kartaApiMentionedMethod Method of the karta api which is used to load the maps in which the object is mentioned
             * @class
             */
            ObjectForm.BaseViewModel = function(rootPage, apiControllerName, lockName, templateLockName, kirjaApiMentionedMethod, kartaApiMarkedMethod)
            {
                GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldHandlingViewModel.apply(this);

                this.rootPage = rootPage;
                this.apiControllerName = apiControllerName;

                this.lockName = lockName;
                this.templateLockName = templateLockName;

                this.kirjaApiMentionedMethod = kirjaApiMentionedMethod;
                this.kartaApiMarkedMethod = kartaApiMarkedMethod;

                this.isTemplateMode = new ko.observable(false);
                if(GoNorth.Util.getParameterFromHash("template"))
                {
                    this.isTemplateMode(true);
                }

                this.id = new ko.observable("");
                var paramId = GoNorth.Util.getParameterFromHash("id");
                if(paramId)
                {
                    this.id(paramId);
                }

                this.objectImageUploadUrl = new ko.computed(function() {
                    if(this.isTemplateMode())
                    {
                        return "/api/" + this.apiControllerName + "/FlexFieldTemplateImageUpload?id=" + this.id();
                    }
                    else
                    {
                        return "/api/" + this.apiControllerName + "/FlexFieldImageUpload?id=" + this.id();
                    }
                }, this);

                var templateId = GoNorth.Util.getParameterFromHash("templateId");
                this.templateId = templateId;
                this.parentFolderId = GoNorth.Util.getParameterFromHash("folderId");
                
                this.isReadonly = new ko.observable(false);
                this.lockedByUser = new ko.observable("");

                this.isLoading = new ko.observable(false);

                this.isImplemented = new ko.observable(false);
                this.compareDialog = new GoNorth.ImplementationStatus.CompareDialog.ViewModel();

                this.objectName = new ko.observable("");
                this.imageFilename = new ko.observable("");
                this.thumbnailImageFilename = new ko.observable("");
                this.objectTags = new ko.observableArray();
                this.existingObjectTags = new ko.observableArray();

                this.objectNameDisplay = new ko.computed(function() {
                    var name = this.objectName();
                    if(name)
                    {
                        return " - " + name;
                    }

                    return "";
                }, this);

                this.showConfirmObjectDeleteDialog = new ko.observable(false);
                this.showCustomizedExportTemplateWarningOnDelete = new ko.observable(false);

                this.showConfirmRegenerateLanguageKeysDialog = new ko.observable(false);

                this.showExportResultDialog = new ko.observable(false);
                this.exportResultContent = new ko.observable("");
                this.exportResultErrors = new ko.observableArray();
                this.exportResultFormat = "";
                this.exportShowSuccessfullyCopiedTooltip = new ko.observable(false);

                this.referencedInQuests = new ko.observableArray();
                this.loadingReferencedInQuests = new ko.observable(false);
                this.errorLoadingReferencedInQuests = new ko.observable(false);

                this.mentionedInKirjaPages = new ko.observableArray();
                this.loadingMentionedInKirjaPages = new ko.observable(false);
                this.errorLoadingMentionedInKirjaPages = new ko.observable(false);

                this.markedInKartaMaps = new ko.observableArray();
                this.loadingMarkedInKartaMaps = new ko.observable(false);
                this.errorLoadingMarkedInKartaMaps = new ko.observable(false);

                this.referencedInTaleDialogs = new ko.observableArray();
                this.loadingReferencedInTaleDialogs = new ko.observable(false);
                this.errorLoadingReferencedInTaleDialogs = new ko.observable(false);

                this.errorOccured = new ko.observable(false);
                this.additionalErrorDetails = new ko.observable("");

                GoNorth.Util.setupValidation("#gn-objectFields");

                if(this.id() && this.isTemplateMode())
                {
                    this.checkIfCustomizedExportTemplateExists();
                }
            };

            
            ObjectForm.BaseViewModel.prototype = jQuery.extend({ }, GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldHandlingViewModel.prototype);

            /**
             * Loads additional dependencies
             */
            ObjectForm.BaseViewModel.prototype.loadAdditionalDependencies = function() {

            };

            /**
             * Parses additional data from a loaded object
             * 
             * @param {object} data Data returned from the webservice
             */
            ObjectForm.BaseViewModel.prototype.parseAdditionalData = function(data) {

            };

            /**
             * Sets Additional save data
             * 
             * @param {object} data Save data
             * @returns {object} Save data with additional values
             */
            ObjectForm.BaseViewModel.prototype.setAdditionalSaveData = function(data) {
                return data;
            };



            /**
             * Initializes the form, called by implementations
             */
            ObjectForm.BaseViewModel.prototype.init = function() {
                if(this.id())
                {
                    this.loadObjectData(this.id(), this.isTemplateMode());
                    
                    if(GoNorth.FlexFieldDatabase.ObjectForm.hasAikaRights && !this.isTemplateMode())
                    {
                        this.loadAikaQuests();
                    }

                    if(GoNorth.FlexFieldDatabase.ObjectForm.hasKirjaRights && !this.isTemplateMode())
                    {
                        this.loadKirjaPages();
                    }

                    if(GoNorth.FlexFieldDatabase.ObjectForm.hasKartaRights && !this.isTemplateMode())
                    {
                        this.loadKartaMaps();
                    }

                    if(GoNorth.FlexFieldDatabase.ObjectForm.hasTaleRights && !this.isTemplateMode())
                    {
                        this.loadTaleDialogs();
                    } 

                    this.loadAdditionalDependencies();

                    this.acquireLock();
                }
                else if(this.templateId)
                {
                    this.loadObjectData(this.templateId, true);
                }
                this.loadExistingObjectTags();
            };

            /**
             * Checks if a customized export template exists
             */
            ObjectForm.BaseViewModel.prototype.checkIfCustomizedExportTemplateExists = function() {
                if(!this.id())
                {
                    return;
                }
                
                var self = this;
                jQuery.ajax({ 
                    url: "/api/ExportApi/DoesExportTemplateExistForObjectId?id=" + this.id(), 
                    type: "GET"
                }).done(function(data) {
                    self.showCustomizedExportTemplateWarningOnDelete(data.doesTemplateExist);
                }).fail(function(xhr) {
                    self.errorOccured(true);
                });
            };

            /**
             * Resets the error state
             */
            ObjectForm.BaseViewModel.prototype.resetErrorState = function() {
                this.errorOccured(false);
                this.additionalErrorDetails("");
            };

            /**
             * Loads all existing objects tags for the tag dropdown list
             */
            ObjectForm.BaseViewModel.prototype.loadExistingObjectTags = function() {
                var self = this;
                jQuery.ajax({ 
                    url: "/api/" + this.apiControllerName + "/FlexFieldObjectTags", 
                    type: "GET"
                }).done(function(data) {
                    self.existingObjectTags(data);
                }).fail(function(xhr) {
                    self.errorOccured(true);
                });
            };

            /**
             * Loads the object data
             * 
             * @param {string} id Id of the data to load
             * @param {bool} fromTemplate true if the value should be loaded from a template
             */
            ObjectForm.BaseViewModel.prototype.loadObjectData = function(id, fromTemplate) {
                var url = "/api/" + this.apiControllerName + "/FlexFieldObject";
                if(fromTemplate)
                {
                    url = "/api/" + this.apiControllerName + "/FlexFieldTemplate"
                }
                url += "?id=" + id;

                this.isLoading(true);
                this.resetErrorState();
                var self = this;
                jQuery.ajax({ 
                    url: url, 
                    type: "GET"
                }).done(function(data) {
                    self.isLoading(false);
                    if(!data)
                    {
                        self.errorOccured(true);
                        return;
                    }
                    
                    if(!fromTemplate)
                    {
                        self.templateId = !self.isTemplateMode() ? data.templateId : "";
                        self.isImplemented(!self.isTemplateMode() ? data.isImplemented : false);
                    }

                    if(!fromTemplate || self.isTemplateMode())
                    {
                        self.objectName(data.name);
                    }
                    else
                    {
                        self.objectName("");
                    }
                    self.parseAdditionalData(data);
                    
                    self.thumbnailImageFilename(data.thumbnailImageFile);
                    self.imageFilename(data.imageFile);
                    self.fieldManager.deserializeFields(data.fields);

                    if(fromTemplate && !self.isTemplateMode())
                    {
                        self.fieldManager.flagFieldsAsCreatedFromTemplate();
                    }

                    self.objectTags(data.tags);
                }).fail(function(xhr) {
                    self.isLoading(false);
                    self.errorOccured(true);
                });
            };

            /**
             * Saves the form
             */
            ObjectForm.BaseViewModel.prototype.save = function() {
                this.sendSaveRequest(false);
            };

            /**
             * Saves the form and distribute the fields to objects
             */
            ObjectForm.BaseViewModel.prototype.saveAndDistributeFields = function() {
                this.sendSaveRequest(true);
            };

            /**
             * Saves the form
             * 
             * @param {bool} distributeFields true if the fields should be distributed, else false
             */
            ObjectForm.BaseViewModel.prototype.sendSaveRequest = function(distributeFields) {
                if(!jQuery("#gn-objectFields").valid())
                {
                    return;
                }

                // Send Data
                var serializedFields = this.fieldManager.serializeFields();
                var requestObject = {
                    templateId: !this.isTemplateMode() ? this.templateId : "",
                    name: this.objectName(),
                    fields: serializedFields,
                    tags: this.objectTags()
                };
                requestObject = this.setAdditionalSaveData(requestObject);

                // Create mode values
                if(!this.isTemplateMode() && !this.id())
                {
                    requestObject.parentFolderId = this.parentFolderId;
                    if(this.imageFilename())
                    {
                        requestObject.imageFile = this.imageFilename();
                    }

                    if(this.thumbnailImageFilename())
                    {
                        requestObject.thumbnailImageFile = this.thumbnailImageFilename();
                    }
                }

                var url = "";
                if(this.isTemplateMode())
                {
                    if(this.id())
                    {
                        url = "/api/" + this.apiControllerName + "/UpdateFlexFieldTemplate?id=" + this.id();
                    }
                    else
                    {
                        url = "/api/" + this.apiControllerName + "/CreateFlexFieldTemplate";
                    }
                }
                else
                {
                    if(this.id())
                    {
                        url = "/api/" + this.apiControllerName + "/UpdateFlexFieldObject?id=" + this.id();
                    }
                    else
                    {
                        url = "/api/" + this.apiControllerName + "/CreateFlexFieldObject";
                    }
                }

                this.isLoading(true);
                this.resetErrorState();
                var self = this;
                jQuery.ajax({ 
                    url: url, 
                    headers: GoNorth.Util.generateAntiForgeryHeader(),
                    data: JSON.stringify(requestObject), 
                    type: "POST",
                    contentType: "application/json"
                }).done(function(data) {
                    if(!self.id())
                    {
                        self.id(data.id);
                        var idAdd = "id=" + data.id;
                        if(self.isTemplateMode())
                        {
                            window.location.hash += "&" + idAdd;
                        }
                        else
                        {
                            window.location.hash = idAdd;
                        }
                        self.acquireLock();
                    }

                    if(!self.isTemplateMode())
                    {
                        self.fieldManager.syncFieldIds(data);
                        self.isImplemented(data.isImplemented);
                    }

                    if(distributeFields)
                    {
                        self.distributeFields();
                    }
                    else
                    {
                        self.isLoading(false);
                    }

                    self.runAfterSave(data);

                    self.callObjectGridRefresh();
                }).fail(function(xhr) {
                    self.isLoading(false);
                    self.errorOccured(true);
                });
            };

            /**
             * Runs logic after save
             * 
             * @param {object} data Returned data after save
             */
            ObjectForm.BaseViewModel.prototype.runAfterSave = function(data) {

            };

            /**
             * Distributes the fields
             */
            ObjectForm.BaseViewModel.prototype.distributeFields = function() {
                var self = this;
                jQuery.ajax({ 
                    url: "/api/" + this.apiControllerName + "/DistributeFlexFieldTemplateFields?id=" + this.id(), 
                    headers: GoNorth.Util.generateAntiForgeryHeader(),
                    type: "POST",
                    contentType: "application/json"
                }).done(function(data) {
                    self.isLoading(false);
                }).fail(function(xhr) {
                    self.isLoading(false);
                    self.errorOccured(true);
                });
            };

            /**
             * Opens the delete object dialog
             */
            ObjectForm.BaseViewModel.prototype.openDeleteObjectDialog = function() {
                this.showConfirmObjectDeleteDialog(true);
            };

            /**
             * Closes the confirm delete dialog
             */
            ObjectForm.BaseViewModel.prototype.closeConfirmObjectDeleteDialog = function() {
                this.showConfirmObjectDeleteDialog(false);
            };

            /**
             * Deletes the object
             */
            ObjectForm.BaseViewModel.prototype.deleteObject = function() {
                var url = "/api/" + this.apiControllerName + "/DeleteFlexFieldObject";
                if(this.isTemplateMode())
                {
                    url = "/api/" + this.apiControllerName + "/DeleteFlexFieldTemplate"
                }
                url += "?id=" + this.id();

                this.isLoading(true);
                this.resetErrorState();
                var self = this;
                jQuery.ajax({ 
                    url: url, 
                    headers: GoNorth.Util.generateAntiForgeryHeader(),
                    type: "DELETE"
                }).done(function(data) {
                    self.callObjectGridRefresh();
                    self.closeConfirmObjectDeleteDialog();
                    window.location = self.rootPage;
                }).fail(function(xhr) {
                    self.isLoading(false);
                    self.errorOccured(true);
                    self.closeConfirmObjectDeleteDialog();

                    // If object is related to anything that prevents deleting a bad request (400) will be returned
                    if(xhr.status == 400 && xhr.responseText)
                    {
                        self.additionalErrorDetails(xhr.responseText);
                    }
                });
            };


            /**
             * Callback if a new image file was uploaded
             * 
             * @param {string} image Image Filename that was uploaded
             */
            ObjectForm.BaseViewModel.prototype.imageUploaded = function(image) {
                this.imageFilename(image);
                this.callObjectGridRefresh();
            };

            /**
             * Callback if an error occured during upload
             * 
             * @param {string} errorMessage Error Message
             * @param {object} xhr Xhr Object
             */
            ObjectForm.BaseViewModel.prototype.imageUploadError = function(errorMessage, xhr) {
                this.errorOccured(true);
                if(xhr && xhr.responseText)
                {
                    this.additionalErrorDetails(xhr.responseText);
                }
                else
                {
                    this.additionalErrorDetails(errorMessage);
                }
            };


            /**
             * Opens the compare dialog for the current object
             * 
             * @returns {jQuery.Deferred} Deferred which gets resolved after the object is marked as implemented
             */
            ObjectForm.BaseViewModel.prototype.openCompareDialogForObject = function() {
                var def = new jQuery.Deferred();
                def.reject("Not implemented");
                return def.promise();
            };

            /**
             * Opens the compare dialog
             */
            ObjectForm.BaseViewModel.prototype.openCompareDialog = function() {
                var self = this;
                this.openCompareDialogForObject().done(function() {
                    self.isImplemented(true);
                });
            };


            /**
             * Opens the export template
             * 
             * @param {number} templateType Type of the template
             */
            ObjectForm.BaseViewModel.prototype.openExportTemplate = function(templateType) {
                if(!this.id())
                {
                    return;
                }

                var url = "/Export/ManageTemplate#templateType=" + templateType + "&customizedObjectId=" + this.id();
                if(this.isTemplateMode())
                {
                    url += "&objectIsTemplate=1";
                }
                window.location = url;
            };

            /**
             * Exports an object
             * 
             * @param {number} templateType Type of the template
             * @param {string} exportFormat Format to export to (Script, JSON, Language)
             */
            ObjectForm.BaseViewModel.prototype.exportObject = function(templateType, exportFormat) {
                this.exportResultFormat = exportFormat;
                this.isLoading(true);
                this.errorOccured(false);
                var self = this;
                jQuery.ajax({ 
                    url: "/api/ExportApi/ExportObject?exportFormat=" + exportFormat + "&id=" + this.id() + "&templateType=" + templateType, 
                    type: "GET"
                }).done(function(data) {
                    self.isLoading(false);
                    self.showExportResultDialog(true);
                    self.exportResultContent(data.code);
                    self.exportResultErrors(data.errors);
                }).fail(function(xhr) {
                    self.closeExportResultDialog();
                    self.errorOccured(true);
                    self.isLoading(false);
                });
            };

            /**
             * Closes the export result dialog
             */
            ObjectForm.BaseViewModel.prototype.closeExportResultDialog = function() {
                this.showExportResultDialog(false);
                this.exportResultContent("");
                this.exportResultErrors([]);
            }; 

            /**
             * Downloads an export result
             * 
             * @param {number} templateType Type of the template
             */
            ObjectForm.BaseViewModel.prototype.exportDownload = function(templateType) {
                window.location = "/api/ExportApi/ExportObjectDownload?exportFormat=" + this.exportResultFormat + "&id=" + this.id() + "&templateType=" + templateType; 
            };

            /**
             * Copies the export result to the clipboard
             */
            ObjectForm.BaseViewModel.prototype.copyExportCodeToClipboard = function() {
                var exportResultField = jQuery("#gn-flexFieldObjectExportResultTextarea")[0];
                exportResultField.select();
                document.execCommand("copy");

                this.exportShowSuccessfullyCopiedTooltip(true);
                var self = this;
                setTimeout(function() {
                    self.exportShowSuccessfullyCopiedTooltip(false);
                }, 1000);
            };


            /**
             * Opens the confirm regenerate language keys dialog
             */
            ObjectForm.BaseViewModel.prototype.openConfirmRegenerateLanguageKeysDialog = function() {
                this.showConfirmRegenerateLanguageKeysDialog(true);
            };

            /**
             * Regenerates the language keys
             */
            ObjectForm.BaseViewModel.prototype.regenerateLanguageKeys = function() {
                this.isLoading(true);
                this.resetErrorState();
                var self = this;
                jQuery.ajax({ 
                    url: "/api/ExportApi/DeleteLanguageKeysByGroupId?groupId=" + this.id(), 
                    headers: GoNorth.Util.generateAntiForgeryHeader(),
                    type: "DELETE"
                }).done(function(data) {
                    self.isLoading(false);
                    self.closeConfirmRegenerateLanguageKeysDialog();
                }).fail(function(xhr) {
                    self.isLoading(false);
                    self.errorOccured(true);
                    self.closeConfirmRegenerateLanguageKeysDialog();
                });
            };

            /**
             * Closes the confirm regenerate language keys dialog
             */
            ObjectForm.BaseViewModel.prototype.closeConfirmRegenerateLanguageKeysDialog = function() {
                this.showConfirmRegenerateLanguageKeysDialog(false);
            };


            /**
             * Loads the Aika quests
             */
            ObjectForm.BaseViewModel.prototype.loadAikaQuests = function() {
                this.loadingReferencedInQuests(true);
                this.errorLoadingReferencedInQuests(false);
                var self = this;
                jQuery.ajax({ 
                    url: "/api/AikaApi/GetQuestsObjectIsReferenced?objectId=" + this.id(), 
                    type: "GET"
                }).done(function(data) {
                    self.referencedInQuests(data);
                    self.loadingReferencedInQuests(false);
                }).fail(function(xhr) {
                    self.errorLoadingReferencedInQuests(true);
                    self.loadingReferencedInQuests(false);
                });
            };

            /**
             * Builds the url for an Aika quest
             * 
             * @param {object} quest Quest to build the url
             * @returns {string} Url for quest
             */
            ObjectForm.BaseViewModel.prototype.buildAikaQuestUrl = function(quest) {
                return "/Aika/Quest#id=" + quest.id;
            };


            /**
             * Loads the kirja pages
             */
            ObjectForm.BaseViewModel.prototype.loadKirjaPages = function() {
                this.loadingMentionedInKirjaPages(true);
                this.errorLoadingMentionedInKirjaPages(false);
                var self = this;
                jQuery.ajax({ 
                    url: "/api/KirjaApi/" + this.kirjaApiMentionedMethod + this.id(), 
                    type: "GET"
                }).done(function(data) {
                    self.mentionedInKirjaPages(data);
                    self.loadingMentionedInKirjaPages(false);
                }).fail(function(xhr) {
                    self.errorLoadingMentionedInKirjaPages(true);
                    self.loadingMentionedInKirjaPages(false);
                });
            };

            /**
             * Builds the url for a Kirja page
             * 
             * @param {object} page Page to build the url for
             * @returns {string} Url for the page
             */
            ObjectForm.BaseViewModel.prototype.buildKirjaPageUrl = function(page) {
                return "/Kirja#id=" + page.id;
            };


            /**
             * Loads the karta maps
             */
            ObjectForm.BaseViewModel.prototype.loadKartaMaps = function() {
                if(!this.kartaApiMarkedMethod)
                {
                    return;
                }

                this.loadingMarkedInKartaMaps(true);
                this.errorLoadingMarkedInKartaMaps(false);
                var self = this;
                jQuery.ajax({ 
                    url: "/api/KartaApi/" + this.kartaApiMarkedMethod + this.id(), 
                    type: "GET"
                }).done(function(data) {
                    for(var curMap = 0; curMap < data.length; ++curMap)
                    {
                        data[curMap].tooltip = self.buildKartaMapMarkerCountTooltip(data[curMap]);
                    }
                    self.markedInKartaMaps(data);
                    self.loadingMarkedInKartaMaps(false);
                }).fail(function(xhr) {
                    self.errorLoadingMarkedInKartaMaps(true);
                    self.loadingMarkedInKartaMaps(false);
                });
            };

            /**
             * Builds the Tooltip for a marker count
             * 
             * @param {object} map Map to build the tooltip for
             * @returns {string} Tooltip for marker count
             */
            ObjectForm.BaseViewModel.prototype.buildKartaMapMarkerCountTooltip = function(map) {
                return GoNorth.FlexFieldDatabase.ObjectForm.Localization.MarkedInMapNTimes.replace("{0}", map.markerIds.length);
            };

            /**
             * Builds the url for a Karta map
             * 
             * @param {object} map Map to build the url for
             * @returns {string} Url for the map
             */
            ObjectForm.BaseViewModel.prototype.buildKartaMapUrl = function(map) {
                var url = "/Karta#id=" + map.mapId;
                if(map.markerIds.length == 1)
                {
                    url += "&zoomOnMarkerId=" + map.markerIds[0] + "&zoomOnMarkerType=" + map.mapMarkerType
                }
                return url;
            };


            /**
             * Loads the tale dialogs
             */
            ObjectForm.BaseViewModel.prototype.loadTaleDialogs = function() {
                this.loadingReferencedInTaleDialogs(true);
                this.errorLoadingReferencedInTaleDialogs(false);
                var self = this;
                jQuery.ajax({ 
                    url: "/api/TaleApi/GetDialogsObjectIsReferenced?objectId=" + this.id(), 
                    type: "GET"
                }).done(function(dialogs) {
                    var npcIds = [];
                    for(var curDialog = 0; curDialog < dialogs.length; ++curDialog)
                    {
                        if(dialogs[curDialog].relatedObjectId != self.id())
                        {
                            npcIds.push(dialogs[curDialog].relatedObjectId);
                        }
                    }

                    if(npcIds.length == 0)
                    {
                        self.referencedInTaleDialogs([]);
                        self.loadingReferencedInTaleDialogs(false);
                        return;
                    }

                    // Get Npc names of the dialog npcs
                    jQuery.ajax({ 
                        url: "/api/KortistoApi/ResolveFlexFieldObjectNames", 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        data: JSON.stringify(npcIds), 
                        type: "POST",
                        contentType: "application/json"
                    }).done(function(npcNames) {
                        self.referencedInTaleDialogs(npcNames);
                        self.loadingReferencedInTaleDialogs(false);
                    }).fail(function(xhr) {
                        self.errorLoadingReferencedInTaleDialogs(true);
                        self.loadingReferencedInTaleDialogs(false);
                    });
                }).fail(function(xhr) {
                    self.errorLoadingReferencedInTaleDialogs(true);
                    self.loadingReferencedInTaleDialogs(false);
                });
            };

            /**
             * Builds the url for a Tale dialog
             * 
             * @param {object} dialogNpc Npc for which to open the dialog
             * @returns {string} Url for the dialog
             */
            ObjectForm.BaseViewModel.prototype.buildTaleDialogUrl = function(dialogNpc) {
                return "/Tale#npcId=" + dialogNpc.id;
            };


            /**
             * Acquires a lock
             */
            ObjectForm.BaseViewModel.prototype.acquireLock = function() {
                var category = this.lockName;
                if(this.isTemplateMode())
                {
                    category = this.templateLockName;
                }

                var self = this;
                GoNorth.LockService.acquireLock(category, this.id()).done(function(isLocked, lockedUsername) {
                    if(isLocked)
                    {
                        self.isReadonly(true);
                        self.lockedByUser(lockedUsername);
                        self.setAdditionalDataToReadonly();
                    }
                }).fail(function() {
                    self.errorOccured(true);
                    self.isReadonly(true);
                });
            };

            /**
             * Sets additional data to readonly
             */
            ObjectForm.BaseViewModel.prototype.setAdditionalDataToReadonly = function() {

            };


            /**
             * Calls the refresh for the object grid of the parent window
             */
            ObjectForm.BaseViewModel.prototype.callObjectGridRefresh = function() {
                if(window.refreshFlexFieldObjectGrid)
                {
                    window.refreshFlexFieldObjectGrid();
                }
            };

        }(FlexFieldDatabase.ObjectForm = FlexFieldDatabase.ObjectForm || {}));
    }(GoNorth.FlexFieldDatabase = GoNorth.FlexFieldDatabase || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Styr) {
        (function(Item) {

            /**
             * Item View Model
             * @class
             */
            Item.ViewModel = function()
            {
                GoNorth.FlexFieldDatabase.ObjectForm.BaseViewModel.apply(this, [ "/Styr", "StyrApi", "StyrItem", "StyrTemplate", "GetPagesByItem?itemId=", "GetMapsByItemId?itemId=" ]);

                this.containedInNpcInventory = new ko.observableArray();
                this.loadingContainedInNpcInventory = new ko.observable(false);
                this.errorLoadingContainedInNpcInventory = new ko.observable(false);

                this.init();
            };

            Item.ViewModel.prototype = jQuery.extend({ }, GoNorth.FlexFieldDatabase.ObjectForm.BaseViewModel.prototype);

            /**
             * Loads additional dependencies
             */
            Item.ViewModel.prototype.loadAdditionalDependencies = function() {
                if(GoNorth.FlexFieldDatabase.ObjectForm.hasKortistoRights && !this.isTemplateMode())
                {
                    this.loadNpcsByItemInInventory();
                } 
            };

            /**
             * Opens the compare dialog for the current object
             * 
             * @returns {jQuery.Deferred} Deferred which gets resolved after the object is marked as implemented
             */
            Item.ViewModel.prototype.openCompareDialogForObject = function() {
                return this.compareDialog.openItemCompare(this.id(), this.objectName());
            };


            /**
             * Loads the npcs in which the item is in the inventory
             */
            Item.ViewModel.prototype.loadNpcsByItemInInventory = function() {
                this.loadingContainedInNpcInventory(true);
                this.errorLoadingContainedInNpcInventory(false);
                var self = this;
                jQuery.ajax({ 
                    url: "/api/KortistoApi/GetNpcsByItemInInventory?itemId=" + this.id(), 
                    type: "GET"
                }).done(function(data) {
                    self.containedInNpcInventory(data);
                    self.loadingContainedInNpcInventory(false);
                }).fail(function(xhr) {
                    self.errorLoadingContainedInNpcInventory(true);
                    self.loadingContainedInNpcInventory(false);
                });
            };

            /**
             * Builds the url for a Kortisto Npc
             * 
             * @param {object} npc Npc to open
             * @returns {string} Url for the npc
             */
            Item.ViewModel.prototype.buildNpcInventoryUrl = function(npc) {
                return "/Kortisto/Npc#id=" + npc.id;
            };

        }(Styr.Item = Styr.Item || {}));
    }(GoNorth.Styr = GoNorth.Styr || {}));
}(window.GoNorth = window.GoNorth || {}));