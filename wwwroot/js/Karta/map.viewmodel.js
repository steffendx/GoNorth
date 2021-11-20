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
                var self = this;
                this.isOpen.subscribe(function(newValue) {
                    if(!newValue && self.markAsImplementedPromise)
                    {
                        self.markAsImplementedPromise.reject();
                    }
                });
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
                    GoNorth.HttpClient.get("/api/ImplementationStatusApi/" + urlPostfix).done(function(compareResult) {
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
                    GoNorth.HttpClient.post("/api/ImplementationStatusApi/" + this.flagAsImplementedMethodUrlPostfix, {}).done(function() {
                        if(window.refreshImplementationStatusList)
                        {
                            window.refreshImplementationStatusList();
                        }

                        self.markAsImplementedPromise.resolve();
                        self.markAsImplementedPromise = null;

                        self.isLoading(false);
                        self.isOpen(false);
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
    (function(ProjectConfig) {
        (function(ConfigKeys) {

            /**
             * Config key for play an animation
             */
            ConfigKeys.PlayAnimationAction = "PlayAnimationAction";

            /**
             * Config key for setting the npc state
             */
            ConfigKeys.SetNpcStateAction = "SetNpcStateAction";

        }(ProjectConfig.ConfigKeys = ProjectConfig.ConfigKeys || {}));
    }(GoNorth.ProjectConfig = GoNorth.ProjectConfig || {}));
}(window.GoNorth = window.GoNorth || {}));
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

    }(GoNorth.Util = GoNorth.Util || {}));
}(window.GoNorth = window.GoNorth || {}));
(function (GoNorth) {
    "use strict";
    (function (BindingHandlers) {

        if (typeof ko !== "undefined") {
            /**
             * Colorpicker Binding Handler
             */
            ko.bindingHandlers.colorpicker = {
                init: function (element, valueAccessor) {
                    jQuery(element).colorpicker({
                        format: "hex"
                    });

                    var value = valueAccessor();
                    if (ko.isObservable(value)) {
                        jQuery(element).on('changeColor', function (event) {
                            value(event.color.toHex());
                        });
                    }
                },
                update: function (element, valueAccessor) {
                    var newColor = ko.utils.unwrapObservable(valueAccessor());
                    jQuery(element).colorpicker("setValue", newColor);
                }
            }
        }

    }(GoNorth.BindingHandlers = GoNorth.BindingHandlers || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Shared) {
        (function(ExportObjectDialog) {

            /**
             * Viewmodel for a dialog to choose the script type
             * @param {ko.observable} isLoading Observable to set loading
             * @param {ko.observable} errorOccured Observable to set error state
             * @class
             */
            ExportObjectDialog.ViewModel = function(isLoading, errorOccured)
            {
                this.showConfirmExportDirtyStateDialog = new ko.observable(false);
                this.showConfirmExportDirtyStatePromise = null;
                this.showExportResultDialog = new ko.observable(false);
                this.exportResultContent = new ko.observable("");
                this.exportResultErrors = new ko.observableArray();
                this.downloadUrl = "";
                this.exportShowSuccessfullyCopiedTooltip = new ko.observable(false);

                this.isLoading = isLoading;
                this.errorOccured = errorOccured;
            };

            ExportObjectDialog.ViewModel.prototype = {
                /**
                 * Exports an object
                 * @param {string} url Url for the export
                 * @param {string} downloadUrl Url for downloading the export
                 * @param {boolean} isDirty true if the form data is dirty
                 */
                 exportObject: function(url, downloadUrl, isDirty) {
                    if(isDirty)
                    {
                        var self = this;
                        this.openConfirmExportDirtyStateDialog().done(function() {
                            self.openExportObjectDialog(url, downloadUrl);
                        });
                        return;
                    }

                    this.openExportObjectDialog(url, downloadUrl);
                },

                /**
                 * Opens the confirm export dirty state dialog
                 */
                openConfirmExportDirtyStateDialog: function() {
                    this.showConfirmExportDirtyStateDialog(true);
                    this.showConfirmExportDirtyStatePromise = new jQuery.Deferred();

                    return this.showConfirmExportDirtyStatePromise.promise();
                },

                /**
                 * Confirms the export dirty state dialog
                 */
                confirmExportDirtyStateDialog: function() {
                    this.showConfirmExportDirtyStateDialog(false);
                    if(this.showConfirmExportDirtyStatePromise)
                    {
                        this.showConfirmExportDirtyStatePromise.resolve();
                        this.showConfirmExportDirtyStatePromise = null;
                    }
                },

                /**
                 * Closes the export dirty state dialog
                 */
                closeConfirmExportDirtyStateDialog: function() {
                    this.showConfirmExportDirtyStateDialog(false);
                    if(this.showConfirmExportDirtyStatePromise)
                    {
                        this.showConfirmExportDirtyStatePromise.reject();
                        this.showConfirmExportDirtyStatePromise = null;
                    }
                },

                /**
                 * Opens the export object dialog
                 * 
                 * @param {string} url Url
                 * @param {string} downloadUrl Download Url
                 */
                openExportObjectDialog: function(url, downloadUrl) {
                    this.downloadUrl = downloadUrl;
                    this.isLoading(true);
                    this.errorOccured(false);
                    var self = this;
                    GoNorth.HttpClient.get(url).done(function(data) {
                        self.isLoading(false);
                        self.showExportResultDialog(true);
                        self.exportResultContent(data.code);
                        self.exportResultErrors(self.groupExportErrors(data.errors));
                    }).fail(function(xhr) {
                        self.closeExportResultDialog();
                        self.errorOccured(true);
                        self.isLoading(false);
                    });
                },

                /**
                 * Groups the export errors by export context
                 * 
                 * @param {object[]} errors Errors to group
                 * @returns {object[]} Grouped errors
                 */
                groupExportErrors: function(errors) {
                    if(!errors) 
                    {
                        return [];
                    }

                    var errorGroups = {};
                    var groupedErrors = [];
                    for(var curError = 0; curError < errors.length; ++curError)
                    {
                        if(!errorGroups[errors[curError].errorContext])
                        {
                            var errorGroup = {
                                contextName: errors[curError].errorContext,
                                errors: []
                            };
                            errorGroups[errorGroup.contextName] = errorGroup;
                            groupedErrors.push(errorGroup);
                        }

                        errorGroups[errors[curError].errorContext].errors.push(errors[curError]);
                    }

                    // Make sure errors with no contextname are shown first
                    groupedErrors = groupedErrors.sort(function(g1, g2) {
                        if(!g1.contextName)
                        {
                            return -1;
                        }
                        else if(!g2.contextName)
                        {
                            return 1;
                        }

                        return 0;
                    });

                    return groupedErrors;
                },

                /**
                 * Closes the export result dialog
                 */
                closeExportResultDialog: function() {
                    this.showExportResultDialog(false);
                    this.exportResultContent("");
                    this.exportResultErrors([]);
                },

                /**
                 * Downloads an export result
                 */
                exportDownload: function() {
                    window.location = this.downloadUrl; 
                },

                /**
                 * Copies the export result to the clipboard
                 */
                copyExportCodeToClipboard: function() {
                    var exportResultField = jQuery("#gn-flexFieldObjectExportResultTextarea")[0];
                    exportResultField.select();
                    document.execCommand("copy");

                    this.exportShowSuccessfullyCopiedTooltip(true);
                    var self = this;
                    setTimeout(function() {
                        self.exportShowSuccessfullyCopiedTooltip(false);
                    }, 1000);
                }
            };

        }(Shared.ExportObjectDialog = Shared.ExportObjectDialog || {}));
    }(GoNorth.Shared = GoNorth.Shared || {}));
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
(function(GoNorth) {
    "use strict";
    (function(ChooseObjectDialog) {

        /// Dialog Page Size
        var dialogPageSize = 15;

        /// Object Type for npcs
        var objectTypeNpc = 0;

        /// Object Type for items
        var objectTypeItem = 1;

        /// Object Type for skills
        var objectTypeSkill = 2;

        /// Object Type for quest
        var objectTypeQuest = 3;

        /// Object Type for wiki page
        var objectTypeWikiPage = 4;

        /// Object Type for daily routines
        var objectTypeDailyRoutine = 5;

        /// Object Type for marker
        var objectTypeMarker = 6;

        /**
         * Page View Model
         * @class
         */
        ChooseObjectDialog.ViewModel = function()
        {
            this.showDialog = new ko.observable(false);
            this.showObjectTypeSelection = new ko.observable(false);
            this.dialogTitle = new ko.observable("");
            this.showNewButtonInDialog = new ko.observable(false);
            this.dialogSearchCallback = null;
            this.dialogCreateNewCallback = null;
            this.dialogSearchPattern = new ko.observable("");
            this.dialogIsLoading = new ko.observable(false);
            this.dialogEntries = new ko.observableArray();
            this.dialogHasMore = new ko.observable(false);
            this.dialogCurrentPage = new ko.observable(0);
            this.errorOccured = new ko.observable(false);
            this.idObservable = null;

            var self = this;
            this.selectedObjectType = new ko.observable(null);
            this.selectedObjectType.subscribe(function() {
                self.onObjectTypeChanged();
            });
            this.availableObjectTypes = [
                { objectType: objectTypeNpc, objectLabel: GoNorth.ChooseObjectDialog.Localization.ObjectTypeNpc },
                { objectType: objectTypeItem, objectLabel: GoNorth.ChooseObjectDialog.Localization.ObjectTypeItem },
                { objectType: objectTypeSkill, objectLabel: GoNorth.ChooseObjectDialog.Localization.ObjectTypeSkill },
                { objectType: objectTypeQuest, objectLabel: GoNorth.ChooseObjectDialog.Localization.ObjectTypeQuest },
                { objectType: objectTypeWikiPage, objectLabel: GoNorth.ChooseObjectDialog.Localization.ObjectTypeWikiPage },
                { objectType: objectTypeDailyRoutine, objectLabel: GoNorth.ChooseObjectDialog.Localization.ObjectTypeDailyRoutine },
                { objectType: objectTypeMarker, objectLabel: GoNorth.ChooseObjectDialog.Localization.ObjectTypeMarker }
            ];

            this.choosingDeferred = null;
        };

        ChooseObjectDialog.ViewModel.prototype = {
            /**
             * Opens the dialog to search for general objects
             * 
             * @param {string} dialogTitle Title of the dialog
             * @returns {jQuery.Deferred} Deferred for the selecting process
             */
            openGeneralObjectSearch: function(dialogTitle) {
                this.showObjectTypeSelection(true);
                this.selectedObjectType(this.availableObjectTypes[0]);
                return this.openDialog(dialogTitle, this.searchNpcs, null, null);
            },
            
            /**
             * Opens the dialog to search for npcs
             * 
             * @param {string} dialogTitle Title of the dialog
             * @param {function} createCallback Optional callback that will get triggered on hitting the new button, if none is provided the button will be hidden
             * @returns {jQuery.Deferred} Deferred for the selecting process
             */
            openNpcSearch: function(dialogTitle, createCallback) {
                this.showObjectTypeSelection(false);
                return this.openDialog(dialogTitle, this.searchNpcs, createCallback, null);
            },

            /**
             * Opens the dialog to search for items
             * 
             * @param {string} dialogTitle Title of the dialog
             * @param {function} createCallback Optional callback that will get triggered on hitting the new button, if none is provided the button will be hidden
             * @returns {jQuery.Deferred} Deferred for the selecting process
             */
            openItemSearch: function(dialogTitle, createCallback) {
                this.showObjectTypeSelection(false);
                return this.openDialog(dialogTitle, this.searchItems, createCallback, null);
            },

            /**
             * Opens the dialog to search for skills
             * 
             * @param {string} dialogTitle Title of the dialog
             * @param {function} createCallback Optional callback that will get triggered on hitting the new button, if none is provided the button will be hidden
             * @returns {jQuery.Deferred} Deferred for the selecting process
             */
            openSkillSearch: function(dialogTitle, createCallback) {
                this.showObjectTypeSelection(false);
                return this.openDialog(dialogTitle, this.searchSkills, createCallback, null);
            },

            /**
             * Opens the dialog to search for kirja pages
             * 
             * @param {string} dialogTitle Title of the dialog
             * @param {function} createCallback Optional callback that will get triggered on hitting the new button, if none is provided the button will be hidden
             * @param {ko.observable} idObservable Optional id observable which will be used to exclude the current object from the search
             * @returns {jQuery.Deferred} Deferred for the selecting process
             */
            openKirjaPageSearch: function(dialogTitle, createCallback, idObservable) {
                this.showObjectTypeSelection(false);
                return this.openDialog(dialogTitle, this.searchPages, createCallback, idObservable);
            },

            /**
             * Opens the dialog to search for quests
             * 
             * @param {string} dialogTitle Title of the dialog
             * @param {function} createCallback Optional callback that will get triggered on hitting the new button, if none is provided the button will be hidden
             * @returns {jQuery.Deferred} Deferred for the selecting process
             */
            openQuestSearch: function(dialogTitle, createCallback) {
                this.showObjectTypeSelection(false);
                return this.openDialog(dialogTitle, this.searchQuest, createCallback, null);
            },

            /**
             * Opens the dialog to search for chapter details
             * 
             * @param {string} dialogTitle Title of the dialog
             * @param {function} createCallback Optional callback that will get triggered on hitting the new button, if none is provided the button will be hidden
             * @param {ko.observable} idObservable Optional id observable which will be used to exclude the current object from the search
             * @returns {jQuery.Deferred} Deferred for the selecting process
             */
            openChapterDetailSearch: function(dialogTitle, createCallback, idObservable) {
                this.showObjectTypeSelection(false);
                return this.openDialog(dialogTitle, this.searchChapterDetails, createCallback, idObservable);
            },

            /**
             * Opens the dialog to search for daily routines
             * 
             * @param {string} dialogTitle Title of the dialog
             * @returns {jQuery.Deferred} Deferred for the selecting process
             */
            openDailyRoutineSearch: function(dialogTitle) {
                this.showObjectTypeSelection(false);
                return this.openDialog(dialogTitle, this.searchDailyRoutines, null, null);
            },

            /**
             * Opens the dialog to search for markers
             * 
             * @param {string} dialogTitle Title of the dialog
             * @returns {jQuery.Deferred} Deferred for the selecting process
             */
            openMarkerSearch: function(dialogTitle) {
                this.showObjectTypeSelection(false);
                return this.openDialog(dialogTitle, this.searchMarkers, null, null);
            },

            /**
             * Opens the dialog
             * 
             * @param {string} dialogTitle Title of the dialog
             * @param {function} searchCallback Function that gets called on starting a search
             * @param {function} createCallback Function that gets called on hitting t he new button
             * @param {ko.observable} idObservable Optional id observable which will be used to exclude the current object from the search
             * @returns {jQuery.Deferred} Deferred for the selecting process
             */
            openDialog: function(dialogTitle, searchCallback, createCallback, idObservable) {
                if(this.choosingDeferred)
                {
                    this.choosingDeferred.reject();
                    this.choosingDeferred = null;
                }

                this.showDialog(true);
                this.dialogTitle(dialogTitle);
                this.dialogCreateNewCallback = typeof createCallback == "function" ? createCallback : null;
                this.showNewButtonInDialog(this.dialogCreateNewCallback ? true : false);
                this.dialogSearchCallback = searchCallback;
                this.resetDialogValues();
                this.idObservable = idObservable;

                this.choosingDeferred = new jQuery.Deferred();
                return this.choosingDeferred.promise();
            },

            /**
             * Resets the dialog values
             */
            resetDialogValues: function() {
                this.dialogSearchPattern("");
                this.dialogIsLoading(false);
                this.dialogEntries([]);
                this.dialogHasMore(false);
                this.dialogCurrentPage(0);
            },

            /**
             * Gets called if the selected object type is changed
             */
            onObjectTypeChanged: function() {
                this.resetDialogValues();

                var objectType = this.selectedObjectType().objectType;
                if(objectType == objectTypeNpc) 
                {
                    this.dialogSearchCallback = this.searchNpcs;
                }
                else if(objectType == objectTypeItem) 
                {
                    this.dialogSearchCallback = this.searchItems;
                }
                else if(objectType == objectTypeSkill) 
                {
                    this.dialogSearchCallback = this.searchSkills;
                }
                else if(objectType == objectTypeQuest) 
                {
                    this.dialogSearchCallback = this.searchQuest;
                }
                else if(objectType == objectTypeWikiPage) 
                {
                    this.dialogSearchCallback = this.searchPages;
                }
                else if(objectType == objectTypeDailyRoutine) 
                {
                    this.dialogSearchCallback = this.searchDailyRoutines;
                }
                else if(objectType == objectTypeMarker) 
                {
                    this.dialogSearchCallback = this.searchMarkers;
                }
            },

            /**
             * Expands an object if it has an expand callback, or selects an object
             * @param {object} selectedObject Selected object
             */
            handleObjectClick: function(selectedObject) {
                if(selectedObject.expandCallback) 
                {
                    selectedObject.expandCallback(selectedObject);
                }
                else
                {
                    this.selectObject(selectedObject);
                }
            },

            /**
             * Selects an object
             * 
             * @param {object} selectedObject Selected object
             */
            selectObject: function(selectedObject) {
                if(this.choosingDeferred)
                {
                    if(this.showObjectTypeSelection())
                    {
                        selectedObject.objectType = this.getDependencyObjectType();
                    }
                    this.choosingDeferred.resolve(selectedObject);
                    this.choosingDeferred = null;
                }

                this.closeDialog();
            },

            /**
             * Returns the dependency object type
             * @returns {string} Dependency object type
             */
            getDependencyObjectType: function() {
                var objectType = this.selectedObjectType().objectType;
                if(objectType == objectTypeNpc) 
                {
                    return GoNorth.DefaultNodeShapes.Actions.RelatedToObjectNpc;
                }
                else if(objectType == objectTypeItem) 
                {
                    return GoNorth.DefaultNodeShapes.Actions.RelatedToObjectItem;
                }
                else if(objectType == objectTypeSkill) 
                {
                    return GoNorth.DefaultNodeShapes.Actions.RelatedToObjectSkill;
                }
                else if(objectType == objectTypeQuest) 
                {
                    return GoNorth.DefaultNodeShapes.Actions.RelatedToObjectQuest;
                }
                else if(objectType == objectTypeWikiPage) 
                {
                    return GoNorth.DefaultNodeShapes.Actions.RelatedToWikiPage;
                }
                else if(objectType == objectTypeDailyRoutine) 
                {
                    return GoNorth.DefaultNodeShapes.Actions.RelatedToObjectDailyRoutine;
                }
                else if(objectType == objectTypeMarker) 
                {
                    return GoNorth.DefaultNodeShapes.Actions.RelatedToObjectMapMarker;
                }

                return "";
            },

            /**
             * Cancels the dialog
             */
            cancelDialog: function() {
                if(this.choosingDeferred)
                {
                    this.choosingDeferred.reject();
                    this.choosingDeferred = null;
                }

                this.closeDialog();
            },

            /**
             * Closes the dialog
             */
            closeDialog: function() {
                this.showDialog(false);
            },

            /**
             * Starts a new dialog search
             */
            startNewDialogSearch: function() {
                this.dialogCurrentPage(0);
                this.dialogHasMore(false);
                this.runDialogSearch();
            },

            /**
             * Loads the previous dialog page
             */
            prevDialogPage: function() {
                this.dialogCurrentPage(this.dialogCurrentPage() - 1);
                this.runDialogSearch();
            },

            /**
             * Loads the previous dialog page
             */
            nextDialogPage: function() {
                this.dialogCurrentPage(this.dialogCurrentPage() + 1);
                this.runDialogSearch();
            },

            /**
             * Runs the dialog search
             */
            runDialogSearch: function() {
                this.dialogIsLoading(true);
                this.errorOccured(false);
                var self = this;
                this.dialogSearchCallback(this.dialogSearchPattern()).done(function(result) {
                    self.dialogHasMore(result.hasMore);
                    self.dialogEntries(result.entries);
                    self.dialogIsLoading(false);
                }).fail(function() {
                    self.errorOccured(true);
                    self.dialogIsLoading(false);
                });
            },

            /**
             * Creates a dialog object
             * 
             * @param {string} id Id of the object
             * @param {string} name Name of the object
             * @param {string} openLink Link to open the object
             */
            createDialogObject: function(id, name, openLink) {
                return {
                    id: id,
                    name: name,
                    openLink: openLink,
                    expandCallback: null,
                    isExpanded: new ko.observable(false),
                    isLoadingExpandedObject: new ko.observable(false),
                    errorLoadingExpandedObject: new ko.observable(false),
                    expandedObjects: new ko.observableArray(),
                    hasExpandedObjectsLoaded: false
                };
            },
            
            /**
             * Creates a dialog object
             * 
             * @param {string} id Id of the object
             * @param {string} name Name of the object
             * @param {string} openLink Link to open the object
             * @param {function} expandCallback Callback function to expand
             */
            createExpandableDialogObject: function(id, name, openLink, expandCallback) {
                var dialogObject = this.createDialogObject(id, name, openLink);
                dialogObject.expandCallback = expandCallback;
                
                return dialogObject;
            },

            /**
             * Searches kirja pages
             * 
             * @param {string} searchPattern Search Pattern
             * @returns {jQuery.Deferred} Deferred for the result
             */
            searchPages: function(searchPattern) {
                var def = new jQuery.Deferred();

                var searchUrl = "/api/KirjaApi/SearchPages?searchPattern=" + encodeURIComponent(searchPattern) + "&start=" + (this.dialogCurrentPage() * dialogPageSize) + "&pageSize=" + dialogPageSize;
                if(this.idObservable)
                {
                    searchUrl += "&excludeId=" + this.idObservable();
                }

                var self = this;
                GoNorth.HttpClient.get(searchUrl).done(function(data) {
                    var result = {
                        hasMore: data.hasMore,
                        entries: []
                    };

                    for(var curEntry = 0; curEntry < data.pages.length; ++curEntry)
                    {
                        result.entries.push(self.createDialogObject(data.pages[curEntry].id, data.pages[curEntry].name, "/Kirja?id=" + data.pages[curEntry].id));
                    }

                    def.resolve(result);
                }).fail(function() {
                    def.reject();
                });

                return def.promise();
            },

            /**
             * Opens a page to create a new kirja page
             */
            openCreatePage: function() {
                this.dialogCreateNewCallback();
            },


            /**
             * Searches kortisto npcs
             * 
             * @param {string} searchPattern Search Pattern
             * @returns {jQuery.Deferred} Deferred for the result
             */
            searchNpcs: function(searchPattern) {
                var def = new jQuery.Deferred();
                
                var self = this;
                GoNorth.HttpClient.get("/api/KortistoApi/SearchFlexFieldObjects?searchPattern=" + encodeURIComponent(searchPattern) + "&start=" + (this.dialogCurrentPage() * dialogPageSize) + "&pageSize=" + dialogPageSize).done(function(data) {
                    var result = {
                        hasMore: data.hasMore,
                        entries: []
                    };

                    for(var curEntry = 0; curEntry < data.flexFieldObjects.length; ++curEntry)
                    {
                        result.entries.push(self.createDialogObject(data.flexFieldObjects[curEntry].id, data.flexFieldObjects[curEntry].name, "/Kortisto/Npc?id=" + data.flexFieldObjects[curEntry].id));
                    }

                    def.resolve(result);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            },


            /**
             * Searches styr items
             * 
             * @param {string} searchPattern Search Pattern
             * @returns {jQuery.Deferred} Deferred for the result
             */
            searchItems: function(searchPattern) {
                var def = new jQuery.Deferred();
                
                var self = this;
                GoNorth.HttpClient.get("/api/StyrApi/SearchFlexFieldObjects?searchPattern=" + encodeURIComponent(searchPattern) + "&start=" + (this.dialogCurrentPage() * dialogPageSize) + "&pageSize=" + dialogPageSize).done(function(data) {
                    var result = {
                        hasMore: data.hasMore,
                        entries: []
                    };

                    for(var curEntry = 0; curEntry < data.flexFieldObjects.length; ++curEntry)
                    {
                        result.entries.push(self.createDialogObject(data.flexFieldObjects[curEntry].id, data.flexFieldObjects[curEntry].name, "/Styr/Item?id=" + data.flexFieldObjects[curEntry].id));
                    }

                    def.resolve(result);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            },


            /**
             * Searches Evne skills
             * 
             * @param {string} searchPattern Search Pattern
             * @returns {jQuery.Deferred} Deferred for the result
             */
            searchSkills: function(searchPattern) {
                var def = new jQuery.Deferred();
                
                var self = this;
                GoNorth.HttpClient.get("/api/EvneApi/SearchFlexFieldObjects?searchPattern=" + encodeURIComponent(searchPattern) + "&start=" + (this.dialogCurrentPage() * dialogPageSize) + "&pageSize=" + dialogPageSize).done(function(data) {
                    var result = {
                        hasMore: data.hasMore,
                        entries: []
                    };

                    for(var curEntry = 0; curEntry < data.flexFieldObjects.length; ++curEntry)
                    {
                        result.entries.push(self.createDialogObject(data.flexFieldObjects[curEntry].id, data.flexFieldObjects[curEntry].name, "/Evne/Skill?id=" + data.flexFieldObjects[curEntry].id));
                    }

                    def.resolve(result);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            },


            /**
             * Searches aika quests
             * 
             * @param {string} searchPattern Search Pattern
             * @returns {jQuery.Deferred} Deferred for the result
             */
            searchQuest: function(searchPattern) {
                var def = new jQuery.Deferred();
                
                var self = this;
                GoNorth.HttpClient.get("/api/AikaApi/GetQuests?searchPattern=" + encodeURIComponent(searchPattern) + "&start=" + (this.dialogCurrentPage() * dialogPageSize) + "&pageSize=" + dialogPageSize).done(function(data) {
                    var result = {
                        hasMore: data.hasMore,
                        entries: []
                    };

                    for(var curEntry = 0; curEntry < data.quests.length; ++curEntry)
                    {
                        result.entries.push(self.createDialogObject(data.quests[curEntry].id, data.quests[curEntry].name, "/Aika/Quest?id=" + data.quests[curEntry].id));
                    }

                    def.resolve(result);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            },

            /**
             * Searches aika chapter details
             * 
             * @param {string} searchPattern Search Pattern
             * @returns {jQuery.Deferred} Deferred for the result
             */
            searchChapterDetails: function(searchPattern) {
                var def = new jQuery.Deferred();
                
                var self = this;
                GoNorth.HttpClient.get("/api/AikaApi/GetChapterDetails?searchPattern=" + encodeURIComponent(searchPattern) + "&start=" + (this.dialogCurrentPage() * dialogPageSize) + "&pageSize=" + dialogPageSize).done(function(data) {
                    var result = {
                        hasMore: data.hasMore,
                        entries: []
                    };

                    for(var curEntry = 0; curEntry < data.details.length; ++curEntry)
                    {
                        if(self.idObservable && self.idObservable() == data.details[curEntry].id)
                        {
                            continue;
                        }

                        result.entries.push(self.createDialogObject(data.details[curEntry].id, data.details[curEntry].name, "/Aika/Detail?id=" + data.details[curEntry].id));
                    }

                    def.resolve(result);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            },
            
            /**
             * Searches daily routines
             * 
             * @param {string} searchPattern Search Pattern
             * @returns {jQuery.Deferred} Deferred for the result
             */
            searchDailyRoutines: function(searchPattern) {
                var def = new jQuery.Deferred();
                
                var self = this;
                GoNorth.HttpClient.get("/api/KortistoApi/SearchFlexFieldObjects?searchPattern=" + encodeURIComponent(searchPattern) + "&start=" + (this.dialogCurrentPage() * dialogPageSize) + "&pageSize=" + dialogPageSize).done(function(data) {
                    var result = {
                        hasMore: data.hasMore,
                        entries: []
                    };

                    for(var curEntry = 0; curEntry < data.flexFieldObjects.length; ++curEntry)
                    {
                        result.entries.push(self.createExpandableDialogObject(data.flexFieldObjects[curEntry].id, data.flexFieldObjects[curEntry].name, "/Kortisto/Npc?id=" + data.flexFieldObjects[curEntry].id, function(dailyRoutineEventNpc) { self.expandDailyRoutineNpc(dailyRoutineEventNpc); }));
                    }

                    def.resolve(result);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            },

            /**
             * Expands a daily routine npc
             * @param {object} dailyRoutineEventNpc Daily routine npc
             */
            expandDailyRoutineNpc: function(dailyRoutineEventNpc) {
                dailyRoutineEventNpc.isExpanded(!dailyRoutineEventNpc.isExpanded());
                if(dailyRoutineEventNpc.hasExpandedObjectsLoaded)
                {
                    return;
                }

                dailyRoutineEventNpc.isLoadingExpandedObject(true);
                dailyRoutineEventNpc.errorLoadingExpandedObject(false);
                GoNorth.HttpClient.get("/api/KortistoApi/FlexFieldObject?id=" + dailyRoutineEventNpc.id).done(function(data) {
                    var dailyRoutineObjects = [];
                    if(data.dailyRoutine)
                    {
                        for(var curEvent = 0; curEvent < data.dailyRoutine.length; ++curEvent)
                        {
                            data.dailyRoutine[curEvent].parentObject = dailyRoutineEventNpc;
                            data.dailyRoutine[curEvent].name = GoNorth.DailyRoutines.Util.formatTimeSpan(GoNorth.ChooseObjectDialog.Localization.TimeFormat, data.dailyRoutine[curEvent].earliestTime, data.dailyRoutine[curEvent].latestTime);
                            var additionalName = "";
                            if(data.dailyRoutine[curEvent].scriptName)
                            {
                                additionalName = data.dailyRoutine[curEvent].scriptName;
                            }
                            else if(data.dailyRoutine[curEvent].movementTarget && data.dailyRoutine[curEvent].movementTarget.name)
                            {
                                additionalName = data.dailyRoutine[curEvent].movementTarget.name;
                            }
                            data.dailyRoutine[curEvent].additionalName = additionalName;
                            dailyRoutineObjects.push(data.dailyRoutine[curEvent]);
                        }
                    }
                    dailyRoutineEventNpc.isLoadingExpandedObject(false);
                    dailyRoutineEventNpc.expandedObjects(dailyRoutineObjects);
                    dailyRoutineEventNpc.hasExpandedObjectsLoaded = true;
                }).fail(function(xhr) {
                    dailyRoutineEventNpc.isLoadingExpandedObject(false);
                    dailyRoutineEventNpc.errorLoadingExpandedObject(true);
                });
            },

            
            /**
             * Searches markers
             * 
             * @param {string} searchPattern Search Pattern
             * @returns {jQuery.Deferred} Deferred for the result
             */
            searchMarkers: function(searchPattern) {
                var def = new jQuery.Deferred();
                
                var self = this;
                GoNorth.HttpClient.get("/api/KartaApi/SearchMarkersByExportName?searchPattern=" + encodeURIComponent(searchPattern) + "&start=" + (this.dialogCurrentPage() * dialogPageSize) + "&pageSize=" + dialogPageSize).done(function(data) {
                    var result = {
                        hasMore: data.hasMore,
                        entries: []
                    };

                    for(var curEntry = 0; curEntry < data.markers.length; ++curEntry)
                    {
                        var dialogObject = self.createDialogObject(data.markers[curEntry].markerId, data.markers[curEntry].markerName + " (" + data.markers[curEntry].mapName + ")", "/Karta?id=" + data.markers[curEntry].mapId + "&zoomOnMarkerId=" + data.markers[curEntry].markerId + "&zoomOnMarkerType=" + data.markers[curEntry].markerType);
                        dialogObject.markerName = data.markers[curEntry].markerName;
                        dialogObject.markerType = data.markers[curEntry].markerType;
                        dialogObject.mapId = data.markers[curEntry].mapId;
                        dialogObject.mapName = data.markers[curEntry].mapName;
                        result.entries.push(dialogObject);
                    }

                    def.resolve(result);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            },
            
        };

    }(GoNorth.ChooseObjectDialog = GoNorth.ChooseObjectDialog || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(BindingHandlers) {

        if(typeof ko !== "undefined")
        {
            /**
             * Builds a time object for custom time frame
             * @param {number} hours Hours
             * @param {number} minutes Minutes
             * @returns {object} Time object
             */
            BindingHandlers.buildTimeObject = function(hours, minutes) {
                return {
                    hours: hours,
                    minutes: minutes
                };
            }

            /**
             * Compares two time objects
             * @param {object} d1 Time object 1
             * @param {object} d2 Time object 2
             * @returns {number} Compare value
             */
            BindingHandlers.compareTimes = function(d1, d2) {
                if(d1.hours < d2.hours) {
                    return -1;
                } else if(d2.hours < d1.hours) {
                    return 1;
                } else if(d1.minutes < d2.minutes) {
                    return -1;
                } else if(d2.minutes < d1.minutes) {
                    return 1;
                }

                return 0;
            }

            /**
             * Returns the time values for a timepicker
             * @param {object} containerElement Container element
             * @param {object} hoursPerDay Hours per day
             * @param {object} minutesPerHour Minutes per hour
             * @returns {object} Time Values
             */
            function getTimeValue(containerElement, hoursPerDay, minutesPerHour) {
                var hours = parseInt(containerElement.find(".gn-timePickerHour").val());
                if(isNaN(hours)) {
                    hours = 0;
                }

                var minutes = parseInt(containerElement.find(".gn-timePickerMinutes").val());
                if(isNaN(minutes)) {
                    minutes = 0;
                }

                hoursPerDay = ko.utils.unwrapObservable(hoursPerDay);
                minutesPerHour = ko.utils.unwrapObservable(minutesPerHour);
                hours = Math.abs(hours) % hoursPerDay;
                minutes = Math.abs(minutes) % minutesPerHour;

                return BindingHandlers.buildTimeObject(hours, minutes);
            }

            /**
             * Updates the time value
             * @param {object} containerElement Container Element
             * @param {function} changeCallback Change callback
             * @param {object} hoursPerDay Hours per day
             * @param {object} minutesPerHour Minutes per hour
             */
            function updateTimeValue(containerElement, changeCallback, hoursPerDay, minutesPerHour)
            {
                changeCallback(getTimeValue(containerElement, hoursPerDay, minutesPerHour));

                updateTimeDisplay(containerElement, hoursPerDay, minutesPerHour);
            }

            /**
             * Updates the time display
             * @param {object} element HTML Element to fill
             * @param {object} hoursPerDay Hours per day
             * @param {object} minutesPerHour Minutes per hour
             */
            function updateTimeDisplay(element, hoursPerDay, minutesPerHour) {
                var containerElement = jQuery(element).closest(".gn-timePickerMainContainer");
                var timeValues = getTimeValue(containerElement, hoursPerDay, minutesPerHour);

                var targetElement = containerElement.find(".gn-timePickerMain");
                var format = targetElement.data("gn-timePickerFormat");
                var formattedTime = GoNorth.Util.formatTime(timeValues.hours, timeValues.minutes, format);
                targetElement.val(formattedTime);
            }

            /**
             * Changes the time value in a given direction
             * @param {object} element HTML Input element
             * @param {number} direction Direction
             * @param {function} changeCallback Change callback
             * @param {number} hoursPerDay Hours per day
             * @param {number} minutesPerHour Minutes per hour
             */
            function changeTimeValue(element, direction, changeCallback, hoursPerDay, minutesPerHour) {
                var value = parseInt(jQuery(element).val());
                if(isNaN(value)) {
                    value = 0;
                } else {
                    value += direction;
                }

                var maxValue = 0;
                if(jQuery(element).hasClass("gn-timePickerHour")) {
                    maxValue = ko.utils.unwrapObservable(hoursPerDay);
                } else {
                    maxValue = ko.utils.unwrapObservable(minutesPerHour);
                }

                if(value < 0) {
                    value = maxValue - 1;
                } else if(value >= maxValue) {
                    value = 0;
                }

                jQuery(element).val(value);
                updateTimeDisplay(element, hoursPerDay, minutesPerHour);
                updateTimeValue(jQuery(element).closest(".gn-timePickerMainContainer"), changeCallback, hoursPerDay, minutesPerHour);
            }

            /**
             * Initializes the time picker
             * @param {object} element HTML Element
             * @param {function} changeCallback Change callback function
             * @param {number} hoursPerDay Hours per day
             * @param {number} minutesPerHour Minutes per hour
             * @param {string} timeFormat Time format
             * @param {function} onOpen Optional callback function on opening the time callout
             * @param {function} onClose Optiona callback function on closing the time callout
             * @param {boolean} dontStyle true if the timepicker formats should not be applied, else false
             */
            BindingHandlers.initTimePicker = function(element, changeCallback, hoursPerDay, minutesPerHour, timeFormat, onOpen, onClose, dontStyle) {
                jQuery(element).wrap("<div class='gn-timePickerMainContainer" + (!dontStyle ? " gn-timePickerMainContainerStyling" : "") + "'></div>");
                jQuery('<div class="dropdown-menu">' +
                    '<div class="gn-timePickerControlContainer">' +
                        '<div class="gn-timePickerSingleControlContainer gn-timePickerSingleControlContainerHours">' +
                            '<button class="btn btn-link gn-timePickerButtonUp gn-timePickerButtonHours" tabindex="-1" type="button"><span class="glyphicon glyphicon-chevron-up"></span></button>' +
                            '<input type="text" class="' + (!dontStyle ? 'form-control ' : '') + 'gn-timePickerInput gn-timePickerHour">' +
                            '<button class="btn btn-link gn-timePickerButtonDown gn-timePickerButtonHours" tabindex="-1" type="button"><span class="glyphicon glyphicon-chevron-down"></span></button>' +
                        '</div>' +
                        '<div class="gn-timePickerSeperator">:</div>' +
                        '<div class="gn-timePickerSingleControlContainer">' +
                            '<button class="btn btn-link gn-timePickerButtonUp gn-timePickerButtonMinutes" tabindex="-1" type="button"><span class="glyphicon glyphicon-chevron-up"></span></button>' +
                            '<input type="text" class="' + (!dontStyle ? 'form-control ' : '') + 'gn-timePickerInput gn-timePickerMinutes"> ' +
                            '<button class="btn btn-link gn-timePickerButtonDown gn-timePickerButtonMinutes" tabindex="-1" type="button"><span class="glyphicon glyphicon-chevron-down"></span></button>' +
                        '</div>' +
                    '</div>' +
                '</div>').insertAfter(element);
                jQuery(element).prop("readonly", true);
                jQuery(element).addClass("gn-timePickerMain");
                if(!dontStyle) {
                    jQuery(element).addClass("gn-timePickerMainStyling");
                }
                if(!timeFormat) {
                    timeFormat = "hh:mm";
                }
                jQuery(element).data("gn-timePickerFormat", timeFormat);

                var containerElement = jQuery(element).parent();
                jQuery(element).focus(function() {
                    if(onOpen) {
                        onOpen();
                    }
                    containerElement.children(".dropdown-menu").addClass("show");
                    containerElement.find(".gn-timePickerHour").focus();
                    setTimeout(function() {
                        containerElement.find(".gn-timePickerHour").focus();
                    }, 50);
                });
                containerElement.find("input").blur(function() {
                    var target = jQuery(event.relatedTarget);
                    if(!target.closest(containerElement).length) {
                        containerElement.children(".dropdown-menu").removeClass("show");
                        if(onClose) {
                            onClose();
                        }
                    }

                    updateTimeValue(containerElement, changeCallback, hoursPerDay, minutesPerHour);
                });
                var closeHandler = null;
                closeHandler = function() {
                    if(!jQuery.contains(document, containerElement[0]))
                    {
                        jQuery(document).unbind("click", closeHandler);
                        return;
                    }

                    var target = jQuery(event.target);
                    if(!target.closest(containerElement).length) {
                        containerElement.children(".dropdown-menu").removeClass("show");
                        if(onClose) {
                            onClose();
                        }
                    }
                };
                jQuery(document).on("click", closeHandler);

                containerElement.find("input").keydown(function(e) {
                    if(e.keyCode == 38) {           // Arrow up
                        changeTimeValue(this, 1, changeCallback, hoursPerDay, minutesPerHour);
                        e.preventDefault();
                        return;
                    } else if(e.keyCode == 40) {    // Arrow down
                        changeTimeValue(this, -1, changeCallback, hoursPerDay, minutesPerHour);
                        e.preventDefault();
                        return;
                    }

                    GoNorth.Util.validateNumberKeyPress(element, e);
                });

                containerElement.find(".btn-link").click(function() {
                    var targetElement = ".gn-timePickerHour";
                    if(jQuery(this).hasClass("gn-timePickerButtonMinutes")) {
                        targetElement = ".gn-timePickerMinutes";
                    }

                    var direction = 1;
                    if(jQuery(this).hasClass("gn-timePickerButtonDown")) {
                        direction = -1;
                    }

                    changeTimeValue(containerElement.find(targetElement), direction, changeCallback, hoursPerDay, minutesPerHour);
                });
            }

            /**
             * Sets the time picker value
             * @param {object} element HTML Element
             * @param {number} hours Hours
             * @param {number} minutes Minutes
             * @param {number} hoursPerDay Hours per day
             * @param {number} minutesPerHour Minutes per hours
             */
            BindingHandlers.setTimePickerValue = function(element, hours, minutes, hoursPerDay, minutesPerHour) {
                var containerElement = jQuery(element).parent();
                containerElement.find(".gn-timePickerHour").val(hours);
                containerElement.find(".gn-timePickerMinutes").val(minutes);
                updateTimeDisplay(element, hoursPerDay, minutesPerHour);
            }

            /**
             * Timepicker Binding Handler with custom timeframe (hours, minutes)
             */
            ko.bindingHandlers.timepicker = {
                init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    var updatedFunction = function(newValue) {
                        valueAccessor()(newValue);
                    };
                    BindingHandlers.initTimePicker(element, updatedFunction, allBindings.get("timepickerHoursPerDay"), allBindings.get("timepickerMinutesPerHour"), allBindings.get("timepickerFormat"));
                },
                update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    var timeValues = ko.utils.unwrapObservable(valueAccessor());
                    BindingHandlers.setTimePickerValue(element, timeValues.hours, timeValues.minutes, allBindings.get("timepickerHoursPerDay"), allBindings.get("timepickerMinutesPerHour"));
                }
            };
        }

    }(GoNorth.BindingHandlers = GoNorth.BindingHandlers || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Shapes) {

            /// Quest state not started
            var questStateNotStarted = 0;

            /// Quest state in progress
            var questStateInProgress = 1;

            /// Quest state success
            var questStateSuccess = 2;

            /// Quest state failed
            var questStateFailed = 3;

            /// Quest state label lookup
            var questStateLabelLookup = { };
            questStateLabelLookup[questStateNotStarted] = DefaultNodeShapes.Localization.QuestStates.NotStarted;
            questStateLabelLookup[questStateInProgress] = DefaultNodeShapes.Localization.QuestStates.InProgress;
            questStateLabelLookup[questStateSuccess] = DefaultNodeShapes.Localization.QuestStates.Success;
            questStateLabelLookup[questStateFailed] = DefaultNodeShapes.Localization.QuestStates.Failed;

            /**
             * Creates a quest state object
             * 
             * @param {int} questState QUest State Number
             * @returns {object} Quest State Object
             */
            function createState(questState) {
                return {
                    questState: questState,
                    label: questStateLabelLookup[questState]
                };
            };

            /**
             * Returns the quest state label for a quest state value
             * 
             * @param {int} questState Quest State to return the label for
             * @returns {string} Quest State Label
             */
            Shapes.getQuestStateLabel = function(questState) {
                return questStateLabelLookup[questState];
            };

            /**
             * Returns all available quest states
             * 
             * @returns {object[]} Array of all available quest states
             */
            Shapes.getQuestStates = function() {
                return [
                    createState(questStateNotStarted),
                    createState(questStateInProgress),
                    createState(questStateSuccess),
                    createState(questStateFailed)
                ];
            };

        }(DefaultNodeShapes.Shapes = DefaultNodeShapes.Shapes || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Shapes) {

            /// Object Resource for npcs
            Shapes.ObjectResourceNpc = 0;

            /// Object Resource for items
            Shapes.ObjectResourceItem = 1;

            /// Object Resource for quests
            Shapes.ObjectResourceQuest = 2;
            
            /// Object Resource for dialogs
            Shapes.ObjectResourceDialogs = 3;

            /// Object Resource for Map Marker
            Shapes.ObjectResourceMapMarker = 4;

            /// Object Resource for Skills
            Shapes.ObjectResourceSkill = 5;
            
            /// Object Resource for Project misc config
            Shapes.ObjectResourceProjectMiscConfig = 6;
            
            /// Object Resource for Wiki page
            Shapes.ObjectResourceWikiPage = 7;


            /// Cached loaded objects
            var loadedObjects = {};

            /// Deferreds for loading objects
            var objectsLoadingDeferreds = {};


            /**
             * Resets the loaded value for an object
             * 
             * @param {number} objectType Object Type
             * @param {string} objectId Object Id
             */
            Shapes.resetSharedObjectLoading = function(objectType, objectId)
            {
                if(loadedObjects[objectType] && loadedObjects[objectType][objectId])
                {
                    loadedObjects[objectType][objectId] = null;
                }

                if(objectsLoadingDeferreds[objectType] && objectsLoadingDeferreds[objectType][objectId])
                {
                    objectsLoadingDeferreds[objectType][objectId] = null;
                }
            };


            /**
             * Shared object loading
             * @class
             */
            Shapes.SharedObjectLoading = function()
            {
            };

            Shapes.SharedObjectLoading.prototype = {
                /**
                 * Returns the id for an object
                 * 
                 * @param {object} existingData Optional Existing data
                 * @returns {string} Object Id
                 */
                getObjectId: function(existingData) {

                },

                /**
                 * Returns the object resource
                 * 
                 * @param {object} existingData Optional Existing data
                 * @returns {int} Object Resource
                 */
                getObjectResource: function(existingData) {

                },

                /**
                 * Clears a loaded shared object
                 * 
                 * @param {object} existingData Optional Existing data
                 */
                clearLoadedSharedObject: function(existingData) {
                    var objectId = this.getObjectId(existingData);
                    if(loadedObjects[this.getObjectResource()]) {
                        loadedObjects[this.getObjectResource()][objectId] = null;
                    }

                    if(objectsLoadingDeferreds[this.getObjectResource()]) {
                        objectsLoadingDeferreds[this.getObjectResource()][objectId] = null;
                    }
                },

                /**
                 * Loads a shared object
                 * 
                 * @param {object} existingData Optional Existing data
                 */
                loadObjectShared: function(existingData) {
                    var objectId = this.getObjectId(existingData);
    
                    if(loadedObjects[this.getObjectResource(existingData)]) {
                        var existingObject = loadedObjects[this.getObjectResource(existingData)][objectId];
                        if(existingObject)
                        {
                            var def = new jQuery.Deferred();
                            def.resolve(existingObject);
                            return def.promise();
                        }
                    }
    
                    var self = this;
                    if(objectsLoadingDeferreds[this.getObjectResource(existingData)])
                    {
                        var existingDef = objectsLoadingDeferreds[this.getObjectResource(existingData)][objectId];
                        if(existingDef)
                        {
                            existingDef.fail(function() {
                                if(self.showErrorCallback) {
                                    self.showErrorCallback();
                                }
                            });
                            return existingDef;
                        }
                    }
    
                    var loadingDef = this.loadObject(objectId, existingData);
                    if(!objectsLoadingDeferreds[this.getObjectResource(existingData)])
                    {
                        objectsLoadingDeferreds[this.getObjectResource(existingData)] = {};
                    }

                    objectsLoadingDeferreds[this.getObjectResource(existingData)][objectId] = loadingDef;
    
                    loadingDef.then(function(object) {
                        if(!loadedObjects[self.getObjectResource(existingData)])
                        {
                            loadedObjects[self.getObjectResource(existingData)] = {};
                        }

                        loadedObjects[self.getObjectResource(existingData)][objectId] = object;
                    }, function() {
                        if(self.showErrorCallback) {
                            self.showErrorCallback();
                        }
                    });
    
                    return loadingDef;
                },

                /**
                 * Loads an object
                 * 
                 * @param {string} objectId Optional Object Id extracted using getObjectId before
                 * @param {object} existingData Existing data
                 * @returns {jQuery.Deferred} Deferred for the loading process
                 */
                loadObject: function(objectId, existingData) {
                    
                }
            };


        }(DefaultNodeShapes.Shapes = DefaultNodeShapes.Shapes || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {

        /**
         * Node Shapes Base View Model
         * @class
         */
        DefaultNodeShapes.BaseViewModel = function()
        {
            this.nodeGraph = new ko.observable();
            this.nodePaper = new ko.observable();
        
            this.showConfirmNodeDeleteDialog = new ko.observable(false);
            this.deleteLoading = new ko.observable(false);
            this.deleteErrorOccured = new ko.observable(false);
            this.deleteErrorAdditionalInformation =  new ko.observable("");
            this.deleteNodeTarget = null;
            this.deleteDeferred = null;

            this.nodeDropOffsetX = 0;
            this.nodeDropOffsetY = 0;

            this.errorOccured = new ko.observable(false);
        };

        DefaultNodeShapes.BaseViewModel.prototype = {

            /**
             * Adds a new node
             * 
             * @param {object} dropElement Element that was dropped
             * @param {float} x X-Drop Coordinate
             * @param {float} z X-Drop Coordinate
             */
            addNewNode: function(dropElement, x, y) {
                if(!this.nodeGraph() || !this.nodePaper())
                {
                    return;
                }

                var initOptions = this.calcNodeInitOptionsPosition(x, y);
                this.addNodeByType(dropElement.data("nodetype"), initOptions);
            },

            /**
             * Creates the node init options with the node position
             * 
             * @param {float} x X-Drop Coordinate
             * @param {float} z X-Drop Coordinate
             */
            calcNodeInitOptionsPosition: function(x, y) {
                var scale = this.nodePaper().scale();
                var translate = this.nodePaper().translate();
                var initOptions = {
                    position: { x: (x - translate.tx) / scale.sx + this.nodeDropOffsetX, y: (y - translate.ty) / scale.sy + this.nodeDropOffsetY }
                };
                return initOptions;
            },

            /**
             * Adds a new node by the type
             * 
             * @param {string} nodeType Type of the new node
             * @param {object} initOptions Init Options for the node
             */
            addNodeByType: function(nodeType, initOptions) {
                var newNode = GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().createNewNode(nodeType, initOptions);
                if(newNode == null)
                {
                    this.errorOccured(true);
                    return;
                }

                this.nodeGraph().addCells(newNode);
                this.setupNewNode(newNode);
            },

            /**
             * Prepares a new node
             * 
             * @param {object} newNode New Node to setup
             */
            setupNewNode: function(newNode) {
                newNode.attr(".inPorts circle/magnet", "passive");
                
                var self = this;
                newNode.onDelete = function(node) {
                    return self.onDelete(node);
                };
            },

            /**
             * Reloads the fields for nodes
             * 
             * @param {string} id Id of the object for which to reload the nodes
             */
            reloadFieldsForNodes: function(objectType, id) {
                GoNorth.DefaultNodeShapes.Shapes.resetSharedObjectLoading(objectType, id);

                if(!this.nodeGraph())
                {
                    return;
                }

                var paper = this.nodePaper();
                var elements = this.nodeGraph().getElements();
                for(var curElement = 0; curElement < elements.length; ++curElement)
                {
                    var view = paper.findViewByModel(elements[curElement]);
                    if(view && view.reloadSharedLoadedData)
                    {
                        view.reloadSharedLoadedData(objectType, id);
                    }
                }
            },


            /**
             * Focuses a node if a node is specified in the url
             */
            focusNodeFromUrl: function() {
                var nodeId = GoNorth.Util.getParameterFromUrl("nodeFocusId");
                if(!nodeId)
                {
                    return;
                }

                GoNorth.Util.removeUrlParameter("nodeFocusId");
                var targetNode = this.nodeGraph().getCell(nodeId);
                if(!targetNode) 
                {
                    return;
                }

                var targetPosition = targetNode.position();
                var targetSize = targetNode.size();
                var paper = this.nodePaper();
                var viewBoundingBox;
                if(paper.el && paper.el.parentElement)
                {
                    viewBoundingBox = paper.el.parentElement.getBoundingClientRect()
                }
                else
                {
                    viewBoundingBox = paper.getContentBBox();
                }
                paper.translate(-targetPosition.x - targetSize.width * 0.5 + viewBoundingBox.width * 0.5, -targetPosition.y - targetSize.width * 0.5 + viewBoundingBox.height * 0.5);
            },


            /**
             * Delete Callback if a user wants to delete a node
             * 
             * @param {object} node Node to delete
             * @returns {jQuery.Deferred} Deferred that will be resolved if the user deletes the node
             */
            onDelete: function(node) {
                this.deleteLoading(false);
                this.deleteErrorOccured(false);
                this.deleteErrorAdditionalInformation("");
                this.showConfirmNodeDeleteDialog(true);

                this.deleteNodeTarget = node;
                this.deleteDeferred = new jQuery.Deferred();
                return this.deleteDeferred.promise();
            },

            /**
             * Deletes the node for which the dialog is opened
             */
            deleteNode: function() {
                if(!this.deleteNodeTarget || !this.deleteNodeTarget.validateDelete)
                {
                    this.resolveDeleteDeferred();
                }
                else
                {
                    var deleteDef = this.deleteNodeTarget.validateDelete();
                    if(!deleteDef)
                    {
                        this.resolveDeleteDeferred();
                    }
                    else
                    {
                        var self = this;
                        this.deleteLoading(true);
                        this.deleteErrorOccured(false);
                        this.deleteErrorAdditionalInformation(""); 
                        deleteDef.done(function() {
                            self.deleteLoading(false);
                            self.resolveDeleteDeferred();
                        }).fail(function(err) {
                            self.deleteLoading(false);
                            self.deleteErrorOccured(true);
                            self.deleteErrorAdditionalInformation(err); 
                        });
                    }
                }
            },

            /**
             * Resolves the delete deferred
             */
            resolveDeleteDeferred: function() {
                if(this.deleteDeferred)
                {
                    this.deleteDeferred.resolve();
                    this.deleteDeferred = null;
                }
                this.closeConfirmNodeDeleteDialog();
            },

            /**
             * Closes the confirm delete node dialog
             */
            closeConfirmNodeDeleteDialog: function() {
                if(this.deleteDeferred)
                {
                    this.deleteDeferred.reject();
                    this.deleteDeferred = null;
                }
                this.showConfirmNodeDeleteDialog(false);
                this.deleteLoading(false);
                this.deleteErrorOccured(false);
                this.deleteErrorAdditionalInformation("");
                this.deleteNodeTarget = null;
            },

            /**
             * Sets the graph to readonly mode
             */
            setGraphToReadonly: function() {
                jQuery(".gn-nodeGraphContainer").find("input,textarea,select").prop("disabled", true);
                jQuery(".gn-nodeGraphContainer").find(".joint-cell").css("pointer-events", "none");
                jQuery(".gn-nodeGraphContainer").find(".gn-nodeDeleteOnReadonly").remove();
                jQuery(".gn-nodeGraphContainer").find(".gn-nodeNonClickableOnReadonly").css("pointer-events", "none");
            }
        };

    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(BindingHandlers) {

        if(typeof ko !== "undefined")
        {

            /**
             * Code Editor Binding Handler
             */
            ko.bindingHandlers.codeEditor = {
                init: function (element, valueAccessor, allBindings) {
                    ace.require("ace/ext/language_tools");

                    var obs = valueAccessor();

                    // Read Config Values
                    var theme = null;
                    if(allBindings.get("codeEditorTheme"))
                    {
                        theme = ko.unwrap(allBindings.get("codeEditorTheme"));
                    }

                    if(!theme)
                    {
                        theme = "ace/theme/monokai";
                    }

                    var mode = null;
                    if(allBindings.get("codeEditorMode"))
                    {
                        mode = ko.unwrap(allBindings.get("codeEditorMode"));
                    }

                    if(!mode)
                    {
                        mode = "ace/mode/lua";
                    }

                    obs._editor = ace.edit(element);
                    obs._editor.setTheme(theme);
                    obs._editor.session.setMode(mode);
                    obs._editor.setOptions({
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: true
                    });

                    // Ensure autocomplete is triggered on dot
                    obs._editor.commands.on("afterExec", function (e) {
                        if ((e.command.name == "insertstring" && /^[\w.]$/.test(e.args)) || e.command.name == "backspace") {
                            obs._editor.execCommand("startAutocomplete");
                        }
                    });

                    if(ko.isObservable(obs))
                    {
                        obs._editor.session.on('change', function(delta) {
                            obs._blockUpdate = true;
                            try
                            {
                                obs(obs._editor.getValue());
                                obs._blockUpdate = false;
                            }
                            catch(e)
                            {
                                obs._blockUpdate = false;
                            }
                        });
                    }
                },
                update: function (element, valueAccessor, allBindings) {
                    var obs = valueAccessor();
                    var blockUpdate = obs._blockUpdate;
                    var value = obs;
                    if(ko.isObservable(value))
                    {
                        value = value();
                    }

                    var isReadonly = allBindings.get("codeEditorReadonly");
                    if(isReadonly)
                    {
                        isReadonly = ko.unwrap(isReadonly);
                        obs._editor.setReadOnly(isReadonly);
                    }

                    if(!blockUpdate)
                    {
                        obs._editor.session.setValue(value);
                    }
                }
            }

        }

    }(GoNorth.BindingHandlers = GoNorth.BindingHandlers || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(ScriptDialog) {

            ScriptDialog.currentCodeScriptDialogIndex = 0;

            /**
             * Viewmodel for a dialog to enter a code script
             * @param {ko.observable} errorOccured Error occured observable
             * @class
             */
            ScriptDialog.CodeScriptDialog = function(errorOccured)
            {
                this.dialogId = ScriptDialog.currentCodeScriptDialogIndex;
                ++ScriptDialog.currentCodeScriptDialogIndex;

                this.errorOccured = errorOccured;

                this.isVisible = new ko.observable(false);
                this.isEditing = new ko.observable(false);

                this.originalScriptName = "";
                this.originalScriptCode = "";
                this.scriptName = new ko.observable("");
                this.scriptCode = new ko.observable("");

                this.editDeferred = null;
                
                this.codeEditorTheme = new ko.observable("");
                this.codeEditorScriptLanguage = new ko.observable("");

                this.showConfirmCloseDialog = new ko.observable(false);
                this.confirmedClose = false;

                this.loadConfig();
            };

            ScriptDialog.CodeScriptDialog.prototype = {
                /**
                 * Loads the config
                 */
                loadConfig: function() {
                    var self = this;
                    GoNorth.HttpClient.get("/api/UserPreferencesApi/GetCodeEditorPreferences").done(function(config) {
                        self.codeEditorTheme(config.codeEditorTheme);
                        self.codeEditorScriptLanguage(config.scriptLanguage);
                    }).fail(function() {
                        self.errorOccured(true);
                    });;
                },

                /**
                 * Opens the create code script dialog
                 * @returns {jQuery.Deferred} Deferred that will be resolved with the result of the dialog
                 */
                openCreateDialog: function() {
                    return this.openDialogInternally("", "");
                },
                
                /**
                 * Opens the edit code script dialog
                 * 
                 * @param {string} name Name to edit
                 * @param {string} code Code to edit
                 * @returns {jQuery.Deferred} Deferred that will be resolved with the result of the dialog
                 */
                openEditDialog: function(name, code) {
                    return this.openDialogInternally(name, code);
                },

                /**
                 * Opens the code script dialog
                 * @param {string} name Name to edit
                 * @param {string} code Code to edit
                 * @returns {jQuery.Deferred} Deferred that will be resolved with the result of the dialog
                 */
                openDialogInternally: function(name, code) {
                    if(this.editDeferred != null)
                    {
                        this.editDeferred.reject();
                    }

                    this.isVisible(true);
                    this.isEditing(!!name);

                    this.originalScriptName = name;
                    this.originalScriptCode = code;
                    this.scriptName(name);
                    this.scriptCode(code);

                    this.showConfirmCloseDialog(false);
                    this.confirmedClose = false;

                    GoNorth.Util.setupValidation("#gn-codeScriptEditorForm" + this.dialogId);

                    this.editDeferred = new jQuery.Deferred();
                    return this.editDeferred.promise();
                },

                /**
                 * Saves the code
                 */
                saveCode: function() {
                    if(!jQuery("#gn-codeScriptEditorForm" + this.dialogId).valid())
                    {
                        return;
                    }

                    this.confirmedClose = true;
                    this.isVisible(false);
                    if(this.editDeferred != null)
                    {
                        this.editDeferred.resolve({
                            name: this.scriptName(),
                            code: this.scriptCode()
                        });
                    }
                },

                /**
                 * Cancels the dialog
                 */
                cancelDialog: function() {
                    this.isVisible(false);
                    if(this.editDeferred != null)
                    {
                        this.editDeferred.reject();
                    }
                },

                /**
                 * Callback gets called before the dialog gets closed
                 * @returns {boolean} true if the dialog should be closed, else false
                 */
                onClosingDialog: function() {
                    if(this.confirmedClose)
                    {
                        return true;
                    }

                    if(this.originalScriptCode != this.scriptCode() || this.originalScriptName != this.scriptName())
                    {
                        this.showConfirmCloseDialog(true);
                        return false;
                    }
                    else
                    {
                        this.showConfirmCloseDialog(false);
                        return true;
                    }
                },

                /**
                 * Confirms the close dialog
                 */
                confirmCloseDialog: function() {
                    this.confirmedClose = true;

                    this.showConfirmCloseDialog(false);
                    this.isVisible(false);
                },

                
                /**
                 * Cancels the close dialog
                 */
                cancelCloseDialog: function() {
                    this.showConfirmCloseDialog(false);
                }
            };

    }(GoNorth.ScriptDialog = GoNorth.ScriptDialog || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(ScriptDialog) {

            ScriptDialog.currentNodeDialogIndex = 0;

            /**
             * Viewmodel for a dialog to enter a script using a node system
             * @param {ko.observable} npcId Npc id to which the node system is related
             * @param {GoNorth.ChooseObjectDialog.ViewModel} objectDialog Object choose dialog
             * @param {GoNorth.ScriptDialog.CodeEditor} codeEditor Code editor dialog
             * @param {ko.observable} errorOccured Error occured observable
             * @class
             */
            ScriptDialog.NodeScriptDialog = function(npcId, objectDialog, codeEditor, errorOccured)
            {
                GoNorth.DefaultNodeShapes.BaseViewModel.apply(this);

                this.dialogId = ScriptDialog.currentNodeDialogIndex;
                ++ScriptDialog.currentNodeDialogIndex;

                this.npcId = npcId;

                this.chooseObjectDialog = objectDialog;
                this.errorOccured = errorOccured;

                this.isVisible = new ko.observable(false);
                this.isEditing = new ko.observable(false);

                this.originalScriptName = "";
                this.originalScriptNodes = {};
                this.scriptName = new ko.observable("");

                this.conditionDialog = new GoNorth.DefaultNodeShapes.Conditions.ConditionDialog();

                this.codeEditor = codeEditor;

                this.editDeferred = null;

                this.showConfirmCloseDialog = new ko.observable(false);
                this.confirmedClose = false;

                // Add access to object id for actions and conditions
                var self = this;
                GoNorth.DefaultNodeShapes.getCurrentRelatedObjectId = function() {
                    return self.npcId();
                };

                // Add access to condition dialog
                GoNorth.DefaultNodeShapes.openConditionDialog = function(condition) {
                    var conditionDialogDeferred = new jQuery.Deferred();
                    self.conditionDialog.openDialog(condition, conditionDialogDeferred);
                    return conditionDialogDeferred;
                };

                // Opens the general object search dialog 
                GoNorth.DefaultNodeShapes.openGeneralObjectSearchDialog = function() {
                    return self.chooseObjectDialog.openGeneralObjectSearch(ScriptDialog.Localization.NodeScripts.ChooseGeneralObject);
                };

                // Opens the item search dialog
                GoNorth.DefaultNodeShapes.openItemSearchDialog = function() {
                    return self.chooseObjectDialog.openItemSearch(GoNorth.DefaultNodeShapes.Localization.Dialogs.ChooseItem);
                };

                // Opens the quest search dialog 
                GoNorth.DefaultNodeShapes.openQuestSearchDialog = function() {
                    return self.chooseObjectDialog.openQuestSearch(ScriptDialog.Localization.NodeScripts.ChooseQuest);                    
                };
                
                // Opens the npc search dialog 
                GoNorth.DefaultNodeShapes.openNpcSearchDialog = function() {
                    return self.chooseObjectDialog.openNpcSearch(ScriptDialog.Localization.NodeScripts.ChooseNpc);                    
                };

                // Opens the skill search dialog 
                GoNorth.DefaultNodeShapes.openSkillSearchDialog = function() {
                    return self.chooseObjectDialog.openSkillSearch(ScriptDialog.Localization.NodeScripts.ChooseSkill);                    
                };

                // Opens the daily routine event dialog
                GoNorth.DefaultNodeShapes.openDailyRoutineEventSearchDialog = function() {
                    return self.chooseObjectDialog.openDailyRoutineSearch(ScriptDialog.Localization.NodeScripts.ChooseDailyRoutineEvent);                    
                };

                // Opens the daily routine event dialog
                GoNorth.DefaultNodeShapes.openMarkerSearchDialog = function() {
                    return self.chooseObjectDialog.openMarkerSearch(ScriptDialog.Localization.NodeScripts.ChooseMarker);                    
                };
                
                // Opens the code editor
                GoNorth.DefaultNodeShapes.openCodeEditor = function(name, scriptCode) {
                    return self.codeEditor.openEditDialog(name, scriptCode);              
                };

                // Load config lists
                GoNorth.DefaultNodeShapes.Shapes.loadConfigLists().fail(function() {
                    self.errorOccured(true);
                });
            };

            
            ScriptDialog.NodeScriptDialog.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.BaseViewModel.prototype);

            ScriptDialog.NodeScriptDialog.prototype = jQuery.extend(ScriptDialog.NodeScriptDialog.prototype, {
                /**
                 * Opens the create node script dialog
                 * @returns {jQuery.Deferred} Deferred that will be resolved with the result of the dialog
                 */
                openCreateDialog: function() {
                    return this.openDialogInternally("", {});
                },
                
                /**
                 * Opens the edit node script dialog
                 * 
                 * @param {string} name Name to edit
                 * @param {string} nodes Nodes to edit
                 * @returns {jQuery.Deferred} Deferred that will be resolved with the result of the dialog
                 */
                openEditDialog: function(name, nodes) {
                    return this.openDialogInternally(name, nodes);
                },

                /**
                 * Opens the node script dialog
                 * @param {string} name Name to edit
                 * @param {string} nodes Nodes to edit
                 * @returns {jQuery.Deferred} Deferred that will be resolved with the result of the dialog
                 */
                openDialogInternally: function(name, nodes) {
                    if(this.editDeferred != null)
                    {
                        this.editDeferred.reject();
                    }

                    this.isVisible(true);
                    this.isEditing(!!name);
                    
                    var nodeSerializer = GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance();
                    var self = this;
                    this.scriptName(name);
                    setTimeout(function() { // Timeout needed to prevent errors with styles because dialog is still opening
                        nodeSerializer.deserializeGraph(self.nodeGraph(), nodes, function(newNode) { self.setupNewNode(newNode); });
                        self.originalScriptNodes = nodeSerializer.serializeGraph(self.nodeGraph());
                        self.resetDependsOnObject(self.originalScriptNodes);
                    }, 150);

                    this.originalScriptName = name;

                    this.showConfirmCloseDialog(false);
                    this.confirmedClose = false;
                    
                    GoNorth.Util.setupValidation("#gn-nodeScriptEditorForm" + this.dialogId);

                    this.editDeferred = new jQuery.Deferred();
                    return this.editDeferred.promise();
                },

                /**
                 * Saves the nodes
                 */
                saveNodes: function() {
                    if(!jQuery("#gn-nodeScriptEditorForm" + this.dialogId).valid())
                    {
                        return;
                    }

                    this.confirmedClose = true;
                    this.isVisible(false);
                    if(this.editDeferred != null)
                    {
                        var nodeSerializer = GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance();
                        var serializedGraph = nodeSerializer.serializeGraph(this.nodeGraph());
                        this.editDeferred.resolve({
                            name: this.scriptName(),
                            graph: serializedGraph
                        });
                    }
                },

                /**
                 * Cancels the dialog
                 */
                cancelDialog: function() {
                    this.isVisible(false);
                    if(this.editDeferred != null)
                    {
                        this.editDeferred.reject();
                    }
                },

                /**
                 * Callback gets called before the dialog gets closed
                 * @returns {boolean} true if the dialog should be closed, else false
                 */
                onClosingDialog: function() {
                    if(this.confirmedClose)
                    {
                        return true;
                    }

                    if(!this.nodeGraph())
                    {
                        return true;
                    }
                    
                    var nodeSerializer = GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance();
                    var serializedGraph = nodeSerializer.serializeGraph(this.nodeGraph());
                    this.resetDependsOnObject(serializedGraph);
                    if(JSON.stringify(this.originalScriptNodes) != JSON.stringify(serializedGraph) || this.originalScriptName != this.scriptName())
                    {
                        this.showConfirmCloseDialog(true);
                        return false;
                    }
                    else
                    {
                        this.showConfirmCloseDialog(false);
                        return true;
                    }
                },

                /**
                 * Confirms the close dialog
                 */
                confirmCloseDialog: function() {
                    this.confirmedClose = true;

                    this.showConfirmCloseDialog(false);
                    this.isVisible(false);
                },

                
                /**
                 * Cancels the close dialog
                 */
                cancelCloseDialog: function() {
                    this.showConfirmCloseDialog(false);
                },

                
                /**
                 * Resets the depends objects
                 * @param {object} serializedNodeGraph Serialized node graph
                 */
                resetDependsOnObject: function(serializedNodeGraph) {
                    if(serializedNodeGraph.action) {
                        for(var curAction = 0; curAction < serializedNodeGraph.action.length; ++curAction) {
                            serializedNodeGraph.action[curAction].actionRelatedToObjectId = "";
                            serializedNodeGraph.action[curAction].actionRelatedToObjectType = "";
                        }
                    }

                    if(serializedNodeGraph.condition) {
                        for(var curCondition = 0; curCondition < serializedNodeGraph.condition.length; ++curCondition) {
                            if(!serializedNodeGraph.condition[curCondition].conditions) {
                                continue;
                            }

                            for(var curConditionPart = 0; curConditionPart < serializedNodeGraph.condition[curCondition].conditions.length; ++curConditionPart)
                            {
                                serializedNodeGraph.condition[curCondition].conditions[curConditionPart].dependsOnObjects = [];
                            }
                        }
                    }
                }
            });

    }(GoNorth.ScriptDialog = GoNorth.ScriptDialog || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DailyRoutines) {
        (function(Util) {
        
            /**
             * Formats a timespan
             * @param {string} timeFormat Time format
             * @param {object} earliest Earliest time
             * @param {object} latest Latest time
             * @returns {string} Formatted timespan
             */
            Util.formatTimeSpan = function(timeFormat, earliest, latest) {
                var timeSpanText = "";
                if(earliest) {
                    timeSpanText = GoNorth.Util.formatTime(earliest.hours, earliest.minutes, timeFormat);
                }

                if(latest && (!earliest || earliest.hours != latest.hours || earliest.minutes != latest.minutes))
                {
                    if(timeSpanText) {
                        timeSpanText += " - ";
                    }
                    timeSpanText += GoNorth.Util.formatTime(latest.hours, latest.minutes, timeFormat);
                }

                return timeSpanText;
            };

            /**
             * Keeps two observable for an earliest or latest time in order so that the latest time is never before the earliest and the other way around
             * @param {ko.observable} earliestTime Earliest time observable
             * @param {ko.observable} latestTime Latest time observable
             */
            Util.keepTimeObservablesInOrder = function(earliestTime, latestTime) {
                earliestTime.subscribe(function(newValue) {
                    var latestTimeValue = latestTime();
                    if(!newValue || !latestTimeValue) {
                        return;
                    }

                    if(newValue.hours > latestTimeValue.hours || (newValue.hours == latestTimeValue.hours && newValue.minutes > latestTimeValue.minutes))
                    {
                        latestTime(newValue);
                    }
                });
                latestTime.subscribe(function(newValue) {
                    var earliestTimeValue = earliestTime();
                    if(!newValue || !earliestTimeValue) {
                        return;
                    }

                    if(newValue.hours < earliestTimeValue.hours || (newValue.hours == earliestTimeValue.hours && newValue.minutes < earliestTimeValue.minutes))
                    {
                        earliestTime(newValue);
                    }
                });  
            };

            /**
             * Returns true if any time events overlap
             * @param {object[]} timeEvents Array with time events
             * @returns {boolean} true if any events overlap, else false
             */
            Util.doEventsOverlap = function(timeEvents) {
                for(var curEvent1 = 0; curEvent1 < timeEvents.length; ++curEvent1)
                {
                    if(!timeEvents[curEvent1].enabledByDefault())
                    {
                        continue;
                    }

                    for(var curEvent2 = curEvent1 + 1; curEvent2 < timeEvents.length; ++curEvent2)
                    {
                        if(!timeEvents[curEvent2].enabledByDefault())
                        {
                            continue;
                        }

                        var earliestTimeComp = GoNorth.BindingHandlers.compareTimes(timeEvents[curEvent1].earliestTime(), timeEvents[curEvent2].earliestTime());
                        var latestTimeComp = GoNorth.BindingHandlers.compareTimes(timeEvents[curEvent1].latestTime(), timeEvents[curEvent2].latestTime());
                        var earliestTimeInBetweenComp = GoNorth.BindingHandlers.compareTimes(timeEvents[curEvent1].earliestTime(), timeEvents[curEvent2].latestTime());
                        var latestTimeInBetweenComp = GoNorth.BindingHandlers.compareTimes(timeEvents[curEvent1].latestTime(), timeEvents[curEvent2].earliestTime());
                        if(earliestTimeComp != latestTimeComp || earliestTimeInBetweenComp != latestTimeComp || latestTimeInBetweenComp != earliestTimeComp)
                        {
                            return true;
                        }
                    }
                }

                return false;
            };

        }(DailyRoutines.Util = DailyRoutines.Util || {}));
    }(GoNorth.DailyRoutines = GoNorth.DailyRoutines || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(BindingHandlers) {

        if(typeof ko !== "undefined")
        {

            /**
             * Writes the timespan to an observbale
             * @param {object} element HTML Element
             * @param {string} timeFormat Time format
             * @param {ko.observable} earliestTime Earliest time
             * @param {ko.observable} latestTime Latest time
             */
            function outputTimespan(element, timeFormat, earliestTime, latestTime) {
                var earliest = ko.unwrap(earliestTime);
                var latest = ko.unwrap(latestTime);

                var timeSpanText = GoNorth.DailyRoutines.Util.formatTimeSpan(timeFormat, earliest, latest);
                
                jQuery(element).text(timeSpanText);
            }

            /**
             * Timespan binding handler
             */
            ko.bindingHandlers.timeSpan = {
                init: function (element, valueAccessor, allBindings) {
                    var timeFormat = "hh:mm";
                    if(allBindings.get("timeSpanTimeFormat")) {
                        timeFormat = allBindings.get("timeSpanTimeFormat");
                    }

                    var timeValues = ko.utils.unwrapObservable(valueAccessor());
                    var earliestTime = timeValues.earliestTime;
                    var latestTime = timeValues.latestTime;

                    if(ko.isObservable(earliestTime)) {
                        var earliestSubscription = earliestTime.subscribe(function() {
                            outputTimespan(element, timeFormat, earliestTime, latestTime);
                        });
                        earliestSubscription.disposeWhenNodeIsRemoved(element);
                    }
                    
                    if(ko.isObservable(latestTime)) {
                        var latestSubscription = latestTime.subscribe(function() {
                            outputTimespan(element, timeFormat, earliestTime, latestTime);
                        });
                        latestSubscription.disposeWhenNodeIsRemoved(element);
                    }

                    outputTimespan(element, timeFormat, earliestTime, latestTime);
                },
                update: function (element, valueAccessor, allBindings) {
                }
            }

        }

    }(GoNorth.BindingHandlers = GoNorth.BindingHandlers || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Shared) {
        (function(ChooseScriptTypeDialog) {

            /**
             * Value that will be returned in the openDialog promise if a node graph was selected. If changed, please make sure that the script types in the daily routines event object or code snippets are matching.
             */
            ChooseScriptTypeDialog.nodeGraph = 0;
            
            /**
             * Value that will be returned in the openDialog promise if a code script was selected. If changed, please make sure that the script types in the daily routines event object or code snippets are matching.
             */
            ChooseScriptTypeDialog.codeScript = 1;

            /**
             * Viewmodel for a dialog to choose the script type
             * @class
             */
            ChooseScriptTypeDialog.ViewModel = function()
            {
                this.isVisible = new ko.observable(false);

                this.creationDeferred = null;
            };

            ChooseScriptTypeDialog.ViewModel.prototype = {
                /**
                 * Opens the script type choosing dialog
                 * @returns {jQuery.Deferred} Deferred that will be resolved with the result of the selection
                 */
                openDialog: function() {
                    if(this.creationDeferred != null)
                    {
                        this.creationDeferred.reject();
                    }

                    this.isVisible(true);
                    this.creationDeferred = new jQuery.Deferred();
                    return this.creationDeferred.promise();
                },

                /**
                 * Creates a node graph
                 */
                createNodeGraph: function() {
                    this.isVisible(false);
                    if(this.creationDeferred != null)
                    {
                        this.creationDeferred.resolve(ChooseScriptTypeDialog.nodeGraph);
                    }
                },
                
                /**
                 * Creates a code script
                 */
                createCodeScript: function() {
                    this.isVisible(false);
                    if(this.creationDeferred != null)
                    {
                        this.creationDeferred.resolve(ChooseScriptTypeDialog.codeScript);
                    }
                },

                /**
                 * Cancels the dialog
                 */
                cancelDialog: function() {
                    this.isVisible(false);
                    if(this.creationDeferred != null)
                    {
                        this.creationDeferred.reject();
                    }
                }
            };

        }(Shared.ChooseScriptTypeDialog = Shared.ChooseScriptTypeDialog || {}));
    }(GoNorth.Shared = GoNorth.Shared || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DailyRoutines) {
        
        /**
         * Daily Routine event types
         */
        DailyRoutines.ScriptTypes = {
            none: -1,
            nodeGraph: 0,
            codeScript: 1
        };

        /**
         * Daily Routine event types. If these are changed, please make sure that the script types in the choose script type dialog are matching.
         */
        DailyRoutines.EventTypes = {
            movement: 0,
            script: 1
        };

        /**
         * Creates a movement target
         * @param {string} mapId If of the map for which the movement target is valid
         * @param {string} name Name of the target
         * @param {string} exportName Export name of the target
         * @param {number} lat Latitude
         * @param {number} lng Longitude
         * @returns {object} Movement target
         */
        DailyRoutines.createMovementTarget = function(mapId, name, exportName, lat, lng) {
            return {
                mapId: mapId,
                name: name,
                exportName: exportName,
                lat: lat,
                lng: lng
            }
        };
        
        /**
         * Creates a new event
         * @param {number} eventType Event Type
         * @param {object} earliestTime Earliest Time at which the event should occure
         * @param {object} latestTime Latest Time at which the event should occure
         * @param {object} movementTarget Movement target
         * @param {string} targetState Target state of the npc upon arriving at the destination
         * @param {number} scriptType Type of the script to run on arrival of the target or upon triggering the event
         * @param {string} scriptName Name of the script
         * @param {object} scriptNodeGraph Script Nodegraph
         * @param {string} scriptCode Script code
         * @param {boolean} enabledByDefault true if the event should be enabled by default
         */
        DailyRoutines.createRoutineEvent = function (eventType, earliestTime, latestTime, movementTarget, targetState, scriptType, scriptName, scriptNodeGraph, scriptCode, enabledByDefault) {
            return {
                eventId: null,
                eventType: eventType,
                earliestTime: new ko.observable(GoNorth.BindingHandlers.buildTimeObject(earliestTime.hours, earliestTime.minutes)),
                latestTime: new ko.observable(GoNorth.BindingHandlers.buildTimeObject(latestTime.hours, latestTime.minutes)),
                movementTarget: movementTarget,
                targetState: new ko.observable(targetState),
                scriptType: scriptType,
                scriptName: new ko.observable(scriptName),
                scriptNodeGraph: scriptNodeGraph,
                scriptCode: scriptCode,
                enabledByDefault: new ko.observable(enabledByDefault)
            };
        };

        /**
         * Serializes a routine event
         * @param {object} eventObj Object to serialize
         * @returns {object} Serialized routine event
         */
        DailyRoutines.serializeRoutineEvent = function(eventObj) {
            return {
                eventId: eventObj.eventId,
                eventType: eventObj.eventType,
                earliestTime: eventObj.earliestTime(),
                latestTime: eventObj.latestTime(),
                movementTarget: eventObj.movementTarget,
                targetState: eventObj.targetState(),
                scriptType: eventObj.scriptType,
                scriptName: eventObj.scriptName(),
                scriptNodeGraph: eventObj.scriptNodeGraph,
                scriptCode: eventObj.scriptCode,
                enabledByDefault: eventObj.enabledByDefault()
            };
        };

        /**
         * Deserializes a daily routine event array
         * @param {object[]} dailyRoutine Daily routine event array
         * @returns {object[]} Deserialized daily routine events
         */
        DailyRoutines.deserializeRoutineEventArray = function(dailyRoutine) {
            if(!dailyRoutine) {
                return [];
            }

            var deserializedEvents = [];
            for(var curEvent = 0; curEvent < dailyRoutine.length; ++curEvent)
            {
                deserializedEvents.push(GoNorth.DailyRoutines.deserializeRoutineEvent(dailyRoutine[curEvent]));
            }

            return deserializedEvents;
        }

        /**
         * Deserializes a routine event
         * @param {object} eventObj Object to serialize
         * @returns {object} Serialized routine event
         */
        DailyRoutines.deserializeRoutineEvent = function(eventObj) {
            var routineObj = DailyRoutines.createRoutineEvent(eventObj.eventType, eventObj.earliestTime, eventObj.latestTime, eventObj.movementTarget, eventObj.targetState, eventObj.scriptType, eventObj.scriptName, 
                                                              eventObj.scriptNodeGraph, eventObj.scriptCode, eventObj.enabledByDefault);
            routineObj.eventId = eventObj.eventId;
            return routineObj;
        };

    }(GoNorth.DailyRoutines = GoNorth.DailyRoutines || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Shapes) {

            /// Action Type
            var actionType = "default.Action";
            
            /// Action Target Array
            var actionTargetArray = "action";


            /// All available actions
            var availableActions = [];

            /// Height of action node
            var actionNodeHeight = 200;

            /**
             * Adds a new available action
             * 
             * @param {object} action Action
             */
            Shapes.addAvailableAction = function(action) {
                availableActions.push(action);
            }

            /**
             * Loads the config for an action
             * 
             * @param {string} configKey Config key
             * @returns {jQuery.Deferred} Deferred for the request
             */
            function loadActionConfig(configKey) {
                var def = new jQuery.Deferred();

                GoNorth.HttpClient.get("/api/ProjectConfigApi/GetJsonConfigByKey?configKey=" + encodeURIComponent(configKey)).done(function(loadedConfigData) {
                    if(!loadedConfigData)
                    {
                        def.resolve();
                        return;
                    }
                    
                    try
                    {
                        var configLines = JSON.parse(loadedConfigData)
                        var configList = jQuery("<datalist id='gn-" + configKey + "'></datalist>");
                        for(var curLine = 0; curLine < configLines.length; ++curLine)
                        {
                            configList.append(jQuery("<option></option>").text(configLines[curLine]));
                        }
                        jQuery("body").append(configList);
                        def.resolve();
                    }
                    catch(e)
                    {
                        self.errorOccured(true);
                        def.reject();
                    }
                }).fail(function() {
                    def.reject();
                })

                return def.promise();
            }

            /**
             * Loads all the config lists
             * @returns {jQuery.Deferred} Deferred for the requests
             */
            Shapes.loadConfigLists = function() {
                var usedConfigKeys = {};
                var loadingPromises = [];

                for(var curAction = 0; curAction < availableActions.length; ++curAction)
                {
                    var configKey = availableActions[curAction].getConfigKey();
                    if(configKey && !usedConfigKeys[configKey])
                    {
                        usedConfigKeys[configKey] = true;
                        loadingPromises.push(loadActionConfig(configKey));
                    }
                }

                return jQuery.when.apply(jQuery, loadingPromises);
            }

            joint.shapes.default = joint.shapes.default || {};

            /**
             * Creates the action shape
             * @returns {object} Action shape
             * @memberof Shapes
             */
            function createActionShape() {
                var model = joint.shapes.devs.Model.extend(
                {
                    defaults: joint.util.deepSupplement
                    (
                        {
                            type: actionType,
                            icon: "glyphicon-cog",
                            size: { width: 250, height: actionNodeHeight },
                            inPorts: ['input'],
                            outPorts: ['output'],
                            attrs:
                            {
                                '.inPorts circle': { "magnet": "passive", "port-type": "input" },
                                '.outPorts circle': { "magnet": "true" }
                            },
                            actionType: null,
                            actionRelatedToObjectType: null,
                            actionRelatedToObjectId: null,
                            actionRelatedToAdditionalObjects: [],
                            actionData: null
                        },
                        joint.shapes.default.Base.prototype.defaults
                    )
                });
                return model;
            }

            /**
             * Creates a action view
             * @returns {object} Action view
             * @memberof Shapes
             */
            function createActionView() {
                return joint.shapes.default.BaseView.extend(
                {
                    /**
                     * Template
                     */
                    template:
                    [
                        '<div class="node">',
                            '<span class="label"><i class="nodeIcon glyphicon"></i><span class="labelText"></span></span>',
                            '<span class="gn-nodeLoading" style="display: none"><i class="glyphicon glyphicon-refresh spinning"></i></span>',
                            '<span class="gn-nodeError text-danger" style="display: none" title="' + GoNorth.DefaultNodeShapes.Localization.ErrorOccured + '"><i class="glyphicon glyphicon-warning-sign"></i></span>',
                            '<button class="delete gn-nodeDeleteOnReadonly cornerButton" title="' + GoNorth.DefaultNodeShapes.Localization.DeleteNode + '">x</button>',
                            '<select class="gn-actionNodeSelectActionType"></select>',
                            '<div class="gn-actionNodeActionContent"></div>',
                        '</div>',
                    ].join(''),

                    /**
                     * Initializes the shape
                     */
                    initialize: function() {
                        joint.shapes.default.BaseView.prototype.initialize.apply(this, arguments);

                        var actionTypeBox = this.$box.find(".gn-actionNodeSelectActionType");
                        GoNorth.Util.fillSelectFromArray(actionTypeBox, availableActions, function(action) { return action.getType(); }, function(action) { return action.getLabel(); });

                        var self = this;
                        actionTypeBox.on("change", function() {
                            self.resetActionData();
                            self.syncActionData();
                        });

                        actionTypeBox.find("option[value='" + this.model.get("actionType") + "']").prop("selected", true);

                        this.syncActionData();
                    },

                    /**
                     * Returns the current action
                     */
                    getCurrentAction: function() {
                        var actionType = this.$box.find(".gn-actionNodeSelectActionType").val();
                        for(var curAction = 0; curAction < availableActions.length; ++curAction)
                        {
                            if(availableActions[curAction].getType() == actionType)
                            {
                                return availableActions[curAction];
                            }
                        }
                        return null;
                    },

                    /**
                     * Resets the action data
                     */
                    resetActionData: function() {
                        this.model.set("actionRelatedToObjectType", null);
                        this.model.set("actionRelatedToObjectId", null);
                        this.model.set("actionRelatedToAdditionalObjects", []);
                        this.model.set("actionData", null);

                        if(this.model.get("actionCustomAttributes")) 
                        {
                            var customAttributes = this.model.get("actionCustomAttributes");
                            for(var curAttribute = 0; curAttribute < customAttributes.length; ++curAttribute)
                            {
                                this.model.set(customAttributes[curAttribute], null);
                            }
                            this.model.set("actionCustomAttributes", null);
                        }
                    },

                    /**
                     * Syncs the action data
                     */
                    syncActionData: function() {
                        var action = this.getCurrentAction();
                        if(!action)
                        {
                            return;
                        }

                        var currentAction = action.buildAction();
                        currentAction.setNodeModel(this.model);
                        this.model.set("actionType", currentAction.getType());

                        var actionContent = this.$box.find(".gn-actionNodeActionContent");
                        actionContent.html(currentAction.getContent());
                        this.model.set("actionCustomAttributes", currentAction.getCustomActionAttributes());
                        var self = this;
                        currentAction.showErrorCallback = function() {
                            self.showError();
                        };
                        this.syncOutputPorts(currentAction);
                        currentAction.onInitialized(actionContent, this);
                    },

                    /**
                     * Syncs the output ports
                     * @param {object} currentAction Action to load the output ports from
                     */
                    syncOutputPorts: function(currentAction) {
                        var currentPortDisplayNames = [];
                        this.$el.find(".gn-nodeActionOutputLabel").each(function() {
                            currentPortDisplayNames.push(jQuery(this).find("tspan").text());
                        });
                        if(currentPortDisplayNames.length == 0)
                        {
                            currentPortDisplayNames.push("");
                        }

                        var outPorts = ["output"];
                        var outPortDisplayNames = [currentAction.getMainOutputLabel()];

                        var additionalOutPorts = currentAction.getAdditionalOutports();
                        if(additionalOutPorts)
                        {
                            for(var curPort = 0; curPort < additionalOutPorts.length; ++curPort)
                            {
                                outPorts.push("additionalActionOutput" + (curPort + 1));
                                outPortDisplayNames.push(additionalOutPorts[curPort])
                            }
                        }

                        if(!GoNorth.Util.isEqual(currentPortDisplayNames, outPortDisplayNames))
                        {
                            this.model.set("outPorts", outPorts);

                            // Update Port Positions
                            if(outPorts.length > 1)
                            {
                                var heightsPerPort = actionNodeHeight / (outPorts.length + 1);
                                for(var curPort = 0; curPort < outPorts.length; ++curPort)
                                {
                                    var label = "";
                                    if(curPort == 0)
                                    {
                                        label = currentAction.getMainOutputLabel();
                                    }
                                    else
                                    {
                                        label = additionalOutPorts[curPort - 1];
                                    }

                                    this.model.attr(".outPorts>.port" + curPort, { "ref-y": (heightsPerPort * (curPort + 1)) + "px", "ref": ".body" });
                                    this.model.attr(".outPorts>.port" + curPort + " .port-label", { "title": label, "class": "gn-nodeActionOutputLabel", "dx": 15, "dy": 0 });
                                }
                            }
                            else
                            {
                                this.model.attr(".outPorts>.port0" + " .port-label", { "title": "", "class": "", "dx": 15, "dy": 0 });
                            }

                            // setTimeout is required to have the element ready on load
                            var self = this;
                            setTimeout(function() {
                                self.$el.find(".gn-nodeActionOutputLabel").each(function() {
                                    jQuery(this).find("tspan").text(jQuery(this).attr("title"));
                                });
                            }, 1);
                        }
                    },

                    /**
                     * Reloads the shared data
                     * 
                     * @param {number} objectType Object Type
                     * @param {string} objectId Object Id
                     */
                    reloadSharedLoadedData: function(objectType, objectId) {
                        if(this.model.get("actionRelatedToObjectId") == objectId)
                        {
                            this.syncActionData();
                        }
                    },


                    /**
                     * Shows the loading indicator
                     */
                    showLoading: function() {
                        this.$box.find(".gn-nodeLoading").show();
                    },

                    /**
                     * Hides the loading indicator
                     */
                    hideLoading: function() {
                        this.$box.find(".gn-nodeLoading").hide();
                    },


                    /**
                     * Shows the error indicator
                     */
                    showError: function() {
                        this.$box.find(".gn-nodeError").show();
                    },

                    /**
                     * Hides the error indicator
                     */
                    hideError: function() {
                        this.$box.find(".gn-nodeError").hide();
                    },


                    /**
                     * Returns statistics for the node
                     * @returns Node statistics
                     */
                    getStatistics: function() {
                        var action = this.getCurrentAction();
                        if(!action)
                        {
                            return;
                        }

                        var currentAction = action.buildAction();
                        currentAction.setNodeModel(this.model);

                        var actionData = this.model.get("actionData");
                        if(!actionData) {
                            return {};
                        }

                        var parsedActionData = JSON.parse(actionData);
                        return currentAction.getStatistics(parsedActionData);
                    }
                });
            }

            /**
             * Action Shape
             */
            joint.shapes.default.Action = createActionShape();

            /**
             * Action View
             */
            joint.shapes.default.ActionView = createActionView();


            /** 
             * Action Serializer 
             * 
             * @class
             */
            Shapes.ActionSerializer = function()
            {
                GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.apply(this, [ joint.shapes.default.Action, actionType, actionTargetArray ]);
            };

            Shapes.ActionSerializer.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.prototype)

            /**
             * Serializes a node
             * 
             * @param {object} node Node Object
             * @returns {object} Serialized NOde
             */
            Shapes.ActionSerializer.prototype.serialize = function(node) {
                var serializedData = {
                    id: node.id,
                    x: node.position.x,
                    y: node.position.y,
                    actionType: node.actionType,
                    actionRelatedToObjectType: node.actionRelatedToObjectType,
                    actionRelatedToObjectId: node.actionRelatedToObjectId,
                    actionRelatedToAdditionalObjects: node.actionRelatedToAdditionalObjects,
                    actionData: node.actionData
                };

                return serializedData;
            };

            /**
             * Deserializes a serialized node
             * 
             * @param {object} node Serialized Node Object
             * @returns {object} Deserialized Node
             */
            Shapes.ActionSerializer.prototype.deserialize = function(node) {
                var initOptions = {
                    id: node.id,
                    position: { x: node.x, y: node.y },
                    actionType: node.actionType,
                    actionRelatedToObjectType: node.actionRelatedToObjectType,
                    actionRelatedToObjectId: node.actionRelatedToObjectId,
                    actionRelatedToAdditionalObjects: node.actionRelatedToAdditionalObjects,
                    actionData: node.actionData
                };

                var node = new this.classType(initOptions);
                return node;
            };

            // Register Serializers
            var actionSerializer = new Shapes.ActionSerializer();
            GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().addNodeSerializer(actionSerializer);

        }(DefaultNodeShapes.Shapes = DefaultNodeShapes.Shapes || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Actions that are related to npcs
            Actions.RelatedToObjectNpc = "Npc";

            /// Actions that are related to quests
            Actions.RelatedToObjectQuest = "Quest";

            /// Actions that are related to skills
            Actions.RelatedToObjectSkill = "Skill";

            /// Actions that are related to items
            Actions.RelatedToObjectItem = "Item";

            /// Actions that are related to map markers
            Actions.RelatedToObjectMapMarker = "MapMarker";

            /// Actions that are related to a map
            Actions.RelatedToObjectMap = "Map";

            /// Actions that are related to a daily routine
            Actions.RelatedToObjectDailyRoutine = "NpcDailyRoutineEvent";

            /// Actions that are related to a daily routine
            Actions.RelatedToWikiPage = "WikiPage";

            /**
             * Base Action
             * @class
             */
            Actions.BaseAction = function()
            {
                this.nodeModel = null;
            };

            Actions.BaseAction.prototype = {
                /**
                 * Builds the action
                 * 
                 * @returns {object} Action
                 */
                buildAction: function() {

                },

                /**
                 * Sets the node model
                 * 
                 * @param {object} model Node model
                 */
                setNodeModel: function(model) {
                    this.nodeModel = model;
                },

                /**
                 * Returns the type of the action
                 * 
                 * @returns {number} Type of the action
                 */
                getType: function() {
                    return -1;
                },

                /**
                 * Returns the label of the action
                 * 
                 * @returns {string} Label of the action
                 */
                getLabel: function() {

                },

                /**
                 * Returns the HTML Content of the action
                 * 
                 * @returns {string} HTML Content of the action
                 */
                getContent: function() {

                },

                /**
                 * Returns the config key for the action
                 * 
                 * @returns {string} Config key
                 */
                getConfigKey: function() {
                    return null;
                },

                /**
                 * Returns the names of the custom action attributes
                 * 
                 * @returns {string[]} Name of the custom action attributes
                 */
                getCustomActionAttributes: function() {
                    return [];
                },

                /**
                 * Returns the label for the main output
                 * 
                 * @returns {string} Label for the main output
                 */
                getMainOutputLabel: function() {
                    return "";
                },

                /**
                 * Returns the additional outports of the action
                 * 
                 * @returns {string[]} Additional outports
                 */
                getAdditionalOutports: function() {
                    return [];
                },

                /**
                 * Gets called once the action was intialized
                 * 
                 * @param {object} contentElement Content element
                 * @param {ActionNode} actionNode Parent Action node
                 */
                onInitialized: function(contentElement, actionNode) {

                },

                /**
                 * Serializes the data
                 * 
                 * @returns {object} Serialized Data 
                 */
                serialize: function() {

                },

                /**
                 * Deserializes the data
                 * 
                 * @param {object} serializedData Serialized data
                 */
                deserialize: function(serializedData) {

                },

                /**
                 * Returns statistics for the action
                 * @param {object} parsedActionData Parsed action data
                 * @returns Node statistics
                 */
                getStatistics: function(parsedActionData) {
                    return {};
                }
            };

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /**
             * Change Value Action
             * @class
             */
            Actions.ChangeValueAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);

                this.contentElement = null;
                this.filteredFields = [];

                this.isNumberValueSelected = false;
            };

            Actions.ChangeValueAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);
            Actions.ChangeValueAction.prototype = jQuery.extend(Actions.ChangeValueAction.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Actions.ChangeValueAction.prototype.getObjectTypeName = function() {
            };

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.ChangeValueAction.prototype.getContent = function() {
                return  "<select class='gn-actionNodeAttributeSelect'></select>" +
                        "<select class='gn-actionNodeAttributeOperator'></select>" +
                        "<input type='text' class='gn-actionNodeAttributeChange'/>";
            };

            /**
             * Returns true if the action is using an individual object id for each object since the user can choose an object instead of having a fixed one, else false
             * 
             * @returns {bool} true if the action is using an individual object id for each object since the user can choose an object instead of having a fixed one, else false
             */
            Actions.ChangeValueAction.prototype.isUsingIndividualObjectId = function() {
                return false;
            };

            /**
             * Returns the object id
             * 
             * @returns {string} Object Id
             */
            Actions.ChangeValueAction.prototype.getObjectId = function(existingData) {
                return null;
            };

            /**
             * Returns true if the object can be loaded, else false
             * 
             * @returns {bool} true if the object can be loaded, else false
             */
            Actions.ChangeValueAction.prototype.canLoadObject = function(existingData) {
                return true;
            };

            /**
             * Runs additional initialize actions
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.ChangeValueAction.prototype.onInitializeAdditional = function(contentElement, actionNode) {

            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.ChangeValueAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;

                this.deserializePreLoadData();

                if(this.canLoadObject())
                {
                    this.loadFields(contentElement, actionNode);
                }

                var self = this;
                contentElement.find(".gn-actionNodeAttributeSelect").on("change", function() {
                    self.syncOperators();
                    self.saveData();
                });

                contentElement.find(".gn-actionNodeAttributeOperator").on("change", function() {
                    self.saveData();
                });

                var attributeCompare = contentElement.find(".gn-actionNodeAttributeChange");
                attributeCompare.keydown(function(e) {
                    if(self.isNumberValueSelected)
                    {
                        GoNorth.Util.validateNumberKeyPress(attributeCompare, e);
                    }
                });

                attributeCompare.change(function(e) {
                    if(self.isNumberValueSelected)
                    {
                        self.ensureNumberValue();
                    }

                    self.saveData();
                });

                this.onInitializeAdditional(contentElement, actionNode);
            };

            /**
             * Parses additional data
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             * @param {object} fieldObject Loaded Field object
             */
            Actions.ChangeValueAction.prototype.parseAdditionalData = function(contentElement, actionNode, fieldObject) {
            };

            /**
             * Loads the fields
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.ChangeValueAction.prototype.loadFields = function(contentElement, actionNode) {
                actionNode.showLoading();
                actionNode.hideError();

                var self = this;
                this.loadObjectShared().then(function(fieldObject) {
                    if(!fieldObject)
                    {
                        actionNode.hideLoading();
                        return;
                    }

                    // Set related object data
                    self.nodeModel.set("actionRelatedToObjectType", self.getObjectTypeName());
                    self.nodeModel.set("actionRelatedToObjectId", fieldObject.id);

                    // Fill field array
                    var attributeSelect = contentElement.find(".gn-actionNodeAttributeSelect");
                    self.filteredFields = GoNorth.Util.getFilteredFieldsForScript(fieldObject.fields);
                    
                    GoNorth.Util.fillSelectFromArray(attributeSelect, self.filteredFields, function(field, index) { return index; }, function(field) { 
                        var label = field.name + " ("; 
                        if(field.fieldType == GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldTypeNumber)
                        {
                            label += DefaultNodeShapes.Localization.Actions.NumberField;
                        }
                        else
                        {
                            label += DefaultNodeShapes.Localization.Actions.TextField;
                        }
                        label += ")";

                        return label;
                    });

                    // Parse additional data
                    self.parseAdditionalData(contentElement, actionNode, fieldObject);
                    
                    var dataExists = self.deserializeData();
                    if(!dataExists)
                    {
                        self.syncOperators();
                        self.saveData();
                    }
                    
                    actionNode.hideLoading();
                }, function() {
                    actionNode.hideLoading();
                    actionNode.showError();
                });
            };

            /**
             * Syncs the operators
             */
            Actions.ChangeValueAction.prototype.syncOperators = function() {
                var selectedField = this.contentElement.find(".gn-actionNodeAttributeSelect").val();
                var operatorSelect = this.contentElement.find(".gn-actionNodeAttributeOperator");
                var curField = this.filteredFields[selectedField];
                if(!curField)
                {
                    GoNorth.Util.fillSelectFromArray(operatorSelect, [], function(operator) { return operator; }, function(operator) { return operator; });
                    return;
                }

                var operators = [];
                if(curField.fieldType == GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldTypeNumber)
                {
                    operators = [ "=", "+=", "-=", "*=", "/=" ];
                    this.isNumberValueSelected = true;

                    this.ensureNumberValue();
                }
                else
                {
                    operators = [ "=" ];
                    this.isNumberValueSelected = false;
                }

                GoNorth.Util.fillSelectFromArray(operatorSelect, operators, function(operator) { return operator; }, function(operator) { return operator; });
            }

            /**
             * Ensures the user entered a number if a number field was selected
             */
            Actions.ChangeValueAction.prototype.ensureNumberValue = function() {
                var parsedValue = parseFloat(this.contentElement.find(".gn-actionNodeAttributeChange").val());
                if(isNaN(parsedValue))
                {
                    this.contentElement.find(".gn-actionNodeAttributeChange").val("0");
                }
            }

            /**
             * Deserializes data before loading data
             */
            Actions.ChangeValueAction.prototype.deserializePreLoadData = function() {
                
            };

            /**
             * Deserializes the data
             */
            Actions.ChangeValueAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return false;
                }

                var data = JSON.parse(actionData);
                var selectedFieldIndex = 0;
                for(var curField = 0; curField < this.filteredFields.length; ++curField)
                {
                    if(this.filteredFields[curField].id == data.fieldId)
                    {
                        selectedFieldIndex = curField;
                        
                        if(this.filteredFields[curField].name == data.fieldName)
                        {
                            break;
                        }
                    }
                }

                this.contentElement.find(".gn-actionNodeAttributeSelect").find("option[value='" + selectedFieldIndex + "']").prop("selected", true);
                this.syncOperators();
                this.contentElement.find(".gn-actionNodeAttributeOperator").find("option[value='" + data.operator + "']").prop("selected", true);
                this.contentElement.find(".gn-actionNodeAttributeChange").val(data.valueChange);

                return true;
            };

            /**
             * Serializes additional data
             * 
             * @param {object} serializeData Existing Serialize Data
             */
            Actions.ChangeValueAction.prototype.serializeAdditionalData = function(serializeData) {

            };

            /**
             * Saves the data
             */
            Actions.ChangeValueAction.prototype.saveData = function() {
                var selectedField = this.contentElement.find(".gn-actionNodeAttributeSelect").val();
                var curField = this.filteredFields[selectedField];
                var operator = this.contentElement.find(".gn-actionNodeAttributeOperator").val();
                var valueChange = this.contentElement.find(".gn-actionNodeAttributeChange").val();

                var serializeData = {
                    fieldId: curField ? curField.id : null,
                    fieldName: curField ? curField.name : null,
                    operator: operator,
                    valueChange: valueChange
                };

                this.serializeAdditionalData(serializeData);

                this.nodeModel.set("actionData", JSON.stringify(serializeData));
            }

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /**
             * Base class for changing the value of object to pick
             * @class
             */
            Actions.ChangeValueChooseObjectAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.ChangeValueAction.apply(this);
            };

            Actions.ChangeValueChooseObjectAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.ChangeValueAction.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.ChangeValueChooseObjectAction.prototype.getContent = function() {
                return  "<div class='gn-actionNodeObjectSelectContainer'>" +
                            "<a class='gn-actionNodeObjectSelect gn-clickable'>" + this.getChooseLabel() + "</a>" +
                            "<a class='gn-clickable gn-nodeActionOpenObject' title='" + this.getOpenObjectTooltip() + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>" +
                        "<select class='gn-actionNodeAttributeSelect'></select>" +
                        "<select class='gn-actionNodeAttributeOperator'></select>" +
                        "<input type='text' class='gn-actionNodeAttributeChange'/>";
            };

            /**
             * Returns the choose object label
             * 
             * @returns {string} Choose object label
             */
            Actions.ChangeValueChooseObjectAction.prototype.getChooseLabel = function() {
                return "NOT IMPLEMENTED";
            };

            /**
             * Returns the open object tool label
             * 
             * @returns {string} Open object label
             */
            Actions.ChangeValueChooseObjectAction.prototype.getOpenObjectTooltip = function() {
                return "NOT IMPLEMENTED";
            };

            /**
             * Returns true if the action is using an individual object id for each object since the user can choose an object instead of having a fixed one, else false
             * 
             * @returns {bool} true if the action is using an individual object id for each object since the user can choose an object instead of having a fixed one, else false
             */
            Actions.ChangeValueChooseObjectAction.prototype.isUsingIndividualObjectId = function() {
                return true;
            };

            /**
             * Returns the object id
             * 
             * @returns {string} Object Id
             */
            Actions.ChangeValueChooseObjectAction.prototype.getObjectId = function(existingData) {
                return this.nodeModel.get("objectId");
            };

            /**
             * Returns the names of the custom action attributes
             * 
             * @returns {string[]} Name of the custom action attributes
             */
            Actions.ChangeValueChooseObjectAction.prototype.getCustomActionAttributes = function() {
                return [ "objectId" ];
            };

            /**
             * Returns true if the object can be loaded, else false
             * 
             * @returns {bool} true if the object can be loaded, else false
             */
            Actions.ChangeValueChooseObjectAction.prototype.canLoadObject = function() {
                return !!this.nodeModel.get("objectId");
            };

            /**
             * Opens the object
             * @param {string} id Id of the object
             */
            Actions.ChangeValueChooseObjectAction.prototype.openObject = function(id) {

            };

            /**
             * Opens the search dialog
             * 
             * @returns {jQuery.Deferred} Deferred for the picking
             */
            Actions.ChangeValueChooseObjectAction.prototype.openSearchDialog = function() {
            };

            /**
             * Parses additional data
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             * @param {object} fieldObject Loaded Field object
             */
            Actions.ChangeValueChooseObjectAction.prototype.parseAdditionalData = function(contentElement, actionNode, fieldObject) {
                contentElement.find(".gn-actionNodeObjectSelect").text(fieldObject.name);
            };

            /**
             * Runs additional initialize actions
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.ChangeValueChooseObjectAction.prototype.onInitializeAdditional = function(contentElement, actionNode) {
                var self = this;

                var openObjectLink = contentElement.find(".gn-nodeActionOpenObject");

                contentElement.find(".gn-actionNodeObjectSelect").on("click", function() {
                    self.openSearchDialog().then(function(fieldObject) {
                        self.nodeModel.set("objectId", fieldObject.id);
                        self.loadFields(contentElement, actionNode);

                        contentElement.find(".gn-actionNodeObjectSelect").text(fieldObject.name);

                        openObjectLink.show();
                    });
                });

                if(this.nodeModel.get("objectId"))
                {
                    openObjectLink.show();
                }

                openObjectLink.on("click", function() {
                    var objectId = self.nodeModel.get("objectId");
                    if(objectId) 
                    {
                        self.openObject(objectId);
                    }
                });
            };

            /**
             * Serializes additional data
             * 
             * @param {object} serializeData Existing Serialize Data
             */
            Actions.ChangeValueChooseObjectAction.prototype.serializeAdditionalData = function(serializeData) {
                serializeData.objectId = this.nodeModel.get("objectId") ? this.nodeModel.get("objectId") : null;
            };

            /**
             * Deserializes data before loading data
             */
            Actions.ChangeValueChooseObjectAction.prototype.deserializePreLoadData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return;
                }

                var data = JSON.parse(actionData);
                this.nodeModel.set("objectId", data.objectId);
            };

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for changing the player value
            var actionTypeChangePlayerValue = 1;

            /**
             * Change player value Action
             * @class
             */
            Actions.ChangePlayerValueAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.ChangeValueAction.apply(this);
            };

            Actions.ChangePlayerValueAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.ChangeValueAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.ChangePlayerValueAction.prototype.buildAction = function() {
                return new Actions.ChangePlayerValueAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.ChangePlayerValueAction.prototype.getType = function() {
                return actionTypeChangePlayerValue;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.ChangePlayerValueAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.ChangePlayerValueLabel;
            };

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Actions.ChangePlayerValueAction.prototype.getObjectTypeName = function() {
                return Actions.RelatedToObjectNpc;
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.ChangePlayerValueAction.prototype.getObjectId = function() {
                return "PlayerNpc";
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.ChangePlayerValueAction.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
            };

            /**
             * Loads the npc
             * 
             * @returns {jQuery.Deferred} Deferred for the npc loading
             */
            Actions.ChangePlayerValueAction.prototype.loadObject = function() {
                var def = new jQuery.Deferred();

                var self = this;
                GoNorth.HttpClient.get("/api/KortistoApi/PlayerNpc").done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.ChangePlayerValueAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for changing the npc value
            var actionTypeChangeNpcValue = 2;

            /**
             * Change npc value Action
             * @class
             */
            Actions.ChangeNpcValueAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.ChangeValueAction.apply(this);
            };

            Actions.ChangeNpcValueAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.ChangeValueAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.ChangeNpcValueAction.prototype.buildAction = function() {
                return new Actions.ChangeNpcValueAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.ChangeNpcValueAction.prototype.getType = function() {
                return actionTypeChangeNpcValue;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.ChangeNpcValueAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.ChangeNpcValueLabel;
            };

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Actions.ChangeNpcValueAction.prototype.getObjectTypeName = function() {
                return Actions.RelatedToObjectNpc;
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.ChangeNpcValueAction.prototype.getObjectId = function() {
                return DefaultNodeShapes.getCurrentRelatedObjectId();
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.ChangeNpcValueAction.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
            };

            /**
             * Loads the npc
             * 
             * @returns {jQuery.Deferred} Deferred for the npc loading
             */
            Actions.ChangeNpcValueAction.prototype.loadObject = function() {
                var def = new jQuery.Deferred();

                GoNorth.HttpClient.get("/api/KortistoApi/FlexFieldObject?id=" + DefaultNodeShapes.getCurrentRelatedObjectId()).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.ChangeNpcValueAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /**
             * Change Inventory Action
             * @class
             */
            Actions.ChangeInventoryAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
            };

            Actions.ChangeInventoryAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.ChangeInventoryAction.prototype.getContent = function() {
                return  "<div class='gn-actionNodeObjectSelectContainer'>" + 
                            "<a class='gn-clickable gn-nodeSelectItemAction gn-nodeNonClickableOnReadonly'></a>&nbsp;" +
                            "<a class='gn-clickable gn-nodeActionOpenItem' title='" + DefaultNodeShapes.Localization.Actions.OpenItemTooltip + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>" +
                        "<div class='gn-nodeActionText'>" + DefaultNodeShapes.Localization.Actions.ItemQuantity + "</div>" +
                        "<input type='text' class='gn-nodeItemQuantity'/>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.ChangeInventoryAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;
                this.contentElement.find(".gn-nodeSelectItemAction").text(DefaultNodeShapes.Localization.Actions.ChooseItem);

                var itemOpenLink = contentElement.find(".gn-nodeActionOpenItem");

                // Deserialize
                var existingItemId = this.deserializeData();
                if(existingItemId)
                {
                    itemOpenLink.show();

                    actionNode.showLoading();
                    actionNode.hideError();
                    GoNorth.HttpClient.post("/api/StyrApi/ResolveFlexFieldObjectNames", [ existingItemId ]).done(function(itemNames) {
                        if(itemNames.length == 0)
                        {
                            actionNode.hideLoading();
                            actionNode.showError();
                            return;
                        }

                        contentElement.find(".gn-nodeSelectItemAction").text(itemNames[0].name);
                        actionNode.hideLoading();
                    }).fail(function(xhr) {
                        actionNode.hideLoading();
                        actionNode.showError();
                    });
                }

                // Handlers
                var self = this;
                var selectItemAction = contentElement.find(".gn-nodeSelectItemAction");
                contentElement.find(".gn-nodeSelectItemAction").on("click", function() {
                    DefaultNodeShapes.openItemSearchDialog().then(function(item) {
                        selectItemAction.data("itemid", item.id);
                        selectItemAction.text(item.name);
                        self.saveData();

                        itemOpenLink.show();
                    });
                });

                var itemQuantity = contentElement.find(".gn-nodeItemQuantity");
                itemQuantity.keydown(function(e) {
                    GoNorth.Util.validateNumberKeyPress(itemQuantity, e);
                });

                itemQuantity.on("input", function(e) {
                    self.ensureNumberValue();
                    self.saveData();
                });

                itemOpenLink.on("click", function() {
                    if(selectItemAction.data("itemid"))
                    {
                        window.open("/Styr/Item?id=" + selectItemAction.data("itemid"));
                    }
                });
            };

            /**
             * Ensures a number value was entered for the item quantity
             */
            Actions.ChangeInventoryAction.prototype.ensureNumberValue = function() {
                var parsedValue = parseFloat(this.contentElement.find(".gn-nodeItemQuantity").val());
                if(isNaN(parsedValue))
                {
                    this.contentElement.find(".gn-nodeItemQuantity").val("");
                }
            };

            /**
             * Deserializes the data
             * @returns {string} Deserialized item id
             */
            Actions.ChangeInventoryAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return "";
                }

                var data = JSON.parse(actionData);
                
                var itemId = "";
                if(data.itemId)
                {
                    this.contentElement.find(".gn-nodeSelectItemAction").data("itemid", data.itemId);
                    itemId = data.itemId;
                }
                else
                {
                    this.contentElement.find(".gn-nodeSelectItemAction").data("itemid", "");
                }

                var quantity = data.quantity;
                if(isNaN(parseInt(data.quantity)))
                {
                    quantity = "";
                }
                this.contentElement.find(".gn-nodeItemQuantity").val(quantity);

                return itemId;
            }

            /**
             * Saves the data
             */
            Actions.ChangeInventoryAction.prototype.saveData = function() {
                var itemId = this.contentElement.find(".gn-nodeSelectItemAction").data("itemid");
                var quantity = parseInt(this.contentElement.find(".gn-nodeItemQuantity").val());
                if(isNaN(quantity))
                {
                    quantity = null;
                }

                var serializeData = {
                    itemId: itemId,
                    quantity: quantity
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));

                // Set related object data
                this.nodeModel.set("actionRelatedToObjectType", GoNorth.DefaultNodeShapes.Actions.RelatedToObjectItem);
                this.nodeModel.set("actionRelatedToObjectId", itemId);
            }

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /**
             * Change Inventory choose npc Action
             * @class
             */
            Actions.ChangeInventoryChooseNpcAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
            };

            Actions.ChangeInventoryChooseNpcAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.ChangeInventoryChooseNpcAction.prototype.getContent = function() {
                return  "<div class='gn-actionNodeObjectSelectContainer'>" + 
                            "<a class='gn-clickable gn-nodeSelectItemAction gn-nodeNonClickableOnReadonly'></a>&nbsp;" +
                            "<a class='gn-clickable gn-nodeActionOpenItem' title='" + DefaultNodeShapes.Localization.Actions.OpenItemTooltip + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>" +
                        "<div class='gn-actionNodeObjectSelectionSeperator'>" + DefaultNodeShapes.Localization.Actions.InInventoryOf + "</div>" +
                        "<div class='gn-actionNodeObjectSelectContainer'>" + 
                            "<a class='gn-clickable gn-nodeSelectNpcAction gn-nodeNonClickableOnReadonly'></a>&nbsp;" +
                            "<a class='gn-clickable gn-nodeActionOpenNpc' title='" + DefaultNodeShapes.Localization.Actions.OpenNpcTooltip + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>" +
                        "<div class='gn-nodeActionText'>" + DefaultNodeShapes.Localization.Actions.ItemQuantity + "</div>" +
                        "<input type='text' class='gn-nodeItemQuantity'/>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.ChangeInventoryChooseNpcAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;
                this.contentElement.find(".gn-nodeSelectItemAction").text(DefaultNodeShapes.Localization.Actions.ChooseItem);
                this.contentElement.find(".gn-nodeSelectNpcAction").text(DefaultNodeShapes.Localization.Actions.ChooseNpc);

                var itemOpenLink = contentElement.find(".gn-nodeActionOpenItem");
                var npcOpenLink = contentElement.find(".gn-nodeActionOpenNpc");

                // Deserialize
                var existingIds = this.deserializeData();
                var loadingDefs = [];
                if(existingIds.itemId)
                {
                    itemOpenLink.show();

                    var itemDef = new jQuery.Deferred();
                    loadingDefs.push(itemDef);
                    GoNorth.HttpClient.post("/api/StyrApi/ResolveFlexFieldObjectNames", [ existingIds.itemId ]).done(function(itemNames) {
                        if(itemNames.length == 0)
                        {
                            itemDef.reject();
                            return;
                        }

                        contentElement.find(".gn-nodeSelectItemAction").text(itemNames[0].name);
                        itemDef.resolve();
                    }).fail(function(xhr) {
                        itemDef.reject();
                    });
                }

                if(existingIds.npcId)
                {
                    npcOpenLink.show();

                    var npcDef = new jQuery.Deferred();
                    loadingDefs.push(npcDef);
                    GoNorth.HttpClient.post("/api/KortistoApi/ResolveFlexFieldObjectNames", [ existingIds.npcId ]).done(function(npcNames) {
                        if(npcNames.length == 0)
                        {
                            npcDef.reject();
                            return;
                        }

                        contentElement.find(".gn-nodeSelectNpcAction").text(npcNames[0].name);
                        npcDef.resolve();
                    }).fail(function(xhr) {
                        npcDef.reject();
                    });
                }

                if(loadingDefs.length > 0)
                {
                    actionNode.showLoading();
                    actionNode.hideError();
                    jQuery.when.apply(jQuery, loadingDefs).done(function() {
                        actionNode.hideLoading();
                    }).fail(function() {
                        actionNode.hideLoading();
                        actionNode.showError();
                    })
                }

                // Handlers
                var self = this;
                var selectItemAction = contentElement.find(".gn-nodeSelectItemAction");
                selectItemAction.on("click", function() {
                    DefaultNodeShapes.openItemSearchDialog().then(function(item) {
                        selectItemAction.data("itemid", item.id);
                        selectItemAction.text(item.name);
                        self.saveData();

                        itemOpenLink.show();
                    });
                });

                var selectNpcAction = contentElement.find(".gn-nodeSelectNpcAction");
                selectNpcAction.on("click", function() {
                    DefaultNodeShapes.openNpcSearchDialog().then(function(npc) {
                        selectNpcAction.data("npcid", npc.id);
                        selectNpcAction.text(npc.name);
                        self.saveData();

                        npcOpenLink.show();
                    });
                });  

                var itemQuantity = contentElement.find(".gn-nodeItemQuantity");
                itemQuantity.keydown(function(e) {
                    GoNorth.Util.validateNumberKeyPress(itemQuantity, e);
                });

                itemQuantity.on("input", function(e) {
                    self.ensureNumberValue();
                    self.saveData();
                });

                itemOpenLink.on("click", function() {
                    if(selectItemAction.data("itemid"))
                    {
                        window.open("/Styr/Item?id=" + selectItemAction.data("itemid"));
                    }
                });
                
                npcOpenLink.on("click", function() {
                    if(selectNpcAction.data("npcid"))
                    {
                        window.open("/Kortisto/Npc?id=" + selectNpcAction.data("npcid"));
                    }
                });
            };

            /**
             * Ensures a number value was entered for the item quantity
             */
            Actions.ChangeInventoryChooseNpcAction.prototype.ensureNumberValue = function() {
                var parsedValue = parseFloat(this.contentElement.find(".gn-nodeItemQuantity").val());
                if(isNaN(parsedValue))
                {
                    this.contentElement.find(".gn-nodeItemQuantity").val("");
                }
            };

            /**
             * Deserializes the data
             * @returns {object} Deserialized ids
             */
            Actions.ChangeInventoryChooseNpcAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return "";
                }

                var data = JSON.parse(actionData);
                
                var itemId = "";
                if(data.itemId)
                {
                    this.contentElement.find(".gn-nodeSelectItemAction").data("itemid", data.itemId);
                    itemId = data.itemId;
                }
                else
                {
                    this.contentElement.find(".gn-nodeSelectItemAction").data("itemid", "");
                }

                var npcId = "";
                if(data.npcId)
                {
                    this.contentElement.find(".gn-nodeSelectNpcAction").data("npcid", data.npcId);
                    npcId = data.npcId;
                }
                else
                {
                    this.contentElement.find(".gn-nodeSelectNpcAction").data("npcid", "");
                }

                var quantity = data.quantity;
                if(isNaN(parseInt(data.quantity)))
                {
                    quantity = "";
                }
                this.contentElement.find(".gn-nodeItemQuantity").val(quantity);

                return {
                    itemId: itemId,
                    npcId: npcId
                };
            }

            /**
             * Saves the data
             */
            Actions.ChangeInventoryChooseNpcAction.prototype.saveData = function() {
                var itemId = this.contentElement.find(".gn-nodeSelectItemAction").data("itemid");
                var npcId = this.contentElement.find(".gn-nodeSelectNpcAction").data("npcid");
                var quantity = parseInt(this.contentElement.find(".gn-nodeItemQuantity").val());
                if(isNaN(quantity))
                {
                    quantity = null;
                }

                var serializeData = {
                    itemId: itemId,
                    npcId: npcId,
                    quantity: quantity
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));

                // Set related object data
                this.nodeModel.set("actionRelatedToObjectType", Actions.RelatedToObjectItem);
                this.nodeModel.set("actionRelatedToObjectId", itemId);

                var additionalRelatedObjects = [];
                if(npcId)
                {
                    additionalRelatedObjects.push({
                        objectType: Actions.RelatedToObjectNpc,
                        objectId: npcId
                    });
                }

                this.nodeModel.set("actionRelatedToAdditionalObjects", additionalRelatedObjects);
            }

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for spawning an item in the player inventory
            var actionTypeSpawnItemInPlayerInventory = 3;

            /**
             * Spawn item in player inventory Action
             * @class
             */
            Actions.SpawnItemInPlayerInventoryAction = function()
            {
                Actions.ChangeInventoryAction.apply(this);
            };

            Actions.SpawnItemInPlayerInventoryAction.prototype = jQuery.extend({ }, Actions.ChangeInventoryAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.SpawnItemInPlayerInventoryAction.prototype.buildAction = function() {
                return new Actions.SpawnItemInPlayerInventoryAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.SpawnItemInPlayerInventoryAction.prototype.getType = function() {
                return actionTypeSpawnItemInPlayerInventory;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.SpawnItemInPlayerInventoryAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.SpawnItemInPlayerInventoryLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.SpawnItemInPlayerInventoryAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for spawning an item in the npc inventory
            var actionTypeSpawnItemInNpcInventory = 4;

            /**
             * Spawn item in npc inventory Action
             * @class
             */
            Actions.SpawnItemInNpcInventoryAction = function()
            {
                Actions.ChangeInventoryAction.apply(this);
            };

            Actions.SpawnItemInNpcInventoryAction.prototype = jQuery.extend({ }, Actions.ChangeInventoryAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.SpawnItemInNpcInventoryAction.prototype.buildAction = function() {
                return new Actions.SpawnItemInNpcInventoryAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.SpawnItemInNpcInventoryAction.prototype.getType = function() {
                return actionTypeSpawnItemInNpcInventory;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.SpawnItemInNpcInventoryAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.SpawnItemInNpcInventoryLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.SpawnItemInNpcInventoryAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for spawning an item in the npc inventory of an npc that can be chosen
            var actionTypeSpawnItemInChooseNpcInventory = 51;

            /**
             * Spawn item in choose npc inventory Action
             * @class
             */
            Actions.SpawnItemInChooseNpcInventoryAction = function()
            {
                Actions.ChangeInventoryChooseNpcAction.apply(this);
            };

            Actions.SpawnItemInChooseNpcInventoryAction.prototype = jQuery.extend({ }, Actions.ChangeInventoryChooseNpcAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.SpawnItemInChooseNpcInventoryAction.prototype.buildAction = function() {
                return new Actions.SpawnItemInChooseNpcInventoryAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.SpawnItemInChooseNpcInventoryAction.prototype.getType = function() {
                return actionTypeSpawnItemInChooseNpcInventory;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.SpawnItemInChooseNpcInventoryAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.SpawnItemInChooseNpcInventoryLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.SpawnItemInChooseNpcInventoryAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for transfering an item from the npc inventory to the player inventory
            var actionTypeTransferItemToPlayerInventory = 5;

            /**
             * Transfer item from the npc inventory to the player inventory Action
             * @class
             */
            Actions.TransferItemToPlayerInventoryAction = function()
            {
                Actions.ChangeInventoryAction.apply(this);
            };

            Actions.TransferItemToPlayerInventoryAction.prototype = jQuery.extend({ }, Actions.ChangeInventoryAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.TransferItemToPlayerInventoryAction.prototype.buildAction = function() {
                return new Actions.TransferItemToPlayerInventoryAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.TransferItemToPlayerInventoryAction.prototype.getType = function() {
                return actionTypeTransferItemToPlayerInventory;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.TransferItemToPlayerInventoryAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.TransferItemToPlayerInventoryLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.TransferItemToPlayerInventoryAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for transfering an item from the player inventory to the npc inventory
            var actionTypeTransferItemToNpcInventory = 6;

            /**
             * Transfer item from the player inventory to the npc inventory Action
             * @class
             */
            Actions.TransferItemNpcInventoryAction = function()
            {
                Actions.ChangeInventoryAction.apply(this);
            };

            Actions.TransferItemNpcInventoryAction.prototype = jQuery.extend({ }, Actions.ChangeInventoryAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.TransferItemNpcInventoryAction.prototype.buildAction = function() {
                return new Actions.TransferItemNpcInventoryAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.TransferItemNpcInventoryAction.prototype.getType = function() {
                return actionTypeTransferItemToNpcInventory;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.TransferItemNpcInventoryAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.TransferItemToNpcInventoryLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.TransferItemNpcInventoryAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for remove an item from the npc inventory
            var actionTypeRemoveItemFromNpcInventory = 34;

            /**
             * Remove item from npc inventory Action
             * @class
             */
            Actions.RemoveItemFromNpcInventoryAction = function()
            {
                Actions.ChangeInventoryAction.apply(this);
            };

            Actions.RemoveItemFromNpcInventoryAction.prototype = jQuery.extend({ }, Actions.ChangeInventoryAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.RemoveItemFromNpcInventoryAction.prototype.buildAction = function() {
                return new Actions.RemoveItemFromNpcInventoryAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.RemoveItemFromNpcInventoryAction.prototype.getType = function() {
                return actionTypeRemoveItemFromNpcInventory;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.RemoveItemFromNpcInventoryAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.RemoveItemFromNpcInventoryLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.RemoveItemFromNpcInventoryAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for remove an item from the player inventory
            var actionTypeRemoveItemFromPlayerInventory = 35;

            /**
             * Remove item from player inventory Action
             * @class
             */
            Actions.RemoveItemFromPlayerInventoryAction = function()
            {
                Actions.ChangeInventoryAction.apply(this);
            };

            Actions.RemoveItemFromPlayerInventoryAction.prototype = jQuery.extend({ }, Actions.ChangeInventoryAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.RemoveItemFromPlayerInventoryAction.prototype.buildAction = function() {
                return new Actions.RemoveItemFromPlayerInventoryAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.RemoveItemFromPlayerInventoryAction.prototype.getType = function() {
                return actionTypeRemoveItemFromPlayerInventory;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.RemoveItemFromPlayerInventoryAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.RemoveItemFromPlayerInventoryLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.RemoveItemFromPlayerInventoryAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for removing an item in the npc inventory of an npc that can be chosen
            var actionTypeRemoveItemFromChooseNpcInventory = 52;

            /**
             * Remove item from choose npc inventory Action
             * @class
             */
            Actions.RemoveItemFromChooseNpcInventoryAction = function()
            {
                Actions.ChangeInventoryChooseNpcAction.apply(this);
            };

            Actions.RemoveItemFromChooseNpcInventoryAction.prototype = jQuery.extend({ }, Actions.ChangeInventoryChooseNpcAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.RemoveItemFromChooseNpcInventoryAction.prototype.buildAction = function() {
                return new Actions.RemoveItemFromChooseNpcInventoryAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.RemoveItemFromChooseNpcInventoryAction.prototype.getType = function() {
                return actionTypeRemoveItemFromChooseNpcInventory;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.RemoveItemFromChooseNpcInventoryAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.RemoveItemFromChooseNpcInventoryLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.RemoveItemFromChooseNpcInventoryAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /**
             * Object Use Item Action
             * @class
             */
            Actions.ObjectUseItemAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
            };

            Actions.ObjectUseItemAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.ObjectUseItemAction.prototype.getContent = function() {
                return  "<div class='gn-actionNodeObjectSelectContainer'>" + 
                            "<a class='gn-clickable gn-nodeSelectItemAction gn-nodeNonClickableOnReadonly'></a>&nbsp;" +
                            "<a class='gn-clickable gn-nodeActionOpenItem' title='" + DefaultNodeShapes.Localization.Actions.OpenItemTooltip + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.ObjectUseItemAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;
                this.contentElement.find(".gn-nodeSelectItemAction").text(DefaultNodeShapes.Localization.Actions.ChooseItem);

                var itemOpenLink = contentElement.find(".gn-nodeActionOpenItem");

                // Deserialize
                var existingItemId = this.deserializeData();
                if(existingItemId)
                {
                    itemOpenLink.show();

                    actionNode.showLoading();
                    actionNode.hideError();
                    GoNorth.HttpClient.post("/api/StyrApi/ResolveFlexFieldObjectNames", [ existingItemId ]).done(function(itemNames) {
                        if(itemNames.length == 0)
                        {
                            actionNode.hideLoading();
                            actionNode.showError();
                            return;
                        }

                        contentElement.find(".gn-nodeSelectItemAction").text(itemNames[0].name);
                        actionNode.hideLoading();
                    }).fail(function(xhr) {
                        actionNode.hideLoading();
                        actionNode.showError();
                    });
                }

                // Handlers
                var self = this;
                var selectItemAction = contentElement.find(".gn-nodeSelectItemAction");
                contentElement.find(".gn-nodeSelectItemAction").on("click", function() {
                    DefaultNodeShapes.openItemSearchDialog().then(function(item) {
                        selectItemAction.data("itemid", item.id);
                        selectItemAction.text(item.name);
                        self.saveData();

                        itemOpenLink.show();
                    });
                });

                itemOpenLink.on("click", function() {
                    if(selectItemAction.data("itemid"))
                    {
                        window.open("/Styr/Item?id=" + selectItemAction.data("itemid"));
                    }
                });
            };

            /**
             * Deserializes the data
             * @returns {string} Deserialized item id
             */
            Actions.ObjectUseItemAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return "";
                }

                var data = JSON.parse(actionData);
                
                var itemId = "";
                if(data.itemId)
                {
                    this.contentElement.find(".gn-nodeSelectItemAction").data("itemid", data.itemId);
                    itemId = data.itemId;
                }
                else
                {
                    this.contentElement.find(".gn-nodeSelectItemAction").data("itemid", "");
                }

                return itemId;
            }

            /**
             * Saves the data
             */
            Actions.ObjectUseItemAction.prototype.saveData = function() {
                var itemId = this.contentElement.find(".gn-nodeSelectItemAction").data("itemid");

                var serializeData = {
                    itemId: itemId
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));

                // Set related object data
                this.nodeModel.set("actionRelatedToObjectType", GoNorth.DefaultNodeShapes.Actions.RelatedToObjectItem);
                this.nodeModel.set("actionRelatedToObjectId", itemId);
            }

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for the npc using an item
            var actionTypeNpcUseItem = 53;

            /**
             * Npc uses an item action
             * @class
             */
            Actions.NpcUseItemAction = function()
            {
                Actions.ObjectUseItemAction.apply(this);
            };

            Actions.NpcUseItemAction.prototype = jQuery.extend({ }, Actions.ObjectUseItemAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.NpcUseItemAction.prototype.buildAction = function() {
                return new Actions.NpcUseItemAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.NpcUseItemAction.prototype.getType = function() {
                return actionTypeNpcUseItem;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.NpcUseItemAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.NpcUseItemLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.NpcUseItemAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for the player using an item
            var actionTypePlayerUseItem = 54;

            /**
             * Player uses an item action
             * @class
             */
            Actions.PlayerUseItemAction = function()
            {
                Actions.ObjectUseItemAction.apply(this);
            };

            Actions.PlayerUseItemAction.prototype = jQuery.extend({ }, Actions.ObjectUseItemAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.PlayerUseItemAction.prototype.buildAction = function() {
                return new Actions.PlayerUseItemAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.PlayerUseItemAction.prototype.getType = function() {
                return actionTypePlayerUseItem;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.PlayerUseItemAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.PlayerUseItemLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.PlayerUseItemAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for a choose npc using an item
            var actionTypeNpcUseItem = 55;

            /**
             * Choose Npc Use Item Action
             * @class
             */
            Actions.ChooseNpcUseItemAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
            };

            Actions.ChooseNpcUseItemAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.ChooseNpcUseItemAction.prototype.buildAction = function() {
                return new Actions.ChooseNpcUseItemAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.ChooseNpcUseItemAction.prototype.getType = function() {
                return actionTypeNpcUseItem;
            };
            
            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.ChooseNpcUseItemAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.ChooseNpcUseItemLabel;
            };

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.ChooseNpcUseItemAction.prototype.getContent = function() {
                return "<div class='gn-actionNodeObjectSelectContainer'>" + 
                            "<a class='gn-clickable gn-nodeSelectNpcAction gn-nodeNonClickableOnReadonly'></a>&nbsp;" +
                            "<a class='gn-clickable gn-nodeActionOpenNpc' title='" + DefaultNodeShapes.Localization.Actions.OpenNpcTooltip + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>" +
                        "<div class='gn-nodeActionText'>" + DefaultNodeShapes.Localization.Actions.UsesItem + "</div>" +
                        "<div class='gn-actionNodeObjectSelectContainer'>" + 
                            "<a class='gn-clickable gn-nodeSelectItemAction gn-nodeNonClickableOnReadonly'></a>&nbsp;" +
                            "<a class='gn-clickable gn-nodeActionOpenItem' title='" + DefaultNodeShapes.Localization.Actions.OpenItemTooltip + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.ChooseNpcUseItemAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;
                this.contentElement.find(".gn-nodeSelectNpcAction").text(DefaultNodeShapes.Localization.Actions.ChooseNpc);
                this.contentElement.find(".gn-nodeSelectItemAction").text(DefaultNodeShapes.Localization.Actions.ChooseItem);

                var npcOpenLink = contentElement.find(".gn-nodeActionOpenNpc");
                var itemOpenLink = contentElement.find(".gn-nodeActionOpenItem");

                // Deserialize
                var existingIds = this.deserializeData();
                var loadingDefs = [];
                if(existingIds.itemId)
                {
                    itemOpenLink.show();
                    
                    var itemDef = new jQuery.Deferred();
                    loadingDefs.push(itemDef);
                    GoNorth.HttpClient.post("/api/StyrApi/ResolveFlexFieldObjectNames", [ existingIds.itemId ]).done(function(itemNames) {
                        if(itemNames.length == 0)
                        {
                            itemDef.reject();
                            return;
                        }

                        contentElement.find(".gn-nodeSelectItemAction").text(itemNames[0].name);
                        itemDef.resolve();
                    }).fail(function(xhr) {
                        itemDef.reject();
                    });
                }

                if(existingIds.npcId)
                {
                    npcOpenLink.show();

                    var npcDef = new jQuery.Deferred();
                    loadingDefs.push(npcDef);
                    GoNorth.HttpClient.post("/api/KortistoApi/ResolveFlexFieldObjectNames", [ existingIds.npcId ]).done(function(npcNames) {
                        if(npcNames.length == 0)
                        {
                            npcDef.reject();
                            return;
                        }

                        contentElement.find(".gn-nodeSelectNpcAction").text(npcNames[0].name);
                        npcDef.resolve();
                    }).fail(function(xhr) {
                        npcDef.reject();
                    });
                }

                if(loadingDefs.length > 0)
                {
                    actionNode.showLoading();
                    actionNode.hideError();
                    jQuery.when.apply(jQuery, loadingDefs).done(function() {
                        actionNode.hideLoading();
                    }).fail(function() {
                        actionNode.hideLoading();
                        actionNode.showError();
                    })
                }

                // Handlers
                var self = this;
                var selectNpcAction = contentElement.find(".gn-nodeSelectNpcAction");
                selectNpcAction.on("click", function() {
                    DefaultNodeShapes.openNpcSearchDialog().then(function(npc) {
                        selectNpcAction.data("npcid", npc.id);
                        selectNpcAction.text(npc.name);
                        self.saveData();

                        npcOpenLink.show();
                    });
                });  

                var selectItemAction = contentElement.find(".gn-nodeSelectItemAction");
                contentElement.find(".gn-nodeSelectItemAction").on("click", function() {
                    DefaultNodeShapes.openItemSearchDialog().then(function(item) {
                        selectItemAction.data("itemid", item.id);
                        selectItemAction.text(item.name);
                        self.saveData();

                        itemOpenLink.show();
                    });
                });

                itemOpenLink.on("click", function() {
                    if(selectItemAction.data("itemid"))
                    {
                        window.open("/Styr/Item?id=" + selectItemAction.data("itemid"));
                    }
                });   

                npcOpenLink.on("click", function() {
                    if(selectNpcAction.data("npcid"))
                    {
                        window.open("/Kortisto/Npc?id=" + selectNpcAction.data("npcid"));
                    }
                });
            };

            /**
             * Deserializes the data
             * @returns {string} Deserialized item id
             */
            Actions.ChooseNpcUseItemAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return "";
                }

                var data = JSON.parse(actionData);
                
                var itemId = "";
                if(data.itemId)
                {
                    this.contentElement.find(".gn-nodeSelectItemAction").data("itemid", data.itemId);
                    itemId = data.itemId;
                }
                else
                {
                    this.contentElement.find(".gn-nodeSelectItemAction").data("itemid", "");
                }

                var npcId = "";
                if(data.npcId)
                {
                    this.contentElement.find(".gn-nodeSelectNpcAction").data("npcid", data.npcId);
                    npcId = data.npcId;
                }
                else
                {
                    this.contentElement.find(".gn-nodeSelectNpcAction").data("npcid", "");
                }

                return {
                    itemId: itemId,
                    npcId: npcId
                };
            }

            /**
             * Saves the data
             */
            Actions.ChooseNpcUseItemAction.prototype.saveData = function() {
                var npcId = this.contentElement.find(".gn-nodeSelectNpcAction").data("npcid");
                var itemId = this.contentElement.find(".gn-nodeSelectItemAction").data("itemid");

                var serializeData = {
                    npcId: npcId,
                    itemId: itemId
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));

                // Set related object data
                this.nodeModel.set("actionRelatedToObjectType", GoNorth.DefaultNodeShapes.Actions.RelatedToObjectItem);
                this.nodeModel.set("actionRelatedToObjectId", itemId);
                if(npcId) 
                {
                    this.nodeModel.set("actionRelatedToAdditionalObjects", [{
                        objectType: GoNorth.DefaultNodeShapes.Actions.RelatedToObjectNpc,
                        objectId: npcId
                    }]);
                } 
                else 
                {
                    this.nodeModel.set("actionRelatedToAdditionalObjects", []);
                }
            }

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.ChooseNpcUseItemAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for changing a quest value
            var actionTypeChangeQuestValue = 8;

            /**
             * Change quest value Action
             * @class
             */
            Actions.ChangeQuestValueAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.ChangeValueChooseObjectAction.apply(this);
            };

            Actions.ChangeQuestValueAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.ChangeValueChooseObjectAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.ChangeQuestValueAction.prototype.buildAction = function() {
                return new Actions.ChangeQuestValueAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.ChangeQuestValueAction.prototype.getType = function() {
                return actionTypeChangeQuestValue;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.ChangeQuestValueAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.ChangeQuestValueLabel;
            };

            /**
             * Returns the choose object label
             * 
             * @returns {string} Choose object label
             */
            Actions.ChangeQuestValueAction.prototype.getChooseLabel = function() {
                return DefaultNodeShapes.Localization.Actions.ChooseQuestLabel;
            };

            /**
             * Returns the open object tool label
             * 
             * @returns {string} Open object label
             */
            Actions.ChangeQuestValueAction.prototype.getOpenObjectTooltip = function() {
                return DefaultNodeShapes.Localization.Actions.OpenQuestTooltip;
            };

            /**
             * Opens the object
             * @param {string} id Id of the object
             */
            Actions.ChangeQuestValueAction.prototype.openObject = function(id) {
                window.open("/Aika/Quest?id=" + encodeURIComponent(id));
            };

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Actions.ChangeQuestValueAction.prototype.getObjectTypeName = function() {
                return Actions.RelatedToObjectQuest;
            };
            
            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.ChangeQuestValueAction.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceQuest;
            };

            /**
             * Opens the search dialog
             * 
             * @returns {jQuery.Deferred} Deferred for the picking
             */
            Actions.ChangeQuestValueAction.prototype.openSearchDialog = function() {
                return GoNorth.DefaultNodeShapes.openQuestSearchDialog();
            };

            /**
             * Loads the quest
             * 
             * @returns {jQuery.Deferred} Deferred for the quest loading
             */
            Actions.ChangeQuestValueAction.prototype.loadObject = function() {
                var def = new jQuery.Deferred();

                GoNorth.HttpClient.get("/api/AikaApi/GetQuest?id=" + this.nodeModel.get("objectId")).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.ChangeQuestValueAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for changing a quest state
            Actions.actionTypeChangeQuestState = 9;

            /**
             * Set Quest State Action
             * @class
             */
            Actions.SetQuestStateAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Actions.SetQuestStateAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);
            Actions.SetQuestStateAction.prototype = jQuery.extend(Actions.SetQuestStateAction.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.SetQuestStateAction.prototype.getContent = function() {
                return  "<div class='gn-actionNodeObjectSelectContainer'>" + 
                            "<a class='gn-clickable gn-nodeActionSelectQuest gn-nodeNonClickableOnReadonly'></a>&nbsp;" +
                            "<a class='gn-clickable gn-nodeActionOpenQuest' title='" + DefaultNodeShapes.Localization.Actions.OpenQuestTooltip + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>" +
                        "<div class='gn-nodeActionText'>" + DefaultNodeShapes.Localization.Actions.QuestState + "</div>" +
                        "<select class='gn-nodeActionQuestState'></select>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.SetQuestStateAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;
                this.contentElement.find(".gn-nodeActionSelectQuest").html(DefaultNodeShapes.Localization.Actions.ChooseQuestLabel);
                GoNorth.Util.fillSelectFromArray(this.contentElement.find(".gn-nodeActionQuestState"), DefaultNodeShapes.Shapes.getQuestStates(), function(questState) { return questState.questState; }, function(questState) { return questState.label; });

                var questOpenLink = contentElement.find(".gn-nodeActionOpenQuest");

                // Deserialize
                var existingQuestId = this.deserializeData();
                if(existingQuestId)
                {
                    questOpenLink.show();

                    actionNode.showLoading();
                    actionNode.hideError();

                    this.loadObjectShared(existingQuestId).then(function(quest) {
                        contentElement.find(".gn-nodeActionSelectQuest").text(quest.name);
                        actionNode.hideLoading();
                    }).fail(function(xhr) {
                        actionNode.hideLoading();
                        actionNode.showError();
                    });
                }

                // Handlers
                var self = this;
                var selectQuestAction = contentElement.find(".gn-nodeActionSelectQuest");
                contentElement.find(".gn-nodeActionSelectQuest").on("click", function() {
                    DefaultNodeShapes.openQuestSearchDialog().then(function(quest) {
                        selectQuestAction.data("questid", quest.id);
                        selectQuestAction.text(quest.name);
                        self.saveData();

                        questOpenLink.show();
                    });
                });

                var questState = contentElement.find(".gn-nodeActionQuestState");
                questState.change(function(e) {
                    self.saveData();
                });

                questOpenLink.on("click", function() {
                    if(selectQuestAction.data("questid"))
                    {
                        window.open("/Aika/Quest?id=" + selectQuestAction.data("questid"));
                    }
                });
            };

            /**
             * Deserializes the data
             * 
             * @returns {string} Id of the selected quest
             */
            Actions.SetQuestStateAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return "";
                }

                var data = JSON.parse(actionData);
                
                var questId = "";
                if(data.questId)
                {
                    this.contentElement.find(".gn-nodeActionSelectQuest").data("questid", data.questId);
                    questId = data.questId;
                }
                else
                {
                    this.contentElement.find(".gn-nodeActionSelectQuest").data("questid", "");
                }

                this.contentElement.find(".gn-nodeActionQuestState").find("option[value='" + data.questState + "']").prop("selected", true);

                return questId;
            }

            /**
             * Saves the data
             */
            Actions.SetQuestStateAction.prototype.saveData = function() {
                // The serialized data is also used in the Aika changeQuestStateInNpcDialogAction. If anything changes this must be taken into consideration.
                
                var questId = this.getObjectId();
                var questState = this.contentElement.find(".gn-nodeActionQuestState").val();
                var serializeData = {
                    questId: questId,
                    questState: questState
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));

                // Set related object data
                this.nodeModel.set("actionRelatedToObjectType", this.getObjectTypeName());
                this.nodeModel.set("actionRelatedToObjectId", questId);
            }

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.SetQuestStateAction.prototype.buildAction = function() {
                return new Actions.SetQuestStateAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.SetQuestStateAction.prototype.getType = function() {
                return Actions.actionTypeChangeQuestState;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.SetQuestStateAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.SetQuestStateLabel;
            };

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Actions.SetQuestStateAction.prototype.getObjectTypeName = function() {
                return Actions.RelatedToObjectQuest;
            };

            /**
             * Returns the object id
             * 
             * @returns {string} Object Id
             */
            Actions.SetQuestStateAction.prototype.getObjectId = function() {
                return this.contentElement.find(".gn-nodeActionSelectQuest").data("questid");
            };
            
            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.SetQuestStateAction.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceQuest;
            };

            /**
             * Loads the quest
             * 
             * @param {string} questId Quest Id
             * @returns {jQuery.Deferred} Deferred for the quest loading
             */
            Actions.SetQuestStateAction.prototype.loadObject = function(questId) {
                var def = new jQuery.Deferred();

                GoNorth.HttpClient.get("/api/AikaApi/GetQuest?id=" + questId).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.SetQuestStateAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for adding text to a quest
            Actions.actionTypeAddQuestToText = 10;

            /**
             * Add Text to Quest Action
             * @class
             */
            Actions.AddQuestTextAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Actions.AddQuestTextAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);
            Actions.AddQuestTextAction.prototype = jQuery.extend(Actions.AddQuestTextAction.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.AddQuestTextAction.prototype.getContent = function() {
                return  "<div class='gn-actionNodeObjectSelectContainer'>" + 
                            "<a class='gn-clickable gn-nodeActionSelectQuest gn-nodeNonClickableOnReadonly'></a>&nbsp;" +
                            "<a class='gn-clickable gn-nodeActionOpenQuest' title='" + DefaultNodeShapes.Localization.Actions.OpenQuestTooltip + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>" +
                        "<div class='gn-nodeActionText'>" + DefaultNodeShapes.Localization.Actions.QuestText + "</div>" +
                        "<textarea class='gn-nodeActionQuestText'></textarea>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.AddQuestTextAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;
                this.contentElement.find(".gn-nodeActionSelectQuest").html(DefaultNodeShapes.Localization.Actions.ChooseQuestLabel);

                var questOpenLink = contentElement.find(".gn-nodeActionOpenQuest");

                // Deserialize
                var existingQuestId = this.deserializeData();
                if(existingQuestId)
                {
                    questOpenLink.show();

                    actionNode.showLoading();
                    actionNode.hideError();

                    this.loadObjectShared(existingQuestId).then(function(quest) {
                        contentElement.find(".gn-nodeActionSelectQuest").text(quest.name);
                        actionNode.hideLoading();
                    }).fail(function(xhr) {
                        actionNode.hideLoading();
                        actionNode.showError();
                    });
                }

                // Handlers
                var self = this;
                var selectQuestAction = contentElement.find(".gn-nodeActionSelectQuest");
                contentElement.find(".gn-nodeActionSelectQuest").on("click", function() {
                    DefaultNodeShapes.openQuestSearchDialog().then(function(quest) {
                        selectQuestAction.data("questid", quest.id);
                        selectQuestAction.text(quest.name);
                        self.saveData();
                        
                        questOpenLink.show();
                    });
                });

                var questText = contentElement.find(".gn-nodeActionQuestText");
                questText.on("input", function(e) {
                    self.saveData();
                });

                questOpenLink.on("click", function() {
                    if(selectQuestAction.data("questid"))
                    {
                        window.open("/Aika/Quest?id=" + selectQuestAction.data("questid"));
                    }
                });
            };

            /**
             * Deserializes the data
             */
            Actions.AddQuestTextAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return "";
                }

                var data = JSON.parse(actionData);
                
                var questId = "";
                if(data.questId)
                {
                    this.contentElement.find(".gn-nodeActionSelectQuest").data("questid", data.questId);
                    questId = data.questId;
                }
                else
                {
                    this.contentElement.find(".gn-nodeActionSelectQuest").data("questid", "");
                }

                this.contentElement.find(".gn-nodeActionQuestText").val(data.questText);

                return questId;
            }

            /**
             * Saves the data
             */
            Actions.AddQuestTextAction.prototype.saveData = function() {
                // The serialized data is also used in the Aika changeQuestTextInNpcDialogAction. If anything changes this must be taken into consideration.
                
                var questId = this.getObjectId();
                var questText = this.contentElement.find(".gn-nodeActionQuestText").val();
                var serializeData = {
                    questId: questId,
                    questText: questText
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));

                // Set related object data
                this.nodeModel.set("actionRelatedToObjectType", GoNorth.DefaultNodeShapes.Actions.RelatedToObjectQuest);
                this.nodeModel.set("actionRelatedToObjectId", questId);
            }

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.AddQuestTextAction.prototype.buildAction = function() {
                return new Actions.AddQuestTextAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.AddQuestTextAction.prototype.getType = function() {
                return Actions.actionTypeAddQuestToText;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.AddQuestTextAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.AddQuestTextLabel;
            };

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Actions.AddQuestTextAction.prototype.getObjectTypeName = function() {
                return Actions.RelatedToObjectQuest;
            };

            /**
             * Returns the object id
             * 
             * @returns {string} Object Id
             */
            Actions.AddQuestTextAction.prototype.getObjectId = function() {
                return this.contentElement.find(".gn-nodeActionSelectQuest").data("questid");
            };
            
            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.AddQuestTextAction.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceQuest;
            };

            /**
             * Loads the quest
             * 
             * @param {string} questId Quest Id
             * @returns {jQuery.Deferred} Deferred for the quest loading
             */
            Actions.AddQuestTextAction.prototype.loadObject = function(questId) {
                var def = new jQuery.Deferred();

                GoNorth.HttpClient.get("/api/AikaApi/GetQuest?id=" + questId).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Returns statistics for the action
             * @param {object} parsedActionData Parsed action data
             * @returns Node statistics
             */
            Actions.AddQuestTextAction.prototype.getStatistics = function(parsedActionData) {
                return {
                    wordCount: GoNorth.Util.getWordCount(parsedActionData.questText)
                };
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.AddQuestTextAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for waiting
            var actionTypeWait = 14;


            /// Wait Type for Waiting in Real Time
            var waitTypeRealTime = 0;

            /// Wait Type for Waiting in Game Time
            var waitTypeGameTime = 1;


            /// Wait unit for milliseconds
            var waitUnitMilliseconds = 0;

            /// Wait unit for seconds
            var waitUnitSeconds = 1;
            
            /// Wait unit for minutes
            var waitUnitMinutes = 2;

            /// Wait unit for hours
            var waitUnitHours = 3;
            
            /// Wait unit for days
            var waitUnitDays = 4;



            /**
             * Wait Action
             * @class
             */
            Actions.WaitAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
            };

            Actions.WaitAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.WaitAction.prototype.getContent = function() {
                return  "<input type='text' class='gn-actionNodeWaitAmount'/>" + 
                        "<select class='gn-actionNodeWaitType'></select>" +
                        "<select class='gn-actionNodeWaitUnit'></select>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.WaitAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;

                this.contentElement.find(".gn-actionNodeWaitAmount").val("0");

                var availableWaitTypes = [
                    {
                        label: DefaultNodeShapes.Localization.Actions.WaitTypeRealTime,
                        value: waitTypeRealTime
                    },
                    {
                        label: DefaultNodeShapes.Localization.Actions.WaitTypeGameTime,
                        value: waitTypeGameTime
                    }
                ];
                var waitType = contentElement.find(".gn-actionNodeWaitType");
                GoNorth.Util.fillSelectFromArray(waitType, availableWaitTypes, function(waitType) { return waitType.value; }, function(waitType) { return waitType.label; });

                var self = this;
                waitType.on("change", function() {
                    self.syncTimeUnits();
                    self.serialize();
                });

                this.syncTimeUnits();
                contentElement.find(".gn-actionNodeWaitUnit").on("change", function() {
                    self.serialize();
                });

                var waitAmount = contentElement.find(".gn-actionNodeWaitAmount");
                waitAmount.keydown(function(e) {
                    GoNorth.Util.validateNumberKeyPress(waitAmount, e);
                });

                waitAmount.change(function(e) {
                    if(self.isNumberValueSelected)
                    {
                        self.ensureNumberValue();
                    }

                    self.serialize();
                });

                this.deserialize();
            };

            /**
             * Syncs the time units
             */
            Actions.WaitAction.prototype.syncTimeUnits = function() {
                var availableUnits = [
                    {
                        label: DefaultNodeShapes.Localization.Actions.WaitUnitMilliseconds,
                        value: waitUnitMilliseconds
                    },
                    {
                        label: DefaultNodeShapes.Localization.Actions.WaitUnitSeconds,
                        value: waitUnitSeconds
                    },
                    {
                        label: DefaultNodeShapes.Localization.Actions.WaitUnitMinutes,
                        value: waitUnitMinutes
                    }
                ];

                if(this.contentElement.find(".gn-actionNodeWaitType").val() == waitTypeGameTime)
                {
                    availableUnits = [
                        {
                            label: DefaultNodeShapes.Localization.Actions.WaitUnitMinutes,
                            value: waitUnitMinutes
                        },
                        {
                            label: DefaultNodeShapes.Localization.Actions.WaitUnitHours,
                            value: waitUnitHours
                        },
                        {
                            label: DefaultNodeShapes.Localization.Actions.WaitUnitDays,
                            value: waitUnitDays
                        }
                    ];
                }

                GoNorth.Util.fillSelectFromArray(this.contentElement.find(".gn-actionNodeWaitUnit"), availableUnits, function(waitType) { return waitType.value; }, function(waitType) { return waitType.label; });
            };

            /**
             * Ensures the user entered a number if a number field was selected
             */
            Actions.WaitAction.prototype.ensureNumberValue = function() {
                var parsedValue = parseFloat(this.contentElement.find(".gn-actionNodeWaitAmount").val());
                if(isNaN(parsedValue))
                {
                    this.contentElement.find(".gn-actionNodeWaitAmount").val("0");
                }
            };

            /**
             * Deserializes the data
             */
            Actions.WaitAction.prototype.deserialize = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return "";
                }

                var data = JSON.parse(actionData);
                
                this.contentElement.find(".gn-actionNodeWaitAmount").val(data.waitAmount);
                this.contentElement.find(".gn-actionNodeWaitType").find("option[value='" + data.waitType + "']").prop("selected", true);
                this.syncTimeUnits();
                this.contentElement.find(".gn-actionNodeWaitUnit").find("option[value='" + data.waitUnit + "']").prop("selected", true);
            };

            /**
             * Saves the data
             */
            Actions.WaitAction.prototype.serialize = function() {
                var waitAmount = parseFloat(this.contentElement.find(".gn-actionNodeWaitAmount").val());
                if(isNaN(waitAmount))
                {
                    waitAmount = 0;
                }

                var waitType = this.contentElement.find(".gn-actionNodeWaitType").val();
                var waitUnit = this.contentElement.find(".gn-actionNodeWaitUnit").val();

                var serializeData = {
                    waitAmount: waitAmount,
                    waitType: waitType,
                    waitUnit: waitUnit
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));
            };

            /**
             * Returns the label for the main output
             * 
             * @returns {string} Label for the main output
             */
            Actions.WaitAction.prototype.getMainOutputLabel = function() {
                return DefaultNodeShapes.Localization.Actions.WaitLaterContinueLabel;
            };

            /**
             * Returns the additional outports of the action
             * 
             * @returns {string[]} Additional outports
             */
            Actions.WaitAction.prototype.getAdditionalOutports = function() {
                return [ DefaultNodeShapes.Localization.Actions.WaitDirectContinueLabel ];
            };

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.WaitAction.prototype.buildAction = function() {
                return new Actions.WaitAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.WaitAction.prototype.getType = function() {
                return actionTypeWait;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.WaitAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.WaitLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.WaitAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /**
             * Set Object State Action
             * @class
             */
            Actions.SetObjectStateAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
            };

            Actions.SetObjectStateAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.SetObjectStateAction.prototype.getContent = function() {
                return  "<input type='text' class='gn-nodeActionObjectState' placeholder='" + DefaultNodeShapes.Localization.Actions.StatePlaceholder + "' list='gn-" + GoNorth.ProjectConfig.ConfigKeys.SetNpcStateAction + "'/>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.SetObjectStateAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;

                // Deserialize
                this.deserializeData();

                // Handlers
                var self = this;
                var objectState = contentElement.find(".gn-nodeActionObjectState");
                objectState.on("input", function(e) {
                    self.saveData();
                });
            };

            /**
             * Deserializes the data
             */
            Actions.SetObjectStateAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return "";
                }

                var data = JSON.parse(actionData);
                
                this.contentElement.find(".gn-nodeActionObjectState").val(data.objectState);
            }

            /**
             * Saves the data
             */
            Actions.SetObjectStateAction.prototype.saveData = function() {
                var objectState = this.contentElement.find(".gn-nodeActionObjectState").val();
                var serializeData = {
                    objectState: objectState
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));
            }

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.SetObjectStateAction.prototype.buildAction = function() {
                return new Actions.SetObjectStateAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.SetObjectStateAction.prototype.getType = function() {
                return -1;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.SetObjectStateAction.prototype.getLabel = function() {
                return "";
            };

            /**
             * Returns the config key for the action
             * 
             * @returns {string} Config key
             */
            Actions.SetObjectStateAction.prototype.getConfigKey = function() {
                return GoNorth.ProjectConfig.ConfigKeys.SetNpcStateAction;
            }

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for changing the player state
            var actionTypeChangePlayerState = 15;

            /**
             * Change player state Action
             * @class
             */
            Actions.SetPlayerStateAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.SetObjectStateAction.apply(this);
            };

            Actions.SetPlayerStateAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.SetObjectStateAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.SetPlayerStateAction.prototype.buildAction = function() {
                return new Actions.SetPlayerStateAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.SetPlayerStateAction.prototype.getType = function() {
                return actionTypeChangePlayerState;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.SetPlayerStateAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.SetPlayerStateLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.SetPlayerStateAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for changing the npc state
            var actionTypeChangeNpcState = 17;

            /**
             * Change npc state Action
             * @class
             */
            Actions.SetNpcStateAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.SetObjectStateAction.apply(this);
            };

            Actions.SetNpcStateAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.SetObjectStateAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.SetNpcStateAction.prototype.buildAction = function() {
                return new Actions.SetNpcStateAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.SetNpcStateAction.prototype.getType = function() {
                return actionTypeChangeNpcState;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.SetNpcStateAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.SetNpcStateLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.SetNpcStateAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /**
             * Learn or Forget a Skill Action
             * @class
             */
            Actions.LearnForgetSkillAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Actions.LearnForgetSkillAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);
            Actions.LearnForgetSkillAction.prototype = jQuery.extend(Actions.LearnForgetSkillAction.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.LearnForgetSkillAction.prototype.getContent = function() {
                return  "<div class='gn-actionNodeObjectSelectContainer'>" + 
                            "<a class='gn-clickable gn-nodeActionSelectSkill gn-nodeNonClickableOnReadonly'></a>&nbsp;" +
                            "<a class='gn-clickable gn-nodeActionOpenSkill' title='" + DefaultNodeShapes.Localization.Actions.OpenSkillTooltip + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.LearnForgetSkillAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;
                this.contentElement.find(".gn-nodeActionSelectSkill").html(DefaultNodeShapes.Localization.Actions.ChooseSkillLabel);

                var skillOpenLink = contentElement.find(".gn-nodeActionOpenSkill");

                // Deserialize
                var existingSkillId = this.deserializeData();
                if(existingSkillId)
                {
                    skillOpenLink.show();

                    actionNode.showLoading();
                    actionNode.hideError();

                    this.loadObjectShared(existingSkillId).then(function(skill) {
                        contentElement.find(".gn-nodeActionSelectSkill").text(skill.name);
                        actionNode.hideLoading();
                    }).fail(function(xhr) {
                        actionNode.hideLoading();
                        actionNode.showError();
                    });
                }

                // Handlers
                var self = this;
                var selectSkillAction = contentElement.find(".gn-nodeActionSelectSkill");
                contentElement.find(".gn-nodeActionSelectSkill").on("click", function() {
                    DefaultNodeShapes.openSkillSearchDialog().then(function(skill) {
                        selectSkillAction.data("skillid", skill.id);
                        selectSkillAction.text(skill.name);
                        self.saveData();

                        skillOpenLink.show();
                    });
                });

                skillOpenLink.on("click", function() {
                    if(selectSkillAction.data("skillid"))
                    {
                        window.open("/Evne/Skill?id=" + selectSkillAction.data("skillid"));
                    }
                });
            };

            /**
             * Deserializes the data
             * 
             * @returns {string} Id of the selected skill
             */
            Actions.LearnForgetSkillAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return "";
                }

                var data = JSON.parse(actionData);
                
                var skillId = "";
                if(data.skillId)
                {
                    this.contentElement.find(".gn-nodeActionSelectSkill").data("skillid", data.skillId);
                    skillId = data.skillId;
                }
                else
                {
                    this.contentElement.find(".gn-nodeActionSelectSkill").data("skillid", "");
                }

                return skillId;
            }

            /**
             * Saves the data
             */
            Actions.LearnForgetSkillAction.prototype.saveData = function() {
                var skillId = this.getObjectId();
                var serializeData = {
                    skillId: skillId
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));

                // Set related object data
                this.nodeModel.set("actionRelatedToObjectType", this.getObjectTypeName());
                this.nodeModel.set("actionRelatedToObjectId", skillId);
            }

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Actions.LearnForgetSkillAction.prototype.getObjectTypeName = function() {
                return Actions.RelatedToObjectSkill;
            };

            /**
             * Returns the object id
             * 
             * @returns {string} Object Id
             */
            Actions.LearnForgetSkillAction.prototype.getObjectId = function() {
                return this.contentElement.find(".gn-nodeActionSelectSkill").data("skillid");
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.LearnForgetSkillAction.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceSkill;
            };

            /**
             * Loads the skill
             * 
             * @param {string} skillId Skill Id
             * @returns {jQuery.Deferred} Deferred for the skill loading
             */
            Actions.LearnForgetSkillAction.prototype.loadObject = function(skillId) {
                var def = new jQuery.Deferred();

                GoNorth.HttpClient.get("/api/EvneApi/FlexFieldObject?id=" + skillId).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for learning a new skill for the player
            var actionTypePlayerLearnSkill = 18;

            /**
             * Player learn a new skill Action
             * @class
             */
            Actions.PlayerLearnSkillAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.LearnForgetSkillAction.apply(this);
            };

            Actions.PlayerLearnSkillAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.LearnForgetSkillAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.PlayerLearnSkillAction.prototype.buildAction = function() {
                return new Actions.PlayerLearnSkillAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.PlayerLearnSkillAction.prototype.getType = function() {
                return actionTypePlayerLearnSkill;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.PlayerLearnSkillAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.PlayerLearnSkillLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.PlayerLearnSkillAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for forgetting a skill for the player
            var actionTypePlayerForgetSkill = 19;

            /**
             * Player forget a skill Action
             * @class
             */
            Actions.PlayerForgetSkillAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.LearnForgetSkillAction.apply(this);
            };

            Actions.PlayerForgetSkillAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.LearnForgetSkillAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.PlayerForgetSkillAction.prototype.buildAction = function() {
                return new Actions.PlayerForgetSkillAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.PlayerForgetSkillAction.prototype.getType = function() {
                return actionTypePlayerForgetSkill;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.PlayerForgetSkillAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.PlayerForgetSkillLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.PlayerForgetSkillAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for learning a skill for the npc
            var actionTypeNpcLearnSkill = 20;

            /**
             * Npc learn a skill Action
             * @class
             */
            Actions.NpcLearnSkillAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.LearnForgetSkillAction.apply(this);
            };

            Actions.NpcLearnSkillAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.LearnForgetSkillAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.NpcLearnSkillAction.prototype.buildAction = function() {
                return new Actions.NpcLearnSkillAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.NpcLearnSkillAction.prototype.getType = function() {
                return actionTypeNpcLearnSkill;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.NpcLearnSkillAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.NpcLearnsSkillLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.NpcLearnSkillAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for forgetting a skill for the npc
            var actionTypeNpcForgetSkill = 21;

            /**
             * Npc forget a skill Action
             * @class
             */
            Actions.NpcForgetSkillAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.LearnForgetSkillAction.apply(this);
            };

            Actions.NpcForgetSkillAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.LearnForgetSkillAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.NpcForgetSkillAction.prototype.buildAction = function() {
                return new Actions.NpcForgetSkillAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.NpcForgetSkillAction.prototype.getType = function() {
                return actionTypeNpcForgetSkill;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.NpcForgetSkillAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.NpcForgetSkillLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.NpcForgetSkillAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {
            
            /**
             * Change skill value Action
             * @class
             */
            Actions.ChangeSkillValueAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.ChangeValueChooseObjectAction.apply(this);
            };

            Actions.ChangeSkillValueAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.ChangeValueChooseObjectAction.prototype);

            /**
             * Returns the choose object label
             * 
             * @returns {string} Choose object label
             */
            Actions.ChangeSkillValueAction.prototype.getChooseLabel = function() {
                return DefaultNodeShapes.Localization.Actions.ChooseSkillLabel;
            };

            /**
             * Returns the open object tool label
             * 
             * @returns {string} Open object label
             */
            Actions.ChangeSkillValueAction.prototype.getOpenObjectTooltip = function() {
                return DefaultNodeShapes.Localization.Actions.OpenSkillTooltip;
            };
            
            /**
             * Opens the object
             * @param {string} id Id of the object
             */
            Actions.ChangeSkillValueAction.prototype.openObject = function(id) {
                window.open("/Evne/Skill?id=" + encodeURIComponent(id));
            };

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Actions.ChangeSkillValueAction.prototype.getObjectTypeName = function() {
                return Actions.RelatedToObjectSkill;
            };
            
            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.ChangeSkillValueAction.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceSkill;
            };

            /**
             * Opens the search dialog
             * 
             * @returns {jQuery.Deferred} Deferred for the picking
             */
            Actions.ChangeSkillValueAction.prototype.openSearchDialog = function() {
                return GoNorth.DefaultNodeShapes.openSkillSearchDialog();
            };

            /**
             * Loads the skill
             * 
             * @returns {jQuery.Deferred} Deferred for the skill loading
             */
            Actions.ChangeSkillValueAction.prototype.loadObject = function() {
                var def = new jQuery.Deferred();

                var self = this;
                GoNorth.HttpClient.get("/api/EvneApi/FlexFieldObject?id=" + this.nodeModel.get("objectId")).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for changing a player skill value
            var actionTypeChangePlayerSkillValue = 22;

            /**
             * Change skill value Action
             * @class
             */
            Actions.ChangePlayerSkillValueAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.ChangeSkillValueAction.apply(this);
            };

            Actions.ChangePlayerSkillValueAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.ChangeSkillValueAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.ChangePlayerSkillValueAction.prototype.buildAction = function() {
                return new Actions.ChangePlayerSkillValueAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.ChangePlayerSkillValueAction.prototype.getType = function() {
                return actionTypeChangePlayerSkillValue;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.ChangePlayerSkillValueAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.ChangePlayerSkillValueLabel;
            };


            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.ChangePlayerSkillValueAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for changing a npc skill value
            var actionTypeChangeNpcSkillValue = 23;

            /**
             * Change skill value Action
             * @class
             */
            Actions.ChangeNpcSkillValueAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.ChangeSkillValueAction.apply(this);
            };

            Actions.ChangeNpcSkillValueAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.ChangeSkillValueAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.ChangeNpcSkillValueAction.prototype.buildAction = function() {
                return new Actions.ChangeNpcSkillValueAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.ChangeNpcSkillValueAction.prototype.getType = function() {
                return actionTypeChangeNpcSkillValue;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.ChangeNpcSkillValueAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.ChangeNpcSkillValueLabel;
            };


            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.ChangeNpcSkillValueAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /**
             * Play animation Action
             * @class
             */
            Actions.PlayAnimationAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
            };

            Actions.PlayAnimationAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.PlayAnimationAction.prototype.getContent = function() {
                return  "<input type='text' class='gn-nodeActionPlayAnimation' placeholder='" + DefaultNodeShapes.Localization.Actions.AnimationPlaceholder + "' list='gn-" + GoNorth.ProjectConfig.ConfigKeys.PlayAnimationAction + "'/>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.PlayAnimationAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;

                // Deserialize
                this.deserializeData();

                // Handlers
                var self = this;
                var animationName = contentElement.find(".gn-nodeActionPlayAnimation");
                animationName.on("input", function(e) {
                    self.saveData();
                });
            };

            /**
             * Deserializes the data
             */
            Actions.PlayAnimationAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return "";
                }

                var data = JSON.parse(actionData);
                
                this.contentElement.find(".gn-nodeActionPlayAnimation").val(data.animationName);
            }

            /**
             * Saves the data
             */
            Actions.PlayAnimationAction.prototype.saveData = function() {
                var animationName = this.contentElement.find(".gn-nodeActionPlayAnimation").val();
                var serializeData = {
                    animationName: animationName
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));
            }

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.PlayAnimationAction.prototype.buildAction = function() {
                return new Actions.PlayAnimationAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.PlayAnimationAction.prototype.getType = function() {
                return -1;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.PlayAnimationAction.prototype.getLabel = function() {
                return "";
            };

            /**
             * Returns the config key for the action
             * 
             * @returns {string} Config key
             */
            Actions.PlayAnimationAction.prototype.getConfigKey = function() {
                return GoNorth.ProjectConfig.ConfigKeys.PlayAnimationAction;
            }

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for playing an npc animation
            var actionTypePlayNpcAnimation = 26;

            /**
             * Play npc animation action
             * @class
             */
            Actions.PlayNpcAnimationAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.PlayAnimationAction.apply(this);
            };

            Actions.PlayNpcAnimationAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.PlayAnimationAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.PlayNpcAnimationAction.prototype.buildAction = function() {
                return new Actions.PlayNpcAnimationAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.PlayNpcAnimationAction.prototype.getType = function() {
                return actionTypePlayNpcAnimation;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.PlayNpcAnimationAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.PlayNpcAnimationLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.PlayNpcAnimationAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for playing a player animation
            var actionTypePlayPlayerAnimation = 27;

            /**
             * Play player animation action
             * @class
             */
            Actions.PlayPlayerAnimationAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.PlayAnimationAction.apply(this);
            };

            Actions.PlayPlayerAnimationAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.PlayAnimationAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.PlayPlayerAnimationAction.prototype.buildAction = function() {
                return new Actions.PlayPlayerAnimationAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.PlayPlayerAnimationAction.prototype.getType = function() {
                return actionTypePlayPlayerAnimation;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.PlayPlayerAnimationAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.PlayPlayerAnimationLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.PlayPlayerAnimationAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for entering a code
            var actionTypeCode = 28;

            /**
             * Code Action
             * @class
             */
            Actions.CodeAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
            };

            Actions.CodeAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.CodeAction.prototype.getContent = function() {
                return  "<div class='gn-actionNodeObjectSelectContainer'><a class='gn-clickable gn-nodeActionScriptName'>" + DefaultNodeShapes.Localization.Actions.ClickHereToEditCode + "</a></div>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.CodeAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;

                // Deserialize
                this.deserializeData();

                // Handlers
                var self = this;
                var scriptName = contentElement.find(".gn-nodeActionScriptName");
                scriptName.click(function(e) {
                    self.openCodeEditor();
                });
            };

            /**
             * Opens the code editor
             */
            Actions.CodeAction.prototype.openCodeEditor = function() {
                var actionData = null;
                try
                {
                    actionData = JSON.parse(this.nodeModel.get("actionData"));
                }
                catch(e) 
                {
                }

                var scriptName = "";
                var scriptCode = "";
                if(actionData) 
                {
                    scriptName = actionData.scriptName;
                    scriptCode = actionData.scriptCode;
                }
                
                var self = this;
                DefaultNodeShapes.openCodeEditor(scriptName, scriptCode).then(function(codeResult) {
                    var serializeData = {
                        scriptName: codeResult.name,
                        scriptCode: codeResult.code
                    }; 
                    
                    self.nodeModel.set("actionData", JSON.stringify(serializeData));
                    self.contentElement.find(".gn-nodeActionScriptName").text(serializeData.scriptName);
                });
            };

            /**
             * Deserializes the data
             */
            Actions.CodeAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return "";
                }

                var data = JSON.parse(actionData);
                
                this.contentElement.find(".gn-nodeActionScriptName").text(data.scriptName);
            }

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.CodeAction.prototype.buildAction = function() {
                return new Actions.CodeAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.CodeAction.prototype.getType = function() {
                return actionTypeCode;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.CodeAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.CodeActionLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.CodeAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for setting the game time
            var actionTypeSetGameTime = 36;

            /**
             * Set game time action
             * @class
             */
            Actions.SetGameTimeAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Actions.SetGameTimeAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);
            Actions.SetGameTimeAction.prototype = jQuery.extend(Actions.SetGameTimeAction.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.SetGameTimeAction.prototype.getContent = function() {
                return  "<div class='gn-actionNodeTimeContainer'><input type='text' class='gn-actionNodeTime' placeholder=''/></div>";
            };

            /**
             * Returns the object resource
             * 
             * @returns {string} Object Id
             */
            Actions.SetGameTimeAction.prototype.getObjectId = function() {
                return "ProjectMiscConfig";
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.SetGameTimeAction.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceProjectMiscConfig;
            };
            
            /**
             * Loads the project config
             * 
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Actions.SetGameTimeAction.prototype.loadObject = function() {
                var def = new jQuery.Deferred();
                
                GoNorth.HttpClient.get("/api/ProjectConfigApi/GetMiscConfig").done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.SetGameTimeAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;

                var self = this;
                this.loadObjectShared({}).done(function(miscConfig) {
                    var actionNodeTime = self.contentElement.find(".gn-actionNodeTime");
                    GoNorth.BindingHandlers.initTimePicker(actionNodeTime, function(timeValue) {
                        self.serialize(timeValue.hours, timeValue.minutes);
                    }, miscConfig.hoursPerDay, miscConfig.minutesPerHour, DefaultNodeShapes.Localization.Actions.TimeFormat, function() {
                        contentElement.closest(".node").addClass("gn-actionNodeTimeOverflow");
                    }, function() {
                        contentElement.closest(".node").removeClass("gn-actionNodeTimeOverflow");
                    }, true);

                    GoNorth.BindingHandlers.setTimePickerValue(actionNodeTime, 0, 0, miscConfig.hoursPerDay, miscConfig.minutesPerHour);
                    
                    self.deserialize(actionNodeTime, miscConfig);
                });

            };

            /**
             * Deserializes the data
             * 
             * @param {object} actionNodeTime HTML Element for the time picker
             * @param {object} miscConfig Misc config
             */
            Actions.SetGameTimeAction.prototype.deserialize = function(actionNodeTime, miscConfig) {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return;
                }

                var data = JSON.parse(actionData);

                GoNorth.BindingHandlers.setTimePickerValue(actionNodeTime, data.hours, data.minutes, miscConfig.hoursPerDay, miscConfig.minutesPerHour);
            };

            /**
             * Saves the data
             * 
             * @param {number} hours Hours
             * @param {number} minutes Minutes
             */
            Actions.SetGameTimeAction.prototype.serialize = function(hours, minutes) {
                var serializeData = {
                    hours: hours,
                    minutes: minutes
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));
            };

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.SetGameTimeAction.prototype.buildAction = function() {
                return new Actions.SetGameTimeAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.SetGameTimeAction.prototype.getType = function() {
                return actionTypeSetGameTime;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.SetGameTimeAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.SetGameTimeActionLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.SetGameTimeAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /**
             * Set Daily Routine event state action
             * @class
             */
            Actions.SetDailyRoutineEventStateAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Actions.SetDailyRoutineEventStateAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);
            Actions.SetDailyRoutineEventStateAction.prototype = jQuery.extend(Actions.SetDailyRoutineEventStateAction.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.SetDailyRoutineEventStateAction.prototype.getContent = function() {
                return  "<div class='gn-actionNodeObjectSelectContainer'>" +
                            "<a class='gn-actionNodeObjectSelect gn-clickable'>" + DefaultNodeShapes.Localization.Actions.ChooseDailyRoutineEvent + "</a>" +
                            "<a class='gn-clickable gn-nodeActionOpenObject' title='" + DefaultNodeShapes.Localization.Actions.OpenDailyRoutineEventNpcTooltip + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.SetDailyRoutineEventStateAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;
                
                var openObjectLink = contentElement.find(".gn-nodeActionOpenObject");

                // Deserialize
                var deserializedData = this.deserializeData();
                if(deserializedData)
                {
                    this.nodeModel.set("actionRelatedToObjectType", Actions.RelatedToObjectNpc);
                    this.nodeModel.set("actionRelatedToObjectId", deserializedData.npcId);
                    this.nodeModel.set("actionRelatedToAdditionalObjects", [{
                        objectType: Actions.RelatedToObjectDailyRoutine,
                        objectId: deserializedData.eventId
                    }]);

                    this.loadEventFromNpc(deserializedData.npcId, deserializedData.eventId);
                }

                // Handlers
                var self = this;
                contentElement.find(".gn-actionNodeObjectSelect").on("click", function() {
                    GoNorth.DefaultNodeShapes.openDailyRoutineEventSearchDialog().then(function(dailyRoutine) {
                        self.nodeModel.set("objectId", dailyRoutine.parentObject.id);
                        self.nodeModel.set("actionRelatedToObjectType", Actions.RelatedToObjectNpc);
                        self.nodeModel.set("actionRelatedToObjectId", dailyRoutine.parentObject.id);
                        self.nodeModel.set("actionRelatedToAdditionalObjects", [{
                            objectType: Actions.RelatedToObjectDailyRoutine,
                            objectId: dailyRoutine.eventId
                        }]);

                        self.saveData(dailyRoutine.parentObject.id, dailyRoutine.eventId);

                        contentElement.find(".gn-actionNodeObjectSelect").text(dailyRoutine.parentObject.name + ": " + dailyRoutine.name);

                        openObjectLink.show();
                    });
                });
                
                openObjectLink.on("click", function() {
                    var npcId = self.nodeModel.get("objectId");
                    if(npcId) 
                    {
                        window.open("/Kortisto/Npc?id=" + npcId);
                    }
                });
            };

            /**
             * Deserializes the data
             * @returns {object} Deserialized data
             */
            Actions.SetDailyRoutineEventStateAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return null;
                }

                var data = JSON.parse(actionData);
                this.nodeModel.set("objectId", data.npcId);

                return data;
            };

            /**
             * Loads the event from an npc
             * @param {string} npcId Id of the npc
             * @param {string} eventId Id of the event
             */
            Actions.SetDailyRoutineEventStateAction.prototype.loadEventFromNpc = function(npcId, eventId) {
                var self = this;
                this.loadObjectShared(npcId).then(function(npc) {
                    if(!npc.dailyRoutine) 
                    {
                        return;
                    }

                    for(var curEvent = 0; curEvent < npc.dailyRoutine.length; ++curEvent)
                    {
                        if(npc.dailyRoutine[curEvent].eventId == eventId)
                        {
                            var eventName = GoNorth.DailyRoutines.Util.formatTimeSpan(DefaultNodeShapes.Localization.Actions.TimeFormat, npc.dailyRoutine[curEvent].earliestTime, npc.dailyRoutine[curEvent].latestTime);
                            self.contentElement.find(".gn-actionNodeObjectSelect").text(npc.name + ": " + eventName);
                            self.contentElement.find(".gn-nodeActionOpenObject").show();
                            break;
                        }
                    }
                });
            };

            /**
             * Saves the data
             * @param {string} npcId Id of the npc
             * @param {string} eventId Id of the event
             */
            Actions.SetDailyRoutineEventStateAction.prototype.saveData = function(npcId, eventId) {
                var serializeData = {
                    npcId: npcId,
                    eventId: eventId
                };
                
                this.nodeModel.set("actionData", JSON.stringify(serializeData));
            };

            /**
             * Returns the names of the custom action attributes
             * 
             * @returns {string[]} Name of the custom action attributes
             */
            Actions.SetDailyRoutineEventStateAction.prototype.getCustomActionAttributes = function() {
                return [ "objectId" ];
            };


            /**
             * Returns the object id
             * 
             * @returns {string} Object Id
             */
            Actions.SetDailyRoutineEventStateAction.prototype.getObjectId = function() {
                return this.nodeModel.get("objectId");
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.SetDailyRoutineEventStateAction.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
            };

            /**
             * Loads the npc
             * 
             * @returns {jQuery.Deferred} Deferred for the npc loading
             */
            Actions.SetDailyRoutineEventStateAction.prototype.loadObject = function() {
                var def = new jQuery.Deferred();

                GoNorth.HttpClient.get("/api/KortistoApi/FlexFieldObject?id=" + this.nodeModel.get("objectId")).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.SetDailyRoutineEventStateAction.prototype.buildAction = function() {
                return new Actions.SetDailyRoutineEventStateAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.SetDailyRoutineEventStateAction.prototype.getType = function() {
                return -1;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.SetDailyRoutineEventStateAction.prototype.getLabel = function() {
                return "";
            };

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for disabling a daily routine event
            var actionTypeDisableDailyRoutineEvent = 37;

            /**
             * Disable daily routine event action
             * @class
             */
            Actions.DisableDailyRoutineEventAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.SetDailyRoutineEventStateAction.apply(this);
            };

            Actions.DisableDailyRoutineEventAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.SetDailyRoutineEventStateAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.DisableDailyRoutineEventAction.prototype.buildAction = function() {
                return new Actions.DisableDailyRoutineEventAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.DisableDailyRoutineEventAction.prototype.getType = function() {
                return actionTypeDisableDailyRoutineEvent;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.DisableDailyRoutineEventAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.DisableDailyRoutineEventLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.DisableDailyRoutineEventAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for enabling a daily routine event
            var actionTypeEnableDailyRoutineEvent = 38;

            /**
             * Enable daily routine event action
             * @class
             */
            Actions.EnableDailyRoutineEventAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.SetDailyRoutineEventStateAction.apply(this);
            };

            Actions.EnableDailyRoutineEventAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.SetDailyRoutineEventStateAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.EnableDailyRoutineEventAction.prototype.buildAction = function() {
                return new Actions.EnableDailyRoutineEventAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.EnableDailyRoutineEventAction.prototype.getType = function() {
                return actionTypeEnableDailyRoutineEvent;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.EnableDailyRoutineEventAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.EnableDailyRoutineEventLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.EnableDailyRoutineEventAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /**
             * Move object action
             * @class
             */
            Actions.MoveObjectAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Actions.MoveObjectAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);
            Actions.MoveObjectAction.prototype = jQuery.extend(Actions.MoveObjectAction.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns true if the action has a movement state, else false
             * 
             * @returns {bool} true if the action has a movement state, else false
             */
            Actions.MoveObjectAction.prototype.hasMovementState = function() {
                return false;
            };

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.MoveObjectAction.prototype.getContent = function() {
                var templateHtml = "<div class='gn-actionNodeObjectSelectContainer'>" +
                            "<a class='gn-actionNodeMarkerSelect gn-clickable'>" + DefaultNodeShapes.Localization.Actions.ChooseMarkerLabel + "</a>" +
                            "<a class='gn-clickable gn-nodeActionOpenObject' title='" + DefaultNodeShapes.Localization.Actions.OpenMarkerTooltip + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>";
                
                if(this.hasMovementState())
                {
                    templateHtml += "<input type='text' class='gn-nodeActionMovementState' placeholder='" + DefaultNodeShapes.Localization.Actions.MovementStatePlaceholder + "' list='gn-" + GoNorth.ProjectConfig.ConfigKeys.SetNpcStateAction + "'/>";
                }

                return templateHtml;
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.MoveObjectAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;

                var markerOpenLink = contentElement.find(".gn-nodeActionOpenObject");

                // Deserialize
                var deserializedData = this.deserializeData();
                if(deserializedData) {
                    this.nodeModel.set("actionRelatedToObjectType", Actions.RelatedToObjectMapMarker);
                    this.nodeModel.set("actionRelatedToObjectId", deserializedData.markerId);
                    this.nodeModel.set("actionRelatedToAdditionalObjects", [{
                        objectType: Actions.RelatedToObjectMap,
                        objectId: deserializedData.mapId
                    }]);

                    this.loadMarkerFromMap(deserializedData.mapId, deserializedData.markerId);
                }

                // Handlers
                var self = this;
                var selectMarkerAction = contentElement.find(".gn-actionNodeMarkerSelect");
                selectMarkerAction.on("click", function() {
                    GoNorth.DefaultNodeShapes.openMarkerSearchDialog().then(function(marker) {
                        selectMarkerAction.data("mapid", marker.mapId);
                        selectMarkerAction.data("markerid", marker.id);
                        selectMarkerAction.data("markertype", marker.markerType);
                        selectMarkerAction.text(marker.name);
                        
                        // Set related object data
                        self.nodeModel.set("actionRelatedToObjectType", Actions.RelatedToObjectMapMarker);
                        self.nodeModel.set("actionRelatedToObjectId", marker.id);
                        self.nodeModel.set("actionRelatedToAdditionalObjects", [{
                            objectType: Actions.RelatedToObjectMap,
                            objectId: marker.mapId
                        }]);

                        self.saveData(marker.mapId, marker.id, marker.markerType)

                        markerOpenLink.show();
                    });
                });
                 
                markerOpenLink.on("click", function() {
                    if(selectMarkerAction.data("markerid"))
                    {
                        window.open("/Karta?id=" + selectMarkerAction.data("mapid") + "&zoomOnMarkerId=" + selectMarkerAction.data("markerid") + "&zoomOnMarkerType=" + selectMarkerAction.data("markertype"))
                    }
                });

                var movementState = contentElement.find(".gn-nodeActionMovementState");
                movementState.on("input", function(e) {
                    self.saveData();
                });
            };

            /**
             * Deserializes the data
             */
            Actions.MoveObjectAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return null;
                }

                var data = JSON.parse(actionData);
                
                var selectMarkerAction = this.contentElement.find(".gn-actionNodeMarkerSelect");
                selectMarkerAction.data("mapid", data.mapId);
                selectMarkerAction.data("markerid", data.markerId);
                selectMarkerAction.data("markertype", data.markerType);
                
                this.contentElement.find(".gn-nodeActionMovementState").val(data.movementState);

                return data;
            };

            /**
             * Loads the marker from a map
             * @param {string} mapId Id of the map
             * @param {string} markerId Id of the marker
             */
            Actions.MoveObjectAction.prototype.loadMarkerFromMap = function(mapId, markerId) {
                var self = this;
                this.loadObjectShared({ mapId: mapId, markerId: markerId }).then(function(marker) {
                    if(!marker) 
                    {
                        return;
                    }

                    self.contentElement.find(".gn-actionNodeMarkerSelect").text(marker.markerName + " (" + marker.mapName + ")");
                    self.contentElement.find(".gn-nodeActionOpenObject").show();
                });
            };

            /**
             * Saves the data
             */
            Actions.MoveObjectAction.prototype.saveData = function() {
                var movementState = this.contentElement.find(".gn-nodeActionMovementState").val();
                if(!movementState)
                {
                    movementState = "";
                }

                var selectMarkerAction = this.contentElement.find(".gn-actionNodeMarkerSelect");

                var serializeData = {
                    mapId: selectMarkerAction.data("mapid"),
                    markerId: selectMarkerAction.data("markerid"),
                    markerType: selectMarkerAction.data("markertype"),
                    movementState: movementState
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));
            };

            
            /**
             * Returns the object id
             * 
             * @returns {string} Object Id
             */
            Actions.MoveObjectAction.prototype.getObjectId = function(existingData) {
                return existingData.mapId + "|" + existingData.markerId;
            };
            
            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.MoveObjectAction.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceMapMarker;
            };

            /**
             * Loads the marker
             * 
             * @returns {jQuery.Deferred} Deferred for the marker loading
             */
            Actions.MoveObjectAction.prototype.loadObject = function() {
                var def = new jQuery.Deferred();

                var selectMarkerAction = this.contentElement.find(".gn-actionNodeMarkerSelect");

                GoNorth.HttpClient.get("/api/KartaApi/GetMarker?mapId=" + selectMarkerAction.data("mapid") + "&markerId=" + selectMarkerAction.data("markerid")).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Returns the config key for the action
             * 
             * @returns {string} Config key
             */
            Actions.MoveObjectAction.prototype.getConfigKey = function() {
                if(this.hasMovementState())
                {
                    return GoNorth.ProjectConfig.ConfigKeys.SetNpcStateAction;
                }

                return null;
            };

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for teleporting an npc
            var actionTypeTeleportNpc = 39;

            /**
             * Teleport npc Action
             * @class
             */
            Actions.TeleportNpcAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.MoveObjectAction.apply(this);
            };

            Actions.TeleportNpcAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.MoveObjectAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.TeleportNpcAction.prototype.buildAction = function() {
                return new Actions.TeleportNpcAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.TeleportNpcAction.prototype.getType = function() {
                return actionTypeTeleportNpc;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.TeleportNpcAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.TeleportNpcLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.TeleportNpcAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for teleporting the player
            var actionTypeTeleportPlayer = 40;

            /**
             * Teleport player Action
             * @class
             */
            Actions.TeleportPlayerAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.MoveObjectAction.apply(this);
            };

            Actions.TeleportPlayerAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.MoveObjectAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.TeleportPlayerAction.prototype.buildAction = function() {
                return new Actions.TeleportPlayerAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.TeleportPlayerAction.prototype.getType = function() {
                return actionTypeTeleportPlayer;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.TeleportPlayerAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.TeleportPlayerLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.TeleportPlayerAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Indicating am object must be loaded
            var loadTypeObject = 0;

            /// Indicating a marker must be loaded
            var loadTypeMarker = 1;

            /**
             * Move choose object action
             * @class
             */
            Actions.MoveChooseObjectAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Actions.MoveChooseObjectAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);
            Actions.MoveChooseObjectAction.prototype = jQuery.extend(Actions.MoveChooseObjectAction.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns true if the action has a movement state, else false
             * 
             * @returns {bool} true if the action has a movement state, else false
             */
            Actions.MoveChooseObjectAction.prototype.hasMovementState = function() {
                return false;
            };

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.MoveChooseObjectAction.prototype.getContent = function() {
                var templateHtml = "<div class='gn-actionNodeObjectSelectContainer'>" +
                            "<a class='gn-actionNodeObjectSelect gn-clickable'>" + this.getChooseObjectLabel() + "</a>" +
                            "<a class='gn-clickable gn-nodeActionOpenChooseObject' title='" + this.getOpenObjectTooltip() + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>" + 
                        "<div class='gn-actionNodeObjectSelectionSeperator'>" + this.getSelectionSeperatorLabel() + "</div>" +
                        "<div class='gn-actionNodeObjectSelectContainer'>" +
                            "<a class='gn-actionNodeMarkerSelect gn-clickable'>" + DefaultNodeShapes.Localization.Actions.ChooseMarkerLabel + "</a>" +
                            "<a class='gn-clickable gn-nodeActionOpenObject' title='" + DefaultNodeShapes.Localization.Actions.OpenMarkerTooltip + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>";

                if(this.hasMovementState())
                {
                    templateHtml += "<input type='text' class='gn-nodeActionMovementState' placeholder='" + DefaultNodeShapes.Localization.Actions.MovementStatePlaceholder + "' list='gn-" + GoNorth.ProjectConfig.ConfigKeys.SetNpcStateAction + "'/>";
                }

                return templateHtml;
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.MoveChooseObjectAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;

                var objectOpenLink = contentElement.find(".gn-nodeActionOpenChooseObject");
                var markerOpenLink = contentElement.find(".gn-nodeActionOpenObject");

                // Deserialize
                var deserializedData = this.deserializeData();
                if(deserializedData) {
                    this.loadObjectFromDeserialize(deserializedData.objectId);
                    this.loadMarkerFromMap(deserializedData.mapId, deserializedData.markerId);
                }

                // Handlers
                var self = this;
                var selectObjectAction = contentElement.find(".gn-actionNodeObjectSelect");
                selectObjectAction.on("click", function() {
                    self.openChooseObjectDialog().then(function(object) {
                        selectObjectAction.data("selectedobjectid", object.id);
                        selectObjectAction.text(object.name);
                        
                        self.saveData();

                        objectOpenLink.show();
                    });
                });

                objectOpenLink.on("click", function() {
                    if(selectObjectAction.data("selectedobjectid"))
                    {
                        self.openObject(selectObjectAction.data("selectedobjectid"))
                    }
                });


                var selectMarkerAction = contentElement.find(".gn-actionNodeMarkerSelect");
                selectMarkerAction.on("click", function() {
                    GoNorth.DefaultNodeShapes.openMarkerSearchDialog().then(function(marker) {
                        selectMarkerAction.data("mapid", marker.mapId);
                        selectMarkerAction.data("markerid", marker.id);
                        selectMarkerAction.data("markertype", marker.markerType);
                        selectMarkerAction.text(marker.name);
                        
                        self.saveData();

                        markerOpenLink.show();
                    });
                });
                 
                markerOpenLink.on("click", function() {
                    if(selectMarkerAction.data("markerid"))
                    {
                        window.open("/Karta?id=" + selectMarkerAction.data("mapid") + "&zoomOnMarkerId=" + selectMarkerAction.data("markerid") + "&zoomOnMarkerType=" + selectMarkerAction.data("markertype"))
                    }
                });
                
                var movementState = contentElement.find(".gn-nodeActionMovementState");
                movementState.on("input", function(e) {
                    self.saveData();
                });
            };

            /**
             * Deserializes the data
             */
            Actions.MoveChooseObjectAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return null;
                }

                var data = JSON.parse(actionData);

                var selectObjectAction = this.contentElement.find(".gn-actionNodeObjectSelect");
                selectObjectAction.data("selectedobjectid", data.objectId);

                var selectMarkerAction = this.contentElement.find(".gn-actionNodeMarkerSelect");
                selectMarkerAction.data("mapid", data.mapId);
                selectMarkerAction.data("markerid", data.markerId);
                selectMarkerAction.data("markertype", data.markerType);

                this.contentElement.find(".gn-nodeActionMovementState").val(data.movementState);

                this.setRelatedToData();

                return data;
            };

            /**
             * Loads the marker from a map
             * @param {string} mapId Id of the map
             * @param {string} markerId Id of the marker
             */
            Actions.MoveChooseObjectAction.prototype.loadObjectFromDeserialize = function(objectId) {
                if(!objectId) {
                    return;
                }

                var self = this;
                this.loadObjectShared({ loadType: loadTypeObject, objectId: objectId }).then(function(loadedObject) {
                    if(!loadedObject) 
                    {
                        return;
                    }

                    self.contentElement.find(".gn-actionNodeObjectSelect").text(loadedObject.name);
                    self.contentElement.find(".gn-nodeActionOpenChooseObject").show();
                });
            };

            /**
             * Loads the marker from a map
             * @param {string} mapId Id of the map
             * @param {string} markerId Id of the marker
             */
            Actions.MoveChooseObjectAction.prototype.loadMarkerFromMap = function(mapId, markerId) {
                if(!mapId || !markerId) {
                    return;
                }

                var self = this;
                this.loadObjectShared({ loadType: loadTypeMarker, mapId: mapId, markerId: markerId }).then(function(marker) {
                    if(!marker) 
                    {
                        return;
                    }

                    self.contentElement.find(".gn-actionNodeMarkerSelect").text(marker.markerName + " (" + marker.mapName + ")");
                    self.contentElement.find(".gn-nodeActionOpenObject").show();
                });
            };

            /**
             * Sets the related to data
             */
            Actions.MoveChooseObjectAction.prototype.setRelatedToData = function() {
                var additionalRelatedObjects = [];
                var selectObjectAction = this.contentElement.find(".gn-actionNodeObjectSelect");
                if(selectObjectAction.data("selectedobjectid"))
                {
                    this.nodeModel.set("actionRelatedToObjectType", this.getRelatedToObjectType());
                    this.nodeModel.set("actionRelatedToObjectId", selectObjectAction.data("selectedobjectid"));
                    
                }

                var selectMarkerAction = this.contentElement.find(".gn-actionNodeMarkerSelect");
                if(selectMarkerAction.data("markerid"))
                {
                    additionalRelatedObjects.push({
                        objectType: Actions.RelatedToObjectMapMarker,
                        objectId: selectMarkerAction.data("markerid")
                    });
                }

                if(selectMarkerAction.data("mapid"))
                {
                    additionalRelatedObjects.push({
                        objectType: Actions.RelatedToObjectMap,
                        objectId: selectMarkerAction.data("mapid")
                    });
                }
                this.nodeModel.set("actionRelatedToAdditionalObjects", additionalRelatedObjects);
            }

            /**
             * Saves the data
             */
            Actions.MoveChooseObjectAction.prototype.saveData = function() {
                this.setRelatedToData();
                
                var selectObjectAction = this.contentElement.find(".gn-actionNodeObjectSelect");
                var selectMarkerAction = this.contentElement.find(".gn-actionNodeMarkerSelect");

                var movementState = this.contentElement.find(".gn-nodeActionMovementState").val();
                if(!movementState)
                {
                    movementState = "";
                }

                var serializeData = {
                    objectId: selectObjectAction.data("selectedobjectid"),
                    mapId: selectMarkerAction.data("mapid"),
                    markerId: selectMarkerAction.data("markerid"),
                    markerType: selectMarkerAction.data("markertype"),
                    movementState: movementState
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));
            };

            
            /**
             * Returns the object id
             * 
             * @returns {string} Object Id
             */
            Actions.MoveChooseObjectAction.prototype.getObjectId = function(existingData) {
                if(existingData.loadType == loadTypeMarker)
                {
                    return existingData.mapId + "|" + existingData.markerId;
                }

                return existingData.objectId;
            };
            
            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.MoveChooseObjectAction.prototype.getObjectResource = function(existingData) {
                if(existingData.loadType == loadTypeMarker)
                {
                    return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceMapMarker;
                }

                return this.getObjectResourceType();
            };

            /**
             * Loads the marker or npc
             * 
             * @param {string} objectId Extracted object id
             * @param {string} existingData Existing data
             * @returns {jQuery.Deferred} Deferred for the objcet loading
             */
            Actions.MoveChooseObjectAction.prototype.loadObject = function(objectId, existingData) {
                if(existingData.loadType == loadTypeMarker)
                {
                    var def = new jQuery.Deferred();

                    var selectMarkerAction = this.contentElement.find(".gn-actionNodeMarkerSelect");
                    GoNorth.HttpClient.get("/api/KartaApi/GetMarker?mapId=" + selectMarkerAction.data("mapid") + "&markerId=" + selectMarkerAction.data("markerid")).done(function(data) {
                        def.resolve(data);
                    }).fail(function(xhr) {
                        def.reject();
                    });

                    return def.promise();
                }

                return this.loadChoosenObject(existingData.objectId);
            };
            
            /**
             * Returns the config key for the action
             * 
             * @returns {string} Config key
             */
            Actions.MoveChooseObjectAction.prototype.getConfigKey = function() {
                if(this.hasMovementState())
                {
                    return GoNorth.ProjectConfig.ConfigKeys.SetNpcStateAction;
                }

                return null;
            };

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for teleporting an npc which is choosen
            var actionTypeTeleportChoseNpc = 41;

            /**
             * Teleport choose npc Action
             * @class
             */
            Actions.TeleportChooseNpcAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.MoveChooseObjectAction.apply(this);
            };

            Actions.TeleportChooseNpcAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.MoveChooseObjectAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.TeleportChooseNpcAction.prototype.buildAction = function() {
                return new Actions.TeleportChooseNpcAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.TeleportChooseNpcAction.prototype.getType = function() {
                return actionTypeTeleportChoseNpc;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.TeleportChooseNpcAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.TeleportChooseNpcLabel;
            };
        

            /**
             * Opens the choose object dialog
             * 
             * @returns {jQuery.Deferred} Deferred that will be resolved with the choosen object
             */
            Actions.TeleportChooseNpcAction.prototype.openChooseObjectDialog = function() {
                return GoNorth.DefaultNodeShapes.openNpcSearchDialog();
            };

            /**
             * Returns the choose label
             * 
             * @returns {string} Label for choosing
             */
            Actions.TeleportChooseNpcAction.prototype.getChooseObjectLabel = function() {
                return DefaultNodeShapes.Localization.Actions.ChooseNpcLabel;
            };

            /**
             * Returns the selections seperator label
             * 
             * @returns {string} Label for seperation
             */
            Actions.TeleportChooseNpcAction.prototype.getSelectionSeperatorLabel = function() {
                return DefaultNodeShapes.Localization.Actions.TeleportTo;
            };

            /**
             * Returns the choose label
             * 
             * @returns {string} Label for choosing
             */
            Actions.TeleportChooseNpcAction.prototype.getOpenObjectTooltip = function() {
                return DefaultNodeShapes.Localization.Actions.OpenNpcTooltip;
            };

            /**
             * Opens the object
             * 
             * @param {string} id Id of the object
             */
            Actions.TeleportChooseNpcAction.prototype.openObject = function(id) {
                window.open("/Kortisto/Npc?id=" + id)
            }

            /**
             * Returns the related object type of the choosen object
             * 
             * @returns {string} Related object type of the choosen object
             */
            Actions.TeleportChooseNpcAction.prototype.getRelatedToObjectType = function() {
                return Actions.RelatedToObjectNpc;
            };

            /**
             * Returns the loading object resource type
             * 
             * @returns {number} Loading objcet resource type
             */
            Actions.TeleportChooseNpcAction.prototype.getObjectResourceType = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
            };

            /**
             * Loads the choosen object
             * 
             * @returns {number} Loading objcet resource type
             * @param {string} npcId Npc Id
             * @returns {jQuery.Deferred} Deferred for the objcet loading
             */
            Actions.TeleportChooseNpcAction.prototype.loadChoosenObject = function(npcId) {
                var def = new jQuery.Deferred();

                GoNorth.HttpClient.get("/api/KortistoApi/FlexFieldObject?id=" + npcId).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.TeleportChooseNpcAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for walking an npc to a target marker
            var actionTypeWalkNpcToMarker = 42;

            /**
             * Walk npc to marker Action
             * @class
             */
            Actions.WalkNpcToMarkerAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.MoveObjectAction.apply(this);
            };

            Actions.WalkNpcToMarkerAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.MoveObjectAction.prototype);

            /**
             * Returns true if the action has a movement state, else false
             * 
             * @returns {bool} true if the action has a movement state, else false
             */
            Actions.WalkNpcToMarkerAction.prototype.hasMovementState = function() {
                return true;
            };

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.WalkNpcToMarkerAction.prototype.buildAction = function() {
                return new Actions.WalkNpcToMarkerAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.WalkNpcToMarkerAction.prototype.getType = function() {
                return actionTypeWalkNpcToMarker;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.WalkNpcToMarkerAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.WalkNpcLabel;
            };
                
            /**
             * Returns the label for the main output
             * 
             * @returns {string} Label for the main output
             */
            Actions.WalkNpcToMarkerAction.prototype.getMainOutputLabel = function() {
                return DefaultNodeShapes.Localization.Actions.WalkOnTargetReachLabel;
            };

            /**
             * Returns the additional outports of the action
             * 
             * @returns {string[]} Additional outports
             */
            Actions.WalkNpcToMarkerAction.prototype.getAdditionalOutports = function() {
                return [ DefaultNodeShapes.Localization.Actions.WalkDirectContinueLabel ];
            };


            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.WalkNpcToMarkerAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for walking an npc which is choosen
            var actionTypeWalkChoseNpc = 43;

            /**
             * Walk choose npc to marker Action
             * @class
             */
            Actions.WalkChooseNpcToMarkerAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.MoveChooseObjectAction.apply(this);
            };

            Actions.WalkChooseNpcToMarkerAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.MoveChooseObjectAction.prototype);

            /**
             * Returns true if the action has a movement state, else false
             * 
             * @returns {bool} true if the action has a movement state, else false
             */
            Actions.WalkChooseNpcToMarkerAction.prototype.hasMovementState = function() {
                return true;
            };

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.WalkChooseNpcToMarkerAction.prototype.buildAction = function() {
                return new Actions.WalkChooseNpcToMarkerAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.WalkChooseNpcToMarkerAction.prototype.getType = function() {
                return actionTypeWalkChoseNpc;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.WalkChooseNpcToMarkerAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.WalkChooseNpcLabel;
            };
        
            /**
             * Returns the label for the main output
             * 
             * @returns {string} Label for the main output
             */
            Actions.WalkChooseNpcToMarkerAction.prototype.getMainOutputLabel = function() {
                return DefaultNodeShapes.Localization.Actions.WalkOnTargetReachLabel;
            };

            /**
             * Returns the additional outports of the action
             * 
             * @returns {string[]} Additional outports
             */
            Actions.WalkChooseNpcToMarkerAction.prototype.getAdditionalOutports = function() {
                return [ DefaultNodeShapes.Localization.Actions.WalkDirectContinueLabel ];
            };


            /**
             * Opens the choose object dialog
             * 
             * @returns {jQuery.Deferred} Deferred that will be resolved with the choosen object
             */
            Actions.WalkChooseNpcToMarkerAction.prototype.openChooseObjectDialog = function() {
                return GoNorth.DefaultNodeShapes.openNpcSearchDialog();
            };

            /**
             * Returns the choose label
             * 
             * @returns {string} Label for choosing
             */
            Actions.WalkChooseNpcToMarkerAction.prototype.getChooseObjectLabel = function() {
                return DefaultNodeShapes.Localization.Actions.ChooseNpcLabel;
            };

            /**
             * Returns the selections seperator label
             * 
             * @returns {string} Label for seperation
             */
            Actions.WalkChooseNpcToMarkerAction.prototype.getSelectionSeperatorLabel = function() {
                return DefaultNodeShapes.Localization.Actions.WalkTo;
            };

            /**
             * Returns the choose label
             * 
             * @returns {string} Label for choosing
             */
            Actions.WalkChooseNpcToMarkerAction.prototype.getOpenObjectTooltip = function() {
                return DefaultNodeShapes.Localization.Actions.OpenNpcTooltip;
            };

            /**
             * Opens the object
             * 
             * @param {string} id Id of the object
             */
            Actions.WalkChooseNpcToMarkerAction.prototype.openObject = function(id) {
                window.open("/Kortisto/Npc?id=" + id)
            }

            /**
             * Returns the related object type of the choosen object
             * 
             * @returns {string} Related object type of the choosen object
             */
            Actions.WalkChooseNpcToMarkerAction.prototype.getRelatedToObjectType = function() {
                return Actions.RelatedToObjectNpc;
            };

            /**
             * Returns the loading object resource type
             * 
             * @returns {number} Loading objcet resource type
             */
            Actions.WalkChooseNpcToMarkerAction.prototype.getObjectResourceType = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
            };

            /**
             * Loads the choosen object
             * 
             * @returns {number} Loading objcet resource type
             * @param {string} npcId Npc Id
             * @returns {jQuery.Deferred} Deferred for the objcet loading
             */
            Actions.WalkChooseNpcToMarkerAction.prototype.loadChoosenObject = function(npcId) {
                var def = new jQuery.Deferred();

                GoNorth.HttpClient.get("/api/KortistoApi/FlexFieldObject?id=" + npcId).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.WalkChooseNpcToMarkerAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /**
             * Move object action
             * @class
             */
            Actions.MoveObjectToNpcAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Actions.MoveObjectToNpcAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);
            Actions.MoveObjectToNpcAction.prototype = jQuery.extend(Actions.MoveObjectToNpcAction.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns true if the action has a movement state, else false
             * 
             * @returns {bool} true if the action has a movement state, else false
             */
            Actions.MoveObjectToNpcAction.prototype.hasMovementState = function() {
                return false;
            };

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.MoveObjectToNpcAction.prototype.getContent = function() {
                var templateHtml = "<div class='gn-actionNodeObjectSelectContainer'>" +
                            "<a class='gn-actionNodeNpcSelect gn-clickable'>" + DefaultNodeShapes.Localization.Actions.ChooseNpcLabel + "</a>" +
                            "<a class='gn-clickable gn-nodeActionOpenObject' title='" + DefaultNodeShapes.Localization.Actions.OpenNpcTooltip + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>";

                if(this.hasMovementState())
                {
                    templateHtml += "<input type='text' class='gn-nodeActionMovementState' placeholder='" + DefaultNodeShapes.Localization.Actions.MovementStatePlaceholder + "' list='gn-" + GoNorth.ProjectConfig.ConfigKeys.SetNpcStateAction + "'/>";
                }
        
                return templateHtml;
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.MoveObjectToNpcAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;

                var npcOpenLink = contentElement.find(".gn-nodeActionOpenObject");

                // Deserialize
                var deserializedData = this.deserializeData();
                if(deserializedData && deserializedData.npcId) {
                    this.nodeModel.set("actionRelatedToObjectType", Actions.RelatedToObjectNpc);
                    this.nodeModel.set("actionRelatedToObjectId", deserializedData.npcId);

                    this.loadNpc(deserializedData);
                }

                // Handlers
                var self = this;
                var selectNpcAction = contentElement.find(".gn-actionNodeNpcSelect");
                selectNpcAction.on("click", function() {
                    GoNorth.DefaultNodeShapes.openNpcSearchDialog().then(function(npc) {
                        selectNpcAction.data("npcid", npc.id);
                        selectNpcAction.text(npc.name);
                        
                        // Set related object data
                        self.nodeModel.set("actionRelatedToObjectType", Actions.RelatedToObjectNpc);
                        self.nodeModel.set("actionRelatedToObjectId", npc.id);

                        self.saveData(npc.id)

                        npcOpenLink.show();
                    });
                });
                 
                npcOpenLink.on("click", function() {
                    if(selectNpcAction.data("npcid"))
                    {
                        window.open("/Kortisto/Npc?id=" + selectNpcAction.data("npcid"))
                    }
                });

                var movementState = contentElement.find(".gn-nodeActionMovementState");
                movementState.on("input", function(e) {
                    self.saveData();
                });
            };

            /**
             * Deserializes the data
             */
            Actions.MoveObjectToNpcAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return null;
                }

                var data = JSON.parse(actionData);
                
                var selectNpcAction = this.contentElement.find(".gn-actionNodeNpcSelect");
                selectNpcAction.data("npcid", data.npcId);

                this.contentElement.find(".gn-nodeActionMovementState").val(data.movementState);

                return data;
            };

            /**
             * Loads the npc
             * @param {string} npcId Id of the npc
             */
            Actions.MoveObjectToNpcAction.prototype.loadNpc = function(npcData) {
                var self = this;
                this.loadObjectShared(npcData).then(function(npc) {
                    if(!npc) 
                    {
                        return;
                    }

                    self.contentElement.find(".gn-actionNodeNpcSelect").text(npc.name);
                    self.contentElement.find(".gn-nodeActionOpenObject").show();
                });
            };

            /**
             * Saves the data
             * @param {string} npcId Npc id
             */
            Actions.MoveObjectToNpcAction.prototype.saveData = function(npcId) {
                var movementState = this.contentElement.find(".gn-nodeActionMovementState").val();
                if(!movementState)
                {
                    movementState = "";
                }

                var serializeData = {
                    npcId: npcId,
                    movementState: movementState
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));
            };

            
            /**
             * Returns the object id
             * 
             * @returns {string} Object Id
             */
            Actions.MoveObjectToNpcAction.prototype.getObjectId = function(existingData) {
                return existingData.npcId;
            };
            
            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.MoveObjectToNpcAction.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
            };

            /**
             * Loads the npcs
             * 
             * @returns {jQuery.Deferred} Deferred for the npc loading
             */
            Actions.MoveObjectToNpcAction.prototype.loadObject = function() {
                var def = new jQuery.Deferred();

                var selectNpcAction = this.contentElement.find(".gn-actionNodeNpcSelect");

                GoNorth.HttpClient.get("/api/KortistoApi/FlexFieldObject?id=" + selectNpcAction.data("npcid")).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Returns the config key for the action
             * 
             * @returns {string} Config key
             */
            Actions.MoveObjectToNpcAction.prototype.getConfigKey = function() {
                if(this.hasMovementState())
                {
                    return GoNorth.ProjectConfig.ConfigKeys.SetNpcStateAction;
                }

                return null;
            };

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for teleporting an npc to an npc
            var actionTypeTeleportNpcToNpc = 44;

            /**
             * Teleport npc to npc Action
             * @class
             */
            Actions.TeleportNpcToNpcAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.MoveObjectToNpcAction.apply(this);
            };

            Actions.TeleportNpcToNpcAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.MoveObjectToNpcAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.TeleportNpcToNpcAction.prototype.buildAction = function() {
                return new Actions.TeleportNpcToNpcAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.TeleportNpcToNpcAction.prototype.getType = function() {
                return actionTypeTeleportNpcToNpc;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.TeleportNpcToNpcAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.TeleportNpcToNpcLabel;
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.TeleportNpcToNpcAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Indicating am object must be loaded
            var loadTypeObject = 0;

            /// Indicating a npc must be loaded
            var loadTypeNpc = 1;

            /**
             * Move choose object to npcaction
             * @class
             */
            Actions.MoveChooseObjectToNpcAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Actions.MoveChooseObjectToNpcAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);
            Actions.MoveChooseObjectToNpcAction.prototype = jQuery.extend(Actions.MoveChooseObjectToNpcAction.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns true if the action has a movement state, else false
             * 
             * @returns {bool} true if the action has a movement state, else false
             */
            Actions.MoveChooseObjectToNpcAction.prototype.hasMovementState = function() {
                return false;
            };

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.MoveChooseObjectToNpcAction.prototype.getContent = function() {
                var templateHtml = "<div class='gn-actionNodeObjectSelectContainer'>" +
                            "<a class='gn-actionNodeObjectSelect gn-clickable'>" + this.getChooseObjectLabel() + "</a>" +
                            "<a class='gn-clickable gn-nodeActionOpenChooseObject' title='" + this.getOpenObjectTooltip() + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>" + 
                        "<div class='gn-actionNodeObjectSelectionSeperator'>" + this.getSelectionSeperatorLabel() + "</div>" +
                        "<div class='gn-actionNodeObjectSelectContainer'>" +
                            "<a class='gn-actionNodeNpcSelect gn-clickable'>" + DefaultNodeShapes.Localization.Actions.ChooseNpcLabel + "</a>" +
                            "<a class='gn-clickable gn-nodeActionOpenObject' title='" + DefaultNodeShapes.Localization.Actions.OpenNpcTooltip + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>";
                
                if(this.hasMovementState())
                {
                    templateHtml += "<input type='text' class='gn-nodeActionMovementState' placeholder='" + DefaultNodeShapes.Localization.Actions.MovementStatePlaceholder + "' list='gn-" + GoNorth.ProjectConfig.ConfigKeys.SetNpcStateAction + "'/>";
                }

                return templateHtml;
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.MoveChooseObjectToNpcAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;

                var objectOpenLink = contentElement.find(".gn-nodeActionOpenChooseObject");
                var npcOpenLink = contentElement.find(".gn-nodeActionOpenObject");

                // Deserialize
                var deserializedData = this.deserializeData();
                if(deserializedData) {
                    this.loadObjectFromDeserialize(deserializedData.objectId);
                    this.loadNpc(deserializedData.npcId);
                }

                // Handlers
                var self = this;
                var selectObjectAction = contentElement.find(".gn-actionNodeObjectSelect");
                selectObjectAction.on("click", function() {
                    self.openChooseObjectDialog().then(function(object) {
                        selectObjectAction.data("selectedobjectid", object.id);
                        selectObjectAction.text(object.name);
                        
                        self.saveData();

                        objectOpenLink.show();
                    });
                });

                objectOpenLink.on("click", function() {
                    if(selectObjectAction.data("selectedobjectid"))
                    {
                        self.openObject(selectObjectAction.data("selectedobjectid"))
                    }
                });


                var selectNpcAction = contentElement.find(".gn-actionNodeNpcSelect");
                selectNpcAction.on("click", function() {
                    GoNorth.DefaultNodeShapes.openNpcSearchDialog().then(function(npc) {
                        selectNpcAction.data("npcid", npc.id);
                        selectNpcAction.text(npc.name);
                        
                        self.saveData();

                        npcOpenLink.show();
                    });
                });
                 
                npcOpenLink.on("click", function() {
                    if(selectNpcAction.data("npcid"))
                    {
                        window.open("/Kortisto/Npc?id=" + selectNpcAction.data("npcid"))
                    }
                });

                var movementState = contentElement.find(".gn-nodeActionMovementState");
                movementState.on("input", function(e) {
                    self.saveData();
                });
            };

            /**
             * Deserializes the data
             */
            Actions.MoveChooseObjectToNpcAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return null;
                }

                var data = JSON.parse(actionData);

                var selectObjectAction = this.contentElement.find(".gn-actionNodeObjectSelect");
                selectObjectAction.data("selectedobjectid", data.objectId);

                var selectNpcAction = this.contentElement.find(".gn-actionNodeNpcSelect");
                selectNpcAction.data("npcid", data.npcId);
                
                this.contentElement.find(".gn-nodeActionMovementState").val(data.movementState);

                this.setRelatedToData();

                return data;
            };

            /**
             * Loads the npc
             * @param {string} objectId Id of the npc
             */
            Actions.MoveChooseObjectToNpcAction.prototype.loadObjectFromDeserialize = function(objectId) {
                if(!objectId) {
                    return;
                }

                var self = this;
                this.loadObjectShared({ loadType: loadTypeObject, objectId: objectId }).then(function(loadedObject) {
                    if(!loadedObject) 
                    {
                        return;
                    }

                    self.contentElement.find(".gn-actionNodeObjectSelect").text(loadedObject.name);
                    self.contentElement.find(".gn-nodeActionOpenChooseObject").show();
                });
            };

            /**
             * Loads the npc
             * @param {string} npcId Id of the npc
             */
            Actions.MoveChooseObjectToNpcAction.prototype.loadNpc = function(npcId) {
                if(!npcId) {
                    return;
                }

                var self = this;
                this.loadObjectShared({ loadType: loadTypeNpc, npcId: npcId }).then(function(npc) {
                    if(!npc) 
                    {
                        return;
                    }

                    self.contentElement.find(".gn-actionNodeNpcSelect").text(npc.name);
                    self.contentElement.find(".gn-nodeActionOpenObject").show();
                });
            };

            /**
             * Sets the related to data
             */
            Actions.MoveChooseObjectToNpcAction.prototype.setRelatedToData = function() {
                var additionalRelatedObjects = [];
                var selectObjectAction = this.contentElement.find(".gn-actionNodeObjectSelect");
                if(selectObjectAction.data("selectedobjectid"))
                {
                    this.nodeModel.set("actionRelatedToObjectType", this.getRelatedToObjectType());
                    this.nodeModel.set("actionRelatedToObjectId", selectObjectAction.data("selectedobjectid"));
                    
                }

                var selectNpcAction = this.contentElement.find(".gn-actionNodeNpcSelect");
                if(selectNpcAction.data("npcid"))
                {
                    additionalRelatedObjects.push({
                        objectType: Actions.RelatedToObjectNpc,
                        objectId: selectNpcAction.data("npcid")
                    });
                }

                this.nodeModel.set("actionRelatedToAdditionalObjects", additionalRelatedObjects);
            }

            /**
             * Saves the data
             */
            Actions.MoveChooseObjectToNpcAction.prototype.saveData = function() {
                this.setRelatedToData();
                
                var selectObjectAction = this.contentElement.find(".gn-actionNodeObjectSelect");
                var selectNpcAction = this.contentElement.find(".gn-actionNodeNpcSelect");

                var movementState = this.contentElement.find(".gn-nodeActionMovementState").val();
                if(!movementState)
                {
                    movementState = "";
                }

                var serializeData = {
                    objectId: selectObjectAction.data("selectedobjectid"),
                    npcId: selectNpcAction.data("npcid"),
                    movementState: movementState
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));
            };

            
            /**
             * Returns the object id
             * 
             * @returns {string} Object Id
             */
            Actions.MoveChooseObjectToNpcAction.prototype.getObjectId = function(existingData) {
                if(existingData.loadType == loadTypeNpc)
                {
                    return existingData.npcId;
                }

                return existingData.objectId;
            };
            
            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.MoveChooseObjectToNpcAction.prototype.getObjectResource = function(existingData) {
                if(existingData.loadType == loadTypeNpc)
                {
                    return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
                }

                return this.getObjectResourceType();
            };

            /**
             * Loads the npc
             * 
             * @param {string} objectId Extracted object id
             * @param {string} existingData Existing data
             * @returns {jQuery.Deferred} Deferred for the objcet loading
             */
            Actions.MoveChooseObjectToNpcAction.prototype.loadObject = function(objectId, existingData) {
                if(existingData.loadType == loadTypeNpc)
                {
                    var def = new jQuery.Deferred();

                    var selectNpcAction = this.contentElement.find(".gn-actionNodeNpcSelect");
                    GoNorth.HttpClient.get("/api/KortistoApi/FlexFieldObject?id=" + selectNpcAction.data("npcid")).done(function(data) {
                        def.resolve(data);
                    }).fail(function(xhr) {
                        def.reject();
                    });

                    return def.promise();
                }

                return this.loadChoosenObject(existingData.objectId);
            };
            
            /**
             * Returns the config key for the action
             * 
             * @returns {string} Config key
             */
            Actions.MoveChooseObjectToNpcAction.prototype.getConfigKey = function() {
                if(this.hasMovementState())
                {
                    return GoNorth.ProjectConfig.ConfigKeys.SetNpcStateAction;
                }

                return null;
            };

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for teleporting an npc to an npc which is choosen
            var actionTypeTeleportChoseNpcToNpc = 45;

            /**
             * Teleport choose npc Action
             * @class
             */
            Actions.TeleportChooseNpcToNpcAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.MoveChooseObjectToNpcAction.apply(this);
            };

            Actions.TeleportChooseNpcToNpcAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.MoveChooseObjectToNpcAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.TeleportChooseNpcToNpcAction.prototype.buildAction = function() {
                return new Actions.TeleportChooseNpcToNpcAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.TeleportChooseNpcToNpcAction.prototype.getType = function() {
                return actionTypeTeleportChoseNpcToNpc;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.TeleportChooseNpcToNpcAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.TeleportChooseNpcToNpcLabel;
            };
        

            /**
             * Opens the choose object dialog
             * 
             * @returns {jQuery.Deferred} Deferred that will be resolved with the choosen object
             */
            Actions.TeleportChooseNpcToNpcAction.prototype.openChooseObjectDialog = function() {
                return GoNorth.DefaultNodeShapes.openNpcSearchDialog();
            };

            /**
             * Returns the choose label
             * 
             * @returns {string} Label for choosing
             */
            Actions.TeleportChooseNpcToNpcAction.prototype.getChooseObjectLabel = function() {
                return DefaultNodeShapes.Localization.Actions.ChooseNpcLabel;
            };

            /**
             * Returns the selections seperator label
             * 
             * @returns {string} Label for seperation
             */
            Actions.TeleportChooseNpcToNpcAction.prototype.getSelectionSeperatorLabel = function() {
                return DefaultNodeShapes.Localization.Actions.TeleportToNpc;
            };

            /**
             * Returns the choose label
             * 
             * @returns {string} Label for choosing
             */
            Actions.TeleportChooseNpcToNpcAction.prototype.getOpenObjectTooltip = function() {
                return DefaultNodeShapes.Localization.Actions.OpenNpcTooltip;
            };

            /**
             * Opens the object
             * 
             * @param {string} id Id of the object
             */
            Actions.TeleportChooseNpcToNpcAction.prototype.openObject = function(id) {
                window.open("/Kortisto/Npc?id=" + id)
            }

            /**
             * Returns the related object type of the choosen object
             * 
             * @returns {string} Related object type of the choosen object
             */
            Actions.TeleportChooseNpcToNpcAction.prototype.getRelatedToObjectType = function() {
                return Actions.RelatedToObjectNpc;
            };

            /**
             * Returns the loading object resource type
             * 
             * @returns {number} Loading objcet resource type
             */
            Actions.TeleportChooseNpcToNpcAction.prototype.getObjectResourceType = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
            };

            /**
             * Loads the choosen object
             * 
             * @returns {number} Loading objcet resource type
             * @param {string} npcId Npc Id
             * @returns {jQuery.Deferred} Deferred for the objcet loading
             */
            Actions.TeleportChooseNpcToNpcAction.prototype.loadChoosenObject = function(npcId) {
                var def = new jQuery.Deferred();

                GoNorth.HttpClient.get("/api/KortistoApi/FlexFieldObject?id=" + npcId).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.TeleportChooseNpcToNpcAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for walking an npc to an npc
            var actionTypeWalkNpcToNpc = 46;

            /**
             * Walk npc to npc Action
             * @class
             */
            Actions.WalkNpcToNpcAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.MoveObjectToNpcAction.apply(this);
            };

            Actions.WalkNpcToNpcAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.MoveObjectToNpcAction.prototype);

            /**
             * Returns true if the action has a movement state, else false
             * 
             * @returns {bool} true if the action has a movement state, else false
             */
            Actions.WalkNpcToNpcAction.prototype.hasMovementState = function() {
                return true;
            };

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.WalkNpcToNpcAction.prototype.buildAction = function() {
                return new Actions.WalkNpcToNpcAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.WalkNpcToNpcAction.prototype.getType = function() {
                return actionTypeWalkNpcToNpc;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.WalkNpcToNpcAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.WalkNpcToNpcLabel;
            };
            /**
             * Returns the label for the main output
             * 
             * @returns {string} Label for the main output
             */
            Actions.WalkNpcToNpcAction.prototype.getMainOutputLabel = function() {
                return DefaultNodeShapes.Localization.Actions.WalkOnTargetReachLabel;
            };

            /**
             * Returns the additional outports of the action
             * 
             * @returns {string[]} Additional outports
             */
            Actions.WalkNpcToNpcAction.prototype.getAdditionalOutports = function() {
                return [ DefaultNodeShapes.Localization.Actions.WalkDirectContinueLabel ];
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.WalkNpcToNpcAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for walking an npc to an npc which is choosen
            var actionTypeWalkChoseNpcToNpc = 47;

            /**
             * Walk choose npc Action
             * @class
             */
            Actions.WalkChooseNpcToNpcAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.MoveChooseObjectToNpcAction.apply(this);
            };

            Actions.WalkChooseNpcToNpcAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.MoveChooseObjectToNpcAction.prototype);

            /**
             * Returns true if the action has a movement state, else false
             * 
             * @returns {bool} true if the action has a movement state, else false
             */
            Actions.WalkChooseNpcToNpcAction.prototype.hasMovementState = function() {
                return true;
            };

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.WalkChooseNpcToNpcAction.prototype.buildAction = function() {
                return new Actions.WalkChooseNpcToNpcAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.WalkChooseNpcToNpcAction.prototype.getType = function() {
                return actionTypeWalkChoseNpcToNpc;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.WalkChooseNpcToNpcAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.WalkChooseNpcToNpcLabel;
            };
                
            /**
             * Returns the label for the main output
             * 
             * @returns {string} Label for the main output
             */
            Actions.WalkChooseNpcToNpcAction.prototype.getMainOutputLabel = function() {
                return DefaultNodeShapes.Localization.Actions.WalkOnTargetReachLabel;
            };

            /**
             * Returns the additional outports of the action
             * 
             * @returns {string[]} Additional outports
             */
            Actions.WalkChooseNpcToNpcAction.prototype.getAdditionalOutports = function() {
                return [ DefaultNodeShapes.Localization.Actions.WalkDirectContinueLabel ];
            };


            /**
             * Opens the choose object dialog
             * 
             * @returns {jQuery.Deferred} Deferred that will be resolved with the choosen object
             */
            Actions.WalkChooseNpcToNpcAction.prototype.openChooseObjectDialog = function() {
                return GoNorth.DefaultNodeShapes.openNpcSearchDialog();
            };

            /**
             * Returns the choose label
             * 
             * @returns {string} Label for choosing
             */
            Actions.WalkChooseNpcToNpcAction.prototype.getChooseObjectLabel = function() {
                return DefaultNodeShapes.Localization.Actions.ChooseNpcLabel;
            };

            /**
             * Returns the selections seperator label
             * 
             * @returns {string} Label for seperation
             */
            Actions.WalkChooseNpcToNpcAction.prototype.getSelectionSeperatorLabel = function() {
                return DefaultNodeShapes.Localization.Actions.WalkToNpc;
            };

            /**
             * Returns the choose label
             * 
             * @returns {string} Label for choosing
             */
            Actions.WalkChooseNpcToNpcAction.prototype.getOpenObjectTooltip = function() {
                return DefaultNodeShapes.Localization.Actions.OpenNpcTooltip;
            };

            /**
             * Opens the object
             * 
             * @param {string} id Id of the object
             */
            Actions.WalkChooseNpcToNpcAction.prototype.openObject = function(id) {
                window.open("/Kortisto/Npc?id=" + id)
            }

            /**
             * Returns the related object type of the choosen object
             * 
             * @returns {string} Related object type of the choosen object
             */
            Actions.WalkChooseNpcToNpcAction.prototype.getRelatedToObjectType = function() {
                return Actions.RelatedToObjectNpc;
            };

            /**
             * Returns the loading object resource type
             * 
             * @returns {number} Loading objcet resource type
             */
            Actions.WalkChooseNpcToNpcAction.prototype.getObjectResourceType = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
            };

            /**
             * Loads the choosen object
             * 
             * @returns {number} Loading objcet resource type
             * @param {string} npcId Npc Id
             * @returns {jQuery.Deferred} Deferred for the objcet loading
             */
            Actions.WalkChooseNpcToNpcAction.prototype.loadChoosenObject = function(npcId) {
                var def = new jQuery.Deferred();

                GoNorth.HttpClient.get("/api/KortistoApi/FlexFieldObject?id=" + npcId).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.WalkChooseNpcToNpcAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Indicating am object must be loaded
            var loadTypeObject = 0;

            /// Indicating a marker must be loaded
            var loadTypeMarker = 1;

            /**
             * Spawn object action
             * @class
             */
            Actions.SpawnChooseObjectAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.BaseAction.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Actions.SpawnChooseObjectAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.BaseAction.prototype);
            Actions.SpawnChooseObjectAction.prototype = jQuery.extend(Actions.SpawnChooseObjectAction.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the HTML Content of the action
             * 
             * @returns {string} HTML Content of the action
             */
            Actions.SpawnChooseObjectAction.prototype.getContent = function() {
                return "<div class='gn-actionNodeObjectSelectContainer'>" +
                            "<a class='gn-actionNodeObjectSelect gn-clickable'>" + this.getChooseObjectLabel() + "</a>" +
                            "<a class='gn-clickable gn-nodeActionOpenChooseObject' title='" + this.getOpenObjectTooltip() + "' style='display: none'><i class='glyphicon glyphicon-eye-open'></i></a>" +
                        "</div>" + 
                        "<div class='gn-actionNodeObjectSelectionSeperator'>" + this.getSelectionSeperatorLabel() + "</div>" +
                        "<div class='gn-actionNodeObjectSelectContainer gn-spawnObjectMarkerActionContainer'>" +
                            "<a class='gn-actionNodeMarkerSelect gn-spawnObjectMarkerAction gn-clickable'>" + DefaultNodeShapes.Localization.Actions.ChooseMarkerLabel + "</a>" +
                            "<a class='gn-clickable gn-nodeActionOpenObject' title='" + DefaultNodeShapes.Localization.Actions.OpenMarkerTooltip + "' style='display: none'><i class='glyphicon glyphicon-eye-open gn-spawnObjectMarkerActionOpenIcon'></i></a>" +
                        "</div>" +
                        "<div class='gn-actionNodeObjectSelectionSeperator'>" + DefaultNodeShapes.Localization.Actions.RotationLabel + "</div>" +
                        "<div class='gn-actionNodeObjectSelectContainer'>" +
                            "<input type='text' class='gn-actionNodeObjectSpawnRotation gn-actionNodeObjectSpawnRotationPitch' placeholder='" + DefaultNodeShapes.Localization.Actions.PitchLabel + "' value='0'/>" +
                            "<input type='text' class='gn-actionNodeObjectSpawnRotation gn-actionNodeObjectSpawnRotationYaw' placeholder='" + DefaultNodeShapes.Localization.Actions.YawLabel + "' value='0'/>" +
                            "<input type='text' class='gn-actionNodeObjectSpawnRotation gn-actionNodeObjectSpawnRotationRoll' placeholder='" + DefaultNodeShapes.Localization.Actions.RollLabel + "' value='0'/>" +
                        "</div>";
            };

            /**
             * Gets called once the action was intialized
             * 
             * @param {object} contentElement Content element
             * @param {ActionNode} actionNode Parent Action node
             */
            Actions.SpawnChooseObjectAction.prototype.onInitialized = function(contentElement, actionNode) {
                this.contentElement = contentElement;

                var objectOpenLink = contentElement.find(".gn-nodeActionOpenChooseObject");
                var markerOpenLink = contentElement.find(".gn-nodeActionOpenObject");

                // Deserialize
                var deserializedData = this.deserializeData();
                if(deserializedData) {
                    this.loadObjectFromDeserialize(deserializedData.objectId);
                    this.loadMarkerFromMap(deserializedData.mapId, deserializedData.markerId);

                    contentElement.find(".gn-actionNodeObjectSpawnRotationPitch").val(deserializedData.pitch ? deserializedData.pitch : 0);
                    contentElement.find(".gn-actionNodeObjectSpawnRotationYaw").val(deserializedData.yaw ? deserializedData.yaw : 0);
                    contentElement.find(".gn-actionNodeObjectSpawnRotationRoll").val(deserializedData.roll ? deserializedData.roll : 0);
                }

                // Handlers
                var self = this;
                var selectObjectAction = contentElement.find(".gn-actionNodeObjectSelect");
                selectObjectAction.on("click", function() {
                    self.openChooseObjectDialog().then(function(object) {
                        selectObjectAction.data("selectedobjectid", object.id);
                        selectObjectAction.text(object.name);
                        
                        self.saveData();

                        objectOpenLink.show();
                    });
                });

                objectOpenLink.on("click", function() {
                    if(selectObjectAction.data("selectedobjectid"))
                    {
                        self.openObject(selectObjectAction.data("selectedobjectid"))
                    }
                });


                var selectMarkerAction = contentElement.find(".gn-actionNodeMarkerSelect");
                selectMarkerAction.on("click", function() {
                    GoNorth.DefaultNodeShapes.openMarkerSearchDialog().then(function(marker) {
                        selectMarkerAction.data("mapid", marker.mapId);
                        selectMarkerAction.data("markerid", marker.id);
                        selectMarkerAction.data("markertype", marker.markerType);
                        selectMarkerAction.text(marker.name);
                        selectMarkerAction.prop("title", marker.name);
                        
                        self.saveData();

                        markerOpenLink.show();
                    });
                });
                 
                markerOpenLink.on("click", function() {
                    if(selectMarkerAction.data("markerid"))
                    {
                        window.open("/Karta?id=" + selectMarkerAction.data("mapid") + "&zoomOnMarkerId=" + selectMarkerAction.data("markerid") + "&zoomOnMarkerType=" + selectMarkerAction.data("markertype"))
                    }
                });


                var nodeObjectSpawnRotation = contentElement.find(".gn-actionNodeObjectSpawnRotation");
                nodeObjectSpawnRotation.keydown(function(e) {
                    GoNorth.Util.validateNumberKeyPress(jQuery(this), e);
                });

                nodeObjectSpawnRotation.change(function(e) {
                    self.ensureNumberValue(jQuery(this));
                    self.saveData();
                });
            };

            /**
             * Ensures a number value for an input element
             * 
             * @param {object} rotationElement Element with the rotation
             */
            Actions.SpawnChooseObjectAction.prototype.ensureNumberValue = function(rotationElement) {
                var parsedValue = parseInt(rotationElement.val());
                if(isNaN(parsedValue))
                {
                    rotationElement.val("");
                }
            };

            /**
             * Deserializes the data
             */
            Actions.SpawnChooseObjectAction.prototype.deserializeData = function() {
                var actionData = this.nodeModel.get("actionData");
                if(!actionData)
                {
                    return null;
                }

                var data = JSON.parse(actionData);

                var selectObjectAction = this.contentElement.find(".gn-actionNodeObjectSelect");
                selectObjectAction.data("selectedobjectid", data.objectId);

                var selectMarkerAction = this.contentElement.find(".gn-actionNodeMarkerSelect");
                selectMarkerAction.data("mapid", data.mapId);
                selectMarkerAction.data("markerid", data.markerId);
                selectMarkerAction.data("markertype", data.markerType);

                this.setRelatedToData();

                return data;
            };

            /**
             * Loads the marker from a map
             * @param {string} mapId Id of the map
             * @param {string} markerId Id of the marker
             */
            Actions.SpawnChooseObjectAction.prototype.loadObjectFromDeserialize = function(objectId) {
                if(!objectId) {
                    return;
                }

                var self = this;
                this.loadObjectShared({ loadType: loadTypeObject, objectId: objectId }).then(function(loadedObject) {
                    if(!loadedObject) 
                    {
                        return;
                    }

                    self.contentElement.find(".gn-actionNodeObjectSelect").text(loadedObject.name);
                    self.contentElement.find(".gn-nodeActionOpenChooseObject").show();
                });
            };

            /**
             * Loads the marker from a map
             * @param {string} mapId Id of the map
             * @param {string} markerId Id of the marker
             */
            Actions.SpawnChooseObjectAction.prototype.loadMarkerFromMap = function(mapId, markerId) {
                if(!mapId || !markerId) {
                    return;
                }

                var self = this;
                this.loadObjectShared({ loadType: loadTypeMarker, mapId: mapId, markerId: markerId }).then(function(marker) {
                    if(!marker) 
                    {
                        return;
                    }

                    var markerName = marker.markerName + " (" + marker.mapName + ")";
                    self.contentElement.find(".gn-actionNodeMarkerSelect").text(markerName);
                    self.contentElement.find(".gn-actionNodeMarkerSelect").prop("title", markerName);
                    self.contentElement.find(".gn-nodeActionOpenObject").show();
                });
            };

            /**
             * Sets the related to data
             */
            Actions.SpawnChooseObjectAction.prototype.setRelatedToData = function() {
                var additionalRelatedObjects = [];
                var selectObjectAction = this.contentElement.find(".gn-actionNodeObjectSelect");
                if(selectObjectAction.data("selectedobjectid"))
                {
                    this.nodeModel.set("actionRelatedToObjectType", this.getRelatedToObjectType());
                    this.nodeModel.set("actionRelatedToObjectId", selectObjectAction.data("selectedobjectid"));
                    
                }

                var selectMarkerAction = this.contentElement.find(".gn-actionNodeMarkerSelect");
                if(selectMarkerAction.data("markerid"))
                {
                    additionalRelatedObjects.push({
                        objectType: Actions.RelatedToObjectMapMarker,
                        objectId: selectMarkerAction.data("markerid")
                    });
                }

                if(selectMarkerAction.data("mapid"))
                {
                    additionalRelatedObjects.push({
                        objectType: Actions.RelatedToObjectMap,
                        objectId: selectMarkerAction.data("mapid")
                    });
                }
                this.nodeModel.set("actionRelatedToAdditionalObjects", additionalRelatedObjects);
            }

            /**
             * Saves the data
             */
            Actions.SpawnChooseObjectAction.prototype.saveData = function() {
                this.setRelatedToData();
                
                var selectObjectAction = this.contentElement.find(".gn-actionNodeObjectSelect");
                var selectMarkerAction = this.contentElement.find(".gn-actionNodeMarkerSelect");

                var serializeData = {
                    objectId: selectObjectAction.data("selectedobjectid"),
                    mapId: selectMarkerAction.data("mapid"),
                    markerId: selectMarkerAction.data("markerid"),
                    markerType: selectMarkerAction.data("markertype"),
                    pitch: this.extractRotationValue(this.contentElement.find(".gn-actionNodeObjectSpawnRotationPitch")),
                    yaw: this.extractRotationValue(this.contentElement.find(".gn-actionNodeObjectSpawnRotationYaw")),
                    roll: this.extractRotationValue(this.contentElement.find(".gn-actionNodeObjectSpawnRotationRoll"))
                };

                this.nodeModel.set("actionData", JSON.stringify(serializeData));
            };

            /**
             * Extracts a rotation value
             * 
             * @param {object} rotationElement Element with the rotation
             * @returns {float} Rotation
             */
            Actions.SpawnChooseObjectAction.prototype.extractRotationValue = function(rotationElement) {
                var parsedValue = parseInt(rotationElement.val());
                if(isNaN(parsedValue))
                {
                    return 0;
                }

                return parsedValue;
            };

            
            /**
             * Returns the object id
             * 
             * @returns {string} Object Id
             */
            Actions.SpawnChooseObjectAction.prototype.getObjectId = function(existingData) {
                if(existingData.loadType == loadTypeMarker)
                {
                    return existingData.mapId + "|" + existingData.markerId;
                }

                return existingData.objectId;
            };
            
            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Actions.SpawnChooseObjectAction.prototype.getObjectResource = function(existingData) {
                if(existingData.loadType == loadTypeMarker)
                {
                    return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceMapMarker;
                }

                return this.getObjectResourceType();
            };

            /**
             * Loads the marker or object
             * 
             * @param {string} objectId Extracted object id
             * @param {string} existingData Existing data
             * @returns {jQuery.Deferred} Deferred for the objcet loading
             */
            Actions.SpawnChooseObjectAction.prototype.loadObject = function(objectId, existingData) {
                if(existingData.loadType == loadTypeMarker)
                {
                    var def = new jQuery.Deferred();

                    var selectMarkerAction = this.contentElement.find(".gn-actionNodeMarkerSelect");
                    GoNorth.HttpClient.get("/api/KartaApi/GetMarker?mapId=" + selectMarkerAction.data("mapid") + "&markerId=" + selectMarkerAction.data("markerid")).done(function(data) {
                        def.resolve(data);
                    }).fail(function(xhr) {
                        def.reject();
                    });

                    return def.promise();
                }

                return this.loadChoosenObject(existingData.objectId);
            };

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for spawning an npc at a marker
            var actionTypeSpawnNpcAtMarker = 48;

            /**
             * Spawn npc at marker Action
             * @class
             */
            Actions.SpawnNpcAtMarkerAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.SpawnChooseObjectAction.apply(this);
            };

            Actions.SpawnNpcAtMarkerAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.SpawnChooseObjectAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.SpawnNpcAtMarkerAction.prototype.buildAction = function() {
                return new Actions.SpawnNpcAtMarkerAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.SpawnNpcAtMarkerAction.prototype.getType = function() {
                return actionTypeSpawnNpcAtMarker;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.SpawnNpcAtMarkerAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.SpawnNpcAtMarkerLabel;
            };
        

            /**
             * Opens the choose object dialog
             * 
             * @returns {jQuery.Deferred} Deferred that will be resolved with the choosen object
             */
            Actions.SpawnNpcAtMarkerAction.prototype.openChooseObjectDialog = function() {
                return GoNorth.DefaultNodeShapes.openNpcSearchDialog();
            };

            /**
             * Returns the choose label
             * 
             * @returns {string} Label for choosing
             */
            Actions.SpawnNpcAtMarkerAction.prototype.getChooseObjectLabel = function() {
                return DefaultNodeShapes.Localization.Actions.ChooseNpcLabel;
            };

            /**
             * Returns the selections seperator label
             * 
             * @returns {string} Label for seperation
             */
            Actions.SpawnNpcAtMarkerAction.prototype.getSelectionSeperatorLabel = function() {
                return DefaultNodeShapes.Localization.Actions.SpawnAt;
            };

            /**
             * Returns the choose label
             * 
             * @returns {string} Label for choosing
             */
            Actions.SpawnNpcAtMarkerAction.prototype.getOpenObjectTooltip = function() {
                return DefaultNodeShapes.Localization.Actions.OpenNpcTooltip;
            };

            /**
             * Opens the object
             * 
             * @param {string} id Id of the object
             */
            Actions.SpawnNpcAtMarkerAction.prototype.openObject = function(id) {
                window.open("/Kortisto/Npc?id=" + id)
            }

            /**
             * Returns the related object type of the choosen object
             * 
             * @returns {string} Related object type of the choosen object
             */
            Actions.SpawnNpcAtMarkerAction.prototype.getRelatedToObjectType = function() {
                return Actions.RelatedToObjectNpc;
            };

            /**
             * Returns the loading object resource type
             * 
             * @returns {number} Loading objcet resource type
             */
            Actions.SpawnNpcAtMarkerAction.prototype.getObjectResourceType = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
            };

            /**
             * Loads the choosen object
             * 
             * @returns {number} Loading objcet resource type
             * @param {string} npcId Npc Id
             * @returns {jQuery.Deferred} Deferred for the objcet loading
             */
            Actions.SpawnNpcAtMarkerAction.prototype.loadChoosenObject = function(npcId) {
                var def = new jQuery.Deferred();

                GoNorth.HttpClient.get("/api/KortistoApi/FlexFieldObject?id=" + npcId).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.SpawnNpcAtMarkerAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Actions) {

            /// Action Type for spawning an item at a marker
            var actionTypeSpawnItemAtMarker = 49;

            /**
             * Spawn item at marker Action
             * @class
             */
            Actions.SpawnItemAtMarkerAction = function()
            {
                GoNorth.DefaultNodeShapes.Actions.SpawnChooseObjectAction.apply(this);
            };

            Actions.SpawnItemAtMarkerAction.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Actions.SpawnChooseObjectAction.prototype);

            /**
             * Builds the action
             * 
             * @returns {object} Action
             */
            Actions.SpawnItemAtMarkerAction.prototype.buildAction = function() {
                return new Actions.SpawnItemAtMarkerAction();
            };

            /**
             * Returns the type of the action
             * 
             * @returns {number} Type of the action
             */
            Actions.SpawnItemAtMarkerAction.prototype.getType = function() {
                return actionTypeSpawnItemAtMarker;
            };

            /**
             * Returns the label of the action
             * 
             * @returns {string} Label of the action
             */
            Actions.SpawnItemAtMarkerAction.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Actions.SpawnItemAtMarkerLabel;
            };
        

            /**
             * Opens the choose object dialog
             * 
             * @returns {jQuery.Deferred} Deferred that will be resolved with the choosen object
             */
            Actions.SpawnItemAtMarkerAction.prototype.openChooseObjectDialog = function() {
                return GoNorth.DefaultNodeShapes.openItemSearchDialog();
            };

            /**
             * Returns the choose label
             * 
             * @returns {string} Label for choosing
             */
            Actions.SpawnItemAtMarkerAction.prototype.getChooseObjectLabel = function() {
                return DefaultNodeShapes.Localization.Actions.ChooseItemLabel;
            };

            /**
             * Returns the selections seperator label
             * 
             * @returns {string} Label for seperation
             */
            Actions.SpawnItemAtMarkerAction.prototype.getSelectionSeperatorLabel = function() {
                return DefaultNodeShapes.Localization.Actions.SpawnAt;
            };

            /**
             * Returns the choose label
             * 
             * @returns {string} Label for choosing
             */
            Actions.SpawnItemAtMarkerAction.prototype.getOpenObjectTooltip = function() {
                return DefaultNodeShapes.Localization.Actions.OpenItemTooltip;
            };

            /**
             * Opens the object
             * 
             * @param {string} id Id of the object
             */
            Actions.SpawnItemAtMarkerAction.prototype.openObject = function(id) {
                window.open("/Styr/Item?id=" + id)
            }

            /**
             * Returns the related object type of the choosen object
             * 
             * @returns {string} Related object type of the choosen object
             */
            Actions.SpawnItemAtMarkerAction.prototype.getRelatedToObjectType = function() {
                return Actions.RelatedToObjectItem;
            };

            /**
             * Returns the loading object resource type
             * 
             * @returns {number} Loading objcet resource type
             */
            Actions.SpawnItemAtMarkerAction.prototype.getObjectResourceType = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceItem;
            };

            /**
             * Loads the choosen object
             * 
             * @returns {number} Loading objcet resource type
             * @param {string} itemId Item Id
             * @returns {jQuery.Deferred} Deferred for the objcet loading
             */
            Actions.SpawnItemAtMarkerAction.prototype.loadChoosenObject = function(itemId) {
                var def = new jQuery.Deferred();

                GoNorth.HttpClient.get("/api/StyrApi/FlexFieldObject?id=" + itemId).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Shapes.addAvailableAction(new Actions.SpawnItemAtMarkerAction());

        }(DefaultNodeShapes.Actions = DefaultNodeShapes.Actions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /**
             * Condition Manager
             * @class
             */
            var conditionManager = function()
            {
                this.availableConditionTypes = [];
            };

            conditionManager.prototype = {
                /**
                 * Adds a new condition type to the manager
                 * 
                 * @param {object} condition Condition type to add
                 */
                addConditionType: function(condition) {
                    this.availableConditionTypes.push(condition);
                },

                /**
                 * Returns the available condition types
                 * 
                 * @returns {object} Condition Types
                 */
                getConditionTypes: function() {
                    return this.availableConditionTypes;
                },

                /**
                 * Returns the available condition types which can be selected
                 * 
                 * @returns {object} Condition Types which can be selected
                 */
                getSelectableConditionTypes: function() {
                    var selectableConditionTypes = [];
                    for(var curConditionType = 0; curConditionType < this.availableConditionTypes.length; ++curConditionType)
                    {
                        if(this.availableConditionTypes[curConditionType].canBeSelected())
                        {
                            selectableConditionTypes.push(this.availableConditionTypes[curConditionType]);
                        }
                    }
                    return selectableConditionTypes;
                },

                /**
                 * Returns the available condition types
                 * 
                 * @param {number} type Type of the condition
                 * @returns {string} Condition template
                 */
                getConditionTemplate: function(type) {
                    var conditionType = this.getConditionType(type);
                    if(conditionType)
                    {
                        return conditionType.getTemplateName();
                    }

                    return "gn-nodeConditionEmpty";
                },

                /**
                 * Returns true if a condition type is selectable, else false
                 * 
                 * @param {number} type Type of the condition
                 * @returns {bool} true if the condition type is selectable, else false
                 */
                isConditionTypeSelectable: function(type) {
                    var conditionType = this.getConditionType(type);
                    if(conditionType)
                    {
                        return conditionType.canBeSelected();
                    }

                    return true;
                },

                /**
                 * Builds the condition data
                 * 
                 * @param {number} type Type of the condition
                 * @param {object} existingData Existing data
                 * @param {object} element Element to which the data belongs
                 * @returns {object} Condition data
                 */
                buildConditionData: function(type, existingData, element) {
                    element.errorOccured(false);
                    var conditionType = this.getConditionType(type);
                    if(conditionType)
                    {
                        return conditionType.buildConditionData(existingData, element);
                    }

                    return null;
                },

                /**
                 * Serializes a condition
                 * 
                 * @param {object} existingData Existing Condition Data
                 * @returns {object} Serialized condition data
                 */
                serializeCondition: function(existingData) {
                    var serializedCondition = {
                        id: existingData.id,
                        dependsOnObjects: Conditions.getConditionManager().getConditionElementsDependsOnObject(existingData.conditionElements),
                        conditionElements: JSON.stringify(existingData.conditionElements)
                    };
                    return serializedCondition;
                },

                /**
                 * Deserializes a condition
                 * 
                 * @param {object} serializedCondition Serialized condition
                 * @returns {object} Deserialized condition data
                 */
                deserializeCondition: function(serializedCondition) {
                    var existingData = {
                        id: serializedCondition.id,
                        conditionElements: JSON.parse(serializedCondition.conditionElements)
                    };
                    return existingData;
                },

                /**
                 * Serializes a condition element
                 * 
                 * @param {object} conditionElement Condition Element
                 * @returns {object} Serialized Condition Element
                 */
                serializeConditionElement: function(conditionElement) {
                    var conditionType = this.getConditionType(conditionElement.conditionType());
                    if(conditionType)
                    {
                        return {
                            conditionType: conditionElement.conditionType(),
                            conditionData: conditionType.serializeConditionData(conditionElement.conditionData())
                        }
                    }

                    return null;
                },

                /**
                 * Returns the objects on which a group of condition element depends
                 * 
                 * @param {number} type Type of the condition
                 * @param {object} existingData Existing condition data
                 * @returns {object[]} Data of objects on which the condition element depends
                 */
                getConditionElementsDependsOnObject: function(conditionElements) {
                    var pushedObjects = {};
                    var allDependencies = [];
                    for(var curElement = 0; curElement < conditionElements.length; ++curElement)
                    {
                        var elementDependencies = Conditions.getConditionManager().getConditionElementDependsOnObject(conditionElements[curElement].conditionType, conditionElements[curElement].conditionData);
                        for(var curDependency = 0; curDependency < elementDependencies.length; ++curDependency)
                        {
                            var key = elementDependencies[curDependency].objectType + "|" + elementDependencies[curDependency].objectId;
                            if(!pushedObjects[key])
                            {
                                allDependencies.push(elementDependencies[curDependency]);
                                pushedObjects[key] = true;
                            }
                        }
                    }
                    return allDependencies;
                },

                /**
                 * Returns the objects on which a condition element depends
                 * 
                 * @param {number} type Type of the condition
                 * @param {object} existingData Existing condition data
                 * @returns {object[]} Data of objects on which the condition element depends
                 */
                getConditionElementDependsOnObject: function(type, existingData) {
                    var conditionType = this.getConditionType(type);
                    if(conditionType)
                    {
                        return conditionType.getConditionDependsOnObject(existingData);
                    }
                    return [];
                },
                
                /**
                 * Returns the condition type
                 * 
                 * @param {number} type Type of the condition
                 * @returns {object} Condition Type
                 */
                getConditionType: function(type) {
                    for(var curConditionType = 0; curConditionType < this.availableConditionTypes.length; ++curConditionType)
                    {
                        if(this.availableConditionTypes[curConditionType].getType() == type)
                        {
                            return this.availableConditionTypes[curConditionType];
                        }
                    }

                    return null;
                },

                /**
                 * Converts the condition elements
                 * 
                 * @param {object[]} elements Elements to convert
                 */
                convertElements: function(elements) {
                    var convertedElements = [];
                    for(var curElement = 0; curElement < elements.length; ++curElement)
                    {
                        var element = this.convertElement(elements[curElement]);
                        convertedElements.push(element);
                    }

                    return convertedElements;
                },

                /**
                 * Convertes an element
                 * 
                 * @param {object} element Element to convert
                 * @returns {object} Condition Element
                 */
                convertElement: function(element) {
                    var convertedElement = {
                        isSelected: new ko.observable(false),
                        conditionType: new ko.observable(element.conditionType),
                        conditionData: new ko.observable(null),
                        conditionTemplate: new ko.observable("gn-nodeConditionEmpty"),
                        parent: null,
                        errorOccured: new ko.observable(false)
                    };
                    convertedElement.conditionData(this.buildConditionData(element.conditionType, element.conditionData, convertedElement));
                    convertedElement.conditionTemplate(this.getConditionTemplate(element.conditionType));
                    this.addSharedFunctions(convertedElement);

                    return convertedElement;
                },

                /**
                 * Creates an empty element
                 * 
                 * @returns {object} Condition Element
                 */
                createEmptyElement: function() {
                    var element = {
                        isSelected: new ko.observable(false),
                        conditionType: new ko.observable(""),
                        conditionData: new ko.observable(null),
                        conditionTemplate: new ko.observable("gn-nodeConditionEmpty"),
                        parent: null,
                        errorOccured: new ko.observable(false)
                    };
                    this.addSharedFunctions(element);
                    return element;
                },

                /**
                 * Adds the shared functions to a condition
                 * 
                 * @param {object} element Condition Element
                 */
                addSharedFunctions: function(element) {
                    var self = this;
                    element.conditionType.subscribe(function() {
                        element.conditionTemplate("gn-nodeConditionEmpty");
                        element.conditionData(self.buildConditionData(element.conditionType(), null, element));
                        element.conditionTemplate(self.getConditionTemplate(element.conditionType()));
                    });
                },


                /**
                 * Returns the condition string for a condition
                 * @param {object[]} conditionElements Condition Elements
                 * @param {string} joinOperator Operator used for the join
                 * @param {bool} addBrackets true if brackets should be added around the result, else false
                 * @returns {jQuery.Deferred} Deferred for loading the text
                 */
                getConditionString: function(conditionElements, joinOperator, addBrackets) {
                    var conditionDef = new jQuery.Deferred();

                    var allElementsDef = [];
                    for(var curElement = 0; curElement < conditionElements.length; ++curElement)
                    {
                        var conditionType = this.getConditionType(conditionElements[curElement].conditionType);
                        allElementsDef.push(conditionType.getConditionString(conditionElements[curElement].conditionData));
                    }

                    jQuery.when.apply(jQuery, allElementsDef).then(function() {
                        if(arguments.length == 0)
                        {
                            conditionDef.resolve("");
                            return;
                        }

                        var allTextLines = [];
                        for(var curArgument = 0; curArgument < arguments.length; ++curArgument)
                        {
                            allTextLines.push(arguments[curArgument]);
                        }
                        var joinedValue = allTextLines.join(" " + joinOperator + " ");
                        if(addBrackets)
                        {
                            joinedValue = "(" + joinedValue + ")";
                        }
                        conditionDef.resolve(joinedValue);
                    }, function(err) {
                        conditionDef.reject(err);
                    });

                    return conditionDef.promise();
                }
            };


            var instance = new conditionManager();

            /**
             * Returns the condition manager instance
             * 
             * @returns {conditionManager} Condition Manager
             */
            Conditions.getConditionManager = function() {
                return instance;
            }

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Conditions that are related to npcs
            Conditions.RelatedToObjectNpc = "Npc";

            /// Conditions that are related to items
            Conditions.RelatedToObjectItem = "Item";

            /// Conditions that are related to quests
            Conditions.RelatedToObjectQuest = "Quest";

            /// Conditions that are related to skills
            Conditions.RelatedToObjectSkill = "Skill";

            /**
             * Base Condition
             * @class
             */
            Conditions.BaseCondition = function()
            {
                this.nodeModel = null;
            };

            Conditions.BaseCondition.prototype = {
                /**
                 * Returns the type of the condition
                 * 
                 * @returns {number} Type of the condition
                 */
                getType: function() {
                    return -1;
                },

                /**
                 * Returns the label of the condition
                 * 
                 * @returns {string} Label of the condition
                 */
                getLabel: function() {

                },

                /**
                 * Returns true if the condition can be selected in the dropdown list, else false
                 * 
                 * @returns {bool} true if the condition can be selected, else false
                 */
                canBeSelected: function() {

                },

                /**
                 * Returns the template name for the condition
                 * 
                 * @returns {string} Template name
                 */
                getTemplateName: function() {

                },
                
                /**
                 * Returns the data for the condition
                 * 
                 * @param {object} existingData Existing condition data
                 * @param {object} element Element to which the data belongs
                 * @returns {object} Template data
                 */
                buildConditionData: function(existingData, element) {

                },

                /**
                 * Serializes condition data
                 * 
                 * @param {object} conditionData Condition data
                 * @returns {object} Serialized data
                 */
                serializeConditionData: function(conditionData) {

                },
                
                /**
                 * Returns the objects on which an object depends
                 * 
                 * @param {object} existingData Existing condition data
                 * @returns {object[]} Objects on which the condition depends
                 */
                getConditionDependsOnObject: function(existingData) {

                },


                /**
                 * Returns the condition data as a display string
                 * 
                 * @param {object} existingData Serialzied condition data
                 * @returns {jQuery.Deferred} Deferred for the loading process
                 */
                getConditionString: function(existingData) {

                }
            };

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {
            
            /// Group Condition type
            Conditions.GroupConditionType = 1;


            /// And Operator for group conditions
            Conditions.GroupConditionOperatorAnd = 0;

            /// Or Operator for group conditions
            Conditions.GroupConditionOperatorOr = 1;

            /**
             * Group condition (and/or)
             * @class
             */
            Conditions.GroupCondition = function()
            {
                Conditions.BaseCondition.apply(this);
            };

            Conditions.GroupCondition.prototype = jQuery.extend({ }, Conditions.BaseCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.GroupCondition.prototype.getType = function() {
                return Conditions.GroupConditionType;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.GroupCondition.prototype.getLabel = function() {
                return "";
            };

            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            Conditions.GroupCondition.prototype.canBeSelected = function() {
                return false;
            };

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            Conditions.GroupCondition.prototype.getTemplateName = function() {
                return "gn-nodeConditionGroup";
            }

            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.GroupCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = {
                    operator: new ko.observable(existingData.operator),
                    conditionElements: new ko.observableArray()
                };
                
                if(existingData.fromDialog)
                {
                    conditionData.conditionElements(existingData.conditionElements);
                }
                else
                {
                    var convertedElements = Conditions.getConditionManager().convertElements(existingData.conditionElements);
                    for(var curElement = 0; curElement < convertedElements.length; ++curElement)
                    {
                        convertedElements[curElement].parent = element;
                    }
                    conditionData.conditionElements(convertedElements);
                }

                conditionData.operatorText = new ko.computed(function() {
                    return conditionData.operator() == Conditions.GroupConditionOperatorAnd ? DefaultNodeShapes.Localization.Conditions.AndOperator : DefaultNodeShapes.Localization.Conditions.OrOperator;
                });

                conditionData.toggleOperator = function() {
                    if(conditionData.operator() == Conditions.GroupConditionOperatorAnd)
                    {
                        conditionData.operator(Conditions.GroupConditionOperatorOr);
                    }
                    else
                    {
                        conditionData.operator(Conditions.GroupConditionOperatorAnd);
                    }
                };

                return conditionData;
            }

            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            Conditions.GroupCondition.prototype.serializeConditionData = function(conditionData) {
                var serializedData = {
                    operator: conditionData.operator(),
                    conditionElements: []
                };

                var conditionElements = conditionData.conditionElements();
                for(var curElement = 0; curElement < conditionElements.length; ++curElement)
                {
                    var element = Conditions.getConditionManager().serializeConditionElement(conditionElements[curElement]);
                    serializedData.conditionElements.push(element);
                }
                return serializedData;
            }

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            Conditions.GroupCondition.prototype.getConditionDependsOnObject = function(existingData) {
                return Conditions.getConditionManager().getConditionElementsDependsOnObject(existingData.conditionElements);
            }


            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialzied condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.GroupCondition.prototype.getConditionString = function(existingData) {
                return Conditions.getConditionManager().getConditionString(existingData.conditionElements, existingData.operator == Conditions.GroupConditionOperatorAnd ? DefaultNodeShapes.Localization.Conditions.AndOperatorShort : DefaultNodeShapes.Localization.Conditions.OrOperatorShort, true);
            }

            Conditions.getConditionManager().addConditionType(new Conditions.GroupCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /**
             * Check value condition
             * @class
             */
            Conditions.CheckValueCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.BaseCondition.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);

                this.fieldObjectId = "";
            };

            Conditions.CheckValueCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.BaseCondition.prototype);
            Conditions.CheckValueCondition.prototype = jQuery.extend(Conditions.CheckValueCondition.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            Conditions.CheckValueCondition.prototype.getTemplateName = function() {
                return "gn-nodeConditionValueCheck";
            };
            
            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            Conditions.CheckValueCondition.prototype.canBeSelected = function() {
                return true;
            };

            /**
             * Function to allow additional object condition data to be processed after loading
             * 
             * @param {object} conditionData Condition data build by calling buildConditionData before
             * @param {object} loadedObject Loaded object
             */
            Conditions.CheckValueCondition.prototype.processAditionalLoadedObjectConditionData = function(conditionData, loadedObject) {
                
            };

            /**
             * Returns the selected field, null if no field was found
             * 
             * @param {object} existingData Existing condition data
             * @param {objec[]} fields Flex fields
             * @returns {object} Selected field
             */
            Conditions.CheckValueCondition.prototype.getSelectedField = function(existingData, fields) {
                var selectedField = null;
                for(var curField = 0; curField < fields.length; ++curField)
                {
                    if(fields[curField].id == existingData.fieldId)
                    {
                        selectedField = fields[curField];
                        
                        if(fields[curField].name == existingData.fieldName)
                        {
                            break;
                        }
                    }
                }
                return selectedField;
            };

            
            /**
             * Returns the data for the condition without trying to load field data
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.CheckValueCondition.prototype.buildConditionDataNoLoad = function(existingData, element) {
                var conditionData = {
                    selectedField: new ko.observable(),
                    operator: new ko.observable(),
                    compareValue: new ko.observable(),
                    availableFields: new ko.observable()
                };
                if(existingData)
                {
                    conditionData.compareValue(existingData.compareValue ? existingData.compareValue : null);
                }

                conditionData.validateInput = function(data, e) {
                    if(conditionData.selectedField().fieldType != GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldTypeNumber)
                    {
                        return true;
                    }

                    var keypressValid = GoNorth.Util.validateNumberKeyPress(e.target, e);
                    return keypressValid;
                };

                conditionData.availableOperators = new ko.computed(function() {
                    if(!this.selectedField())
                    {
                        return [];
                    }

                    var operators = [ "=", "!=", "contains", "startsWith", "endsWith" ];
                    if(this.selectedField().fieldType == GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldTypeNumber)
                    {
                        operators = [ "=", "!=", "<=", "<", ">=", ">" ];
                    }
                    return operators;
                }, conditionData);

                conditionData.selectedField.subscribe(function() {
                    if(conditionData.selectedField().fieldType != GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldTypeNumber)
                    {
                        return;
                    }

                    var parsedValue =  parseFloat(conditionData.compareValue());
                    if(isNaN(parsedValue))
                    {
                        conditionData.compareValue("0");
                    }
                });

                return conditionData;
            };

            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.CheckValueCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = this.buildConditionDataNoLoad(existingData, element);

                // Load field data
                if(this.canLoadFieldObject(existingData))
                {
                    this.loadAndParseFields(conditionData, existingData, element);
                }

                return conditionData;
            };
            
            /**
             * Returns true if the field object can be loaded, else false
             * 
             * @param {object} existingData Existing data
             * @returns {bool} true if the object can be loaded, else false
             */
            Conditions.CheckValueCondition.prototype.canLoadFieldObject = function(existingData) {
                return true;
            }

            /**
             * Loads and parses the fields for the condition dialog
             * 
             * @param {object} conditionData Condition Data 
             * @param {object} existingData Existing Data
             * @param {object} element Element
             */
            Conditions.CheckValueCondition.prototype.loadAndParseFields = function(conditionData, existingData, element)
            {
                var self = this;
                this.loadObjectShared(existingData).then(function(fieldObject) {
                    if(!fieldObject)
                    {
                        return;
                    }

                    self.fieldObjectId = fieldObject.id;
                    var filteredFields = GoNorth.Util.getFilteredFieldsForScript(fieldObject.fields);
                    for(var curField = 0; curField < filteredFields.length; ++curField)
                    {
                        var displayName = filteredFields[curField].name + " (";
                        if(filteredFields[curField].fieldType == GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldTypeNumber)
                        {
                            displayName += DefaultNodeShapes.Localization.Conditions.NumberField;
                        }
                        else
                        {
                            displayName += DefaultNodeShapes.Localization.Conditions.TextField;
                        }
                        displayName += ")";
                        filteredFields[curField].displayName = displayName;
                    }

                    conditionData.availableFields(filteredFields);
                    
                    // Load old data
                    if(existingData)
                    {
                        var selectedField = self.getSelectedField(existingData, filteredFields);
                        if(selectedField)
                        {
                            conditionData.selectedField(selectedField);
                        }
                        conditionData.operator(existingData.operator ? existingData.operator : null);
                    }

                    // Additional processing
                    self.processAditionalLoadedObjectConditionData(conditionData, fieldObject);
                }, function(err) {
                    element.errorOccured(true);
                });
            }

            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            Conditions.CheckValueCondition.prototype.serializeConditionData = function(conditionData) {
                return {
                    fieldId: conditionData.selectedField() ? conditionData.selectedField().id : null,
                    fieldName: conditionData.selectedField() ? conditionData.selectedField().name : null,
                    operator: conditionData.operator(),
                    compareValue: conditionData.compareValue() ? conditionData.compareValue() : null
                };
            };

            /**
             * Returns the object id for dependency checks
             * 
             * @param {object} existingData Existing condition data
             * @returns {string} Object Id on which the condition depends
             */
            Conditions.CheckValueCondition.prototype.getDependsOnObjectId = function(existingData) {
                return this.fieldObjectId;
            };

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            Conditions.CheckValueCondition.prototype.getConditionDependsOnObject = function(existingData) {
                var objectId = this.getDependsOnObjectId(existingData);

                return [{
                    objectType: this.getObjectTypeName(),
                    objectId: objectId
                }];
            }

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Conditions.CheckValueCondition.prototype.getObjectTypeName = function() {

            };

            /**
             * Returns the title of the field object used in the string representation
             * 
             * @param {object} loadedFieldObject Loaded Field object for returning name if necessary
             * @returns {string} Title of the field object
             */
            Conditions.CheckValueCondition.prototype.getObjectTitle = function(loadedFieldObject) {
                
            };

            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialized condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckValueCondition.prototype.getConditionString = function(existingData) {
                var def = new jQuery.Deferred();
                
                // Check if data is valid
                if(!this.canLoadFieldObject(existingData) || existingData.fieldId == null)
                {
                    def.resolve(DefaultNodeShapes.Localization.Conditions.MissingInformations);
                    return def.promise();
                }

                // Load data and build string
                var self = this;
                this.loadObjectShared(existingData).then(function(fieldObject) {
                    self.fieldObjectId = fieldObject.id;
                    var filteredFields = GoNorth.Util.getFilteredFieldsForScript(fieldObject.fields);
                    var selectedField = self.getSelectedField(existingData, filteredFields);
                    if(!selectedField)
                    {
                        def.reject(DefaultNodeShapes.Localization.Conditions.FieldWasDeleted);
                        return;
                    }

                    var conditionText = self.getObjectTitle(fieldObject) + "(\"" + selectedField.name + "\") " + existingData.operator + " ";
                    var isNumberField = selectedField.fieldType == GoNorth.FlexFieldDatabase.ObjectForm.FlexFieldTypeNumber;
                    var emptyValue = "0";
                    if(!isNumberField)
                    {
                        conditionText += "\"";
                        emptyValue = "";
                    }
                    conditionText += existingData.compareValue ? existingData.compareValue : emptyValue;
                    if(!isNumberField)
                    {
                        conditionText += "\"";
                    }

                    def.resolve(conditionText);
                }, function() {
                    def.reject();
                });

                return def.promise();
            };

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking the player value
            var conditionTypeCheckPlayerValue = 2;

            /**
             * Check player value condition
             * @class
             */
            Conditions.CheckPlayerValueCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.CheckValueCondition.apply(this);
            };

            Conditions.CheckPlayerValueCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.CheckValueCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckPlayerValueCondition.prototype.getType = function() {
                return conditionTypeCheckPlayerValue;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckPlayerValueCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckPlayerValueLabel;
            };

            /**
             * Returns the title of the field object used in the string representation
             * 
             * @param {object} loadedFieldObject Loaded Field object for returning name if necessary
             * @returns {string} Title of the field object
             */
            Conditions.CheckPlayerValueCondition.prototype.getObjectTitle = function(loadedFieldObject) {
                return DefaultNodeShapes.Localization.Conditions.PlayerLabel;
            };

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Conditions.CheckPlayerValueCondition.prototype.getObjectTypeName = function() {
                return "Npc";
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckPlayerValueCondition.prototype.getObjectId = function() {
                return "PlayerNpc";
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckPlayerValueCondition.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
            };

            /**
             * Loads the npc
             * 
             * @returns {jQuery.Deferred} Deferred for the async process
             */
            Conditions.CheckPlayerValueCondition.prototype.loadObject = function() {
                var def = new jQuery.Deferred();
                
                GoNorth.HttpClient.get("/api/KortistoApi/PlayerNpc").done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };


            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckPlayerValueCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking the npc value
            var conditionTypeCheckNpcValue = 3;

            /**
             * Check npc value condition
             * @class
             */
            Conditions.CheckNpcValueCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.CheckValueCondition.apply(this);
            };

            Conditions.CheckNpcValueCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.CheckValueCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckNpcValueCondition.prototype.getType = function() {
                return conditionTypeCheckNpcValue;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckNpcValueCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckNpcValueLabel;
            };

            /**
             * Returns the title of the field object used in the string representation
             * 
             * @param {object} loadedFieldObject Loaded Field object for returning name if necessary
             * @returns {string} Title of the field object
             */
            Conditions.CheckNpcValueCondition.prototype.getObjectTitle = function(loadedFieldObject) {
                return DefaultNodeShapes.Localization.Conditions.NpcLabel;
            };

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Conditions.CheckNpcValueCondition.prototype.getObjectTypeName = function() {
                return "Npc";
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckNpcValueCondition.prototype.getObjectId = function() {
                return DefaultNodeShapes.getCurrentRelatedObjectId();
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckNpcValueCondition.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
            };

            /**
             * Loads the npc
             * 
             * @returns {jQuery.Deferred} Deferred for the async process
             */
            Conditions.CheckNpcValueCondition.prototype.loadObject = function() {
                var def = new jQuery.Deferred();
                
                GoNorth.HttpClient.get("/api/KortistoApi/FlexFieldObject?id=" + DefaultNodeShapes.getCurrentRelatedObjectId()).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };


            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckNpcValueCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking the alive state of a npc to choose
            var conditionTypeCheckNpcAliveState = 9;


            /// Npc state alive
            var npcStateAlive = 0;

            /// Npc state dead
            var npcStateDead = 1;

            /// Npc state label lookup
            var npcStateLabelLookup = { };
            npcStateLabelLookup[npcStateAlive] = DefaultNodeShapes.Localization.Conditions.NpcAliveStateAlive;
            npcStateLabelLookup[npcStateDead] = DefaultNodeShapes.Localization.Conditions.NpcAliveStateDead;


            /**
             * Check npc alive state condition
             * @class
             */
            Conditions.CheckNpcAliveStateCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.BaseCondition.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Conditions.CheckNpcAliveStateCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.BaseCondition.prototype);
            Conditions.CheckNpcAliveStateCondition.prototype = jQuery.extend(Conditions.CheckNpcAliveStateCondition.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            Conditions.CheckNpcAliveStateCondition.prototype.getTemplateName = function() {
                return "gn-nodeNpcAliveStateCheck";
            };
            
            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            Conditions.CheckNpcAliveStateCondition.prototype.canBeSelected = function() {
                return true;
            };

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckNpcAliveStateCondition.prototype.getType = function() {
                return conditionTypeCheckNpcAliveState;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckNpcAliveStateCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckNpcAliveStateLabel;
            };

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            Conditions.CheckNpcAliveStateCondition.prototype.getConditionDependsOnObject = function(existingData) {
                if(!existingData.npcId)
                {
                    return [];
                }

                return [{
                    objectType: Conditions.RelatedToObjectNpc,
                    objectId: existingData.npcId
                }];
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckNpcAliveStateCondition.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
            };

            /**
             * Returns the object id from existing condition data for request caching
             * 
             * @param {object} existingData Existing condition data
             * @returns {string} Object Id for caching
             */
            Conditions.CheckNpcAliveStateCondition.prototype.getObjectId = function(existingData) {
                return existingData.npcId;
            };

            /**
             * Loads an npc
             * 
             * @param {string} npcId Npc Id
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckNpcAliveStateCondition.prototype.loadObject = function(npcId) {
                var loadingDef = new jQuery.Deferred();

                GoNorth.HttpClient.get("/api/KortistoApi/FlexFieldObject?id=" + npcId).done(function(npc) {
                    loadingDef.resolve(npc);
                }).fail(function(xhr) {
                    loadingDef.reject();
                });

                return loadingDef;
            };

            /**
             * Creates a npc alive state object
             * 
             * @param {number} npcState Alive State of the npc
             * @returns {object} Npc Alive State object
             */
            Conditions.CheckNpcAliveStateCondition.prototype.createState = function(npcState)
            {
                return {
                    npcState: npcState,
                    label: npcStateLabelLookup[npcState]
                };
            };
            
            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.CheckNpcAliveStateCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = {
                    selectedNpcId: new ko.observable(),
                    selectedNpcName: new ko.observable(DefaultNodeShapes.Localization.Conditions.ChooseNpcLabel),
                    selectedNpcState: new ko.observable(),
                    npcStates: [ 
                        this.createState(npcStateAlive),
                        this.createState(npcStateDead)
                    ]
                };

                conditionData.chooseNpc = function() {
                    GoNorth.DefaultNodeShapes.openNpcSearchDialog().then(function(npc) {
                        conditionData.selectedNpcId(npc.id);
                        conditionData.selectedNpcName(npc.name);
                    });
                };

                // Load existing data
                if(existingData)
                {
                    conditionData.selectedNpcId(existingData.npcId);
                    conditionData.selectedNpcState(existingData.state);

                    if(existingData.npcId) 
                    {
                        this.loadObjectShared(existingData).then(function(npc) {
                            conditionData.selectedNpcName(npc.name);
                        }, function() {
                            element.errorOccured(true);
                        });
                    }
                }

                return conditionData;
            };

            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            Conditions.CheckNpcAliveStateCondition.prototype.serializeConditionData = function(conditionData) {
                return {
                    npcId: conditionData.selectedNpcId(),
                    state: conditionData.selectedNpcState()
                };
            };

            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialzied condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckNpcAliveStateCondition.prototype.getConditionString = function(existingData) {
                var def = new jQuery.Deferred();
                
                // Check if data is valid
                if(!existingData.npcId)
                {
                    def.resolve(DefaultNodeShapes.Localization.Conditions.MissingInformations);
                    return def.promise();
                }

                // Load data and build string
                var self = this;
                this.loadObjectShared(existingData).then(function(npc) {
                    var conditionText = DefaultNodeShapes.Localization.Conditions.StateLabel + "(" + npc.name + ") = " + npcStateLabelLookup[existingData.state];

                    def.resolve(conditionText);
                }, function() {
                    def.reject();
                });

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckNpcAliveStateCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Operator for the has at least operation
            var inventoryOperatorHasAtLeast = 0;

            /// Operator for the has at maximum operation
            var inventoryOperatorHasAtMaximum = 1;

            /**
             * Check inventory condition
             * @class
             */
            Conditions.CheckInventoryCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.BaseCondition.apply(this);
            };

            Conditions.CheckInventoryCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.BaseCondition.prototype);

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            Conditions.CheckInventoryCondition.prototype.getTemplateName = function() {
                return "gn-nodeConditionInventoryCheck";
            };
            
            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            Conditions.CheckInventoryCondition.prototype.canBeSelected = function() {
                return true;
            };

            /**
             * Returns the name of an item
             * 
             * @param {string} itemId Id of the item
             * @returns {jQuery.Deferred} Deferred for the loading proccess
             */
            Conditions.CheckInventoryCondition.prototype.getItemName = function(itemId) {
                var def = new jQuery.Deferred();

                GoNorth.HttpClient.post("/api/StyrApi/ResolveFlexFieldObjectNames", [ itemId ]).done(function(itemNames) {
                    if(itemNames.length == 0)
                    {
                        def.reject();
                        return;
                    }

                    def.resolve(itemNames[0].name);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.CheckInventoryCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = {
                    selectedItemId: new ko.observable(),
                    selectedItemName: new ko.observable(DefaultNodeShapes.Localization.Conditions.ChooseItem),
                    operator: new ko.observable(),
                    availableOperators: [ { value: inventoryOperatorHasAtLeast, title: DefaultNodeShapes.Localization.Conditions.ItemOperatorHasAtLeast }, { value: inventoryOperatorHasAtMaximum, title: DefaultNodeShapes.Localization.Conditions.ItemOperatorHasMaximum }],
                    quantity: new ko.observable(0)
                };

                if(existingData)
                {
                    conditionData.selectedItemId(existingData.itemId);
                    conditionData.operator(existingData.operator);
                    conditionData.quantity(existingData.quantity);

                    this.getItemName(existingData.itemId).then(function(name) {
                        conditionData.selectedItemName(name);
                    }, function() {
                        element.errorOccured(true);
                    });
                }

                conditionData.chooseItem = function() {
                    GoNorth.DefaultNodeShapes.openItemSearchDialog().then(function(item) {
                        conditionData.selectedItemId(item.id);
                        conditionData.selectedItemName(item.name);
                    });
                };
                
                return conditionData;
            };
            
            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            Conditions.CheckInventoryCondition.prototype.serializeConditionData = function(conditionData) {
                var quantity = parseInt(conditionData.quantity());
                if(isNaN(quantity))
                {
                    quantity = 0;
                }

                return {
                    itemId: conditionData.selectedItemId(),
                    operator: conditionData.operator(),
                    quantity: quantity
                };
            };

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            Conditions.CheckInventoryCondition.prototype.getConditionDependsOnObject = function(existingData) {
                return [{
                    objectType: Conditions.RelatedToObjectItem,
                    objectId: existingData.itemId
                }];
            }

            /**
             * Returns the title of the inventory
             * 
             * @returns {string} Title of the inventory
             */
            Conditions.CheckInventoryCondition.prototype.getInventoryTitle = function() {
                
            };

            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialzied condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckInventoryCondition.prototype.getConditionString = function(existingData) {
                var def = new jQuery.Deferred();
                if(!existingData.itemId)
                {
                    def.resolve(DefaultNodeShapes.Localization.Conditions.ChooseItem);
                    return def.promise();
                }

                var self = this;
                this.getItemName(existingData.itemId).then(function(name) {
                    var conditionString = self.getInventoryTitle() + " " + DefaultNodeShapes.Localization.Conditions.ItemCount + "(\"" + name + "\") ";
                    if(existingData.operator == inventoryOperatorHasAtLeast)
                    {
                        conditionString += ">=";
                    }
                    else if(existingData.operator == inventoryOperatorHasAtMaximum)
                    {
                        conditionString += "<=";
                    }
                    conditionString += " " + existingData.quantity;

                    def.resolve(conditionString);
                }, function() {
                    def.reject();
                });

                return def.promise();
            }

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking the player inventory
            var conditionTypeCheckPlayerInventory = 4;

            /**
             * Check player inventory condition
             * @class
             */
            Conditions.CheckPlayerInventoryCondition = function()
            {
                Conditions.CheckInventoryCondition.apply(this);
            };

            Conditions.CheckPlayerInventoryCondition.prototype = jQuery.extend({ }, Conditions.CheckInventoryCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckPlayerInventoryCondition.prototype.getType = function() {
                return conditionTypeCheckPlayerInventory;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckPlayerInventoryCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckPlayerInventoryLabel;
            };

            /**
             * Returns the title of the inventory
             * 
             * @returns {string} Title of the inventory
             */
            Conditions.CheckPlayerInventoryCondition.prototype.getInventoryTitle = function() {
                return DefaultNodeShapes.Localization.Conditions.PlayerInventoryLabel;
            };


            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckPlayerInventoryCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking the npc inventory
            var conditionTypeCheckNpcInventory = 5;

            /**
             * Check npc inventory condition
             * @class
             */
            Conditions.CheckNpcInventoryCondition = function()
            {
                Conditions.CheckInventoryCondition.apply(this);
            };

            Conditions.CheckNpcInventoryCondition.prototype = jQuery.extend({ }, Conditions.CheckInventoryCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckNpcInventoryCondition.prototype.getType = function() {
                return conditionTypeCheckNpcInventory;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckNpcInventoryCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckNpcInventoryLabel;
            };

            /**
             * Returns the title of the inventory
             * 
             * @returns {string} Title of the inventory
             */
            Conditions.CheckNpcInventoryCondition.prototype.getInventoryTitle = function() {
                return DefaultNodeShapes.Localization.Conditions.NpcInventoryLabel;
            };


            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckNpcInventoryCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /**
             * Check current quest value condition
             * @class
             */
            Conditions.CheckChooseObjectValueCondition = function()
            {
                DefaultNodeShapes.Conditions.CheckValueCondition.apply(this);
            };

            Conditions.CheckChooseObjectValueCondition.prototype = jQuery.extend({ }, DefaultNodeShapes.Conditions.CheckValueCondition.prototype);

            /**
             * Opens the object search dialog
             * 
             * @returns {jQuery.Deferred} Deferred for the choosing process
             */
            Conditions.CheckChooseObjectValueCondition.prototype.openObjectSearchDialog = function() {

            };

            /**
             * Returns the label used if no object name is selected to prompt the user to choose an object
             * 
             * @returns {string} Label used if no object name is selected to prompt the user to choose an object
             */
            Conditions.CheckChooseObjectValueCondition.prototype.getChooseObjectLabel = function() {

            };

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            Conditions.CheckChooseObjectValueCondition.prototype.getTemplateName = function() {
                return "gn-nodeConditionChooseObjectValueCheck";
            };

            /**
             * Returns true if the field object can be loaded, else false
             * 
             * @param {object} existingData Existing data
             * @returns {bool} true if the object can be loaded, else false
             */
            Conditions.CheckChooseObjectValueCondition.prototype.canLoadFieldObject = function(existingData) {
                return existingData && existingData.selectedObjectId;
            }

            /**
             * Function to allow additional object condition data to be processed after loading
             * 
             * @param {object} conditionData Condition data build by calling buildConditionData before
             * @param {object} loadedObject Loaded object
             */
            Conditions.CheckChooseObjectValueCondition.prototype.processAditionalLoadedObjectConditionData = function(conditionData, loadedObject) {
                conditionData.selectedObjectName(loadedObject.name);                
            };

            /**
             * Returns the object id for dependency checks
             * 
             * @param {object} existingData Existing condition data
             * @returns {string} Object Id on which the condition depends
             */
            Conditions.CheckChooseObjectValueCondition.prototype.getDependsOnObjectId = function(existingData) {
                return this.getObjectId(existingData);
            };

            /**
             * Returns the object id from existing condition data for request caching
             * 
             * @param {object} existingData Existing condition data
             * @returns {string} Object Id for caching
             */
            Conditions.CheckChooseObjectValueCondition.prototype.getObjectId = function(existingData) {
                return existingData.selectedObjectId;
            };

            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.CheckChooseObjectValueCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = Conditions.CheckValueCondition.prototype.buildConditionDataNoLoad.apply(this, [existingData, element]);

                conditionData.selectedObjectId = new ko.observable("");
                conditionData.selectedObjectName = new ko.observable(this.getChooseObjectLabel());

                if(existingData)
                {
                    conditionData.selectedObjectId(existingData.selectedObjectId);
                }

                var self = this;
                conditionData.chooseObject = function() {
                    self.openObjectSearchDialog().then(function(chosenObject) {
                        conditionData.selectedObjectId(chosenObject.id);
                        conditionData.selectedObjectName(chosenObject.name);

                        var updatedExistingData = self.serializeConditionData(conditionData);
                        self.loadAndParseFields(conditionData, updatedExistingData, element);
                    });
                };

                // Load field data
                if(this.canLoadFieldObject(existingData))
                {
                    this.loadAndParseFields(conditionData, existingData, element);
                }

                return conditionData;
            };

            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            Conditions.CheckChooseObjectValueCondition.prototype.serializeConditionData = function(conditionData) {
                var serializedData = Conditions.CheckValueCondition.prototype.serializeConditionData.apply(this, [conditionData]);
                
                serializedData.selectedObjectId = conditionData.selectedObjectId();

                return serializedData;
            };

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking value of a quest to choose
            var conditionTypeCheckChooseQuestValue = 7;

            /**
             * Check quest value condition where quest is chosen
             * @class
             */
            Conditions.CheckChooseQuestValueCondition = function()
            {
                DefaultNodeShapes.Conditions.CheckChooseObjectValueCondition.apply(this);
            };

            Conditions.CheckChooseQuestValueCondition.prototype = jQuery.extend({ }, DefaultNodeShapes.Conditions.CheckChooseObjectValueCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckChooseQuestValueCondition.prototype.getType = function() {
                return conditionTypeCheckChooseQuestValue;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckChooseQuestValueCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckChooseQuestValueLabel;
            };

            /**
             * Returns the title of the field object used in the string representation
             * 
             * @param {object} loadedFieldObject Loaded Field object for returning name if necessary
             * @returns {string} Title of the field object
             */
            Conditions.CheckChooseQuestValueCondition.prototype.getObjectTitle = function(loadedFieldObject) {
                return loadedFieldObject.name;
            };

            /**
             * Opens the object search dialog
             * 
             * @returns {jQuery.Deferred} Deferred for the choosing process
             */
            Conditions.CheckChooseQuestValueCondition.prototype.openObjectSearchDialog = function() {
                return GoNorth.DefaultNodeShapes.openQuestSearchDialog();
            };

            
            /**
             * Returns the label used if no object name is selected to prompt the user to choose an object
             * 
             * @returns {string} Label used if no object name is selected to prompt the user to choose an object
             */
            Conditions.CheckChooseQuestValueCondition.prototype.getChooseObjectLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.ChooseQuestLabel;
            };

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Conditions.CheckChooseQuestValueCondition.prototype.getObjectTypeName = function() {
                return Conditions.RelatedToObjectQuest;
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckChooseQuestValueCondition.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceQuest;
            };

            /**
             * Loads the quest
             * 
             * @param {object} objectId Optional object id
             * @returns {jQuery.Deferred} Deferred for the async process
             */
            Conditions.CheckChooseQuestValueCondition.prototype.loadObject = function(objectId) {
                var def = new jQuery.Deferred();
                
                GoNorth.HttpClient.get("/api/AikaApi/GetQuest?id=" + objectId).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckChooseQuestValueCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking the state of a quest to choose
            var conditionTypeCheckChooseQuestState = 8;
            
            /**
             * Check quest state condition
             * @class
             */
            Conditions.CheckQuestStateCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.BaseCondition.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Conditions.CheckQuestStateCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.BaseCondition.prototype);
            Conditions.CheckQuestStateCondition.prototype = jQuery.extend(Conditions.CheckQuestStateCondition.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            Conditions.CheckQuestStateCondition.prototype.getTemplateName = function() {
                return "gn-nodeQuestStateCheck";
            };
            
            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            Conditions.CheckQuestStateCondition.prototype.canBeSelected = function() {
                return true;
            };

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckQuestStateCondition.prototype.getType = function() {
                return conditionTypeCheckChooseQuestState;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckQuestStateCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckQuestStateLabel;
            };

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            Conditions.CheckQuestStateCondition.prototype.getConditionDependsOnObject = function(existingData) {
                if(!existingData.questId)
                {
                    return [];
                }

                return [{
                    objectType: Conditions.RelatedToObjectQuest,
                    objectId: existingData.questId
                }];
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckQuestStateCondition.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceQuest;
            };

            /**
             * Returns the object id from existing condition data for request caching
             * 
             * @param {object} existingData Existing condition data
             * @returns {string} Object Id for caching
             */
            Conditions.CheckQuestStateCondition.prototype.getObjectId = function(existingData) {
                return existingData.questId;
            };

            /**
             * Loads a quest
             * 
             * @param {string} questId Quest Id
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckQuestStateCondition.prototype.loadObject = function(questId) {
                var loadingDef = new jQuery.Deferred();

                GoNorth.HttpClient.get("/api/AikaApi/GetQuest?id=" + questId).done(function(quest) {
                    loadingDef.resolve(quest);
                }).fail(function(xhr) {
                    loadingDef.reject();
                });

                return loadingDef;
            };
            
            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.CheckQuestStateCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = {
                    selectedQuestId: new ko.observable(),
                    selectedQuestName: new ko.observable(DefaultNodeShapes.Localization.Conditions.ChooseQuestLabel),
                    selectedQuestState: new ko.observable(),
                    questStates: DefaultNodeShapes.Shapes.getQuestStates()
                };

                conditionData.chooseQuest = function() {
                    GoNorth.DefaultNodeShapes.openQuestSearchDialog().then(function(quest) {
                        conditionData.selectedQuestId(quest.id);
                        conditionData.selectedQuestName(quest.name);
                    });
                };

                // Load existing data
                if(existingData)
                {
                    conditionData.selectedQuestId(existingData.questId);
                    conditionData.selectedQuestState(existingData.state)

                    if(existingData.questId) 
                    {
                        this.loadObjectShared(existingData).then(function(quest) {
                            conditionData.selectedQuestName(quest.name);
                        }, function() {
                            element.errorOccured(true);
                        });
                    }
                }

                return conditionData;
            };

            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            Conditions.CheckQuestStateCondition.prototype.serializeConditionData = function(conditionData) {
                return {
                    questId: conditionData.selectedQuestId(),
                    state: conditionData.selectedQuestState()
                };
            };

            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialzied condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckQuestStateCondition.prototype.getConditionString = function(existingData) {
                var def = new jQuery.Deferred();
                
                // Check if data is valid
                if(!existingData.questId)
                {
                    def.resolve(DefaultNodeShapes.Localization.Conditions.MissingInformations);
                    return def.promise();
                }

                // Load data and build string
                var self = this;
                this.loadObjectShared(existingData).then(function(quest) {
                    var conditionText = DefaultNodeShapes.Localization.Conditions.StateLabel + "(" + quest.name + ") = " + DefaultNodeShapes.Shapes.getQuestStateLabel(existingData.state);

                    def.resolve(conditionText);
                }, function() {
                    def.reject();
                });

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckQuestStateCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking the game time
            var conditionTypeCheckGameTime = 12;

            /// Game time Operator before
            var gameTimeOperatorBefore = 0;

            /// Game time Operator after
            var gameTimeOperatorAfter = 1;

            /// Game time operator label lookup
            var gameTimeOperatorLabelLookup = { };
            gameTimeOperatorLabelLookup[gameTimeOperatorBefore] = DefaultNodeShapes.Localization.Conditions.GameTimeOperatorBefore;
            gameTimeOperatorLabelLookup[gameTimeOperatorAfter] = DefaultNodeShapes.Localization.Conditions.GameTimeOperatorAfter;

            /**
             * Check game time condition
             * @class
             */
            Conditions.CheckGameTimeCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.BaseCondition.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Conditions.CheckGameTimeCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.BaseCondition.prototype);
            Conditions.CheckGameTimeCondition.prototype = jQuery.extend(Conditions.CheckGameTimeCondition.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            Conditions.CheckGameTimeCondition.prototype.getTemplateName = function() {
                return "gn-nodeGameTimeCheck";
            };
            
            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            Conditions.CheckGameTimeCondition.prototype.canBeSelected = function() {
                return true;
            };

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckGameTimeCondition.prototype.getType = function() {
                return conditionTypeCheckGameTime;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckGameTimeCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckGameTimeLabel;
            };

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            Conditions.CheckGameTimeCondition.prototype.getConditionDependsOnObject = function(existingData) {
                return [];
            };

            /**
             * Returns the object resource
             * 
             * @returns {string} Object Id
             */
            Conditions.CheckGameTimeCondition.prototype.getObjectId = function() {
                return "ProjectMiscConfig";
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckGameTimeCondition.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceProjectMiscConfig;
            };
            
            /**
             * Loads the project config
             * 
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckGameTimeCondition.prototype.loadObject = function() {
                var def = new jQuery.Deferred();
                
                GoNorth.HttpClient.get("/api/ProjectConfigApi/GetMiscConfig").done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Creates a time operator object
             * 
             * @param {number} timeOperator Time operator
             * @returns {object} Time operator object
             */
            Conditions.CheckGameTimeCondition.prototype.createTimeOperator = function(timeOperator)
            {
                return {
                    operator: timeOperator,
                    label: gameTimeOperatorLabelLookup[timeOperator]
                };
            };

            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.CheckGameTimeCondition.prototype.buildConditionData = function(existingData, element) {
                var gameTimeMinutes = [];
                for(var curMinute = 0; curMinute < 60; curMinute += 5)
                {
                    gameTimeMinutes.push(curMinute);
                }
                gameTimeMinutes.push(59);

                var conditionData = {
                    selectedGameTimeOperator: new ko.observable(),
                    selectedGameTime: new ko.observable(GoNorth.BindingHandlers.buildTimeObject(0, 0)),
                    gameTimeOperators: [
                        this.createTimeOperator(gameTimeOperatorBefore),
                        this.createTimeOperator(gameTimeOperatorAfter)
                    ],
                    hoursPerDay: new ko.observable(24),
                    minutesPerHour: new ko.observable(60)
                };

                // Load config
                this.loadObjectShared({}).done(function(miscConfig) {
                    conditionData.hoursPerDay(miscConfig.hoursPerDay);
                    conditionData.minutesPerHour(miscConfig.minutesPerHour);
                }).fail(function() {
                    element.errorOccured(true);
                })

                // Load existing data
                if(existingData)
                {
                    conditionData.selectedGameTimeOperator(existingData.operator);
                    conditionData.selectedGameTime(GoNorth.BindingHandlers.buildTimeObject(existingData.hour, existingData.minutes));
                }

                return conditionData;
            };

            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            Conditions.CheckGameTimeCondition.prototype.serializeConditionData = function(conditionData) {
                return {
                    operator: conditionData.selectedGameTimeOperator(),
                    hour: conditionData.selectedGameTime().hours,
                    minutes: conditionData.selectedGameTime().minutes
                };
            };

            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialzied condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckGameTimeCondition.prototype.getConditionString = function(existingData) {
                var def = new jQuery.Deferred();
                
                var conditionString = DefaultNodeShapes.Localization.Conditions.GameTime;
                conditionString += " " + gameTimeOperatorLabelLookup[existingData.operator];
                conditionString += " " + this.formatTwoDigits(existingData.hour) + ":" + this.formatTwoDigits(existingData.minutes);
                def.resolve(conditionString);

                return def.promise();
            };

            /**
             * Formats a value as a two digit number
             * 
             * @param {number} number Number to format
             * @returns {string} Number as two digit
             */
            Conditions.CheckGameTimeCondition.prototype.formatTwoDigits = function(number) {
                if(!number) {
                    return "00";
                }

                var numberFormated = number.toString();
                if(numberFormated.length < 2)
                {
                    numberFormated = "0" + numberFormated;
                }

                return numberFormated;
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckGameTimeCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /**
             * Check skill value condition where skill is chosen
             * @class
             */
            Conditions.CheckChooseSkillValueCondition = function()
            {
                DefaultNodeShapes.Conditions.CheckChooseObjectValueCondition.apply(this);
            };

            Conditions.CheckChooseSkillValueCondition.prototype = jQuery.extend({ }, DefaultNodeShapes.Conditions.CheckChooseObjectValueCondition.prototype);

            /**
             * Returns the skill prefix
             * 
             * @returns {string} Skill Prefix
             */
            Conditions.CheckChooseSkillValueCondition.prototype.getSkillPrefix = function() {
                return "";
            };

            /**
             * Returns the title of the field object used in the string representation
             * 
             * @param {object} loadedFieldObject Loaded Field object for returning name if necessary
             * @returns {string} Title of the field object
             */
            Conditions.CheckChooseSkillValueCondition.prototype.getObjectTitle = function(loadedFieldObject) {
                return this.getSkillPrefix() + loadedFieldObject.name;
            };

            /**
             * Opens the object search dialog
             * 
             * @returns {jQuery.Deferred} Deferred for the choosing process
             */
            Conditions.CheckChooseSkillValueCondition.prototype.openObjectSearchDialog = function() {
                return GoNorth.DefaultNodeShapes.openSkillSearchDialog();
            };

            
            /**
             * Returns the label used if no object name is selected to prompt the user to choose an object
             * 
             * @returns {string} Label used if no object name is selected to prompt the user to choose an object
             */
            Conditions.CheckChooseSkillValueCondition.prototype.getChooseObjectLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.ChooseSkillLabel;
            };

            /**
             * Returns the object type name. Used for dependency objects
             * 
             * @returns {string} Object Type name used for depends on objects 
             */
            Conditions.CheckChooseSkillValueCondition.prototype.getObjectTypeName = function() {
                return Conditions.RelatedToObjectSkill;
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckChooseSkillValueCondition.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceSkill;
            };

            /**
             * Loads the skill
             * 
             * @param {object} objectId Optional object id
             * @returns {jQuery.Deferred} Deferred for the async process
             */
            Conditions.CheckChooseSkillValueCondition.prototype.loadObject = function(objectId) {
                var def = new jQuery.Deferred();
                
                GoNorth.HttpClient.get("/api/EvneApi/FlexFieldObject?id=" + objectId).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking value of a skill to choose
            var conditionTypeCheckChoosePlayerSkillValue = 13;

            /**
             * Check player skill value condition where skill is chosen
             * @class
             */
            Conditions.CheckChoosePlayerSkillValueCondition = function()
            {
                DefaultNodeShapes.Conditions.CheckChooseSkillValueCondition.apply(this);
            };

            Conditions.CheckChoosePlayerSkillValueCondition.prototype = jQuery.extend({ }, DefaultNodeShapes.Conditions.CheckChooseSkillValueCondition.prototype);

            /**
             * Returns the skill prefix
             * 
             * @returns {string} Skill Prefix
             */
            Conditions.CheckChoosePlayerSkillValueCondition.prototype.getSkillPrefix = function() {
                return DefaultNodeShapes.Localization.Conditions.PlayerSkillPrefix;
            };

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckChoosePlayerSkillValueCondition.prototype.getType = function() {
                return conditionTypeCheckChoosePlayerSkillValue;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckChoosePlayerSkillValueCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckChoosePlayerSkillValueLabel;
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckChoosePlayerSkillValueCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking value of a skill to choose
            var conditionTypeCheckChooseNpcSkillValue = 14;

            /**
             * Check npc skill value condition where skill is chosen
             * @class
             */
            Conditions.CheckChooseNpcSkillValueCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.CheckChooseSkillValueCondition.apply(this);
            };

            Conditions.CheckChooseNpcSkillValueCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.CheckChooseSkillValueCondition.prototype);

            /**
             * Returns the skill prefix
             * 
             * @returns {string} Skill Prefix
             */
            Conditions.CheckChooseNpcSkillValueCondition.prototype.getSkillPrefix = function() {
                return DefaultNodeShapes.Localization.Conditions.NpcSkillPrefix;
            };

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckChooseNpcSkillValueCondition.prototype.getType = function() {
                return conditionTypeCheckChooseNpcSkillValue;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckChooseNpcSkillValueCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckChooseNpcSkillValueLabel;
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckChooseNpcSkillValueCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /**
             * Checks if a skill is learned or not
             * @class
             */
            Conditions.CheckLearnedSkillCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.BaseCondition.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Conditions.CheckLearnedSkillCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.BaseCondition.prototype);
            Conditions.CheckLearnedSkillCondition.prototype = jQuery.extend(Conditions.CheckLearnedSkillCondition.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            Conditions.CheckLearnedSkillCondition.prototype.getTemplateName = function() {
                return "gn-nodeConditionChooseSkillCheck";
            };

            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            Conditions.CheckLearnedSkillCondition.prototype.canBeSelected = function() {
                return true;
            };

            /**
             * Returns the object id for dependency checks
             * 
             * @param {object} existingData Existing condition data
             * @returns {string} Object Id on which the condition depends
             */
            Conditions.CheckLearnedSkillCondition.prototype.getDependsOnObjectId = function(existingData) {
                return this.getObjectId(existingData);
            };

            /**
             * Returns the object id from existing condition data for request caching
             * 
             * @param {object} existingData Existing condition data
             * @returns {string} Object Id for caching
             */
            Conditions.CheckLearnedSkillCondition.prototype.getObjectId = function(existingData) {
                return existingData.selectedSkillId;
            };

            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckLearnedSkillCondition.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceSkill;
            };

            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.CheckLearnedSkillCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = {
                    selectedSkillId: new ko.observable(""),
                    selectedSkillName: new ko.observable(DefaultNodeShapes.Localization.Conditions.ChooseSkillLabel)
                }

                if(existingData)
                {
                    conditionData.selectedSkillId(existingData.selectedSkillId);
                }

                var self = this;
                conditionData.chooseSkill = function() {
                    GoNorth.DefaultNodeShapes.openSkillSearchDialog().then(function(chosenSkill) {
                        conditionData.selectedSkillId(chosenSkill.id);
                        conditionData.selectedSkillName(chosenSkill.name);
                    });
                };

                // Load field data
                if(existingData && existingData.selectedSkillId)
                {
                    this.loadObjectShared(existingData).then(function(skill) {
                        conditionData.selectedSkillName(skill.name);
                    }).fail(function(xhr) {
                        element.errorOccured(true);
                    });
                }

                return conditionData;
            };

            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            Conditions.CheckLearnedSkillCondition.prototype.serializeConditionData = function(conditionData) {
                var serializedData = {
                    selectedSkillId: conditionData.selectedSkillId()
                };

                return serializedData;
            };

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            Conditions.CheckLearnedSkillCondition.prototype.getConditionDependsOnObject = function(existingData) {
                if(!existingData || !existingData.selectedSkillId)
                {
                    return [];
                }

                return [{
                    objectType: Conditions.RelatedToObjectSkill,
                    objectId: existingData.selectedSkillId
                }];
            }

            /**
             * Loads the skill
             * 
             * @param {object} objectId Optional object id
             * @returns {jQuery.Deferred} Deferred for the async process
             */
            Conditions.CheckLearnedSkillCondition.prototype.loadObject = function(objectId) {
                var def = new jQuery.Deferred();
                
                GoNorth.HttpClient.get("/api/EvneApi/FlexFieldObject?id=" + objectId).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Returns the condition string prefix infront of the skill name
             * 
             * @returns {string} Condition String prefix
             */
            Conditions.CheckLearnedSkillCondition.prototype.getConditionStringPrefix = function() {
                return "";
            }

            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialized condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckLearnedSkillCondition.prototype.getConditionString = function(existingData) {
                var def = new jQuery.Deferred();
                
                // Check if data is valid
                if(!existingData || !existingData.selectedSkillId)
                {
                    def.resolve(DefaultNodeShapes.Localization.Conditions.MissingInformations);
                    return def.promise();
                }

                // Load data and build string
                var self = this;
                this.loadObjectShared(existingData).then(function(skill) {
                    var conditionText = self.getConditionStringPrefix() + skill.name;                    
                    def.resolve(conditionText);
                }, function() {
                    def.reject();
                });

                return def.promise();
            };

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking if the player has learned a skill
            var conditionTypeCheckSkillPlayerLearned = 15;

            /**
             * Check if player has learned a skill
             * @class
             */
            Conditions.CheckPlayerLearnedSkillCondition = function()
            {
                DefaultNodeShapes.Conditions.CheckLearnedSkillCondition.apply(this);
            };

            Conditions.CheckPlayerLearnedSkillCondition.prototype = jQuery.extend({ }, DefaultNodeShapes.Conditions.CheckLearnedSkillCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckPlayerLearnedSkillCondition.prototype.getType = function() {
                return conditionTypeCheckSkillPlayerLearned;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckPlayerLearnedSkillCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckPlayerLearnedSkillLabel;
            };

            /**
             * Returns the condition string prefix infront of the skill name
             * 
             * @returns {string} Condition String prefix
             */
            Conditions.CheckPlayerLearnedSkillCondition.prototype.getConditionStringPrefix = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckPlayerLearnedSkillPrefixLabel;
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckPlayerLearnedSkillCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking if the player has not learned a skill
            var conditionTypeCheckSkillPlayerNotLearned = 16;

            /**
             * Check if player has not learned a skill
             * @class
             */
            Conditions.CheckPlayerNotLearnedSkillCondition = function()
            {
                DefaultNodeShapes.Conditions.CheckLearnedSkillCondition.apply(this);
            };

            Conditions.CheckPlayerNotLearnedSkillCondition.prototype = jQuery.extend({ }, DefaultNodeShapes.Conditions.CheckLearnedSkillCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckPlayerNotLearnedSkillCondition.prototype.getType = function() {
                return conditionTypeCheckSkillPlayerNotLearned;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckPlayerNotLearnedSkillCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckPlayerNotLearnedSkillLabel;
            };

            /**
             * Returns the condition string prefix infront of the skill name
             * 
             * @returns {string} Condition String prefix
             */
            Conditions.CheckPlayerNotLearnedSkillCondition.prototype.getConditionStringPrefix = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckPlayerNotLearnedSkillPrefixLabel;
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckPlayerNotLearnedSkillCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking if the npc has learned a skill
            var conditionTypeCheckSkillNpcLearned = 17;

            /**
             * Check if npc has learned a skill
             * @class
             */
            Conditions.CheckNpcLearnedSkillCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.CheckLearnedSkillCondition.apply(this);
            };

            Conditions.CheckNpcLearnedSkillCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.CheckLearnedSkillCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckNpcLearnedSkillCondition.prototype.getType = function() {
                return conditionTypeCheckSkillNpcLearned;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckNpcLearnedSkillCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckNpcLearnedSkillLabel;
            };

            /**
             * Returns the condition string prefix infront of the skill name
             * 
             * @returns {string} Condition String prefix
             */
            Conditions.CheckNpcLearnedSkillCondition.prototype.getConditionStringPrefix = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckNpcLearnedSkillPrefixLabel;
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckNpcLearnedSkillCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking if the npc has not learned a skill
            var conditionTypeCheckSkillNpcNotLearned = 18;

            /**
             * Check if npc has not learned a skill
             * @class
             */
            Conditions.CheckNpcNotLearnedSkillCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.CheckLearnedSkillCondition.apply(this);
            };

            Conditions.CheckNpcNotLearnedSkillCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.CheckLearnedSkillCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckNpcNotLearnedSkillCondition.prototype.getType = function() {
                return conditionTypeCheckSkillNpcNotLearned;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckNpcNotLearnedSkillCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckNpcNotLearnedSkillLabel;
            };

            /**
             * Returns the condition string prefix infront of the skill name
             * 
             * @returns {string} Condition String prefix
             */
            Conditions.CheckNpcNotLearnedSkillCondition.prototype.getConditionStringPrefix = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckNpcNotLearnedSkillPrefixLabel;
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckNpcNotLearnedSkillCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking a random game value
            var conditionTypeCheckRandomValue = 19;

            /**
             * Check random value condition
             * @class
             */
            Conditions.CheckRandomValueCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.BaseCondition.apply(this);
            };

            Conditions.CheckRandomValueCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.BaseCondition.prototype);

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            Conditions.CheckRandomValueCondition.prototype.getTemplateName = function() {
                return "gn-nodeCheckRandomValue";
            };
            
            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            Conditions.CheckRandomValueCondition.prototype.canBeSelected = function() {
                return true;
            };

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckRandomValueCondition.prototype.getType = function() {
                return conditionTypeCheckRandomValue;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckRandomValueCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckRandomValueLabel;
            };

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            Conditions.CheckRandomValueCondition.prototype.getConditionDependsOnObject = function(existingData) {
                return [];
            };

            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.CheckRandomValueCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = {
                    selectedOperator: new ko.observable(),
                    minValue: new ko.observable(),
                    maxValue: new ko.observable(),
                    compareValue: new ko.observable(),
                    availableOperators: [ "=", "!=", "<=", "<", ">=", ">" ]
                };

                // Load existing data
                if(existingData)
                {
                    conditionData.selectedOperator(existingData.operator);
                    conditionData.minValue(existingData.minValue);
                    conditionData.maxValue(existingData.maxValue);
                    conditionData.compareValue(existingData.compareValue);
                }

                return conditionData;
            };

            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            Conditions.CheckRandomValueCondition.prototype.serializeConditionData = function(conditionData) {
                return {
                    operator: conditionData.selectedOperator(),
                    minValue: conditionData.minValue() ? conditionData.minValue() : 0,
                    maxValue: conditionData.maxValue() ? conditionData.maxValue() : 0,
                    compareValue: conditionData.compareValue() ? conditionData.compareValue() : 0
                };
            };

            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialzied condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckRandomValueCondition.prototype.getConditionString = function(existingData) {
                var def = new jQuery.Deferred();
                
                var conditionString = DefaultNodeShapes.Localization.Conditions.Rand;
                conditionString += "(" + existingData.minValue + "," + existingData.maxValue + ")";
                conditionString += " " + existingData.operator + " " + existingData.compareValue;
                def.resolve(conditionString);

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckRandomValueCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /**
             * Check value condition
             * @class
             */
            Conditions.CheckDailyRoutineEventStateCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.BaseCondition.apply(this);
                GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);
            };

            Conditions.CheckDailyRoutineEventStateCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.BaseCondition.prototype);
            Conditions.CheckDailyRoutineEventStateCondition.prototype = jQuery.extend(Conditions.CheckDailyRoutineEventStateCondition.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            Conditions.CheckDailyRoutineEventStateCondition.prototype.getTemplateName = function() {
                return "gn-nodeConditionCheckDailyRoutineEventState";
            };
            
            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            Conditions.CheckDailyRoutineEventStateCondition.prototype.canBeSelected = function() {
                return true;
            };

            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.CheckDailyRoutineEventStateCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = {
                    selectedDailyRoutineNpcId: new ko.observable(null),
                    selectedDailyRoutineEventId: new ko.observable(null),
                    selectedDailyRoutineNpcName: new ko.observable(null),
                    selectedDailyRoutineEvent: new ko.observable(null),
                };

                conditionData.selectedDailyRoutineEventDisplay = new ko.pureComputed(function() {
                    var npcName = this.selectedDailyRoutineNpcName();
                    var event = this.selectedDailyRoutineEvent();
                    if(!event) {
                        return DefaultNodeShapes.Localization.Conditions.ChooseDailyRoutineEvent;
                    }

                    var eventName = GoNorth.DailyRoutines.Util.formatTimeSpan(DefaultNodeShapes.Localization.Conditions.TimeFormat, event.earliestTime, event.latestTime);
                    return npcName + ": " + eventName;
                }, conditionData);

                // Handler
                conditionData.chooseDailyRoutineEvent = function() {
                    GoNorth.DefaultNodeShapes.openDailyRoutineEventSearchDialog().then(function(dailyRoutine) {
                        conditionData.selectedDailyRoutineNpcId(dailyRoutine.parentObject.id);
                        conditionData.selectedDailyRoutineEventId(dailyRoutine.eventId);
                        conditionData.selectedDailyRoutineNpcName(dailyRoutine.parentObject.name);
                        conditionData.selectedDailyRoutineEvent(dailyRoutine);
                    });
                };

                // Deserialize
                if(existingData)
                {
                    this.deserializeConditionData(conditionData, existingData);
                }

                return conditionData;
            };
            
            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            Conditions.CheckDailyRoutineEventStateCondition.prototype.serializeConditionData = function(conditionData) {
                return {
                    npcId: conditionData.selectedDailyRoutineNpcId(),
                    eventId: conditionData.selectedDailyRoutineEventId()
                };
            };

            /**
             * Deserializes condition data
             * 
             * @param {object} conditionData Condition data
             * @param {object} existingData Existing condition data
             */
            Conditions.CheckDailyRoutineEventStateCondition.prototype.deserializeConditionData = function(conditionData, existingData) {
                if(!existingData || !existingData.npcId || !existingData.eventId)
                {
                    return;
                }

                
                this.loadObjectShared(existingData).then(function(npc) {
                    if(!npc.dailyRoutine) 
                    {
                        return;
                    }

                    for(var curEvent = 0; curEvent < npc.dailyRoutine.length; ++curEvent)
                    {
                        if(npc.dailyRoutine[curEvent].eventId == existingData.eventId)
                        {
                            conditionData.selectedDailyRoutineNpcId(npc.id);
                            conditionData.selectedDailyRoutineNpcName(npc.name);
                            conditionData.selectedDailyRoutineEventId(npc.dailyRoutine[curEvent].eventId);
                            conditionData.selectedDailyRoutineEvent(npc.dailyRoutine[curEvent]);
                            return;
                        }
                    }
                });
            };

            /**
             * Returns the object id for dependency checks
             * 
             * @param {object} existingData Existing condition data
             * @returns {string} Object Id on which the condition depends
             */
            Conditions.CheckDailyRoutineEventStateCondition.prototype.getDependsOnObjectId = function(existingData) {
                return existingData && existingData.npcId ? existingData.npcId : null;
            };

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            Conditions.CheckDailyRoutineEventStateCondition.prototype.getConditionDependsOnObject = function(existingData) {
                var objectId = this.getDependsOnObjectId(existingData);

                return [{
                    objectType: "Npc",
                    objectId: objectId
                },{
                    objectType: "NpcDailyRoutineEvent",
                    objectId: existingData && existingData.eventId
                }];
            }


            /**
             * Returns the object resource
             * 
             * @returns {int} Object Resource
             */
            Conditions.CheckDailyRoutineEventStateCondition.prototype.getObjectResource = function() {
                return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
            };

            /**
             * Returns the object id from existing condition data for request caching
             * 
             * @param {object} existingData Existing condition data
             * @returns {string} Object Id for caching
             */
            Conditions.CheckDailyRoutineEventStateCondition.prototype.getObjectId = function(existingData) {
                return existingData.npcId;
            };

            /**
             * Loads an npc
             * 
             * @param {string} npcId Npc Id
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckDailyRoutineEventStateCondition.prototype.loadObject = function(npcId) {
                var loadingDef = new jQuery.Deferred();

                GoNorth.HttpClient.get("/api/KortistoApi/FlexFieldObject?id=" + npcId).done(function(npc) {
                    loadingDef.resolve(npc);
                }).fail(function(xhr) {
                    loadingDef.reject();
                });

                return loadingDef;
            };

            /**
             * Returns the condition string text template
             * 
             * @returns {string} Condition string text template
             */
            Conditions.CheckDailyRoutineEventStateCondition.prototype.getConditionStringText = function() {
                return "";
            };

            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialized condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckDailyRoutineEventStateCondition.prototype.getConditionString = function(existingData) {
                var def = new jQuery.Deferred();
                
                // Check if data is valid
                if(!existingData || !existingData.npcId || !existingData.eventId)
                {
                    def.resolve(DefaultNodeShapes.Localization.Conditions.MissingInformations);
                    return def.promise();
                }

                // Load data and build string
                var self = this;
                this.loadObjectShared(existingData).then(function(npc) {
                    if(!npc.dailyRoutine) 
                    {
                        def.resolve(DefaultNodeShapes.Localization.Conditions.MissingInformations);
                        return;
                    }

                    for(var curEvent = 0; curEvent < npc.dailyRoutine.length; ++curEvent)
                    {
                        if(npc.dailyRoutine[curEvent].eventId == existingData.eventId)
                        {
                            var eventName = GoNorth.DailyRoutines.Util.formatTimeSpan(DefaultNodeShapes.Localization.Conditions.TimeFormat, npc.dailyRoutine[curEvent].earliestTime, npc.dailyRoutine[curEvent].latestTime);
                            var displayString = self.getConditionStringText().replace("{0}", npc.name + ": " + eventName)
                            def.resolve(displayString);
                            return;
                        }
                    }

                    def.resolve(DefaultNodeShapes.Localization.Conditions.MissingInformations);
                }, function() {
                    def.reject();
                });

                return def.promise();
            };

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking if a daily routine event is disabled
            var conditionTypeCheckDailyRoutineEventIsDisabled = 21;

            /**
             * Check if a daily routine event is disabled condition
             * @class
             */
            Conditions.CheckDailyRoutineEventIsDisabledCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.CheckDailyRoutineEventStateCondition.apply(this);
            };

            Conditions.CheckDailyRoutineEventIsDisabledCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.CheckDailyRoutineEventStateCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckDailyRoutineEventIsDisabledCondition.prototype.getType = function() {
                return conditionTypeCheckDailyRoutineEventIsDisabled;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckDailyRoutineEventIsDisabledCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckDailyRoutineIsDisabled;
            };
            
            /**
             * Returns the condition string text template
             * 
             * @returns {string} Condition string text template
             */
            Conditions.CheckDailyRoutineEventIsDisabledCondition.prototype.getConditionStringText = function() {
                return DefaultNodeShapes.Localization.Conditions.DailyRoutineEventIsDisabled;
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckDailyRoutineEventIsDisabledCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for checking if a daily routine event is active
            var conditionTypeCheckDailyRoutineEventIsActive = 20;

            /**
             * Check if a daily routine event is active condition
             * @class
             */
            Conditions.CheckDailyRoutineEventIsActiveCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.CheckDailyRoutineEventStateCondition.apply(this);
            };

            Conditions.CheckDailyRoutineEventIsActiveCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.CheckDailyRoutineEventStateCondition.prototype);

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckDailyRoutineEventIsActiveCondition.prototype.getType = function() {
                return conditionTypeCheckDailyRoutineEventIsActive;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckDailyRoutineEventIsActiveCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckDailyRoutineIsActive;
            };
            
            /**
             * Returns the condition string text template
             * 
             * @returns {string} Condition string text template
             */
            Conditions.CheckDailyRoutineEventIsActiveCondition.prototype.getConditionStringText = function() {
                return DefaultNodeShapes.Localization.Conditions.DailyRoutineEventIsActive;
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckDailyRoutineEventIsActiveCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /// Condition Type for running a condition
            var conditionTypeCheckCodeCondition = 22;

            /**
             * Check code condition
             * @class
             */
            Conditions.CheckCodeCondition = function()
            {
                GoNorth.DefaultNodeShapes.Conditions.BaseCondition.apply(this);
            };

            Conditions.CheckCodeCondition.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Conditions.BaseCondition.prototype);

            /**
             * Returns the template name for the condition
             * 
             * @returns {string} Template name
             */
            Conditions.CheckCodeCondition.prototype.getTemplateName = function() {
                return "gn-nodeCheckCode";
            };
            
            /**
             * Returns true if the condition can be selected in the dropdown list, else false
             * 
             * @returns {bool} true if the condition can be selected, else false
             */
            Conditions.CheckCodeCondition.prototype.canBeSelected = function() {
                return true;
            };

            /**
             * Returns the type of the condition
             * 
             * @returns {number} Type of the condition
             */
            Conditions.CheckCodeCondition.prototype.getType = function() {
                return conditionTypeCheckCodeCondition;
            };

            /**
             * Returns the label of the condition
             * 
             * @returns {string} Label of the condition
             */
            Conditions.CheckCodeCondition.prototype.getLabel = function() {
                return DefaultNodeShapes.Localization.Conditions.CheckCodeLabel;
            };

            /**
             * Returns the objects on which an object depends
             * 
             * @param {object} existingData Existing condition data
             * @returns {object[]} Objects on which the condition depends
             */
            Conditions.CheckCodeCondition.prototype.getConditionDependsOnObject = function(existingData) {
                return [];
            };

            /**
             * Returns the data for the condition
             * 
             * @param {object} existingData Existing condition data
             * @param {object} element Element to which the data belongs
             * @returns {object} Condition data
             */
            Conditions.CheckCodeCondition.prototype.buildConditionData = function(existingData, element) {
                var conditionData = {
                    scriptName: new ko.observable(""),
                    scriptCode: new ko.observable("")                
                };

                var self = this;
                conditionData.editScript = function() {
                    self.editScript(conditionData);
                };

                // Load existing data
                if(existingData)
                {
                    conditionData.scriptName(existingData.scriptName);
                    conditionData.scriptCode(existingData.scriptCode);
                }

                return conditionData;
            };

            /**
             * Edits the condition script
             * 
             * @param {object} conditionData Condition data
             */
            Conditions.CheckCodeCondition.prototype.editScript = function(conditionData) {
                GoNorth.DefaultNodeShapes.openCodeEditor(conditionData.scriptName(), conditionData.scriptCode()).then(function(result) {
                    conditionData.scriptName(result.name);
                    conditionData.scriptCode(result.code);
                });
            };

            /**
             * Serializes condition data
             * 
             * @param {object} conditionData Condition data
             * @returns {object} Serialized data
             */
            Conditions.CheckCodeCondition.prototype.serializeConditionData = function(conditionData) {
                return {
                    scriptName: conditionData.scriptName(),
                    scriptCode: conditionData.scriptCode()
                };
            };

            /**
             * Returns the condition data as a display string
             * 
             * @param {object} existingData Serialzied condition data
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Conditions.CheckCodeCondition.prototype.getConditionString = function(existingData) {
                var def = new jQuery.Deferred();
                
                def.resolve(existingData.scriptName ? existingData.scriptName : DefaultNodeShapes.Localization.Conditions.CheckCodeConditionPlaceholderString);

                return def.promise();
            };

            GoNorth.DefaultNodeShapes.Conditions.getConditionManager().addConditionType(new Conditions.CheckCodeCondition());

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Shapes) {

            // Function needs to be set in view model to open condition dialog
            if(!DefaultNodeShapes.openConditionDialog)
            {
                DefaultNodeShapes.openConditionDialog = function() {
                    var def = new jQuery.Deferred();
                    def.reject("Not implemented");
                    return def.promise();
                }
            }

            /// Condition Type
            var conditionType = "default.Condition";
            
            /// Condition Target Array
            var conditionTargetArray = "condition";


            /// Condition node width
            var conditionWidth = 350;
            
            /// Min Condition Height
            var conditionMinHeight = 50;

            /// Height of condition item in pixel
            var conditionItemHeight = 66;

            /// Initial Offset of the port
            var conditionPortInitialOffset = 76;
            

            joint.shapes.default = joint.shapes.default || {};

            /**
             * Creates the condition shape
             * @returns {object} Condition shape
             */
            function createConditionShape() {
                var model = joint.shapes.devs.Model.extend(
                {
                    defaults: joint.util.deepSupplement
                    (
                        {
                            type: conditionType,
                            icon: "glyphicon-question-sign",
                            size: { width: conditionWidth, height: conditionMinHeight },
                            inPorts: ['input'],
                            outPorts: [],
                            attrs:
                            {
                                '.inPorts circle': { "magnet": "passive", "port-type": "input" },
                                '.outPorts circle': { "magnet": "true" }
                            },
                            conditions: [],
                            currentConditionId: 0
                        },
                        joint.shapes.default.Base.prototype.defaults
                    )
                });
                return model;
            }

            /**
             * Creates a condition view
             * @returns {object} Condition view
             */
            function createConditionView() {
                return joint.shapes.default.BaseView.extend(
                {
                    /**
                     * Template
                     */
                    template:
                    [
                        '<div class="node">',
                            '<span class="label"><i class="nodeIcon glyphicon"></i><span class="labelText"></span></span>',
                            '<span class="gn-nodeLoading" style="display: none"><i class="glyphicon glyphicon-refresh spinning"></i></span>',
                            '<span class="gn-nodeError text-danger" style="display: none" title="' + GoNorth.DefaultNodeShapes.Localization.ErrorOccured + '"><i class="glyphicon glyphicon-warning-sign"></i></span>',
                            '<button class="delete gn-nodeDeleteOnReadonly cornerButton" title="' + GoNorth.DefaultNodeShapes.Localization.DeleteNode + '" type="button">x</button>',
                            '<button class="gn-nodeAddCondition gn-nodeDeleteOnReadonly cornerButton" title="' + GoNorth.DefaultNodeShapes.Localization.Conditions.AddCondition + '" type="button">+</button>',
                        '</div>',
                    ].join(''),

                    /** 
                     * Additiona Callback Buttons 
                     */
                    additionalCallbackButtons: {
                        "gn-nodeAddCondition": function() {
                            this.addCondition();
                        }
                    },

                    /**
                     * Initializes the shape
                     */
                    initialize: function() {
                        _.bindAll(this, 'addCondition');
                        joint.shapes.default.BaseView.prototype.initialize.apply(this, arguments);

                        this.model.on('change:conditions', this.syncConditions, this);

                        if(this.model.get("conditions").length == 0)
                        {
                            this.addCondition();
                        }
                        else
                        {
                            this.syncConditions();
                        }
                    },

                    /**
                     * Adds a new condition
                     * 
                     * @param {object} existingCondition Existing condition to add, null to create new one
                     */
                    addCondition: function(existingCondition) {
                        var condition = existingCondition;
                        if(!condition)
                        {
                            condition = {
                                id: this.model.get("currentConditionId"),
                                conditionElements: []
                            };
                            this.model.set("currentConditionId", this.model.get("currentConditionId") + 1);
                        }

                        // Copy conditions and update using set
                        var newConditions = (this.model.get("conditions") || {}).slice();
                        newConditions.push(condition);
                        this.model.set("conditions", newConditions);
                    },

                    /**
                     * Moves a condition
                     * 
                     * @param {number} conditionId Condition Id
                     * @param {number} direction Direction to move
                     */
                    moveCondition: function(conditionId, direction) {
                        var newConditions = (this.model.get("conditions") || {}).slice();
                        for(var curCondition = 0; curCondition < newConditions.length; ++curCondition)
                        {
                            if(newConditions[curCondition].id == conditionId)
                            {
                                var newIndex = curCondition + direction;
                                if(newIndex >= 0 && newIndex < newConditions.length)
                                {
                                    var tmpCondition = newConditions[curCondition];
                                    newConditions[curCondition] = newConditions[newIndex];
                                    newConditions[newIndex] = tmpCondition;
                                    this.model.set("conditions", newConditions);
                                }
                                return;
                            }
                        }
                    },

                    /**
                     * Delets a condition
                     * 
                     * @param {number} conditionId Condition Id
                     */
                    deleteCondition: function(conditionId) {
                        var newCondition = (this.model.get("conditions") || {}).slice();
                        for(var curCondition = 0; curCondition < newCondition.length; ++curCondition)
                        {
                            if(newCondition[curCondition].id == conditionId)
                            {
                                newCondition.splice(curCondition, 1);
                                this.model.set("conditions", newCondition);
                                return;
                            }
                        }
                    },


                    /** 
                     * Opens a condition
                     * 
                     * @param {number} conditionId Condition Id
                     */
                    openConditionDialog: function(conditionId) {
                        var conditions = (this.model.get("conditions") || {}).slice();
                        for(var curCondition = 0; curCondition < conditions.length; ++curCondition)
                        {
                            if(conditions[curCondition].id == conditionId)
                            {
                                var self = this;
                                DefaultNodeShapes.openConditionDialog(conditions[curCondition]).then(function() {
                                    self.syncConditions();
                                });
                                return;
                            }
                        }
                    },
                    
                    
                    /**
                     * Syncs the conditions (ports, size, ...)
                     */
                    syncConditions: function() {
                        var outPorts = [];
                        var conditions = this.model.get("conditions");
                        for(var curCondition = 0; curCondition < conditions.length; ++curCondition)
                        {
                            outPorts.push("condition" + conditions[curCondition].id);
                        }
                        outPorts.push("else");
                        this.model.set("outPorts", outPorts);

                        // Update Html
                        var allTextDeferreds = [];
                        var self = this;
                        
                        this.model.set("size", { width: conditionWidth, height: conditionMinHeight + outPorts.length * conditionItemHeight});
                        var conditionTable = "<table class='gn-nodeConditionTable'>";
                        jQuery.each(conditions, function(key, condition) {
                            var conditionText = self.buildConditionString(condition, allTextDeferreds);
                            conditionText = jQuery("<div></div>").text(conditionText).html();

                            conditionTable += "<tr>";
                            conditionTable += "<td class='gn-nodeConditionTableConditionCell'><a class='gn-clickable gn-nodeNonClickableOnReadonly' data-conditionid='" + condition.id + "'>" + conditionText + "</a></td>";
                            conditionTable += "<td class='gn-nodeDeleteOnReadonly'><i class='glyphicon glyphicon-arrow-up gn-nodeMoveConditionUp gn-nodeConditionIcon' data-conditionid='" + condition.id + "' title='" + DefaultNodeShapes.Localization.Conditions.MoveConditionUp + "'></i></td>";
                            conditionTable += "<td class='gn-nodeDeleteOnReadonly'><i class='glyphicon glyphicon-arrow-down gn-nodeMoveConditionDown gn-nodeConditionIcon' data-conditionid='" + condition.id + "' title='" + DefaultNodeShapes.Localization.Conditions.MoveConditionDown + "'></i></td>";
                            conditionTable += "<td class='gn-nodeDeleteOnReadonly'><i class='glyphicon glyphicon-trash gn-nodeDeleteCondition gn-nodeConditionIcon' data-conditionid='" + condition.id + "' title='" + DefaultNodeShapes.Localization.Conditions.DeleteCondition + "'></i></td>";
                            conditionTable += "</tr>";
                        });

                        conditionTable += "<tr>";
                        conditionTable += "<td class='gn-nodeConditionTableConditionCell'>" + DefaultNodeShapes.Localization.Conditions.Else + "</td>";
                        conditionTable += "</tr>";

                        conditionTable += "</table>";
                        if(this.$box.find(".gn-nodeConditionTable").length > 0)
                        {
                            this.$box.find(".gn-nodeConditionTable").replaceWith(conditionTable);
                        }
                        else
                        {
                            this.$box.append(conditionTable);
                        }

                        this.hideError();
                        if(allTextDeferreds.length > 0)
                        {
                            this.showLoading();
                            jQuery.when.apply(jQuery, allTextDeferreds).then(function() {
                                self.hideLoading();
                            }, function() {
                                self.hideLoading();
                                self.showError();
                            });
                        }

                        // Update Port Positions
                        for(var curCondition = 0; curCondition < outPorts.length; ++curCondition)
                        {
                            this.model.attr(".outPorts>.port" + curCondition, { "ref-y": (conditionPortInitialOffset + conditionItemHeight * curCondition) + "px", "ref": ".body" });
                        }

                        // Bind events
                        this.$box.find(".gn-nodeMoveConditionUp").on("click", function() {
                            self.moveCondition(jQuery(this).data("conditionid"), -1);
                        });

                        this.$box.find(".gn-nodeMoveConditionDown").on("click", function() {
                            self.moveCondition(jQuery(this).data("conditionid"), +1);
                        });

                        this.$box.find(".gn-nodeDeleteCondition").on("click", function() {
                            self.deleteCondition(jQuery(this).data("conditionid"));
                        });

                        this.$box.find(".gn-nodeConditionTableConditionCell a").on("click", function() {
                            self.openConditionDialog(jQuery(this).data("conditionid"));
                        });
                    },

                    /**
                     * Builds a condition string and sets it
                     * 
                     * @param {object} condition Condition
                     * @param {jQuery.Deferred[]} allTextDeferreds All Text Deferreds
                     * @returns {string} Condition text
                     */
                    buildConditionString: function(condition, allTextDeferreds) {
                        var conditionText = "";
                        var self = this;
                        if(condition.conditionElements && condition.conditionElements.length > 0)
                        {
                            conditionText = DefaultNodeShapes.Localization.Conditions.LoadingConditionText;

                            var selectorString = ".gn-nodeConditionTableConditionCell>a[data-conditionid='" + condition.id + "']";
                            var textDef = GoNorth.DefaultNodeShapes.Conditions.getConditionManager().getConditionString(condition.conditionElements, GoNorth.DefaultNodeShapes.Localization.Conditions.AndOperatorShort, false);
                            textDef.then(function(generatedText) {
                                if(!generatedText) 
                                {
                                    generatedText = DefaultNodeShapes.Localization.Conditions.EditCondition;
                                }
                                else 
                                { 
                                    self.$box.find(selectorString).attr("title", generatedText);
                                }
                                self.$box.find(selectorString).text(generatedText);
                                conditionText = generatedText;  // Update condition text in case no async operation was necessary
                            }, function(err) {
                                var errorText = DefaultNodeShapes.Localization.Conditions.ErrorLoadingConditionText;
                                if(err) 
                                {
                                    errorText += ": " + err;
                                }
                                self.$box.find(selectorString).text(errorText);
                                self.$box.find(selectorString).attr("title", errorText);
                                conditionText = errorText;
                            });
                            allTextDeferreds.push(textDef);
                        }
                        else
                        {
                            conditionText = DefaultNodeShapes.Localization.Conditions.EditCondition;
                        }

                        return conditionText;
                    },

                    /**
                     * Reloads the shared data
                     * 
                     * @param {number} objectType Object Type
                     * @param {string} objectId Object Id
                     */
                    reloadSharedLoadedData: function(objectType, objectId) {
                        var conditions = this.model.get("conditions");
                        var allTextDeferreds = [];
                        for(var curCondition = 0; curCondition < conditions.length; ++curCondition)
                        {
                            var dependsOnObject = GoNorth.DefaultNodeShapes.Conditions.getConditionManager().getConditionElementsDependsOnObject(conditions[curCondition].conditionElements);
                            for(var curDependency = 0; curDependency < dependsOnObject.length; ++curDependency)
                            {
                                if(dependsOnObject[curDependency].objectId == objectId)
                                {
                                    this.buildConditionString(conditions[curCondition], allTextDeferreds);
                                }
                            }
                        }

                        this.hideError();
                        if(allTextDeferreds.length > 0)
                        {
                            this.showLoading();
                            var self = this;
                            jQuery.when.apply(jQuery, allTextDeferreds).then(function() {
                                self.hideLoading();
                            }, function() {
                                self.hideLoading();
                                self.showError();
                            });
                        }
                    },


                    /**
                     * Shows the loading indicator
                     */
                    showLoading: function() {
                        this.$box.find(".gn-nodeLoading").show();
                    },

                    /**
                     * Hides the loading indicator
                     */
                    hideLoading: function() {
                        this.$box.find(".gn-nodeLoading").hide();
                    },


                    /**
                     * Shows the error indicator
                     */
                    showError: function() {
                        this.$box.find(".gn-nodeError").show();
                    },

                    /**
                     * Hides the error indicator
                     */
                    hideError: function() {
                        this.$box.find(".gn-nodeError").hide();
                    },


                    /**
                     * Returns statistics for the node
                     * @returns Node statistics
                     */
                    getStatistics: function() {
                        var conditions = this.model.get("conditions");
                        var conditionCount = 0;
                        for(var curCondition = 0; curCondition < conditions.length; ++curCondition) {
                            if(conditions[curCondition].conditionElements && conditions[curCondition].conditionElements.length > 0) {
                                ++conditionCount;
                            }
                        }

                        return {
                            conditionCount: conditionCount
                        };
                    }
                });
            }

            /**
             * Condition Shape
             */
            joint.shapes.default.Condition = createConditionShape();

            /**
             * Condition View
             */
            joint.shapes.default.ConditionView = createConditionView();


            /** 
             * Condition Serializer 
             * 
             * @class
             */
            Shapes.ConditionSerializer = function()
            {
                GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.apply(this, [ joint.shapes.default.Condition, conditionType, conditionTargetArray ]);
            };

            Shapes.ConditionSerializer.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.prototype)

            /**
             * Serializes a node
             * 
             * @param {object} node Node Object
             * @returns {object} Serialized NOde
             */
            Shapes.ConditionSerializer.prototype.serialize = function(node) {
                var serializedConditions = [];
                for(var curCondition = 0; curCondition < node.conditions.length; ++curCondition)
                {
                    var serializedCondition = GoNorth.DefaultNodeShapes.Conditions.getConditionManager().serializeCondition(node.conditions[curCondition]);
                    serializedConditions.push(serializedCondition);
                }

                var serializedData = {
                    id: node.id,
                    x: node.position.x,
                    y: node.position.y,
                    conditions: serializedConditions,
                    currentConditionId: node.currentConditionId
                };

                return serializedData;
            };

            /**
             * Deserializes a serialized node
             * 
             * @param {object} node Serialized Node Object
             * @returns {object} Deserialized Node
             */
            Shapes.ConditionSerializer.prototype.deserialize = function(node) {
                var deserializedConditions = [];
                for(var curCondition = 0; curCondition < node.conditions.length; ++curCondition)
                {
                    var deserializedCondition = GoNorth.DefaultNodeShapes.Conditions.getConditionManager().deserializeCondition(node.conditions[curCondition]);
                    deserializedConditions.push(deserializedCondition);
                }

                var initOptions = {
                    id: node.id,
                    position: { x: node.x, y: node.y },
                    conditions: deserializedConditions,
                    currentConditionId: node.currentConditionId
                };

                var node = new this.classType(initOptions);
                return node;
            };

            // Register Serializers
            var conditionSerializer = new Shapes.ConditionSerializer();
            GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().addNodeSerializer(conditionSerializer);

        }(DefaultNodeShapes.Shapes = DefaultNodeShapes.Shapes || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Conditions) {

            /**
             * Finds the condition dialog in a parents list
             * @param {object[]} parents Knockout parents elements
             * @returns {object} Condition Dialog context
             */
            Conditions.findConditionDialog = function(parents) {
                for(var curParent = 0; curParent < parents.length; ++curParent)
                {
                    if(parents[curParent].isConditionDialogViewModel) {
                        return parents[curParent];
                    }
                }

                return parents[0];
            }

            /**
             * Condition Dialog Model
             * @class
             */
            Conditions.ConditionDialog = function()
            {
                this.isConditionDialogViewModel = true;

                this.isOpen = new ko.observable(false);
                this.condition = null;
                this.closingDeferred = null;

                this.conditionElements = new ko.observableArray();

                this.showGroupWarning = new ko.observable(false);
                this.showDragParentToChildWarning = new ko.observable(false);
                this.warningHideTimeout = null;
                
                this.selectableConditionTypes = Conditions.getConditionManager().getSelectableConditionTypes();
            };

            Conditions.ConditionDialog.prototype = {
                /**
                 * Shows the dialog
                 * 
                 * @param {object} condition Condition to edit
                 * @param {jQuery.Deferred} closingDeferred optional deferred that will be resolved on save
                 */
                openDialog: function(condition, closingDeferred) {
                    this.condition = condition;
                    this.closingDeferred = closingDeferred;
                    this.conditionElements(Conditions.getConditionManager().convertElements(condition.conditionElements));
                    if(this.conditionElements().length == 0)
                    {
                        this.addNewConditionElement();
                    }

                    this.isOpen(true);
                },

                /**
                 * Adds a new condition element
                 */
                addNewConditionElement: function() {
                    var element = Conditions.getConditionManager().createEmptyElement();

                    this.conditionElements.push(element);
                },

                /**
                 * Groups the selected elements as and
                 */
                andGroupElements: function() {
                    this.groupElements(Conditions.GroupConditionOperatorAnd);
                },
                
                /**
                 * Groups the selected elements as or
                 */
                orGroupElements: function() {
                    this.groupElements(Conditions.GroupConditionOperatorOr);
                },

                /**
                 * Groups the selected elements
                 * 
                 * @param {number} operator Operator for the element
                 */
                groupElements: function(operator) {
                    this.showGroupWarning(false);
                    
                    var selectedElements = [];
                    this.collectSelectedElements(selectedElements, this.conditionElements());
                    if(selectedElements.length < 2)
                    {
                        return;
                    }

                    for(var curElement = 1; curElement < selectedElements.length; ++curElement)
                    {
                        if(selectedElements[0].parent != selectedElements[curElement].parent)
                        {
                            this.displayWarning(this.showGroupWarning);
                            return;
                        }
                    }

                    // Group Elements
                    var groupData = {
                        conditionType: Conditions.GroupConditionType,
                        conditionData: {
                            fromDialog: true,
                            operator: operator,
                            conditionElements: selectedElements
                        }
                    };
                    var groupElement = Conditions.getConditionManager().convertElement(groupData);
                    groupElement.parent = selectedElements[0].parent;

                    // Push array
                    var targetArray = this.conditionElements;
                    if(selectedElements[0].parent)
                    {
                        targetArray = selectedElements[0].parent.conditionData().conditionElements;
                    }

                    var firstIndex = targetArray.indexOf(selectedElements[0]);
                    targetArray.removeAll(selectedElements);
                    if(firstIndex < targetArray().length)
                    {
                        targetArray.splice(firstIndex, 0, groupElement);
                    }
                    else
                    {
                        targetArray.push(groupElement);
                    }

                    // Set parent
                    for(var curElement = 0; curElement < selectedElements.length; ++curElement)
                    {
                        selectedElements[curElement].parent = groupElement;
                        selectedElements[curElement].isSelected(false);
                    }
                },

                /**
                 * Collects all selected elements
                 * 
                 * @param {object[]} targetArray Target array to fill
                 * @param {object[]} conditionElements Source array to search
                 */
                collectSelectedElements: function(targetArray, conditionElements) {
                    for(var curElement = 0; curElement < conditionElements.length; ++curElement)
                    {
                        if(conditionElements[curElement].isSelected())
                        {
                            targetArray.push(conditionElements[curElement]);
                        }

                        if(conditionElements[curElement].conditionData().conditionElements)
                        {
                            this.collectSelectedElements(targetArray, conditionElements[curElement].conditionData().conditionElements());
                        }
                    }
                },

                /**
                 * Moves a condition element up
                 * 
                 * @param {object} element Condition Element to move
                 */
                moveConditionElementUp: function(element) {
                    this.moveSingleConditionElement(element, -1);
                },

                /**
                 * Moves a condition element down
                 * 
                 * @param {object} element Condition Element to move
                 */
                moveConditionElementDown: function(element) {
                    this.moveSingleConditionElement(element, 1);
                },

                /**
                 * Moves a single condition element
                 * 
                 * @param {object} element Condition Element to move
                 * @param {number} direction Direction to move the element in
                 */
                moveSingleConditionElement: function(element, direction) {
                    var conditionElements = null;
                    if(element.parent)
                    {
                        conditionElements = element.parent.conditionData().conditionElements;
                    }
                    else
                    {
                        conditionElements = this.conditionElements;
                    }

                    var elementIndex = conditionElements.indexOf(element);
                    var newIndex = elementIndex + direction;
                    var unwrappedElements = conditionElements();
                    if(newIndex >= 0 && newIndex < unwrappedElements.length)
                    {
                        var tmp = unwrappedElements[elementIndex];
                        unwrappedElements[elementIndex] = unwrappedElements[newIndex];
                        unwrappedElements[newIndex] = tmp;
                        conditionElements.valueHasMutated();
                    }
                },

                /**
                 * Moves a condition to a group using drag and drop
                 */
                dropConditionToGroup: function(group, conditionElement) {
                    // Check data
                    if(conditionElement.parent == group)
                    {
                        return;
                    }

                    var parent = group ? group.parent : null;
                    while(parent != null)
                    {
                        if(parent == conditionElement)
                        {
                            this.displayWarning(this.showDragParentToChildWarning);
                            return;
                        }
                        parent = parent.parent;
                    }

                    // Remove from old array
                    if(!conditionElement.parent)
                    {
                        this.conditionElements.remove(conditionElement);
                    }
                    else
                    {
                        conditionElement.parent.conditionData().conditionElements.remove(conditionElement);
                        if(conditionElement.parent.conditionData().conditionElements().length < 2)
                        {
                            this.deleteConditionElement(conditionElement.parent);
                        }
                    }

                    if(!group)
                    {
                        this.conditionElements.push(conditionElement);
                    }
                    else
                    {
                        group.conditionData().conditionElements.push(conditionElement);
                    }

                    conditionElement.parent = group;
                },

                /**
                 * Displays a warning
                 * 
                 * @param {ko.observable} obs Observable to set to true to display the warning
                 */
                displayWarning: function(obs) {
                    if(this.warningHideTimeout)
                    {
                        clearTimeout(this.warningHideTimeout);
                        this.showGroupWarning(false);
                        this.showDragParentToChildWarning(false);
                    }

                    obs(true);
                    this.warningHideTimeout = setTimeout(function() {
                        obs(false);
                    }, 5000);
                },

                /**
                 * Deletes a condition element
                 * 
                 * @param {object} element Condition Element
                 */
                deleteConditionElement: function(element) {
                    if(element.conditionData().conditionElements)
                    {
                        var conditionElements = element.conditionData().conditionElements();
                        if(element.parent && element.parent.conditionData().conditionElements)
                        {
                            this.moveConditionElements(conditionElements, element.parent.conditionData().conditionElements, element.parent, element);
                        }
                        else
                        {
                            this.moveConditionElements(conditionElements, this.conditionElements, null, element);
                        }
                    }

                    if(!element.parent || !element.parent.conditionData().conditionElements)
                    {
                        this.conditionElements.remove(element);
                    }
                    else
                    {
                        element.parent.conditionData().conditionElements.remove(element);
                        if(element.parent.conditionData().conditionElements().length < 2)
                        {
                            this.deleteConditionElement(element.parent);
                        }
                    }
                },

                /**
                 * Moves the condition elements 
                 * 
                 * @param {object[]} conditionElements Condition elements to move
                 * @param {ko.observableArray} targetArray Target array to move the elements too
                 * @param {object} parent New parent
                 */
                moveConditionElements: function(conditionElements, targetArray, parent, element) {
                    // Move elements
                    var targetIndex = targetArray.indexOf(element);
                    for(var curElement = 0; curElement < conditionElements.length; ++curElement)
                    {
                        conditionElements[curElement].parent = parent;
                        if(targetIndex < targetArray().length)
                        {
                            targetArray.splice(targetIndex + curElement, 0, conditionElements[curElement]);
                        }
                        else
                        {
                            targetArray.push(conditionElements[curElement]);
                        }
                    }
                },

                /**
                 * Returns the condition template
                 * 
                 * @param {object} element Condition Element
                 * @returns {string} Condition Element template
                 */
                getConditionTemplate: function(element) {
                    if(element)
                    {
                        return Conditions.getConditionManager().getConditionTemplate(element.conditionType());
                    }

                    return "gn-nodeConditionEmpty";
                },

                /**
                 * Returns the condition template
                 * 
                 * @param {object} element Condition Element
                 * @returns {string} Condition Element template
                 */
                isConditionTypeSelectable: function(element) {
                    if(element)
                    {
                        return Conditions.getConditionManager().isConditionTypeSelectable(element.conditionType());
                    }

                    return true;
                },


                /**
                 * Saves the condition
                 */
                saveCondition: function() {
                    var serializedData = [];
                    var conditionElements = this.conditionElements();
                    for(var curElement = 0; curElement < conditionElements.length; ++curElement)
                    {
                        serializedData.push(Conditions.getConditionManager().serializeConditionElement(conditionElements[curElement]));
                    }
                    
                    this.condition.conditionElements = serializedData;
                    if(this.closingDeferred)
                    {
                        this.closingDeferred.resolve();
                    }
                    this.closeDialog();
                },

                /**
                 * Closes the dialog
                 */
                closeDialog: function() {
                    this.condition = null;
                    this.closingDeferred = null;
                    this.isOpen(false);
                }
            };

        }(DefaultNodeShapes.Conditions = DefaultNodeShapes.Conditions || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(DefaultNodeShapes) {
        (function(Shapes) {

            /// Reference Type
            var referenceType = "default.Reference";
            
            /// Reference Target Array
            var referenceTargetArray = "reference";

            joint.shapes.default = joint.shapes.default || {};

            /**
             * Creates the reference shape
             * @returns {object} reference shape
             * @memberof Shapes
             */
            function createReferenceShape() {
                var model = joint.shapes.devs.Model.extend(
                {
                    defaults: joint.util.deepSupplement
                    (
                        {
                            type: referenceType,
                            icon: "glyphicon-link",
                            size: { width: 250, height: 200 },
                            inPorts: ['input'],
                            outPorts: ['output'],
                            attrs:
                            {
                                '.inPorts circle': { "magnet": "passive", "port-type": "input" },
                                '.outPorts circle': { "magnet": "true" }
                            },
                            referencedObjects: [],
                            referencedMarkerType: "",
                            referenceText: ""
                        },
                        joint.shapes.default.Base.prototype.defaults
                    )
                });
                return model;
            }

            /**
             * Creates a reference view
             * @returns {object} Reference view
             * @memberof Shapes
             */
            function createReferenceView() {
                let baseView = joint.shapes.default.BaseView.extend(
                {
                    /**
                     * Template
                     */
                    template:
                    [
                        '<div class="node">',
                            '<span class="label"><i class="nodeIcon glyphicon"></i><span class="labelText"></span></span>',
                            '<span class="gn-nodeLoading" style="display: none"><i class="glyphicon glyphicon-refresh spinning"></i></span>',
                            '<span class="gn-nodeError text-danger" style="display: none" title="' + GoNorth.DefaultNodeShapes.Localization.ErrorOccured + '"><i class="glyphicon glyphicon-warning-sign"></i></span>',
                            '<button class="delete gn-nodeDeleteOnReadonly cornerButton" title="' + GoNorth.DefaultNodeShapes.Localization.DeleteNode + '" type="button">x</button>',
                            '<div class="gn-referenceNodeLink">',
                                '<a class="gn-clickable gn-nodeNonClickableOnReadonly objectChooseLink"></a>',
                                '<a class="gn-clickable gn-nodeActionOpenObject" title="' + DefaultNodeShapes.Localization.Reference.OpenObjectTooltip + '" style="display: none"><i class="glyphicon glyphicon-eye-open"></i></a>',
                            '</div>',
                            '<textarea class="gn-referenceText" placeholder="' + GoNorth.DefaultNodeShapes.Localization.Reference.ReferenceText + '"></textarea>',
                        '</div>',
                    ].join(''),

                    /**
                     * Initializes the shape
                     */
                    initialize: function() {
                        joint.shapes.default.BaseView.prototype.initialize.apply(this, arguments);
                        GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.apply(this);

                        var self = this;
                        this.$box.find('.gn-referenceText').on('input', function(evt)
                        {
                            self.model.set('referenceText', jQuery(evt.target).val());
                        });

                        this.$box.find('.objectChooseLink').on("click", function() {
                            GoNorth.DefaultNodeShapes.openGeneralObjectSearchDialog().then(function(selectedObject) {
                                var referencedMarkerType = "";
                                var dependencyObjects = [{
                                    objectType: selectedObject.objectType,
                                    objectId: selectedObject.eventId ? selectedObject.eventId : selectedObject.id
                                }];
                                if(selectedObject.parentObject) {
                                    dependencyObjects.push({
                                        objectType: GoNorth.DefaultNodeShapes.Actions.RelatedToObjectNpc,
                                        objectId: selectedObject.parentObject.id
                                    });
                                }
                                if(selectedObject.mapId) {
                                    dependencyObjects.push({
                                        objectType: GoNorth.DefaultNodeShapes.Actions.RelatedToObjectMap,
                                        objectId: selectedObject.mapId
                                    });
                                    referencedMarkerType = selectedObject.markerType;
                                }

                                self.model.set('referencedObjects', dependencyObjects);
                                self.model.set('referencedMarkerType', referencedMarkerType);
                                var objectName = selectedObject.name;
                                if(selectedObject.additionalName) {
                                    objectName += " (" + selectedObject.additionalName + ")";
                                }
                                self.setLinkLabel(objectName, selectedObject.objectType);
                            });
                        });
                        
                        this.$box.find('.gn-nodeActionOpenObject').on("click", function() {
                            self.openObject();
                        });

                        this.syncModelData();
                    },

                    /**
                     * Syncs the model data
                     */
                    syncModelData: function() {
                        this.$box.find('.gn-referenceText').val(this.model.get('referenceText'));

                        var selectionText = GoNorth.DefaultNodeShapes.Localization.Reference.ChooseObject;
                        this.$box.find('.objectChooseLink').text(selectionText);

                        var referencedObjects = this.model.get('referencedObjects');
                        if(referencedObjects && referencedObjects.length > 0)
                        {
                            var self = this;
                            self.hideError();
                            self.showLoading();
                            this.loadReferencedObjectName(referencedObjects).then(function(name) {
                                self.hideLoading();
                                self.setLinkLabel(name, referencedObjects[0].objectType);
                            }, function() {
                                self.showError();
                                self.hideLoading();
                            });
                        }
                    },

                    /**
                     * Sets the link label
                     * @param {string} objectName Object name
                     * @param {string} objectType Object type
                     */
                    setLinkLabel: function(objectName, objectType) {
                        var iconName = "";
                        if(objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectNpc) 
                        {
                            iconName = "glyphicon-user";
                        }
                        else if(objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectItem) 
                        {
                            iconName = "glyphicon-apple";
                        }
                        else if(objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectSkill) 
                        {
                            iconName = "glyphicon-flash";
                        }
                        else if(objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectQuest) 
                        {
                            iconName = "glyphicon-king";
                        }
                        else if(objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToWikiPage) 
                        {
                            iconName = "glyphicon-book";
                        }
                        else if(objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectDailyRoutine) 
                        {
                            iconName = "glyphicon-hourglass";
                        }
                        else if(objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectMapMarker) 
                        {
                            iconName = "glyphicon-map-marker";
                        }

                        var htmlContent = "<i class='glyphicon " + iconName + "'></i>&nbsp;" + objectName;
                        this.$box.find('.objectChooseLink').html(htmlContent);
                        this.$box.find('.gn-nodeActionOpenObject').show();
                    },

                    /**
                     * Opens an object 
                     */
                    openObject: function() {
                        let referencedObjects = this.model.get("referencedObjects");
                        if(!referencedObjects || referencedObjects.length == 0) {
                            return;
                        }

                        var referencedObject = referencedObjects[0];
                        var url = "";
                        if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectNpc) 
                        {
                            url = "/Kortisto/Npc?id=" + referencedObject.objectId;
                        }
                        else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectItem) 
                        {
                            url = "/Styr/Item?id=" + referencedObject.objectId;
                        }
                        else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectSkill) 
                        {
                            url = "/Evne/Skill?id=" + referencedObject.objectId;
                        }
                        else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectQuest) 
                        {
                            url = "/Aika/Quest?id=" + referencedObject.objectId;
                        }
                        else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToWikiPage) 
                        {
                            url = "/Kirja?id=" + referencedObject.objectId;
                        }
                        else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectDailyRoutine && referencedObjects.length > 1) 
                        {
                            url = "/Kortisto/Npc?id=" + referencedObjects[1].objectId;
                        }
                        else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectMapMarker && referencedObjects.length > 1) 
                        {
                            url = "/Karta?id=" + referencedObjects[1].objectId + "&zoomOnMarkerId=" + referencedObjects[0].objectId + "&zoomOnMarkerType=" + this.model.get("referencedMarkerType");
                        }

                        if(url) 
                        {
                            window.open(url);
                        }
                    },

                    /**
                     * Returns the display name of a daily routine
                     * @param {object} dailyRoutineEvent Daily routine event to format
                     * @returns {string} Formatted Dialy routine event
                     */
                    getDailyRoutineDisplayName: function(dailyRoutineEvent) {
                        var displayName = GoNorth.DailyRoutines.Util.formatTimeSpan(GoNorth.DefaultNodeShapes.Localization.Reference.TimeFormat, dailyRoutineEvent.earliestTime, dailyRoutineEvent.latestTime);
                        var additionalName = "";
                        if (dailyRoutineEvent.scriptName) 
                        {
                            additionalName = dailyRoutineEvent.scriptName;
                        }
                        else if (dailyRoutineEvent.movementTarget && dailyRoutineEvent.movementTarget.name) 
                        {
                            additionalName = dailyRoutineEvent.movementTarget.name;
                        }
    
                        if (additionalName) {
                            displayName += " (" + additionalName + ")";
                        }
                        return displayName;
                    },

                    /**
                     * Loads the referenced object name
                     * @param referencedObjects Referenced objects
                     * @returns {jQuery.Deferred} Deferred for the loading proccess 
                     */
                    loadReferencedObjectName: function(referencedObjects) {
                        var def = new jQuery.Deferred();

                        var self = this;
                        this.loadObjectShared(referencedObjects).then(function(object) {
                            if(referencedObjects[0].objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectDailyRoutine) 
                            {                                
                                for(var curEvent = 0; curEvent < object.dailyRoutine.length; ++curEvent)
                                {
                                    if(object.dailyRoutine[curEvent].eventId == referencedObjects[0].objectId)
                                    {
                                        var displayName = self.getDailyRoutineDisplayName(object.dailyRoutine[curEvent]);
                                        def.resolve(displayName);
                                        return;
                                    }
                                }
                                def.resolve("<MISSING>");
                            }
                            else if(referencedObjects[0].objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectMapMarker) 
                            {
                                def.resolve(object.markerName + " (" + object.mapName + ")");
                            }
                            else
                            {
                                def.resolve(object.name);
                            }
                        }, function(e) {
                            def.reject(e);
                        })

                        return def.promise();
                    },

                    /**
                     * Shows the loading indicator
                     */
                    showLoading: function() {
                        this.$box.find(".gn-nodeLoading").show();
                    },

                    /**
                     * Hides the loading indicator
                     */
                    hideLoading: function() {
                        this.$box.find(".gn-nodeLoading").hide();
                    },


                    /**
                     * Shows the error indicator
                     */
                    showError: function() {
                        this.$box.find(".gn-nodeError").show();
                    },

                    /**
                     * Hides the error indicator
                     */
                    hideError: function() {
                        this.$box.find(".gn-nodeError").hide();
                    },


                    /**
                     * Returns statistics for the node
                     * @returns Node statistics
                     */
                    getStatistics: function() {
                        return {
                            wordCount: GoNorth.Util.getWordCount(this.model.get('referenceText'))
                        };
                    }
                });
                baseView.prototype = jQuery.extend(baseView.prototype, GoNorth.DefaultNodeShapes.Shapes.SharedObjectLoading.prototype);
                
                /**
                 * Returns the object id
                 * 
                 * @param {object[]} referencedObjects Referenced objects
                 * @returns {string} Object Id
                 */
                baseView.prototype.getObjectId = function(referencedObjects) {
                    var referencedObject = referencedObjects[0];
                    if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectDailyRoutine) 
                    {
                        return referencedObjects[1].objectId;
                    }
                    else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectMapMarker) 
                    {
                        return referencedObjects[1].objectId + "|" + referencedObjects[0].objectId;
                    }

                    return referencedObject.objectId;
                };

                /**
                 * Returns the object resource
                 * 
                 * @param {object[]} referencedObjects Referenced objects
                 * @returns {int} Object Resource
                 */
                baseView.prototype.getObjectResource = function(referencedObjects) {
                    var referencedObject = referencedObjects[0];
                    if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectNpc || referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectDailyRoutine) 
                    {
                        return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceNpc;
                    }
                    else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectItem) 
                    {
                        return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceItem;
                    }
                    else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectSkill) 
                    {
                        return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceSkill;
                    }
                    else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectQuest) 
                    {
                        return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceQuest;
                    }
                    else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToWikiPage) 
                    {
                        return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceWikiPage;
                    }
                    else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectMapMarker) 
                    {
                        return GoNorth.DefaultNodeShapes.Shapes.ObjectResourceMapMarker;
                    }
                };

                /**
                 * Loads a referenced object
                 * @param {string} objectId Id of the object to load
                 * @param {object[]} referencedObjects Referenced objects
                 */
                baseView.prototype.loadObject = function(objectId, referencedObjects) {
                    var url = "";
                    var referencedObject = referencedObjects[0];
                    if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectNpc || referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectDailyRoutine) 
                    {
                        url = "/api/KortistoApi/FlexFieldObject?id=" + objectId;
                    }
                    else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectItem) 
                    {
                        url = "/api/StyrApi/FlexFieldObject?id=" + objectId;
                    }
                    else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectSkill) 
                    {
                        url = "/api/EvneApi/FlexFieldObject?id=" + objectId;
                    }
                    else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectQuest) 
                    {
                        url = "/api/AikaApi/GetQuest?id=" + objectId;
                    }
                    else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToWikiPage) 
                    {
                        url = "/api/KirjaApi/Page?id=" + objectId;
                    }
                    else if(referencedObject.objectType == GoNorth.DefaultNodeShapes.Actions.RelatedToObjectMapMarker) 
                    {
                        url = "/api/KartaApi/GetMarker?mapId=" + referencedObjects[1].objectId + "&markerId=" + referencedObjects[0].objectId;
                    }
                    
                    return GoNorth.HttpClient.get(url);
                };

                return baseView;
            }

            /**
             * Reference Shape
             */
            joint.shapes.default.Reference = createReferenceShape();

            /**
             * Reference View
             */
            joint.shapes.default.ReferenceView = createReferenceView();


            /** 
             * Reference Serializer 
             * 
             * @class
             */
            Shapes.ReferenceSerializer = function()
            {
                GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.apply(this, [ joint.shapes.default.Reference, referenceType, referenceTargetArray ]);
            };

            Shapes.ReferenceSerializer.prototype = jQuery.extend({ }, GoNorth.DefaultNodeShapes.Serialize.BaseNodeSerializer.prototype)

            /**
             * Serializes a node
             * 
             * @param {object} node Node Object
             * @returns {object} Serialized NOde
             */
            Shapes.ReferenceSerializer.prototype.serialize = function(node) {
                var serializedData = {
                    id: node.id,
                    x: node.position.x,
                    y: node.position.y,
                    referencedObjects: node.referencedObjects,
                    referenceText: node.referenceText
                };

                return serializedData;
            };

            /**
             * Deserializes a serialized node
             * 
             * @param {object} node Serialized Node Object
             * @returns {object} Deserialized Node
             */
            Shapes.ReferenceSerializer.prototype.deserialize = function(node) {
                var initOptions = {
                    id: node.id,
                    position: { x: node.x, y: node.y },
                    referencedObjects: node.referencedObjects,
                    referenceText: node.referenceText
                };

                var node = new this.classType(initOptions);
                return node;
            };

            // Register Serializers
            var referenceSerializer = new Shapes.ReferenceSerializer();
            GoNorth.DefaultNodeShapes.Serialize.getNodeSerializerInstance().addNodeSerializer(referenceSerializer);

        }(DefaultNodeShapes.Shapes = DefaultNodeShapes.Shapes || {}));
    }(GoNorth.DefaultNodeShapes = GoNorth.DefaultNodeShapes || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /// Cached npcs
            var npcCache = {};

            /// Promises for loading npcs
            var npcPromises = {};

            /**
             * Loads an npc and caches the npc
             * @param {string} npcId Id of the npc
             * @returns {JQuery.Deferred} jQuery Deferred for the loading process
             */
            Map.loadNpcCached = function(npcId) {
                if(npcCache[npcId]) {
                    var def = new jQuery.Deferred();

                    // setTimeout is required to prevent the content to be overwritten with loading circle again
                    setTimeout(function() {
                        def.resolve(npcCache[npcId]);
                    }, 1);
                    
                    return def.promise();
                }

                if(npcPromises[npcId]) {
                    return npcPromises[npcId].promise();
                }                

                var def = new jQuery.Deferred();
                npcPromises[npcId] = def;

                GoNorth.HttpClient.get("/api/KortistoApi/FlexFieldObject?id=" + npcId).done(function(npc) {
                    npcCache[npcId] = npc;
                    npcPromises[npcId] = null;
                    def.resolve(npc);
                }).fail(function() {
                    npcPromises[npcId] = null;
                    def.reject();
                });

                return def.promise();
            }

            /**
             * Invalidates a cached npc
             * @param {string} npcId Id of the npc
             */
            Map.invalidateCachedNpc = function(npcId) {
                npcCache[npcId] = null;
                npcPromises[npcId] = null;
            }

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /**
             * Leaflet Draw Color Picker
             * @class L.Draw.ColorPicker
             */
            L.Draw.ColorPicker = L.Draw.Feature.extend({
                /// Statics
                statics: {
                    TYPE: 'colorpicker'
                },

                /// Options
                options: {
                    availableGeometryColors: [],
                    viewModel: null
                },

                /**
                 * Initalizes the color picker
                 * 
                 * @param {object} map Map Object
                 * @param {object} options Options Object
                 */
                initialize: function (map, options) {
                    // Save the type so super can fire, need to do this as cannot do this.TYPE :(
                    this.type = L.Draw.ColorPicker.TYPE;

                    L.Draw.Feature.prototype.initialize.call(this, map, options);
                },

                /**
                 * Overwrites the actions
                 */
                overwriteAction: function() {
                    var actions = [];
                    var colorPickerSelf = this;
                    jQuery.each(this.options.availableGeometryColors, function(index, color) {
                        actions.push({
                            title: color.name,
                            text: color.name,
                            callback: function() { this.pickColor(color.color); },
                            context: colorPickerSelf
                        });
                    });
                    return actions;
                },

                /**
                 * Picks a color
                 * 
                 * @param {string} color The picked color
                 */
                pickColor: function(color) {
                    this.options.viewModel.mapGeometryToolbar.options.draw.rectangle.shapeOptions.color = color;
                    this.options.viewModel.mapGeometryToolbar.options.draw.polyline.shapeOptions.color = color;
                    this.options.viewModel.mapGeometryToolbar.options.draw.polygon.shapeOptions.color = color;
                    this.options.viewModel.mapGeometryToolbar.options.draw.circle.shapeOptions.color = color;
                    this.disable();
                }
            });

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /**
             * Adds the colorpicker to the draw toolbar
             */
            Map.addColorpickerToDrawToolbar = function() {
                var originalFunc = L.DrawToolbar.prototype.getActions;
                L.DrawToolbar.prototype.getActions = function(handler) {
                    var allActions = originalFunc.apply(this, arguments);
                    if(handler.overwriteAction)
                    {
                        allActions = handler.overwriteAction();
                    }
                    return allActions;
                };

                L.DrawToolbar.include({
                    getModeHandlers: function (map) {
                        return [
                            {
                                enabled: this.options.polyline,
                                handler: new L.Draw.Polyline(map, this.options.polyline),
                                title: L.drawLocal.draw.toolbar.buttons.polyline
                            },
                            {
                                enabled: this.options.polygon,
                                handler: new L.Draw.Polygon(map, this.options.polygon),
                                title: L.drawLocal.draw.toolbar.buttons.polygon
                            },
                            {
                                enabled: this.options.rectangle,
                                handler: new L.Draw.Rectangle(map, this.options.rectangle),
                                title: L.drawLocal.draw.toolbar.buttons.rectangle
                            },
                            {
                                enabled: this.options.circle,
                                handler: new L.Draw.Circle(map, this.options.circle),
                                title: L.drawLocal.draw.toolbar.buttons.circle
                            },
                            {
                                enabled: this.options.colorPicker,
                                handler: new L.Draw.ColorPicker(map, this.options.colorPicker),
                                title: L.drawLocal.draw.toolbar.buttons.circle
                            }
                        ];
                    }
                });
            };

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            if(typeof ko !== "undefined")
            {
                /// Tile Size
                var TileSize = 256;

                /// Pow of two to reach tile size (2^8 = 256)
                var TileSizePowOfTwo = 8;

                /// Default Zoom Level
                var defaultZoom = 2;
                
                /// Url Latitude
                var urlLat = null;

                /// Url Longitude
                var urlLong = null;

                /// Url Zoom
                var urlZoom = null;

                /**
                 * Reads the url map locations
                 */
                GoNorth.Karta.Map.readUrlMapLocations = function() {
                    urlLat = parseFloat(GoNorth.Util.getParameterFromUrl("mapLat"));
                    urlLong = parseFloat(GoNorth.Util.getParameterFromUrl("mapLong"));
                    urlZoom = parseInt(GoNorth.Util.getParameterFromUrl("mapZoom"));
                }
                GoNorth.Karta.Map.readUrlMapLocations();

                /**
                 * Unwraps an observable
                 * @param {object} obs Observable or value
                 * @returns {object} Value of the observable
                 */
                function unwrapIfObservable(obs) {
                    if(ko.isObservable(obs))
                    {
                        return obs();
                    }

                    return obs;
                }

                /**
                 * Removes dangling events from leaflet that get not correctly removed
                 * @param {object} domElement Dom Element
                 * @param {object} inputObj Input object
                 * @param {boolean} checkPrefix true to check the prefix, else false
                 */
                function removeDanglingEvents(domElement, inputObj, checkPrefix)
                {
                    if(inputObj !== null)
                    {
                        var msPointer = L.Browser.msPointer;
                        var POINTER_DOWN   = msPointer ? 'MSPointerDown'   : 'pointerdown';
                        var POINTER_MOVE   = msPointer ? 'MSPointerMove'   : 'pointermove';
                        var POINTER_UP     = msPointer ? 'MSPointerUp'     : 'pointerup';
                        var POINTER_CANCEL = msPointer ? 'MSPointerCancel' : 'pointercancel';

                        for(var prop in inputObj)
                        {
                            var prefixOk = checkPrefix ? prop.indexOf('_leaflet_') !== -1 : true, propVal; 
                            if(inputObj.hasOwnProperty(prop) && prefixOk)
                            {
                                var evt = []; 
                                if(prop.indexOf('touchstart') !== -1) 
                                {
                                    evt = [ POINTER_DOWN ];
                                }
                                else if(prop.indexOf('touchmove') !== -1)
                                {
                                    evt = [ POINTER_MOVE ];
                                }
                                else if(prop.indexOf('touchend') !== -1)
                                {
                                    evt = [ POINTER_UP, POINTER_CANCEL ];
                                }

                                propVal = inputObj[prop];
                                if(evt.length > 0 && typeof propVal === 'function')
                                {
                                    for(var curEvent = 0; curEvent < evt.length; ++curEvent)
                                    {
                                        domElement.removeEventListener(evt[curEvent], propVal, false);
                                    }                 
                                }

                                inputObj[prop] = null;
                                delete inputObj[prop];
                            }
                        }
                    }        
                };

                /**
                 * Initializes the map
                 * @param {object} element Element
                 * @param {object} valueAccessor Value Accessor
                 * @param {object} allBindings All Bindings
                 * @param {object} bindingContext Binding context
                 */
                function initMap(element, valueAccessor, allBindings, bindingContext) {
                    // Get Values
                    var obs = valueAccessor();
                    var urlTemplate = obs;
                    var maxZoom = allBindings.get("mapMaxZoom");
                    var imageWidth = allBindings.get("mapImageWidth");
                    var imageHeight = allBindings.get("mapImageHeight");
                    if(!urlTemplate || !maxZoom || !imageWidth || !imageHeight)
                    {
                        throw "Missing binding values for map";
                    }

                    urlTemplate = unwrapIfObservable(urlTemplate);
                    maxZoom = unwrapIfObservable(maxZoom);
                    imageWidth = unwrapIfObservable(imageWidth);
                    imageHeight = unwrapIfObservable(imageHeight);

                    // Get Map Size
                    var powOfTwoSize = Math.pow(2, maxZoom + TileSizePowOfTwo);
                    var width = 0;
                    var height = 0;
                    if(imageWidth > imageHeight)
                    {
                        width = powOfTwoSize;
                        height = (imageHeight / imageWidth) * powOfTwoSize;
                    }
                    else
                    {
                        height = powOfTwoSize;
                        width = (imageWidth / imageHeight) * powOfTwoSize;
                    }

                    var maxTileCountX = Math.floor(imageWidth / TileSize);
                    var maxTileCountY = Math.floor(imageHeight / TileSize);

                    // Create map
                    if(!ko.bindingHandlers.map.nextMapId)
                    {
                        ko.bindingHandlers.map.nextMapId = 0;
                    }

                    if(!jQuery(element).attr("id"))
                    {
                        jQuery(element).attr("id", "Map_" + ko.bindingHandlers.map.nextMapId)
                        ++ko.bindingHandlers.map.nextMapId;
                    }

                    // Create Tile Layer
                    var map = L.map(jQuery(element).attr("id"));
                    var northEast = map.unproject([width, 0], maxZoom);
                    var southWest = map.unproject([0, height], maxZoom);
                    var tileBounds = new L.LatLngBounds(southWest, northEast);

                    var originalUrlTemplate = urlTemplate;
                    urlTemplate = urlTemplate.replace("{maxZoom}", maxZoom);
                    urlTemplate = urlTemplate.replace("{maxTileCountX}", maxTileCountX);
                    urlTemplate = urlTemplate.replace("{maxTileCountY}", maxTileCountY);

                    L.tileLayer(urlTemplate, {
                        maxZoom: maxZoom,
                        crs: L.CRS.Simple,
                        noWrap: true,
                        bounds: tileBounds
                    }).addTo(map);

                    // Set Map Bounds to ensure that user only scrolls in image
                    var mapNorthEast = map.unproject([imageWidth, 0], maxZoom);
                    var mapSouthWest = map.unproject([0, imageHeight], maxZoom);
                    var mapTileBounds = new L.LatLngBounds(mapSouthWest, mapNorthEast);
                    map.setMaxBounds(mapTileBounds);

                    var mapCenter = map.unproject([imageWidth * 0.5, imageHeight * 0.5], 0);
                    var mapZoom = defaultZoom;

                    if(urlLat != null && urlLong != null && !isNaN(urlLat) && !isNaN(urlLong))
                    {
                        mapCenter = new L.LatLng(urlLat, urlLong);
                        urlLat = null;
                        urlLong = null;
                    }
                    if(urlZoom != null && !isNaN(urlZoom))
                    {
                        mapZoom = urlZoom;
                        urlZoom = null;
                    }

                    map.setView(mapCenter, Math.min(mapZoom, maxZoom));

                    if(ko.isObservable(obs)) 
                    {
                        obs._map = map;
                        obs._mapTemplateUrl = originalUrlTemplate;
                    }

                    // Event Binding
                    var clickHandler = allBindings.get("mapClick");
                    if(clickHandler)
                    {
                        map.on("click", function(e) {
                            clickHandler.apply(bindingContext.$data, [ map, e.latlng ])
                        });
                    }

                    GoNorth.Karta.Map.refreshUrlMapLocations = function() {
                        var urlParams = "mapLat=" + map.getCenter().lat;
                        urlParams += "&mapLong=" + map.getCenter().lng;
                        urlParams += "&mapZoom=" + map.getZoom();

                        var finalParams = window.location.search;
                        if(finalParams) 
                        {
                            finalParams = finalParams.replace(/mapLat=.*?&mapLong=.*?&mapZoom=.*?(&|$)/i, "");
                            if(finalParams[finalParams.length - 1] != "&")
                            {
                                finalParams += "&";
                            }
                            finalParams += urlParams;
                        }
                        else
                        {
                            finalParams = "?" + urlParams;
                        }

                        window.history.replaceState(finalParams, null, finalParams)
                    };

                    map.on("zoomend moveend", function() {
                        GoNorth.Karta.Map.refreshUrlMapLocations();
                    });

                    var readyHandler = allBindings.get("mapReady");
                    if(readyHandler)
                    {
                        readyHandler.apply(bindingContext.$data, [ map ]);
                    }
                }

                /**
                 * Map Binding Handler
                 */
                ko.bindingHandlers.map = {
                    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                    },
                    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                        var obs = valueAccessor();
                        var urlTemplate = unwrapIfObservable(obs);
                        if(obs._mapTemplateUrl && obs._mapTemplateUrl == urlTemplate)
                        {
                            return;
                        }

                        if(obs._map)
                        {
                            obs._map.remove();
                            // Some events are not removed by leaflet itself, must be done here to prevent errors
                            removeDanglingEvents(element, element._leaflet_events, false);
                            removeDanglingEvents(element, element, true);
                            obs._map = null;
                        }

                        initMap(element, valueAccessor, allBindings, bindingContext);
                    }
                }
            }

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /// Popup max width
            var popupMaxWidth = 600;

            /// Geometry Types
            var geometryTypes = {
                /// Polygon
                polygon: "Polygon",

                /// Circle
                circle: "Circle",

                /// Line String
                lineString: "LineString",

                /// Rectangle
                rectangle: "Rectangle"
            };

            /// Geometry Id Range
            var geometryIdRange = 100;

            /**
             * Base Karta Marker
             * 
             * @class
             */
            Map.BaseMarker = function() 
            {
                this.marker = null;
                this.id = "";
                this.mapId = "";
                this.editGeometryCallback = null;
                this.editCallback = null;
                this.deleteCallback = null;

                this.isDisabled = false;

                this.chapterPixelCoords = [];
                this.addedInChapter = -1;
                this.deletedInChapter = -1;

                this.isTrackingImplementationStatus = false;
                this.isImplemented = false;

                this.disableCopyLink = false;
                this.disableGeometryEditing = false;

                this.markerType = "";

                this.serializePropertyName = "";

                this.compareDialog = null;

                this.popupContentObject = null;

                this.markerGeometry = [];

                this.disableExportNameSetting = false;
                this.editExportNameCallback = null;
                this.exportName = "";
            }

            Map.BaseMarker.prototype = {
                /**
                 * Returns the icon url
                 * 
                 * @return {string} Icon Url
                 */
                getIconUrl: function() {
                    return "";
                },

                /**
                 * Returns the icon retina url
                 * 
                 * @return {string} Icon Retina Url
                 */
                getIconRetinaUrl: function() {
                    return "";
                },

                /**
                 * Returns the additional popup buttons for the marker
                 * @returns {object[]} Additional popup buttons
                 */
                getAdditionalPopupButtons: function() {
                    return [];
                },

                /**
                 * Binds an additional popup button callback
                 * @param {object} jQueryContent jQuery Content
                 * @param {object} additionalButton Additional button
                 */
                bindAdditionalPopupButtonCallback: function(jQueryContent, additionalButton) {
                    var self = this;
                    jQueryContent.find("." + additionalButton.cssClass).click(function() {
                        additionalButton.callback.apply(self);
                    });
                },

                /**
                 * Builds the export name button html
                 */
                buildExportNameButtonHtml: function() {
                    var additionalClasses = "";
                    var additionalTooltip = "";
                    if(this.exportName) {
                        additionalClasses = " gn-kartaMarkerHasExportName";
                        additionalTooltip = Map.Localization.CurrentExportNameTooltip.replace("{0}", this.exportName);
                    }
                    return "<a class='gn-clickable gn-setExportNameButton" + additionalClasses + "' title='" + Map.Localization.SetExportNameTooltip + additionalTooltip + "'><i class='glyphicon glyphicon-log-in'></i></a>";
                },

                /**
                 * Initializes the marker
                 * 
                 * @param {object} latLng Coordinates of the marker
                 */
                initMarker: function(latLng) {
                    var markerIcon = this.buildIcon();
                    this.marker = L.marker(latLng, { draggable: !this.isDisabled, icon: markerIcon });
                    
                    var self = this;
                    this.marker.bindPopup(function() {
                        self.loadContent().done(function(content) {
                            if(!self.isDisabled)
                            {
                                content += "<div class='gn-kartaPopupButtons'>";

                                var additionalButtons = self.getAdditionalPopupButtons();
                                for(var curButton = 0; curButton < additionalButtons.length; ++curButton)
                                {
                                    content += "<a class='gn-clickable " + additionalButtons[curButton].cssClass + "' title='" + additionalButtons[curButton].title + "'><i class='glyphicon " + additionalButtons[curButton].icon + "'></i></a>";
                                }

                                
                                if(!self.disableExportNameSetting)
                                {
                                   content += self.buildExportNameButtonHtml();
                                }

                                if(!self.disableCopyLink) 
                                {
                                    content += "<a class='gn-clickable gn-kartaCopyMarkerLink' title='" + Map.Localization.CopyLinkToMarkerTooltip + "'><i class='glyphicon glyphicon-link'></i></a>";
                                }
                                if(!self.disableGeometryEditing) 
                                {
                                    content += "<a class='gn-clickable gn-kartaEditMarkerGeometryButton' title='" + Map.Localization.EditMarkerGeometryTooltip + "'><i class='glyphicon glyphicon-record'></i></a>";
                                }
                                if(self.editCallback)
                                {
                                    content += "<a class='gn-clickable gn-kartaEditMarkerButton' title='" + Map.Localization.EditMarkerTooltip + "'><i class='glyphicon glyphicon-pencil'></i></a>";
                                }
                                if(self.isTrackingImplementationStatus && Map.hasImplementationStatusTrackerRights)
                                {
                                    var implementedIcon = "glyphicon-remove";
                                    var implementedIconCss = "gn-clickable text-danger";
                                    var implementedTooltip = Map.Localization.MarkerIsNotImplementedTooltip;
                                    if(self.isImplemented)
                                    {
                                        implementedIcon = "glyphicon-ok";
                                        implementedIconCss = "text-success";
                                        implementedTooltip = Map.Localization.MarkerIsImplementedTooltip;
                                    }
                                    content += "<a class='gn-kartaMarkAsImplementedMarkerButton " + implementedIconCss + "' title='" + implementedTooltip + "'><i class='glyphicon " + implementedIcon + "'></i></a>";    
                                }
                                content += "<a class='gn-clickable gn-kartaDeleteMarkerButton' title='" + Map.Localization.DeleteMarkerTooltip + "'><i class='glyphicon glyphicon-trash'></i></a>";
                                content += "</div>";
                            }
                            content = "<div>" + content + "</div>";

                            var jQueryContent = jQuery(content);
                            jQueryContent.find(".gn-setExportNameButton").click(function() {
                                self.callSetExportName();
                            });

                            jQueryContent.find(".gn-kartaCopyMarkerLink").click(function() {
                                self.copyMarkerLink(this);
                            });

                            jQueryContent.find(".gn-kartaEditMarkerGeometryButton").click(function() {
                                self.callEditGeometry();
                            });

                            jQueryContent.find(".gn-kartaEditMarkerButton").click(function() {
                                self.callEdit();
                            });

                            jQueryContent.find(".gn-kartaDeleteMarkerButton").click(function() {
                                self.callDelete();
                            });

                            jQueryContent.find(".gn-kartaMarkAsImplementedMarkerButton").click(function() {
                                self.openCompareDialog(jQueryContent);
                            });

                            if(additionalButtons) {
                                for(var curButton = 0; curButton < additionalButtons.length; ++curButton)
                                {
                                    self.bindAdditionalPopupButtonCallback(jQueryContent, additionalButtons[curButton]);
                                }
                            }
                            
                            self.popupContentObject = jQueryContent;
                            self.setPopupContent(jQueryContent[0]);
                        }).fail(function() {
                            self.setPopupContent("<i class='glyphicon glyphicon-warning-sign text-danger' title='" + Map.Localization.ErrorOccured + "'></i>");
                        });

                        return "<i class='glyphicon glyphicon-refresh spinning'></i>";
                    }, 
                    {
                        maxWidth: popupMaxWidth
                    });
                },

                /**
                 * Builds the marker icon
                 * 
                 * @returns {object} Marker Icon
                 */
                buildIcon: function() {
                    var iconUrl = this.getIconUrl();
                    if((window.devicePixelRatio || (window.screen.deviceXDPI / window.screen.logicalXDPI)) > 1)
                    {
                        iconUrl = this.getIconRetinaUrl();
                    }

                    var iconLabel = this.getIconLabel();
                    if(!iconLabel)
                    {
                        iconLabel = "";
                    }

                    var markerIcon = new L.DivIcon({
                        iconAnchor: [ 12, 41 ],
                        iconSize: [ 25, 41 ],
                        popupAnchor: [ 1, -43 ],
                        shadowSize: [ 41, 41 ],
                        tooltipAnchor: [ 16, -28 ],
                        
                        className: "gn-kartaIcon",
                        html: "<img class='gn-kartaIconShadowImage' src='/img/karta/markerShadow.png'/>"+
                              "<img src='" + iconUrl + "' style='width: 25px; height: 41px;'/>"+
                              "<div class='gn-kartaIconLabel'>" + iconLabel + "</div>"
                    })

                    return markerIcon;
                },

                /**
                 * Returns the icon label
                 * 
                 * @returns {string} Icon Label
                 */
                getIconLabel: function() {
                    return "";
                },

                /**
                 * Sets the content of the popup
                 * 
                 * @param {string} content Content of the poup
                 */
                setPopupContent: function(content) {
                    var popup = this.marker.getPopup();
                    popup.setContent(content);
                    popup.update();
                },
                
                /**
                 * Closes the popup
                 */
                closePopup: function() {
                    if(this.marker)
                    {
                        this.marker.closePopup();
                    }
                },

                /**
                 * Zooms on the marker
                 * 
                 * @param {object} map Map for zooming
                 */
                zoomOn: function(map) {
                    if(!this.marker)
                    {
                        return;
                    }

                    this.marker.openPopup();
                    
                    var latLngs = [ this.marker.getLatLng() ];
                    var markerBounds = L.latLngBounds(latLngs);
                    map.fitBounds(markerBounds);
                },

                /**
                 * Sets the type of the marker
                 * 
                 * @param {string} markerType Marker Type
                 */
                setMarkerType: function(markerType) {
                    this.markerType = markerType;
                },

                /**
                 * Sets the map id to which the marker belongs
                 * 
                 * @param {string} mapId Id of the map to which the marker belongs
                 */
                setMapId: function(mapId) {
                    this.mapId = mapId;
                },

                /**
                 * Sets the compare dialog
                 * 
                 * @param {object} compareDialog Compare Dialog
                 */
                setCompareDialog: function(compareDialog) {
                    this.compareDialog = compareDialog;
                },

                /**
                 * Flags the marker as not implemented
                 */
                flagAsNotImplemented: function() {
                    if(!this.isImplemented)
                    {
                        return;
                    }

                    this.isImplemented = false;

                    if(this.popupContentObject != null)
                    {
                        this.popupContentObject.find(".gn-kartaMarkAsImplementedMarkerButton").removeClass("text-success").addClass("text-danger gn-clickable").prop("title", Map.Localization.MarkerIsNotImplementedTooltip);
                        this.popupContentObject.find(".gn-kartaMarkAsImplementedMarkerButton > i").removeClass("glyphicon-ok").addClass("glyphicon-remove");
                    }
                },

                /**
                 * Opens the compare dialog
                 * 
                 * @param {object} popupContent jQuery Content Object of the marker to switch the button after flagging as implemented
                 */
                openCompareDialog: function(popupContent) {
                    if(this.isImplemented)
                    {
                        return;
                    }

                    var self = this;
                    this.compareDialog.openMarkerCompare(this.mapId, this.id, this.markerType).done(function() {
                        self.isImplemented = true;
                        popupContent.find(".gn-kartaMarkAsImplementedMarkerButton").removeClass("text-danger gn-clickable").addClass("text-success").prop("title", Map.Localization.MarkerIsImplementedTooltip);
                        popupContent.find(".gn-kartaMarkAsImplementedMarkerButton > i").removeClass("glyphicon-remove").addClass("glyphicon-ok");
                    });
                },


                /**
                 * Loads the content
                 * 
                 * @returns {jQuery.Deferred} Deferred
                 */
                loadContent: function() {
                    var def = new jQuery.Deferred();
                    def.resolve("");

                    return def.promise();
                },


                /**
                 * Sets the id id of the marker
                 * 
                 * @param {string} id Id of the marker
                 */
                setId: function(id) {
                    this.id = id;
                },

                /**
                 * Sets the pixel coords of the marker
                 * 
                 * @param {float} x X-Coordinate
                 * @param {float} y Y-Coordinate
                 */
                setPixelCoords: function(x, y) {
                    this.x = x;
                    this.y = y;
                },

                /**
                 * Sets the pixel coords of the marker for a given chapter
                 * 
                 * @param {int} chapterNumber Number of the chapter
                 * @param {float} x X-Coordinate
                 * @param {float} y Y-Coordinate
                 */
                setChapterPixelCoords: function(chapterNumber, x, y) {
                    if(!this.chapterPixelCoords) {
                        this.chapterPixelCoords = [];
                    }
                    
                    for(var curCoords = 0; curCoords < this.chapterPixelCoords.length; ++curCoords)
                    {
                        if(this.chapterPixelCoords[curCoords].chapterNumber == chapterNumber)
                        {
                            this.chapterPixelCoords[curCoords].x = x;
                            this.chapterPixelCoords[curCoords].y = y;
                            return;
                        }
                    }

                    this.chapterPixelCoords.push({
                        chapterNumber: chapterNumber,
                        x: x,
                        y: y
                    });
                    this.chapterPixelCoords.sort(function(p1, p2) {
                        return p1.chapterNumber - p2.chapterNumber
                    });
                },

                /**
                 * Adjusts the position of the marker to a chapter
                 * 
                 * @param {int} chapterNumber Number of the chapter to adjust to
                 * @param {object} map Map object for calculating lat long
                 */
                adjustPositionToChapter: function(chapterNumber, map) {
                    if(!this.marker || !this.chapterPixelCoords || this.chapterPixelCoords.length == 0)
                    {
                        return;
                    }
                    
                    var x = this.x;
                    var y = this.y;
                    
                    for(var curCoords = 0; curCoords < this.chapterPixelCoords.length; ++curCoords)
                    {
                        if(this.chapterPixelCoords[curCoords].chapterNumber <= chapterNumber)
                        {
                            x = this.chapterPixelCoords[curCoords].x;
                            y = this.chapterPixelCoords[curCoords].y;
                        }
                    }

                    // Adjust position
                    var latLng = map.unproject([ x, y ], map.getMaxZoom());
                    this.marker.setLatLng(latLng);
                },

                /**
                 * Sets the chapter in which the marker was added for non default chapter
                 * 
                 * @param {int} chapterNumber Number of the chapter in which the marker was added
                 */
                setAddedInChapter: function(chapterNumber) {
                    this.addedInChapter = chapterNumber;
                },
                
                /**
                 * Sets the chapter in which the marker was added for non default chapter
                 * 
                 * @returns Number of the chapter in which the marker was added
                 */
                getAddedInChapter: function(chapterNumber) {
                    return this.addedInChapter;
                },

                /**
                 * Sets the chapter in which the marker was deleted for non default chapter
                 * 
                 * @param {int} chapterNumber Number of the chapter in which the marker was deleted
                 */
                setDeletedInChapter: function(chapterNumber) {
                    this.deletedInChapter = chapterNumber;
                },
                
                /**
                 * Sets the chapter in which the marker was deleted for non default chapter
                 * 
                 * @returns Number of the chapter in which the marker was deleted
                 */
                getDeletedInChapter: function(chapterNumber) {
                    return this.deletedInChapter;
                },

                /**
                 * Checks if a marker is valid for a chapter (either because deleted or because not yet added)
                 *
                 * @param {int} chapterNumber Number of the chapter to check
                 */
                isValidForChapter: function(chapterNumber) {
                    if(this.addedInChapter >= 0)
                    {
                        if(chapterNumber < this.addedInChapter)
                        {
                            return false;
                        }
                    }

                    if(this.deletedInChapter >= 0)
                    {
                        if(chapterNumber >= this.deletedInChapter)
                        {
                            return false;
                        }
                    }

                    return true;
                },


                /**
                 * Sets a callback function on the drag end of the marker
                 * 
                 * @param {function} callback Callback Function
                 */
                setOnDragEnd: function(callback) {
                    this.marker.on('dragend', function() {
                        callback();
                    });
                },


                /**
                 * Copys a link to the marker
                 * 
                 * @param {object} markerLinkElement Marker Link Element
                 */
                copyMarkerLink: function(markerLinkElement) {
                    var link = window.location.protocol + "//" + window.location.hostname;
                    if(window.location.port)
                    {
                        link += ":" + window.location.port;
                    }
                    link += "/Karta?id=" + encodeURIComponent(this.mapId) + "&zoomOnMarkerId=" + encodeURIComponent(this.id) + "&zoomOnMarkerType=" + this.markerType;

                    jQuery("#gn-kartaMarkerLinkContainer").remove();
                    jQuery("body").append("<div id='gn-kartaMarkerLinkContainer' style='opacity: 0'><input id='gn-kartaMarkerLink'/></div>");
                    jQuery("#gn-kartaMarkerLink").val(link);

                    var exportResultField = jQuery("#gn-kartaMarkerLink")[0];
                    exportResultField.select();
                    document.execCommand("copy");

                    jQuery("#gn-kartaMarkerLinkContainer").remove();

                    jQuery("#gn-copyToClipboardToolTipContainer").remove();
                    var buttonContainer = jQuery(markerLinkElement).parent();
                    buttonContainer.append("<div id='gn-kartaCopyToLinkSuccessTooltip' class='gn-copyToClipboardToolTipContainer' style='width: 400px;position: absolute;right: 0px;bottom: 37px'><span class='gn-copyToClipboardToolTipText' style='bottom: 140%'>" + Map.Localization.SuccessfullyCopiedToClipboard + "</span></div>");
                    var rightPosition = -(jQuery("#gn-kartaCopyToLinkSuccessTooltip").width() - jQuery(".gn-copyToClipboardToolTipText").outerWidth() / 2) + (buttonContainer.width() - jQuery(markerLinkElement).position().left + 34);
                    jQuery("#gn-kartaCopyToLinkSuccessTooltip").css("right", rightPosition + "px");
                    setTimeout(function() {
                        buttonContainer.find("#gn-kartaCopyToLinkSuccessTooltip").remove();
                    }, 1000);
                },

                /**
                 * Calls the edit geometry callback
                 */
                callEditGeometry: function() {
                    if(this.editGeometryCallback)
                    {
                        this.editGeometryCallback();
                    }
                },

                /**
                 * Sets the edit geometry callback
                 */
                setEditGeometryCallback: function(callback) {
                    this.editGeometryCallback = callback;
                },

                /**
                 * Calls the edit callback
                 */
                callEdit: function() {
                    if(this.editCallback)
                    {
                        this.editCallback();
                    }
                },

                /**
                 * Sets the edit callback
                 */
                setEditCallback: function(callback) {
                    this.editCallback = callback;
                },


                /**
                 * Calls the delete callback
                 */
                callDelete: function() {
                    if(this.deleteCallback)
                    {
                        this.deleteCallback();
                    }
                },

                /**
                 * Sets the delete callback
                 */
                setDeleteCallback: function(callback) {
                    this.deleteCallback = callback;
                },


                /**
                 * Calls the set export name callback
                 */
                callSetExportName: function() {
                    if(this.editExportNameCallback)
                    {
                        this.editExportNameCallback();
                    }
                },

                /**
                 * Sets the export name callback
                 */
                setEditExportNameCallback: function(callback) {
                    this.editExportNameCallback = callback;
                },

                /**
                 * Sets the export name
                 * @param {string} exportName Export name
                 */
                setExportName: function(exportName) {
                    this.exportName = exportName;
                    if(this.popupContentObject) {
                        var self = this;
                        this.popupContentObject.find(".gn-setExportNameButton").replaceWith(this.buildExportNameButtonHtml());
                        this.popupContentObject.find(".gn-setExportNameButton").click(function() {
                            self.callSetExportName();
                        });
                    }
                },


                /**
                 * Adds the marker to an object
                 * 
                 * @param {object} map Map object
                 */
                addTo: function(map) {
                    this.marker.addTo(map);

                    if(this.markerGeometry)
                    {
                        for(var curGeo = 0; curGeo < this.markerGeometry.length; ++curGeo)
                        {
                            this.markerGeometry[curGeo].addTo(map);
                        }
                    }
                },

                /**
                 * Removes the marker from an object
                 * 
                 * @param {object} map Map object
                 */
                removeFrom: function(map) {
                    this.marker.removeFrom(map);
                    for(var curGeo = 0; curGeo < this.markerGeometry.length; ++curGeo)
                    {
                        this.markerGeometry[curGeo].removeFrom(map);
                    }
                },


                /**
                 * Checks if the marker is equal to a marker on the map
                 * 
                 * @param {object} marker Marker on the map
                 */
                isMarker: function(marker) {
                    return this.marker != null && this.marker == marker;
                },


                /**
                 * Returns the lat/long position of the marker
                 * 
                 * @returns {object} Lat/long position
                 */
                getLatLng: function() {
                    return this.marker.getLatLng();
                },


                /**
                 * Disables the marker
                 */
                disable: function() {
                    if(this.marker)
                    {
                        if(this.marker.dragging)
                        {
                            this.marker.dragging.disable();
                        }
                        if(this.marker.getPopup() && this.marker.getPopup().getElement())
                        {
                            jQuery(this.marker.getPopup().getElement()).find(".gn-kartaPopupButtons").remove();
                        }
                    }
                    this.isDisabled = true;
                },


                /**
                 * Adds geometry to the marker
                 * 
                 * @param {object} geometry Geometry to add to the marker
                 */
                addGeometry: function(geometry) {
                    this.markerGeometry.push(geometry);
                },

                /**
                 * Moves the geometry marker
                 * 
                 * @param {object} latLngOffset Lat/Lng Offset
                 */
                moveGeometry: function(latLngOffset) {
                    for(var curGeo = 0; curGeo < this.markerGeometry.length; ++curGeo)
                    {
                        if(this.markerGeometry[curGeo] instanceof L.Rectangle)
                        {
                            var latLngs = this.offsetLatLngsCollection(latLngOffset, this.markerGeometry[curGeo].getLatLngs());
                            this.markerGeometry[curGeo].setLatLngs(latLngs);
                        }
                        else if(this.markerGeometry[curGeo] instanceof L.Circle)
                        {
                            var center = this.markerGeometry[curGeo].getLatLng();
                            center.lat += latLngOffset.lat;
                            center.lng += latLngOffset.lng;
                            this.markerGeometry[curGeo].setLatLng(center);
                        }
                        else if(this.markerGeometry[curGeo] instanceof L.Polygon)
                        {
                            var latLngs = this.offsetLatLngsCollection(latLngOffset, this.markerGeometry[curGeo].getLatLngs());
                            this.markerGeometry[curGeo].setLatLngs(latLngs);
                        }
                        else if(this.markerGeometry[curGeo] instanceof L.Polyline)
                        {
                            var latLngs = this.offsetLatLngs(latLngOffset, this.markerGeometry[curGeo].getLatLngs());
                            this.markerGeometry[curGeo].setLatLngs(latLngs);
                        }

                        if(this.markerGeometry[curGeo].editing && this.markerGeometry[curGeo].editing.enabled())
                        {
                            this.markerGeometry[curGeo].editing.updateMarkers();
                        }
                    }
                },

                /**
                 * Offsets an array of arrays of lat/lngs
                 * 
                 * @param {object} latLngOffset Lat/Lng Offset
                 * @param {object} latLngs Array of lat/lngs
                 * @returns {object[][]} Offset lat/lng coordinates
                 */
                offsetLatLngsCollection: function(latLngOffset, latLngs) {
                    for(var curCoord = 0; curCoord < latLngs.length; ++curCoord)
                    {
                        latLngs[curCoord] = this.offsetLatLngs(latLngOffset, latLngs[curCoord]);
                    }

                    return latLngs;
                },

                /**
                 * Offsets an array of lat/lngs
                 * 
                 * @param {object} latLngOffset Lat/Lng Offset
                 * @param {object} latLngs Array of lat/lngs
                 * @returns {object[]} Offset lat/lng coordinates
                 */
                offsetLatLngs: function(latLngOffset, latLngs) {
                    for(var curCoord = 0; curCoord < latLngs.length; ++curCoord)
                    {
                        latLngs[curCoord].lat += latLngOffset.lat;
                        latLngs[curCoord].lng += latLngOffset.lng;
                    }

                    return latLngs;
                },

                /**
                 * Removes a geometry from the marker
                 * 
                 * @param {object} geometry Geometry to remove from the marker
                 * @param {object} map Map object
                 */
                removeGeometry: function(geometry, map) {
                    for(var curGeo = 0; curGeo < this.markerGeometry.length; ++curGeo)
                    {
                        if(this.markerGeometry[curGeo] == geometry)
                        {
                            this.markerGeometry[curGeo].removeFrom(map);
                            this.markerGeometry.splice(curGeo, 1);
                            return;
                        }
                    }
                },

                /**
                 * Enables the geometry edit mode
                 * 
                 * @param {boolean} allowEdit true wenn bearbeiten erlaubt ist, sonst false
                 * @param {function} editCallback Callback Function that gets called on edit
                 * @param {function} clickCallback Callback Function that gets called on click
                 */
                setGeometryEditMode: function(allowEdit, editCallback, clickCallback) {
                    jQuery.each(this.markerGeometry, function(index, marker) {
                        if(marker.editing)
                        {
                            if(!marker.options.editing)
                            {
                                marker.options.editing = {};
                            }
                            
                            if(allowEdit)
                            {
                                marker.editing.enable();
                                marker.on("edit", editCallback);
                                marker.on("click", function() { clickCallback(marker); });
                                jQuery(marker.getElement()).addClass("gn-kartaGeometryEditable");
                            }
                            else
                            {
                                marker.editing.disable();
                                marker.off("edit");
                                marker.off("click");
                                jQuery(marker.getElement()).removeClass("gn-kartaGeometryEditable");
                            }
                        }
                    });
                },


                /**
                 * Serializes the base data
                 * 
                 * @param {object} map Map object
                 * @returns {object} Serialized Base Data
                 */
                serializeBaseData: function(map) {
                    var serializedData = {
                        id: this.id,
                        x: this.x,
                        y: this.y,
                        addedInChapter: this.addedInChapter,
                        chapterPixelCoords: this.chapterPixelCoords,
                        deletedInChapter: this.deletedInChapter,
                        isImplemented: this.isImplemented,                      
                        geometry: this.serializeGeometry(map),
                        exportName: this.exportName
                    };

                    return serializedData;
                },

                /**
                 * Sets the base data from a serialized data
                 * 
                 * @param {object} serializedData Serialized data
                 * @param {object} map Map object
                 */
                setBaseDataFromSerialized: function(serializedData, map) {
                    this.id = serializedData.id;
                    this.x = serializedData.x;
                    this.y = serializedData.y;
                    this.addedInChapter = serializedData.addedInChapter ? serializedData.addedInChapter : -1;
                    this.chapterPixelCoords = serializedData.chapterPixelCoords;
                    this.deletedInChapter = serializedData.deletedInChapter ? serializedData.deletedInChapter : -1;
                    this.isImplemented = serializedData.isImplemented;
                    this.deserializeGeometry(serializedData.geometry, map);
                    this.exportName = serializedData.exportName ? serializedData.exportName : "";
                },

                /**
                 * Serializes the geometry
                 * 
                 * @param {object} map Map object
                 */
                serializeGeometry: function(map) {
                    var serializedMarkers = [];

                    if(!this.markerGeometry)
                    {
                        return serializedMarkers;
                    }

                    for(var curGeo = 0; curGeo < this.markerGeometry.length; ++curGeo)
                    {
                        var geoType = this.markerGeometry[curGeo].toGeoJSON().geometry.type;
                        var latLngs = null;
                        var radius = null;
                        if(this.markerGeometry[curGeo] instanceof L.Rectangle)
                        {
                            var bounds = this.markerGeometry[curGeo].getBounds();
                            latLngs = [ bounds.getNorthEast(), bounds.getSouthWest() ];
                            geoType = "Rectangle";
                        }
                        else if(this.markerGeometry[curGeo] instanceof L.Circle)
                        {
                            var center = this.markerGeometry[curGeo].getLatLng();
                            radius = this.markerGeometry[curGeo].getRadius();
                            latLngs = [ center ];
                            geoType = "Circle";
                        }
                        else if(geoType == "Polygon")
                        {
                            latLngs = this.markerGeometry[curGeo].getLatLngs()[0];
                        }
                        else
                        {
                            latLngs = this.markerGeometry[curGeo].getLatLngs();
                        }
                        var serializedCoordinates = this.projectGeometryPositions(curGeo * geometryIdRange, latLngs, map);

                        if(radius != null)
                        {
                            var radiusPos = {
                                id: serializedCoordinates[0].id + 1,
                                x: serializedCoordinates[0].x + radius,
                                y: serializedCoordinates[0].y
                            };
                            serializedCoordinates.push(radiusPos);
                        }

                        var serializedData = {
                            id: this.markerGeometry[curGeo].id,
                            geoType: geoType,
                            positions: serializedCoordinates,
                            color: this.markerGeometry[curGeo].options.color
                        };
                        serializedMarkers.push(serializedData);
                    }

                    return serializedMarkers;
                },

                /**
                 * Projects the geometry positions
                 * @param {number} startId Start Id
                 * @param {object[]} positions Positions
                 * @param {object} map Map object
                 * @returns {object[]} projectedPositions
                 */
                projectGeometryPositions: function(startId, positions, map)
                {
                    var positionId = startId;
                    var serializedCoordinates = [];
                    for(var curCoord = 0; curCoord < positions.length; ++curCoord)
                    {
                        var pixelPos = map.project(positions[curCoord], map.getMaxZoom());
                        pixelPos.id = positionId;
                        serializedCoordinates.push(pixelPos);
                        ++positionId;
                    }

                    return serializedCoordinates;
                },

                /**
                 * Deserializes the geometry data
                 * 
                 * @param {object[]} geometry Serialized geometry
                 * @param {object} map Map object
                 */
                deserializeGeometry: function(geometry, map) {
                    this.markerGeometry = [];
                    if(!geometry)
                    {
                        return;
                    }

                    for(var curGeo = 0; curGeo < geometry.length; ++curGeo)
                    {
                        var geoLayer = null;
                        if(geometry[curGeo].geoType == geometryTypes.polygon)
                        {
                            geoLayer = new L.Polygon(this.unprojectGeometryPositions(geometry[curGeo].positions, map));
                        }
                        else if(geometry[curGeo].geoType == geometryTypes.circle)
                        {
                            var radius = geometry[curGeo].positions[1].x - geometry[curGeo].positions[0].x;
                            geoLayer = new L.Circle(this.unprojectGeometryPositions([ geometry[curGeo].positions[0] ], map)[0], { radius: radius });
                        }
                        else if(geometry[curGeo].geoType == geometryTypes.lineString)
                        {
                            geoLayer = new L.Polyline(this.unprojectGeometryPositions(geometry[curGeo].positions, map));
                        }
                        else if(geometry[curGeo].geoType == geometryTypes.rectangle)
                        {
                            geoLayer = new L.Rectangle(this.unprojectGeometryPositions(geometry[curGeo].positions, map));
                        }

                        if(geoLayer)
                        {
                            geoLayer.id = geometry[curGeo].id;
                            geoLayer.setStyle({ fillColor: geometry[curGeo].color, color: geometry[curGeo].color, cursor: 'default' });
                            this.markerGeometry.push(geoLayer);
                        }
                    }
                },

                /**
                 * Unprojects the geometry positions
                 * @param {object[]} positions Positions
                 * @param {object} map Map object
                 */
                unprojectGeometryPositions: function(positions, map)
                {
                    var unprojectedPositions = [];
                    for(var curPos = 0; curPos < positions.length; ++curPos)
                    {
                        var pos = map.unproject([ positions[curPos].x, positions[curPos].y ], map.getMaxZoom());
                        unprojectedPositions.push(pos);
                    }
                    return unprojectedPositions;
                }
            };

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /**
             * Kirja Marker
             * 
             * @param {object} pageId Id of the kirja page
             * @param {string} pageName Name of the page
             * @param {object} latLng Coordinates of the marker
             * @class
             */
            Map.KirjaMarker = function(pageId, pageName, latLng) 
            {
                Map.BaseMarker.apply(this);

                this.pageId = pageId;
                this.pageName = pageName;

                this.isTrackingImplementationStatus = false;

                this.serializePropertyName = "KirjaMarker";

                this.initMarker(latLng);
            }

            Map.KirjaMarker.prototype = jQuery.extend({ }, Map.BaseMarker.prototype)

            /**
             * Returns the icon url
             * 
             * @return {string} Icon Url
             */
            Map.KirjaMarker.prototype.getIconUrl = function() {
                return "/img/karta/kirjaMarker.png";
            }

            /**
             * Returns the icon retina url
             * 
             * @return {string} Icon Retina Url
             */
            Map.KirjaMarker.prototype.getIconRetinaUrl = function() {
                return "/img/karta/kirjaMarker_2x.png";
            }

            /**
             * Returns the icon label
             * 
             * @returns {string} Icon Label
             */
            Map.KirjaMarker.prototype.getIconLabel = function() {
                return this.pageName;
            }

            /**
             * Loads the content
             * 
             * @returns {jQuery.Deferred} Deferred
             */
            Map.KirjaMarker.prototype.loadContent = function() {
                var def = new jQuery.Deferred();

                var self = this;
                GoNorth.HttpClient.get("/api/KirjaApi/Page?id=" + this.pageId).done(function(pageContent) {
                    var pageHtml = "<h4><a href='/Kirja?id=" + self.pageId + "' target='_blank'>" + pageContent.name + "</a></h4>";
                    pageHtml += "<div class='gn-kartaPopupContent'>" + pageContent.content + "</div>";

                    def.resolve(pageHtml);
                }).fail(function() {
                    def.reject();
                })

                return def.promise();
            }

            /**
             * Serializes the marker
             * 
             * @param {object} map Map
             * @returns {object} Serialized data
             */
            Map.KirjaMarker.prototype.serialize = function(map) {
                var serializedObject = this.serializeBaseData(map);
                serializedObject.pageId = this.pageId;
                serializedObject.pageName = this.pageName;
                return serializedObject;
            }

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /**
             * Kortisto Marker
             * 
             * @param {object} npcId Id of the Npc
             * @param {string} npcName Name of the npc
             * @param {object} latLng Coordinates of the marker
             * @class
             */
            Map.KortistoMarker = function(npcId, npcName, latLng) 
            {
                Map.BaseMarker.apply(this);
                
                this.npcId = npcId;
                this.npcName = npcName;

                this.disableExportNameSetting = true;

                this.isTrackingImplementationStatus = true;

                this.serializePropertyName = "NpcMarker";

                this.initMarker(latLng);
            }

            Map.KortistoMarker.prototype = jQuery.extend({ }, Map.BaseMarker.prototype)

            /**
             * Returns the icon url
             * 
             * @return {string} Icon Url
             */
            Map.KortistoMarker.prototype.getIconUrl = function() {
                return "/img/karta/kortistoMarker.png";
            }

            /**
             * Returns the icon retina url
             * 
             * @return {string} Icon Retina Url
             */
            Map.KortistoMarker.prototype.getIconRetinaUrl = function() {
                return "/img/karta/kortistoMarker_2x.png";
            }

            /**
             * Returns the icon label
             * 
             * @returns {string} Icon Label
             */
            Map.KortistoMarker.prototype.getIconLabel = function() {
                return this.npcName;
            }

            /**
             * Returns the additional popup buttons for the marker
             * @returns {object[]} Additional popup buttons
             */
            Map.KortistoMarker.prototype.getAdditionalPopupButtons = function() {
                return [{
                    cssClass: "gn-kartaManageDailyRoutine",
                    icon: "glyphicon glyphicon-hourglass",
                    title: Map.Localization.KortistoEditDailyRoutineTooltip,
                    callback: this.editDailyRoutine
                }];
            }

            /**
             * Loads the content
             * 
             * @returns {jQuery.Deferred} Deferred
             */
            Map.KortistoMarker.prototype.loadContent = function() {
                var def = new jQuery.Deferred();

                var self = this;
                Map.loadNpcCached(this.npcId).done(function(npc) {
                    var npcHtml = "<h4><a href='/Kortisto/Npc?id=" + self.npcId + "' target='_blank'>" + npc.name + "</a></h4>";
                    if(npc.imageFile)
                    {
                        npcHtml += "<div class='gn-kartaPopupImageContainer'><img class='gn-kartaPopupImage' src='/api/KortistoApi/FlexFieldObjectImage?imageFile=" + encodeURIComponent(npc.imageFile) + "'/></div>";
                    }

                    def.resolve(npcHtml);
                }).fail(function() {
                    def.reject();
                })

                return def.promise();
            }

            /**
             * Serializes the marker
             * 
             * @param {object} map Map
             * @returns {object} Serialized data
             */
            Map.KortistoMarker.prototype.serialize = function(map) {
                var serializedObject = this.serializeBaseData(map);
                serializedObject.npcId = this.npcId;
                serializedObject.npcName = this.npcName;
                return serializedObject;
            }


            /**
             * Edits the daily routines of the npc
             */
            Map.KortistoMarker.prototype.editDailyRoutine = function() {
                Map.editDailyRoutineOfMarker(this);
            }

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /**
             * Karta Marker
             * 
             * @param {object} mapId Id of the karta map
             * @param {string} mapName Name of the karta map
             * @param {object} latLng Coordinates of the marker
             * @class
             */
            Map.KartaMarker = function(mapId, mapName, latLng) 
            {
                Map.BaseMarker.apply(this);

                this.mapChangeId = mapId;
                this.mapName = mapName;

                this.isTrackingImplementationStatus = true;

                this.serializePropertyName = "MapChangeMarker";

                this.initMarker(latLng);
            }

            Map.KartaMarker.prototype = jQuery.extend({ }, Map.BaseMarker.prototype);

            /**
             * Returns the icon url
             * 
             * @return {string} Icon Url
             */
            Map.KartaMarker.prototype.getIconUrl = function() {
                return "/img/karta/kartaMarker.png";
            }

            /**
             * Returns the icon retina url
             * 
             * @return {string} Icon Retina Url
             */
            Map.KartaMarker.prototype.getIconRetinaUrl = function() {
                return "/img/karta/kartaMarker_2x.png";
            }

            /**
             * Returns the icon label
             * 
             * @returns {string} Icon Label
             */
            Map.KartaMarker.prototype.getIconLabel = function() {
                return this.mapName;
            }

            /**
             * Loads the content
             * 
             * @returns {jQuery.Deferred} Deferred
             */
            Map.KartaMarker.prototype.loadContent = function() {
                var def = new jQuery.Deferred();

                var self = this;
                GoNorth.HttpClient.get("/api/KartaApi/Map?id=" + this.mapChangeId).done(function(map) {
                    var mapHtml = "<h4><a class='gn-clickable' onclick='GoNorth.Karta.Map.switchToMap(\"" + self.mapChangeId + "\")'>" + map.name + "</a></h4>";

                    def.resolve(mapHtml);
                }).fail(function() {
                    def.reject();
                })

                return def.promise();
            }

            /**
             * Serializes the marker
             * 
             * @param {object} map Map
             * @returns {object} Serialized data
             */
            Map.KartaMarker.prototype.serialize = function(map) {
                var serializedObject = this.serializeBaseData(map);
                serializedObject.mapId = this.mapChangeId;
                serializedObject.mapName = this.mapName;
                return serializedObject;
            }

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /**
             * Styr Marker
             * 
             * @param {object} itemId Id of the Item
             * @param {string} itemName Name of the item
             * @param {object} latLng Coordinates of the marker
             * @class
             */
            Map.StyrMarker = function(itemId, itemName, latLng) 
            {
                Map.BaseMarker.apply(this);
                
                this.itemId = itemId;
                this.itemName = itemName;

                this.isTrackingImplementationStatus = true;

                this.serializePropertyName = "ItemMarker";

                this.initMarker(latLng);
            }

            Map.StyrMarker.prototype = jQuery.extend({ }, Map.BaseMarker.prototype)

            /**
             * Returns the icon url
             * 
             * @return {string} Icon Url
             */
            Map.StyrMarker.prototype.getIconUrl = function() {
                return "/img/karta/styrMarker.png";
            }

            /**
             * Returns the icon retina url
             * 
             * @return {string} Icon Retina Url
             */
            Map.StyrMarker.prototype.getIconRetinaUrl = function() {
                return "/img/karta/styrMarker_2x.png";
            }

            /**
             * Returns the icon label
             * 
             * @returns {string} Icon Label
             */
            Map.StyrMarker.prototype.getIconLabel = function() {
                return this.itemName;
            }

            /**
             * Loads the content
             * 
             * @returns {jQuery.Deferred} Deferred
             */
            Map.StyrMarker.prototype.loadContent = function() {
                var def = new jQuery.Deferred();

                var self = this;
                GoNorth.HttpClient.get("/api/StyrApi/FlexFieldObject?id=" + this.itemId).done(function(item) {
                    var itemHtml = "<h4><a href='/Styr/Item?id=" + self.itemId + "' target='_blank'>" + item.name + "</a></h4>";
                    if(item.imageFile)
                    {
                        itemHtml += "<div class='gn-kartaPopupImageContainer'><img class='gn-kartaPopupImage' src='/api/StyrApi/FlexFieldObjectImage?imageFile=" + encodeURIComponent(item.imageFile) + "'/></div>";
                    }

                    def.resolve(itemHtml);
                }).fail(function() {
                    def.reject();
                })

                return def.promise();
            }

            /**
             * Serializes the marker
             * 
             * @param {object} map Map
             * @returns {object} Serialized data
             */
            Map.StyrMarker.prototype.serialize = function(map) {
                var serializedObject = this.serializeBaseData(map);
                serializedObject.itemId = this.itemId;
                serializedObject.itemName = this.itemName;
                return serializedObject;
            }

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /**
             * Aika Marker
             * 
             * @param {object} questId Id of the Quest
             * @param {string} name Name of the marker
             * @param {object} latLng Coordinates of the marker
             * @class
             */
            Map.AikaMarker = function(questId, name, latLng) 
            {
                Map.BaseMarker.apply(this);
                
                this.questId = questId;
                this.name = name;

                this.isTrackingImplementationStatus = true;

                this.serializePropertyName = "QuestMarker";

                this.initMarker(latLng);
            }

            Map.AikaMarker.prototype = jQuery.extend({ }, Map.BaseMarker.prototype)

            /**
             * Returns the icon url
             * 
             * @return {string} Icon Url
             */
            Map.AikaMarker.prototype.getIconUrl = function() {
                return "/img/karta/aikaMarker.png";
            }

            /**
             * Returns the icon retina url
             * 
             * @return {string} Icon Retina Url
             */
            Map.AikaMarker.prototype.getIconRetinaUrl = function() {
                return "/img/karta/aikaMarker_2x.png";
            }

            /**
             * Returns the icon label
             * 
             * @returns {string} Icon Label
             */
            Map.AikaMarker.prototype.getIconLabel = function() {
                return this.name;
            }

            /**
             * Loads the content
             * 
             * @returns {jQuery.Deferred} Deferred
             */
            Map.AikaMarker.prototype.loadContent = function() {
                var def = new jQuery.Deferred();

                var self = this;
                GoNorth.HttpClient.get("/api/AikaApi/GetQuest?id=" + this.questId).done(function(quest) {
                    var questHtml = "<h4><a href='/Aika/Quest?id=" + self.questId + "' target='_blank'>" + quest.name + "</a></h4>";
                    questHtml += "<div class='gn-kartaPopupContent'>" + jQuery("<div></div>").text(self.name).html() + "</div>";

                    def.resolve(questHtml);
                }).fail(function() {
                    def.reject();
                })

                return def.promise();
            }

            /**
             * Serializes the marker
             * 
             * @returns {object} Serialized data
             */
            Map.AikaMarker.prototype.serialize = function() {
                var serializedObject = this.serializeBaseData();
                serializedObject.questId = this.questId;
                serializedObject.name = this.name;
                return serializedObject;
            }

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /**
             * Note Marker
             * 
             * @param {string} name Name of the marker
             * @param {string} description Description of the marker
             * @param {string} color Color of the marker
             * @param {object} latLng Coordinates of the marker
             * @class
             */
            Map.NoteMarker = function(name, description, color, latLng) 
            {
                Map.BaseMarker.apply(this);
                
                this.name = name;
                this.description = description;
                this.color = color;

                this.isTrackingImplementationStatus = true;

                this.serializePropertyName = "NoteMarker";

                this.initMarker(latLng);
            }

            Map.NoteMarker.prototype = jQuery.extend({ }, Map.BaseMarker.prototype)

            /**
             * Returns the icon url
             * 
             * @return {string} Icon Url
             */
            Map.NoteMarker.prototype.getIconUrl = function() {
                let url = "/api/KartaApi/GetNoteMapImage";
                if(this.color) {
                    url += "?color=" + encodeURIComponent(this.color);
                }
                return url;
            }

            /**
             * Returns the icon retina url
             * 
             * @return {string} Icon Retina Url
             */
            Map.NoteMarker.prototype.getIconRetinaUrl = function() {
                return this.getIconUrl();
            }

            /**
             * Returns the icon label
             * 
             * @returns {string} Icon Label
             */
            Map.NoteMarker.prototype.getIconLabel = function() {
                return this.name;
            }

            /**
             * Loads the content
             * 
             * @returns {jQuery.Deferred} Deferred
             */
            Map.NoteMarker.prototype.loadContent = function() {
                var def = new jQuery.Deferred();
        
                // setTimeout is required to prevent the content to be overwritten with loading circle again
                var self = this;
                setTimeout(function() {
                    var noteHtml = "<h4 class='gn-kartaNoteMarkerTitle'>" + jQuery("<div></div>").text(self.name).html() + "</h4>";
                    noteHtml +=  "<div class='gn-kartaPopupContent'>" + jQuery("<div></div>").text(self.description).html() + "</div>";
                    def.resolve(noteHtml);
                }, 1);
                
                return def.promise();
            }

            /**
             * Serializes the marker
             * 
             * @param {object} map Map
             * @returns {object} Serialized data
             */
            Map.NoteMarker.prototype.serialize = function(map) {
                var serializedObject = this.serializeBaseData(map);
                serializedObject.name = this.name;
                serializedObject.description = this.description;
                serializedObject.color = this.color;
                return serializedObject;
            }

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /// Selection Mode None
            var selectionModeNone = 0;

            /// Selection Mode Default
            var selectionModeDefault = 1;

            /**
             * Marker Manager
             * 
             * @param {object} viewModel Viewmodel to which the manager belongs
             * @class
             */
            Map.MarkerManager = function(viewModel) 
            {
                this.viewModel = viewModel;

                this.markerSelectionMode = selectionModeNone;

                this.preSelectType = null;
                this.markerType = null;

                this.isExpanded = new ko.observable(false);
                this.isLoading = new ko.observable(false);
                this.errorOccured = new ko.observable(false);

                this.loadedEntries = new ko.observableArray();
                this.searchTerm = new ko.observable("");
                this.currentPage = new ko.observable(0);
                this.hasMore = new ko.observable(false);

                this.additionalButtons = new ko.observableArray();

                this.markerChildShowId = new ko.observable("");

                this.hideSearchBar = false;
                this.hidePaging = false;

                this.markers = [];
                this.unparsedMarkers = [];

                this.markerLayer = null;
                this.markerMap = null;
                this.isLayerVisible = new ko.observable(true);
                var self = this;
                this.isLayerVisible.subscribe(function() {
                    self.syncLayerVisibility();
                });
            }

            Map.MarkerManager.prototype = {
                /**
                 * Creates a layer for a map
                 * 
                 * @param {object} map Map to which the layer should be added
                 */
                createLayerForMap: function(map) {
                    this.markerMap = map;
                    this.markerLayer = L.layerGroup();
                    if(this.isLayerVisible())
                    {
                        this.markerLayer.addTo(map);
                    }
                },

                /**
                 * Sets the layer visibility based on the observable value
                 */
                syncLayerVisibility: function() {
                    if(!this.markerLayer || !this.markerMap)
                    {
                        return;
                    }

                    if(this.isLayerVisible())
                    {
                        this.markerLayer.addTo(this.markerMap);
                    }
                    else
                    {
                        this.markerLayer.removeFrom(this.markerMap);
                        if(!this.isNotSelected())
                        {
                            this.viewModel.resetMarkerObjectData();
                        }
                    }
                },

                /**
                 * Checks the pre selection
                 * 
                 * @param {string} preSelectType Type of the pre select (Quest, ...)
                 * @param {string} preSelectId Id of the pre selection
                 * @returns {jQuery.Deferred} Deferred for the loading process
                 */
                checkPreSelection: function(preSelectType, preSelectId)
                {
                    var def = new jQuery.Deferred();
                    if(!this.preSelectType || this.preSelectType != preSelectType)
                    {
                        def.reject();
                        return def.promise();
                    }

                    this.isExpanded(true);

                    this.isLoading(true);
                    this.errorOccured(false);
                    var self = this;
                    this.loadPreSelectionObject(preSelectType, preSelectId).done(function(entry) {
                        self.searchTerm(entry.name);
                        self.loadedEntries([ entry ]);
                        self.hasMore(false);
                        self.isLoading(false);

                        if(!self.isNotSelected())
                        {
                            self.viewModel.resetMarkerObjectData();
                        }
                        self.selectEntry(entry);
                        def.resolve();
                    }).fail(function() {
                        self.errorOccured(true);
                        self.isLoading(false);
                        def.reject();
                    });
                    
                    return def.promise();
                },

                /**
                 * Loads the pre selection object
                 * 
                 * @param {string} preSelectType Type of the pre select (Quest, ...)
                 * @param {string} preSelectId Id of the pre selection object
                 * @returns {jQuery.Deferred} Deferred for the loading process
                 */
                loadPreSelectionObject: function(preSelectType, preSelectId)
                {
                    var def = new jQuery.Deferred();
                    def.reject("Not implemented");
                    return def.promise();
                },

                /**
                 * Checks if the marker manager must zoom on a marker
                 * 
                 * @param {string} zoomOnMarkerType Type of the marker to zoom on (Npc, Item, Quest, ...)
                 * @param {string} zoomOnMarkerId Id of the marker to zoom on
                 */
                checkZoomOnMarker: function(zoomOnMarkerType, zoomOnMarkerId) {
                    if(!this.markerType || this.markerType != zoomOnMarkerType)
                    {
                        return;
                    }

                    for(var curMarker = 0; curMarker < this.markers.length; ++curMarker)
                    {
                        if(this.markers[curMarker].id == zoomOnMarkerId)
                        {
                            var self = this;
                            this.checkZoomOnMarkerPreSelectionRequirements(this.markers[curMarker]).done(function() {
                                self.viewModel.switchChapterByNumber(self.markers[curMarker].getAddedInChapter());
                                self.markers[curMarker].zoomOn(self.markerMap);
                            });
                            return;
                        }
                    }
                },

                /**
                 * Checks if marker has pre selection requirements for zooming on (like selecting a quest for a marker)
                 * 
                 * @param {object} marker Marker which will be zoomed on
                 * @returns {jQuery.Deferred} Deferred for loading process
                 */
                checkZoomOnMarkerPreSelectionRequirements: function(marker) {
                    var def = new jQuery.Deferred();
                    def.resolve();
                    return def.promise();
                },
                
                /**
                 * Toogles the visibility
                 */
                toogleVisibility: function() {
                    this.isExpanded(!this.isExpanded());

                    if(this.loadedEntries().length === 0)
                    {
                        this.currentPage(0);
                        this.loadEntries();
                    }
                },

                /**
                 * Starts a new search
                 */
                startNewSearch: function() {
                    this.currentPage(0);
                    this.loadEntries();
                },

                /**
                 * Loads the previous search page
                 */
                prevPage: function() {
                    this.currentPage(this.currentPage() - 1);

                    this.loadEntries();
                },

                /**
                 * Loads the next search page
                 */
                nextPage: function() {
                    this.currentPage(this.currentPage() + 1);

                    this.loadEntries();
                },

                /**
                 * Loads the entries
                 */
                loadEntries: function() {
                    this.onEntrySelected(null);

                    this.isLoading(true);
                    this.errorOccured(false);
                    var self = this;
                    this.sendEntriesRequest().done(function(data) {
                        self.loadedEntries(data.entries);
                        self.hasMore(data.hasMore);
                        self.isLoading(false);

                        if(!self.isNotSelected())
                        {
                            self.viewModel.resetMarkerObjectData();
                        }
                    }).fail(function() {
                        self.errorOccured(true);
                        self.isLoading(false);
                    });
                },

                /**
                 * Finds an entry bd id
                 * 
                 * @param {string} id Id to search
                 * @returns {object} Entry with matching id
                 */
                findEntryById: function(id) {
                    var entries = this.loadedEntries();
                    for(var curEntry = 0; curEntry < entries.length; ++curEntry)
                    {
                        if(entries[curEntry].id == id)
                        {
                            return entries[curEntry];
                        }
                    }

                    return null;
                },

                /**
                 * Resets the selection data
                 */
                resetSelectionData: function() {
                    this.markerSelectionMode = selectionModeNone;
                },

                /**
                 * Gets called whenever an entry is selected
                 * 
                 * @param {object} entry Entry that was selected
                 */
                onEntrySelected: function(entry)
                {

                },

                /**
                 * Deselects the current entry
                 */
                deselectCurrentEntry: function() {
                    this.onEntrySelected(null);
                    this.resetSelectionData();
                    this.viewModel.setCurrentObjectId(null, null);
                },

                /**
                 * Selects an entry
                 * 
                 * @param {object} entry Entry to select
                 */
                selectEntry: function(entry) {
                    if(this.viewModel.isReadonly())
                    {
                        return;
                    }

                    if(this.viewModel.selectedMarkerObjectId() == entry.id)
                    {
                        this.deselectCurrentEntry();
                        return;
                    }

                    this.onEntrySelected(entry);

                    this.viewModel.setCurrentObjectId(entry.id, this);
                    this.markerSelectionMode = selectionModeDefault;

                    if(!this.isLayerVisible())
                    {
                        this.isLayerVisible(true);
                    }
                },

                /**
                 * Returns true if the manager is not selected, else false
                 * 
                 * @returns {bool} true if the manager is not selected, else false
                 */
                isNotSelected: function() {
                    return this.markerSelectionMode == selectionModeNone;
                },

                /**
                 * Returns true if the default mode is selected, else false
                 * 
                 * @returns {bool} true if the default mode is selected, else false
                 */
                isDefaultSelected: function() {
                    return this.markerSelectionMode == selectionModeDefault;
                },


                /**
                 * Resets the markers
                 */
                resetMarkers: function() {
                    this.markers = [];
                    this.unparsedMarkers = [];
                },

                /**
                 * Saves unparsed markers to parse later after map was loaded
                 */
                setUnparsedMarkers: function(unparsedMarkers) {
                    this.unparsedMarkers = unparsedMarkers;
                },

                /**
                 * Parses unparsed markers
                 * 
                 * @param {object} map Map for parsing
                 */
                parseUnparsedMarkers: function(map) {
                    this.parseMarkers(this.unparsedMarkers, map);
                },

                /**
                 * Returns the lat lng coordinates from a serialized marker
                 * 
                 * @param {object} serializedMarker Serialized Marker
                 * @param {object} map Map for unprojecting
                 */
                getLatLngFromSerializedMarker: function(serializedMarker, map) {
                    return map.unproject([ serializedMarker.x, serializedMarker.y ], map.getMaxZoom());
                },

                /**
                 * Parses markers
                 * 
                 * @param {object[]} markers to parse
                 * @param {object} map Map for parsing
                 */
                parseMarkers: function(markers, map) {
                    if(!markers)
                    {
                        markers = [];
                    }

                    this.markers = [];
                    for(var curMarker = 0; curMarker < markers.length; ++curMarker)
                    {
                        var latLng = this.getLatLngFromSerializedMarker(markers[curMarker], map);

                        var marker = this.parseMarker(markers[curMarker], latLng);
                        this.viewModel.setMarkerDragCallback(marker);
                        marker.setBaseDataFromSerialized(markers[curMarker], map);

                        this.pushMarker(marker);
                    }
                },

                /**
                 * Removes a marker
                 * 
                 * @param {object} marker Marker to remove
                 */
                removeMarker: function(marker) {
                    for(var curMarker = 0; curMarker < this.markers.length; ++curMarker)
                    {
                        if(this.markers[curMarker] == marker)
                        {
                            this.markers.splice(curMarker, 1);
                            
                            if(this.markerLayer)
                            {
                                marker.removeFrom(this.markerLayer);
                            }

                            return;
                        }
                    }
                },

                /**
                 * Adjustes the markers to a chapter
                 * 
                 * @param {int} chapterNumber Number of the chapter
                 * @param {object} map Map object for calculating lat long
                 */
                adjustMarkersToChapter: function(chapterNumber, map) {
                    for(var curMarker = 0; curMarker < this.markers.length; ++curMarker)
                    {
                        this.markers[curMarker].adjustPositionToChapter(chapterNumber, map);

                        if(!this.canPushMarkerToMap(this.markers[curMarker]))
                        {
                            continue;
                        }

                        if(this.markers[curMarker].isValidForChapter(chapterNumber))
                        {
                            this.markers[curMarker].addTo(this.markerLayer);
                        }
                        else
                        {
                            this.markers[curMarker].removeFrom(this.markerLayer);
                        }
                    }
                },


                /**
                 * Sets a markers edit geometry callback function
                 * 
                 * @param {object} marker Marker to set the edit geometry callback for
                 */
                setEditGeometryCallback: function(marker) {
                    var self = this;
                    marker.setEditGeometryCallback(function() {
                        self.viewModel.enterGeometryEditMode(marker, self);
                    });
                },

                /**
                 * Sets a markers edit callback function
                 * 
                 * @param {object} marker Marker to set the edit callback for
                 */
                setEditCallback: function(marker) {
                },

                /**
                 * Sets a markers drag callback function
                 * 
                 * @param {object} marker Marker to set the delete callback for
                 */
                setDeleteCallback: function(marker) {
                    var self = this;
                    marker.setDeleteCallback(function() {
                        self.viewModel.openDeleteDialog(marker, self);
                    });
                },

                /**
                 * Sets a markers edit export name callback function
                 * 
                 * @param {object} marker Marker to set the edit export name callback for
                 */
                setEditExportNameCallback: function(marker) {
                    var self = this;
                    marker.setEditExportNameCallback(function() {
                        self.viewModel.openEditExportNameDialog(marker);
                    });
                },

                /**
                 * Checks if a new marker can be pushed to be the map
                 * 
                 * @param {marker} Marker Marker to push
                 * @returns {bool} true if marker can be pushed, else false
                 */
                canPushMarkerToMap: function(marker) {
                    return true;
                },

                /**
                 * Pushes a new marker
                 * 
                 * @param {marker} marker Marker to push
                 */
                pushMarker: function(marker) {
                    this.setEditGeometryCallback(marker);
                    this.setEditCallback(marker);
                    this.setDeleteCallback(marker);
                    this.setEditExportNameCallback(marker);
                    marker.setMapId(this.viewModel.id());
                    marker.setMarkerType(this.markerType);
                    marker.setCompareDialog(this.viewModel.compareDialog);
                    this.markers.push(marker);

                    var currentChapter = this.viewModel.getSelectedChapterNumber();

                    if((currentChapter == -1 || marker.isValidForChapter(currentChapter)) && this.canPushMarkerToMap(marker))
                    {
                        marker.addTo(this.markerLayer);
                    }
                },


                /**
                 * Adds geometry to the layer
                 * 
                 * @param {object} geometry Geometry to push to the layer
                 */
                addGeometryToLayer: function(geometry)
                {
                    if(!this.markerLayer)
                    {
                        return;
                    }

                    this.markerLayer.addLayer(geometry);
                },


                /**
                 * Disables the markers
                 */
                disable: function() {
                    for(var curMarker = 0; curMarker < this.markers.length; ++curMarker)
                    {
                        this.markers[curMarker].disable();
                    }
                },

                
                /**
                 * Sends the entries request
                 * 
                 * @returns {jQuery.Deferred} Deferred for the async call
                 */
                sendEntriesRequest: function() {
                    var def = new jQuery.Deferred();
                    def.reject();

                    return def.promise();
                },

                /**
                 * Creates a new marker
                 * 
                 * @param {string} objectId Object Id
                 * @param {object} latLng Lat/Long Position
                 */
                createMarker: function(objectId, latLng) {

                },

                /**
                 * Parses a marker
                 * 
                 * @param {object} unparsedMarker Unparsed marker
                 * @param {object} latLng Lat/Long Position
                 */
                parseMarker: function(unparsedMarker, latLng) {
                    return {};
                }
            };

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /// Kirja Page Size
            var kirjaPageSize = 20;
            
            /// New Kirja Page Button Id
            var newKirjaPageButtonId = "NewKirjaPage";

            /// New Kirja Selection Mode
            var newKirjaPageSelectionMode = 2;

            /**
             * Kirja Marker Manager
             * 
             * @param {object} viewModel Viewmodel to which the manager belongs
             * @class
             */
            Map.KirjaMarkerManager = function(viewModel) 
            {
                Map.MarkerManager.apply(this, [ viewModel ]);

                this.title = GoNorth.Karta.Map.Localization.KirjaMarkerTitle;
                
                this.markerType = "KirjaPage";

                this.additionalButtons.push({
                    buttonId: newKirjaPageButtonId,
                    title: GoNorth.Karta.Map.Localization.KirjaMarkerNewPage,
                    callback: this.createNewKirjaMarker
                });
            }

            Map.KirjaMarkerManager.prototype = jQuery.extend({ }, Map.MarkerManager.prototype)

            /**
             * Sends the entries request
             * 
             * @returns {jQuery.Deferred} Deferred for the async call
             */
            Map.KirjaMarkerManager.prototype.sendEntriesRequest = function() {
                var def = new jQuery.Deferred();
                GoNorth.HttpClient.get("/api/KirjaApi/SearchPages?searchPattern=" + this.searchTerm() + "&start=" + (this.currentPage() * kirjaPageSize) + "&pageSize=" + kirjaPageSize).done(function(data) {
                    def.resolve({
                        entries: data.pages,
                        hasMore: data.hasMore
                    });
                }).fail(function() {
                    def.reject();
                })

                return def.promise();
            };

            /**
             * Creates a new marker
             * 
             * @param {string} objectId Object Id
             * @param {object} latLng Lat/Long Position
             */
            Map.KirjaMarkerManager.prototype.createMarker = function(objectId, latLng) {
                var def = new jQuery.Deferred();
                
                if(this.isDefaultSelected())
                {
                    this.createMarkerFromExistingPage(def, objectId, latLng);
                }
                else if(this.markerSelectionMode == newKirjaPageSelectionMode)
                {
                    this.createMarkerFromNewPage(def, latLng);
                }
                else
                {
                    def.reject();
                }

                return def.promise();
            };

            /**
             * Creates a new marker from an existing page
             * 
             * @param {jQuery.Deferred} def Deferred for the creation process
             * @param {string} pageId Page Id
             * @param {object} latLng Lat/Long Position
             */
            Map.KirjaMarkerManager.prototype.createMarkerFromExistingPage = function(def, pageId, latLng) {
                var pageName = "";
                var page = this.findEntryById(pageId);
                if(page) 
                {
                    pageName = page.name;
                }

                var marker = new Map.KirjaMarker(pageId, pageName, latLng);
                this.pushMarker(marker);
                def.resolve(marker);
            };

            /**
             * Creates a new marker from a new page
             * 
             * @param {jQuery.Deferred} def Deferred for the creation process
             * @param {object} latLng Lat/Long Position
             */
            Map.KirjaMarkerManager.prototype.createMarkerFromNewPage = function(def, latLng) {
                this.viewModel.showWaitOnPageDialog(true);

                var self = this;
                var newPage = window.open("/Kirja?newPage=1");
                newPage.onbeforeunload = function() {
                    self.viewModel.showWaitOnPageDialog(false);
                };
                newPage.newKirjaPageSaved = function(id, name) {
                    var marker = new Map.KirjaMarker(id, name, latLng);
                    self.pushMarker(marker);

                    self.viewModel.showWaitOnPageDialog(false);

                    def.resolve(marker);
                };
            };

            /**
             * Creates a new kirja page for a marker
             */
            Map.KirjaMarkerManager.prototype.createNewKirjaMarker = function() {
                if(this.markerSelectionMode == newKirjaPageSelectionMode)
                {
                    this.deselectCurrentEntry();
                    return;
                }

                this.viewModel.setCurrentObjectId(newKirjaPageButtonId, this);
                this.markerSelectionMode = newKirjaPageSelectionMode;
            };

            /**
             * Parses a marker
             * 
             * @param {object} unparsedMarker Unparsed marker
             * @param {object} latLng Lat/Long Position
             */
            Map.KirjaMarkerManager.prototype.parseMarker = function(unparsedMarker, latLng) {
                return new Map.KirjaMarker(unparsedMarker.pageId, unparsedMarker.pageName, latLng);
            };

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /// Kortisto Page Size
            var kortistoPageSize = 20;

            /**
             * Kortisto Marker Manager
             * 
             * @param {object} viewModel Viewmodel to which the manager belongs
             * @class
             */
            Map.KortistoMarkerManager = function(viewModel) 
            {
                Map.MarkerManager.apply(this, [ viewModel ]);

                this.title = GoNorth.Karta.Map.Localization.KortistoMarkerTitle;

                this.markerType = "Npc";
            }

            Map.KortistoMarkerManager.prototype = jQuery.extend({ }, Map.MarkerManager.prototype)

            /**
             * Sends the entries request
             * 
             * @returns {jQuery.Deferred} Deferred for the async call
             */
            Map.KortistoMarkerManager.prototype.sendEntriesRequest = function() {
                var def = new jQuery.Deferred();
                GoNorth.HttpClient.get("/api/KortistoApi/SearchFlexFieldObjects?searchPattern=" + this.searchTerm() + "&start=" + (this.currentPage() * kortistoPageSize) + "&pageSize=" + kortistoPageSize).done(function(data) {
                    def.resolve({
                        entries: data.flexFieldObjects,
                        hasMore: data.hasMore
                    });
                }).fail(function() {
                    def.reject();
                })

                return def.promise();
            };

            /**
             * Creates a new marker
             * 
             * @param {string} objectId Object Id
             * @param {object} latLng Lat/Long Position
             */
            Map.KortistoMarkerManager.prototype.createMarker = function(objectId, latLng) {
                var def = new jQuery.Deferred();
                var npcName = "";
                var npc = this.findEntryById(objectId);
                if(npc) 
                {
                    npcName = npc.name;
                }
                
                var marker = new Map.KortistoMarker(objectId, npcName, latLng);
                this.pushMarker(marker);
                def.resolve(marker);

                return def.promise();
            };

            /**
             * Parses a marker
             * 
             * @param {object} unparsedMarker Unparsed marker
             * @param {object} latLng Lat/Long Position
             */
            Map.KortistoMarkerManager.prototype.parseMarker = function(unparsedMarker, latLng) {
                return new Map.KortistoMarker(unparsedMarker.npcId, unparsedMarker.npcName, latLng);
            };

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /// Styr Page Size
            var styrPageSize = 20;

            /**
             * Styr Marker Manager
             * 
             * @param {object} viewModel Viewmodel to which the manager belongs
             * @class
             */
            Map.StyrMarkerManager = function(viewModel) 
            {
                Map.MarkerManager.apply(this, [ viewModel ]);

                this.title = GoNorth.Karta.Map.Localization.StyrMarkerTitle;

                this.markerType = "Item";
            }

            Map.StyrMarkerManager.prototype = jQuery.extend({ }, Map.MarkerManager.prototype)

            /**
             * Sends the entries request
             * 
             * @returns {jQuery.Deferred} Deferred for the async call
             */
            Map.StyrMarkerManager.prototype.sendEntriesRequest = function() {
                var def = new jQuery.Deferred();
                GoNorth.HttpClient.get("/api/StyrApi/SearchFlexFieldObjects?searchPattern=" + this.searchTerm() + "&start=" + (this.currentPage() * styrPageSize) + "&pageSize=" + styrPageSize).done(function(data) {
                    def.resolve({
                        entries: data.flexFieldObjects,
                        hasMore: data.hasMore
                    });
                }).fail(function() {
                    def.reject();
                })

                return def.promise();
            };

            /**
             * Creates a new marker
             * 
             * @param {string} objectId Object Id
             * @param {object} latLng Lat/Long Position
             */
            Map.StyrMarkerManager.prototype.createMarker = function(objectId, latLng) {
                var def = new jQuery.Deferred();
                var itemName = "";
                var item = this.findEntryById(objectId);
                if(item) 
                {
                    itemName = item.name;
                }

                var marker = new Map.StyrMarker(objectId, itemName, latLng);
                this.pushMarker(marker);
                def.resolve(marker);

                return def.promise();
            };

            /**
             * Parses a marker
             * 
             * @param {object} unparsedMarker Unparsed marker
             * @param {object} latLng Lat/Long Position
             */
            Map.StyrMarkerManager.prototype.parseMarker = function(unparsedMarker, latLng) {
                return new Map.StyrMarker(unparsedMarker.itemId, unparsedMarker.itemName, latLng);
            };

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /// Aika Page Size
            var aikaPageSize = 20;

            /**
             * Aika Marker Manager
             * 
             * @param {object} viewModel Viewmodel to which the manager belongs
             * @class
             */
            Map.AikaMarkerManager = function(viewModel) 
            {
                Map.MarkerManager.apply(this, [ viewModel ]);

                this.title = GoNorth.Karta.Map.Localization.AikaMarkerTitle;

                this.preSelectType = "Quest";
                this.markerType = "Quest";
            }

            Map.AikaMarkerManager.prototype = jQuery.extend({ }, Map.MarkerManager.prototype)

            /**
             * Sends the entries request
             * 
             * @returns {jQuery.Deferred} Deferred for the async call
             */
            Map.AikaMarkerManager.prototype.sendEntriesRequest = function() {
                var def = new jQuery.Deferred();
                GoNorth.HttpClient.get("/api/AikaApi/GetQuests?searchPattern=" + this.searchTerm() + "&start=" + (this.currentPage() * aikaPageSize) + "&pageSize=" + aikaPageSize).done(function(data) {
                    def.resolve({
                        entries: data.quests,
                        hasMore: data.hasMore
                    });
                }).fail(function() {
                    def.reject();
                })

                return def.promise();
            };

            /**
             * Loads the pre selection object
             * 
             * @param {string} preSelectType Type of the pre select (Quest, ...)
             * @param {string} preSelectId Id of the pre selection object
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Map.AikaMarkerManager.prototype.loadPreSelectionObject = function(preSelectType, preSelectId) {
                var def = new jQuery.Deferred();
                
                GoNorth.HttpClient.get("/api/AikaApi/GetQuest?id=" + preSelectId).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Checks if marker has pre selection requirements for zooming on (like selecting a quest for a marker)
             * 
             * @param {object} marker Marker which will be zoomed on
             * @returns {jQuery.Deferred} Deferred for loading process
             */
            Map.AikaMarkerManager.prototype.checkZoomOnMarkerPreSelectionRequirements = function(marker) {
                return this.checkPreSelection(this.preSelectType, marker.questId);
            };

            /**
             * Gets called whenever an entry is selected
             * 
             * @param {object} entry Entry that was selected
             */
            Map.AikaMarkerManager.prototype.onEntrySelected = function(entry)
            {
                if(entry && (this.viewModel.selectedMarkerObjectId() != entry.id || this.markerChildShowId() != entry.id))
                {
                    this.markerChildShowId(entry.id);
                }
                else
                {
                    this.markerChildShowId("");
                }

                this.syncVisibleMarkers();
            };

            /**
             * Checks if a new marker can be pushed to be the map
             * 
             * @param {marker} Marker Marker to push
             * @returns {bool} true if marker can be pushed, else false
             */
            Map.AikaMarkerManager.prototype.syncVisibleMarkers = function() {
                if(!this.markerLayer)
                {
                    return;
                }

                var currentChapter = this.viewModel.getSelectedChapterNumber();

                for(var curMarker = 0; curMarker < this.markers.length; ++curMarker)
                {
                    if(this.markers[curMarker].questId != this.markerChildShowId())
                    {
                        this.markers[curMarker].removeFrom(this.markerLayer);
                    }
                    else
                    {
                        if(this.markers[curMarker].isValidForChapter(currentChapter))
                        {
                            this.markers[curMarker].addTo(this.markerLayer);
                        }
                    }
                }
            };

            /**
             * Checks if a new marker can be pushed to be the map
             * 
             * @param {marker} Marker Marker to push
             * @returns {bool} true if marker can be pushed, else false
             */
            Map.AikaMarkerManager.prototype.canPushMarkerToMap = function(marker) {
                return marker.questId == this.markerChildShowId();
            };

            /**
             * Creates a new marker
             * 
             * @param {string} objectId Object Id
             * @param {object} latLng Lat/Long Position
             */
            Map.AikaMarkerManager.prototype.createMarker = function(objectId, latLng) {
                var def = new jQuery.Deferred();
                
                var self = this;
                this.viewModel.openMarkerNameDialog().then(function(name) {
                    self.markerChildShowId(objectId);
                    self.syncVisibleMarkers();

                    var marker = new Map.AikaMarker(objectId, name, latLng);
                    self.pushMarker(marker);
                    def.resolve(marker);
                });

                return def.promise();
            };

            /**
             * Sets a markers edit callback function
             * 
             * @param {object} marker Marker to set the edit callback for
             */
            Map.AikaMarkerManager.prototype.setEditCallback = function(marker) {
                var self = this;
                marker.setEditCallback(function() {
                    self.viewModel.openMarkerNameDialog(marker.name).then(function(name) {
                        if(marker.name == name)
                        {
                            return;
                        }

                        marker.name = name;

                        // Update popup
                        if(marker.marker.getPopup())
                        {
                            jQuery(marker.marker.getPopup().getElement()).find(".gn-kartaPopupContent").text(name)
                        }

                        if(marker.marker.getElement())
                        {
                            jQuery(marker.marker.getElement()).find(".gn-kartaIconLabel").text(name);
                        }

                        self.viewModel.saveMarker(marker);
                    });
                });
            };

            /**
             * Parses a marker
             * 
             * @param {object} unparsedMarker Unparsed marker
             * @param {object} latLng Lat/Long Position
             */
            Map.AikaMarkerManager.prototype.parseMarker = function(unparsedMarker, latLng) {
                return new Map.AikaMarker(unparsedMarker.questId, unparsedMarker.name, latLng);
            };

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /**
             * Karta Marker Manager
             * 
             * @param {object} viewModel Viewmodel to which the manager belongs
             * @class
             */
            Map.KartaMarkerManager = function(viewModel) 
            {
                Map.MarkerManager.apply(this, [ viewModel ]);

                this.title = GoNorth.Karta.Map.Localization.KartaMarkerTitle;

                this.markerType = "MapChange";

                this.hideSearchBar = true;
                this.hidePaging = true;

                this.allMaps = [];

                var self = this;
                this.viewModel.id.subscribe(function() {
                    self.loadedEntries(self.getFilteredMaps());
                    if(!self.isNotSelected())
                    {
                        self.viewModel.resetMarkerObjectData();
                    }
                });
            }

            Map.KartaMarkerManager.prototype = jQuery.extend({ }, Map.MarkerManager.prototype)

            /**
             * Sends the entries request
             * 
             * @returns {jQuery.Deferred} Deferred for the async call
             */
            Map.KartaMarkerManager.prototype.sendEntriesRequest = function() {
                var def = new jQuery.Deferred();
                if(this.allMaps.length > 0)
                {
                    def.resolve({
                        entries: this.getFilteredMaps(),
                        hasMore: false
                    });
                    return def.promise();
                }

                var self = this;
                GoNorth.HttpClient.get("/api/KartaApi/Maps").done(function(data) {
                    self.allMaps = data;
                    def.resolve({
                        entries: self.getFilteredMaps(),
                        hasMore: false
                    });
                }).fail(function() {
                    def.reject();
                })

                return def.promise();
            };

            /**
             * Returns all the maps except the one which is currently opened
             * 
             * @returns {object[]} Filtered maps
             */
            Map.KartaMarkerManager.prototype.getFilteredMaps = function() {
                var maps = [];
                for(var curMap = 0; curMap < this.allMaps.length; ++curMap)
                {
                    if(this.allMaps[curMap].id != this.viewModel.id())
                    {
                        maps.push(this.allMaps[curMap]);
                    }
                }
                return maps;
            };

            /**
             * Creates a new marker
             * 
             * @param {string} objectId Object Id
             * @param {object} latLng Lat/Long Position
             */
            Map.KartaMarkerManager.prototype.createMarker = function(objectId, latLng) {
                var def = new jQuery.Deferred();
                var mapName = "";
                var map = this.findEntryById(objectId);
                if(map) 
                {
                    mapName = map.name;
                }

                var marker = new Map.KartaMarker(objectId, mapName, latLng);
                this.pushMarker(marker);
                def.resolve(marker);

                return def.promise();
            };

            /**
             * Parses a marker
             * 
             * @param {object} unparsedMarker Unparsed marker
             * @param {object} latLng Lat/Long Position
             */
            Map.KartaMarkerManager.prototype.parseMarker = function(unparsedMarker, latLng) {
                return new Map.KartaMarker(unparsedMarker.mapId, unparsedMarker.mapName, latLng);
            };

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /// New Note Button Id
            var newNoteButtonId = "NewNote";

            /**
             * Note Marker Manager
             * 
             * @param {object} viewModel Viewmodel to which the manager belongs
             * @class
             */
            Map.NoteMarkerManager = function(viewModel) 
            {
                Map.MarkerManager.apply(this, [ viewModel ]);

                this.title = GoNorth.Karta.Map.Localization.NoteMarkerTitle;

                this.markerType = "Note";

                this.hideSearchBar = true;
                this.hidePaging = true;

                this.additionalButtons.push({
                    buttonId: newNoteButtonId,
                    title: GoNorth.Karta.Map.Localization.NoteMarkerNewNote,
                    callback: this.createNewNoteMarker
                });
            }

            Map.NoteMarkerManager.prototype = jQuery.extend({ }, Map.MarkerManager.prototype)

            /**
             * Sends the entries request
             * 
             * @returns {jQuery.Deferred} Deferred for the async call
             */
            Map.NoteMarkerManager.prototype.sendEntriesRequest = function() {
                var def = new jQuery.Deferred();
                def.resolve({
                    entries: [],
                    hasMore: false
                });

                return def.promise();
            };

            /**
             * Sets the create mode for creating a new note marker
             */
            Map.NoteMarkerManager.prototype.createNewNoteMarker = function() {
                if(this.viewModel.selectedMarkerObjectId() == newNoteButtonId)
                {
                    this.deselectCurrentEntry();
                    return;
                }

                this.viewModel.setCurrentObjectId(newNoteButtonId, this);
            };

            /**
             * Creates a new marker
             * 
             * @param {string} objectId Object Id
             * @param {object} latLng Lat/Long Position
             */
            Map.NoteMarkerManager.prototype.createMarker = function(objectId, latLng) {
                var def = new jQuery.Deferred();
                
                var self = this;
                this.viewModel.openMarkerNameDialog("", true, "", true).then(function(name, description, color) {
                    var marker = new Map.NoteMarker(name, description, color, latLng);
                    self.pushMarker(marker);
                    def.resolve(marker);
                });

                return def.promise();
            };

            /**
             * Sets a markers edit callback function
             * 
             * @param {object} marker Marker to set the edit callback for
             */
            Map.NoteMarkerManager.prototype.setEditCallback = function(marker) {
                var self = this;
                marker.setEditCallback(function() {
                    self.viewModel.openMarkerNameDialog(marker.name, true, marker.description, true, marker.color).then(function(name, description, color) {
                        if(marker.name == name && marker.description == description && marker.color == color)
                        {
                            return;
                        }

                        marker.name = name;
                        marker.description = description;
                        marker.color = color;

                        // Update popup
                        if(marker.marker.getPopup())
                        {
                            jQuery(marker.marker.getPopup().getElement()).find(".gn-kartaNoteMarkerTitle").text(name);
                            jQuery(marker.marker.getPopup().getElement()).find(".gn-kartaPopupContent").text(description);
                        }

                        if(marker.marker.getElement())
                        {
                            jQuery(marker.marker.getElement()).find(".gn-kartaIconLabel").text(name);
                            jQuery(marker.marker.getElement()).find("img:not('.gn-kartaIconShadowImage')").attr("src", marker.getIconUrl())
                        }

                        self.viewModel.saveMarker(marker);
                    });
                });
            };

            /**
             * Parses a marker
             * 
             * @param {object} unparsedMarker Unparsed marker
             * @param {object} latLng Lat/Long Position
             */
            Map.NoteMarkerManager.prototype.parseMarker = function(unparsedMarker, latLng) {
                return new Map.NoteMarker(unparsedMarker.name, unparsedMarker.description, unparsedMarker.color, latLng);
            };

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /**
             * Npc Daily routine editor
             * 
             * @param {GoNorth.Karta.Map.ViewModel} viewModel Main karta viewmodel
             * @param {ko.observable} isLoading Observable to indicate a process is loading
             * @param {ko.observable} errorOccured Observable to indicate an error occured
             * @class
             */
            Map.DailyRoutineEditor = function(viewModel, isLoading, errorOccured) 
            {
                this.isLoading = isLoading;
                this.errorOccured = errorOccured;

                this.currentNpcId = new ko.observable("");
                this.dailyRoutineEvents = new ko.observableArray();

                this.showEventCallout = new ko.observable(false);
                this.showDisabledEvents = new ko.observable(true);

                this.suggestedNpcStates = new ko.observableArray();

                this.hoursPerDay = new ko.observable(24);
                this.minutesPerHour = new ko.observable(60);

                this.isEditingDailyRoutine = new ko.observable(false);
                this.editingDailyRoutineNpcName = new ko.observable("");

                this.showAddEditEventDialog = new ko.observable(false);
                this.addEditEventName = new ko.observable("");
                this.addEditEventEarliestTime = new ko.observable(GoNorth.BindingHandlers.buildTimeObject(0, 0));
                this.addEditEventLatestTime = new ko.observable(GoNorth.BindingHandlers.buildTimeObject(0, 0));
                this.addEditEventTargetState = new ko.observable("");
                this.addEditEventTargetReachedScript = new ko.observable("");
                this.addEditEventTargetReachedScriptType = GoNorth.DailyRoutines.ScriptTypes.none;
                this.addEditEventTargetReachedScriptCode = "";
                this.addEditEventTargetReachedScriptGraph = null;
                this.addEditEventEnabledByDefault = new ko.observable(true);
                this.eventToEdit = new ko.observable(null);
                this.addMarkerLatLng = null;
                this.addEditEventDialogLoading = new ko.observable(false);
                this.addEditEventDialogErrorOccured = new ko.observable(false);
                GoNorth.DailyRoutines.Util.keepTimeObservablesInOrder(this.addEditEventEarliestTime, this.addEditEventLatestTime);

                this.showConfirmDeleteScriptDialog = new ko.observable(false);

                this.showConfirmDeleteEventDialog = new ko.observable(false);
                this.eventToDelete = null;

                this.viewModel = viewModel;

                this.isLayerVisible = new ko.observable(false);
                this.markerLayer = null;
                this.markerMap = null;
                var self = this;
                this.isLayerVisible.subscribe(function() {
                    self.syncLayerVisibility();
                });
                
                this.objectDialog = new GoNorth.ChooseObjectDialog.ViewModel();
                this.chooseScriptTypeDialog = new GoNorth.Shared.ChooseScriptTypeDialog.ViewModel();
                this.codeScriptDialog = new GoNorth.ScriptDialog.CodeScriptDialog(this.errorOccured);
                this.nodeScriptDialog = new GoNorth.ScriptDialog.NodeScriptDialog(this.currentNpcId, this.objectDialog, this.codeScriptDialog, this.errorOccured);

                this.showNpcLockedByDialog = new ko.observable(false);
                this.npcLockedBy = new ko.observable("");

                this.timeEventsOverlap = new ko.pureComputed(function() {
                    return GoNorth.DailyRoutines.Util.doEventsOverlap(this.dailyRoutineEvents());
                }, this);

                GoNorth.Util.setupValidation("#gn-addEditEventForm");

                this.loadConfig();
                
                this.dailyRoutineNpcIdFromUrl = GoNorth.Util.getParameterFromUrl("dailyRoutineNpcId");
                this.zoomOnDailyRoutineAfterInit = false;
                if(this.dailyRoutineNpcIdFromUrl && !GoNorth.Util.getParameterFromUrl("mapLat") && !GoNorth.Util.getParameterFromUrl("mapLong") && !GoNorth.Util.getParameterFromUrl("mapZoom"))
                {
                    this.zoomOnDailyRoutineAfterInit = true;
                }

                // Add access for markers
                Map.editDailyRoutineOfMarker = function(npcMarker) {
                    self.editDailyRoutineOfMarker(npcMarker);
                }
            }

            Map.DailyRoutineEditor.prototype = {
                /**
                 * Loads the config
                 */
                loadConfig: function() {
                    var self = this;
                    GoNorth.HttpClient.get("/api/ProjectConfigApi/GetMiscConfig").done(function(data) {
                        self.hoursPerDay(data.hoursPerDay);
                        self.minutesPerHour(data.minutesPerHour);
                    }).fail(function() {
                        self.errorOccured(true);
                    });

                    GoNorth.HttpClient.get("/api/ProjectConfigApi/GetJsonConfigByKey?configKey=" + GoNorth.ProjectConfig.ConfigKeys.SetNpcStateAction).done(function(loadedConfigData) {
                        if(!loadedConfigData)
                        {
                            return;
                        }
                        
                        try
                        {
                            var configLines = JSON.parse(loadedConfigData)
                            self.suggestedNpcStates(configLines);
                        }
                        catch(e)
                        {
                            self.errorOccured(true);
                        }
                    }).fail(function() {
                        self.errorOccured(true);
                    })
                },

                /**
                 * Creates a layer for a map
                 * 
                 * @param {object} map Map to which the layer should be added
                 */
                createLayerForMap: function(map) {
                    this.markerMap = map;
                    this.markerLayer = L.layerGroup();
                    if(this.isEditingDailyRoutine())
                    {
                        this.markerLayer.addTo(map);
                        this.syncDailyRoutineMarkers();
                    }

                    if(this.dailyRoutineNpcIdFromUrl) {
                        this.editDailyRoutineByNpcId(this.dailyRoutineNpcIdFromUrl, true);
                        this.dailyRoutineNpcIdFromUrl = null;
                    }
                },

                /**
                 * Sets the layer visibility based on the observable value
                 */
                syncLayerVisibility: function() {
                    if(!this.markerLayer || !this.markerMap)
                    {
                        return;
                    }

                    if(this.isLayerVisible())
                    {
                        this.markerLayer.addTo(this.markerMap);
                    }
                    else
                    {
                        this.markerLayer.removeFrom(this.markerMap);
                    }
                },

                /**
                 * Syncs the daily routine markers
                 */
                syncDailyRoutineMarkers: function() {
                    if(!this.markerLayer) {
                        return;
                    }

                    this.markerLayer.clearLayers();
                    
                    if(!this.dailyRoutineEvents()) {
                        return;
                    }

                    var sortedEvents = this.dailyRoutineEvents().sort(function(event1, event2) {
                        var d1 = event1.earliestTime();
                        var d2 = event2.earliestTime();

                        return GoNorth.BindingHandlers.compareTimes(d1, d2)
                    });

                    // Add markers
                    var mapId = this.viewModel.id();
                    var activeLatLngCoords = [];
                    var activeMovementEvents = [];
                    for(var curDailyRoutineEvent = 0; curDailyRoutineEvent < sortedEvents.length; ++curDailyRoutineEvent)
                    {
                        if(!this.showDisabledEvents() && !sortedEvents[curDailyRoutineEvent].enabledByDefault()) {
                            continue;
                        }

                        var movementTarget = sortedEvents[curDailyRoutineEvent].movementTarget;
                        if(!movementTarget || movementTarget.mapId != mapId) {
                            continue;
                        }

                        var latLng = L.latLng(movementTarget.lat, movementTarget.lng);
                        this.addMarkerForDailyRoutineEvent(latLng, sortedEvents[curDailyRoutineEvent]);

                        if(sortedEvents[curDailyRoutineEvent].enabledByDefault())
                        {
                            activeLatLngCoords.push(latLng);
                            activeMovementEvents.push(sortedEvents[curDailyRoutineEvent]);
                        }
                    }

                    // Show movement flow
                    if(activeMovementEvents.length > 1) {                        
                        activeLatLngCoords.push(activeLatLngCoords[0]);
                        activeMovementEvents.push(activeMovementEvents[0]);

                        var routineLine = L.polyline(activeLatLngCoords, { color: "#ff6631" });
                        routineLine.setText("  ►  ", {repeat: true, attributes: { fill: "#ff6631" }});
                        routineLine.addTo(this.markerLayer);

                        // Add time after path for draw ordering reasons
                        for(var curDailyRoutineEvent = 1; curDailyRoutineEvent < activeMovementEvents.length; ++curDailyRoutineEvent)
                        {
                            var earliest = activeMovementEvents[curDailyRoutineEvent].earliestTime();
                            var latest = activeMovementEvents[curDailyRoutineEvent].latestTime();
                            
                            var textLine = L.polyline([ activeLatLngCoords[curDailyRoutineEvent - 1], activeLatLngCoords[curDailyRoutineEvent] ], { color: "transparent" });
                            textLine.setText(GoNorth.DailyRoutines.Util.formatTimeSpan(Map.Localization.TimeFormat, earliest, latest), { center: true, orientation: "fixed", attributes: { class: "gn-kartaDailyRoutineTimeLabel", fill: "#FFF" } });
                            textLine.addTo(this.markerLayer);
                        }
                    }
                },

                /**
                 * Adds a marker for a daily routine event
                 * @param {L.latLng} latLng Lat lng coordinates
                 * @param {object} routineEvent Daily routine event
                 */
                addMarkerForDailyRoutineEvent: function(latLng, routineEvent) {
                    var self = this;
                    var marker = new Map.DailyRoutineMarker(latLng, routineEvent);
                    marker.setEditCallback(function() {
                        self.editDailyRoutineEvent(routineEvent);
                    });
                    marker.setDeleteCallback(function() {
                        self.openDeleteDailyRoutineEvent(routineEvent);
                    });
                    marker.setExportName(routineEvent.movementTarget && routineEvent.movementTarget.exportName ? routineEvent.movementTarget.exportName : "");
                    marker.setEditExportNameCallback(function() {
                        marker.setExportName(routineEvent.movementTarget && routineEvent.movementTarget.exportName ? routineEvent.movementTarget.exportName : "");
                        self.viewModel.openEditExportNameDialog(marker, function(newName) {
                            marker.setExportName(newName);
                            self.setDailyRoutineEventExportName(routineEvent, newName);
                        });
                    });
                    marker.addTo(this.markerLayer);
                    marker.setOnDragEnd(function() {
                        self.updateDailyRoutineMarkerPosition(marker, routineEvent);
                    });
                    this.viewModel.setupNewMarker(marker);
                },

                /**
                 * Sets the export name of a daily routine event
                 * @param {object} routineEvent Daily routine event
                 * @param {string} newName New export name
                 */
                setDailyRoutineEventExportName: function(routineEvent, newName) {
                    if(!routineEvent.movementTarget) {
                        return;
                    }

                    var oldName = routineEvent.movementTarget.exportName;
                    routineEvent.movementTarget.exportName = newName;

                    this.isLoading(true);
                    this.errorOccured(false);

                    var self = this;
                    this.saveDailyRoutineEvent(routineEvent).done(function() {
                        self.isLoading(false);
                    }).fail(function() {
                        routineEvent.movementTarget.exportName = oldName;
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Updates the daily routine marker position after a drag event
                 * @param {GoNorth.Karta.Map.DailyRoutineMarker} marker Marker that was dragged
                 * @param {object} routineEvent Daily routine event
                 */
                updateDailyRoutineMarkerPosition: function(marker, routineEvent) {
                    var oldPos = {
                        lat: routineEvent.movementTarget.lat,
                        lng: routineEvent.movementTarget.lng
                    }

                    var newPos = marker.getLatLng();
                    routineEvent.movementTarget.lat = newPos.lat;
                    routineEvent.movementTarget.lng = newPos.lng;

                    var self = this;
                    this.isLoading(true);
                    this.errorOccured(false);

                    this.syncDailyRoutineMarkers();
                    this.saveDailyRoutineEvent(routineEvent).done(function() {
                        self.isLoading(false);
                    }).fail(function() {
                        routineEvent.movementTarget.lat = oldPos.lat;
                        routineEvent.movementTarget.lng = oldPos.lng;
                        self.syncDailyRoutineMarkers();
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },


                /**
                 * Edits the daily routine of an npc marker
                 * @param {object} npcMarker Npc marker to edit the raily routine for
                 */
                editDailyRoutineOfMarker: function(npcMarker) {
                    if(this.isEditingDailyRoutine() && this.currentNpcId() == npcMarker.npcId)
                    {
                        this.isLayerVisible(true);
                        this.syncLayerVisibility();

                        npcMarker.closePopup();
                        return;
                    }

                    this.editDailyRoutineByNpcId(npcMarker.npcId, false);
                    npcMarker.closePopup();
                },

                /**
                 * Starst editing the daily routine of an npc by its id
                 * @param {string} npcId Id of the npc
                 * @param {boolean} fromUrl true if the start of the editing is coming from the url
                 */
                editDailyRoutineByNpcId: function(npcId, fromUrl) {
                    if(!fromUrl) {
                        this.viewModel.setCurrentObjectId("", null);
                    }
                    
                    this.isLayerVisible(true);
                    this.syncLayerVisibility();

                    this.isEditingDailyRoutine(true);
                    this.showDisabledEvents(true);
                    this.currentNpcId(npcId);

                    this.isLoading(true);
                    this.errorOccured(false);

                    var self = this;
                    Map.loadNpcCached(npcId).done(function(npc) {
                        self.isLoading(false);

                        if(!self.isEditingDailyRoutine())
                        {
                            return;
                        }

                        self.editingDailyRoutineNpcName(npc.name);
                        self.dailyRoutineEvents(GoNorth.DailyRoutines.deserializeRoutineEventArray(npc.dailyRoutine));
                        self.syncDailyRoutineMarkers();
                        if(self.markerLayer) {
                            self.markerLayer.addTo(self.markerMap);
                        }

                        if(fromUrl && self.zoomOnDailyRoutineAfterInit) {
                            self.zoomOnDailyRoutine();
                        }
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });

                    this.acquireLock();
                    if(!fromUrl) {
                        this.viewModel.refreshUrlParameters();
                    }
                },

                /**
                 * Zooms on the daily routine
                 */
                zoomOnDailyRoutine: function() {
                    this.zoomOnDailyRoutineAfterInit = false;
                    if(this.markerLayer && this.markerLayer.getLayers().length > 0) {
                        var boundingBox = { minLat: 1000000, maxLat: -1000000, minLng: 1000000, maxLng: -1000000 };
                        this.markerLayer.eachLayer(function(layer) {
                            if(!layer.getLatLng) {
                                return;
                            }

                            var latLng = layer.getLatLng();
                            boundingBox.minLat = Math.min(boundingBox.minLat, latLng.lat);
                            boundingBox.maxLat = Math.max(boundingBox.maxLat, latLng.lat);
                            boundingBox.minLng = Math.min(boundingBox.minLng, latLng.lng);
                            boundingBox.maxLng = Math.max(boundingBox.maxLng, latLng.lng);
                        });
                        var leafletBoundingBox = L.latLngBounds(L.latLng(boundingBox.minLat, boundingBox.minLng), L.latLng(boundingBox.maxLat, boundingBox.maxLng));
                        this.markerMap.fitBounds(leafletBoundingBox);
                    }
                },


                /**
                 * Leaves the edit mode
                 */
                leaveEditMode: function() {
                    if(!this.isEditingDailyRoutine())
                    {
                        return;
                    }

                    this.isEditingDailyRoutine(false);
                    this.isLayerVisible(false);
                    this.showEventCallout(false);
                    this.editingDailyRoutineNpcName("");
                    this.currentNpcId("");

                    if(this.markerLayer) {
                        this.markerLayer.removeFrom(this.markerMap);
                    }

                    GoNorth.LockService.releaseCurrentLock();
                    this.viewModel.refreshUrlParameters();
                },


                /**
                 * Adds a new marker
                 * 
                 * @param {object} map Map Object
                 * @param {object} latLng Click coordinates
                 */
                addMarker: function(map, latLng) {                    
                    this.addEditEventName("");
                    this.addEditEventEarliestTime(GoNorth.BindingHandlers.buildTimeObject(0, 0));
                    this.addEditEventLatestTime(GoNorth.BindingHandlers.buildTimeObject(0, 0));
                    this.addEditEventTargetState("");
                    this.addEditEventTargetReachedScript("");
                    this.addEditEventTargetReachedScriptType = GoNorth.DailyRoutines.ScriptTypes.none;
                    this.addEditEventTargetReachedScriptGraph = null;
                    this.addEditEventTargetReachedScriptCode = "";
                    this.addEditEventEnabledByDefault(true);
                    this.eventToEdit(null);

                    this.showEventCallout(false);
                    this.addEditEventDialogLoading(false);
                    this.addEditEventDialogErrorOccured(false);
                    this.showAddEditEventDialog(true);

                    this.addMarkerLatLng = latLng;
                }, 

                /**
                 * Edits a daily routine event
                 * @param {object} event Event to edit
                 */
                editDailyRoutineEvent: function(event) {
                    this.addEditEventName(event.movementTarget.name);
                    this.addEditEventEarliestTime(GoNorth.BindingHandlers.buildTimeObject(event.earliestTime().hours, event.earliestTime().minutes));
                    this.addEditEventLatestTime(GoNorth.BindingHandlers.buildTimeObject(event.latestTime().hours, event.latestTime().minutes));
                    this.addEditEventTargetState(event.targetState());
                    this.addEditEventTargetReachedScript(event.scriptName());
                    this.addEditEventTargetReachedScriptType = event.scriptType;
                    this.addEditEventTargetReachedScriptGraph = event.scriptNodeGraph;
                    this.addEditEventTargetReachedScriptCode = event.scriptCode;
                    this.addEditEventEnabledByDefault(event.enabledByDefault());
                    this.eventToEdit(event);
                    
                    this.showEventCallout(false);
                    this.addEditEventDialogLoading(false);
                    this.addEditEventDialogErrorOccured(false);
                    this.showAddEditEventDialog(true);
                },

                /**
                 * Confirms the add / edit event marker
                 */
                confirmAddEditEvent: function() {
                    if(!jQuery("#gn-addEditEventForm").valid())
                    {
                        return;
                    }

                    var routineEvent = null;
                    var isEdit = false;
                    if(!this.eventToEdit())
                    {
                        var movementTarget = GoNorth.DailyRoutines.createMovementTarget(this.viewModel.id(), this.addEditEventName(), "", this.addMarkerLatLng.lat, this.addMarkerLatLng.lng);
                        routineEvent = GoNorth.DailyRoutines.createRoutineEvent(GoNorth.DailyRoutines.EventTypes.movement, this.addEditEventEarliestTime(), this.addEditEventLatestTime(), movementTarget, 
                                                                         this.addEditEventTargetState(), this.addEditEventTargetReachedScriptType, this.addEditEventTargetReachedScript(), 
                                                                         this.addEditEventTargetReachedScriptGraph, this.addEditEventTargetReachedScriptCode, this.addEditEventEnabledByDefault());
                    }
                    else
                    {
                        routineEvent = this.eventToEdit();
                        routineEvent.earliestTime(GoNorth.BindingHandlers.buildTimeObject(this.addEditEventEarliestTime().hours, this.addEditEventEarliestTime().minutes));
                        routineEvent.latestTime(GoNorth.BindingHandlers.buildTimeObject(this.addEditEventLatestTime().hours, this.addEditEventLatestTime().minutes)),
                        routineEvent.movementTarget.name = this.addEditEventName(),
                        routineEvent.targetState(this.addEditEventTargetState()),
                        routineEvent.scriptType = this.addEditEventTargetReachedScriptType;
                        routineEvent.scriptName(this.addEditEventTargetReachedScript());
                        routineEvent.scriptNodeGraph = this.addEditEventTargetReachedScriptGraph;
                        routineEvent.scriptCode = this.addEditEventTargetReachedScriptCode;
                        routineEvent.enabledByDefault(this.addEditEventEnabledByDefault());
                        isEdit = true;
                    }
                    

                    this.addEditEventDialogLoading(true);
                    this.addEditEventDialogErrorOccured(false);

                    var self = this;
                    this.saveDailyRoutineEvent(routineEvent).done(function() {
                        self.addEditEventDialogLoading(false);

                        if(!isEdit) 
                        {
                            self.dailyRoutineEvents.push(routineEvent);
                        }
                        if(!self.addEditEventEnabledByDefault() && !self.showDisabledEvents()) {
                            self.showDisabledEvents(true);
                        }
                        self.syncDailyRoutineMarkers();
                        self.closeAddEditEventDialog();
                    }).fail(function() {
                        self.addEditEventDialogLoading(false);
                        self.addEditEventDialogErrorOccured(true);
                    });
                },

                /**
                 * Closes the add / edit event marker dialog
                 */
                closeAddEditEventDialog: function() {
                    this.showAddEditEventDialog(false);
                },


                /**
                 * Adds or edit a target reached script
                 */
                addEditTargetReachedScript: function() {
                    if(this.addEditEventTargetReachedScriptType == GoNorth.DailyRoutines.ScriptTypes.none)
                    {
                        this.addTargetReachedScript();
                    }
                    else
                    {
                        this.editTargetReachedScript();
                    }
                },

                /**
                 * Adds a target reached script
                 */
                addTargetReachedScript: function() {
                    var self = this;
                    this.chooseScriptTypeDialog.openDialog().done(function(selectedType) {
                        if(selectedType == GoNorth.Shared.ChooseScriptTypeDialog.nodeGraph)
                        {
                            self.nodeScriptDialog.openCreateDialog().done(function(result) {
                                self.addEditEventTargetReachedScript(result.name);
                                self.addEditEventTargetReachedScriptType = GoNorth.DailyRoutines.ScriptTypes.nodeGraph;
                                self.addEditEventTargetReachedScriptCode = "";
                                self.addEditEventTargetReachedScriptGraph = result.graph;
                            });
                        }
                        else if(selectedType == GoNorth.Shared.ChooseScriptTypeDialog.codeScript)
                        {
                            self.codeScriptDialog.openCreateDialog().done(function(result) {
                                self.addEditEventTargetReachedScript(result.name);
                                self.addEditEventTargetReachedScriptType = GoNorth.DailyRoutines.ScriptTypes.codeScript;
                                self.addEditEventTargetReachedScriptCode = result.code;
                                self.addEditEventTargetReachedScriptGraph = null;
                            });
                        }
                    });
                },

                /**
                 * Edits the target reached script
                 */
                editTargetReachedScript: function() {
                    var self = this;
                    if(this.addEditEventTargetReachedScriptType == GoNorth.DailyRoutines.ScriptTypes.nodeGraph)
                    {
                        this.nodeScriptDialog.openEditDialog(this.addEditEventTargetReachedScript(), this.addEditEventTargetReachedScriptGraph).done(function(result) {
                            self.addEditEventTargetReachedScript(result.name);
                            self.addEditEventTargetReachedScriptGraph = result.graph;
                        });
                    }
                    else if(this.addEditEventTargetReachedScriptType == GoNorth.DailyRoutines.ScriptTypes.codeScript)
                    {
                        this.codeScriptDialog.openEditDialog(this.addEditEventTargetReachedScript(), this.addEditEventTargetReachedScriptCode).done(function(result) {
                            self.addEditEventTargetReachedScript(result.name);
                            self.addEditEventTargetReachedScriptCode = result.code;
                        });
                    }
                },


                /**
                 * Opens the confirm delete daily routine event dialog
                 * @param {object} eventToDelete Event to delete
                 */
                openDeleteDailyRoutineEvent: function(eventToDelete) {
                    this.showConfirmDeleteEventDialog(true);
                    this.eventToDelete = eventToDelete;
                },

                /**
                 * Deletes the daily routine event for which the confirm delete dialog is open
                 */
                deleteDailyRoutineEvent: function() {
                    this.dailyRoutineEvents.remove(this.eventToDelete);
                    this.syncDailyRoutineMarkers();
                    
                    this.sendDeleteDailyRoutineEventRequest(this.eventToDelete);
                    this.closeConfirmDeleteEventDialog();
                },

                /**
                 * Sends a delete daily routine event request
                 * @param {object} eventToDelete Event to delete
                 */
                sendDeleteDailyRoutineEventRequest: function(eventToDelete) {
                    this.isLoading(true);
                    this.errorOccured(false);

                    var self = this;
                    var currentNpcId = this.currentNpcId();
                    GoNorth.HttpClient.delete("/api/KortistoApi/DeleteDailyRoutineEvent?id=" + encodeURIComponent(currentNpcId) + "&eventId=" + encodeURIComponent(eventToDelete.eventId)).done(function() {
                        Map.invalidateCachedNpc(currentNpcId);

                        self.isLoading(false);
                    }).fail(function() {
                        self.dailyRoutineEvents.push(eventToDelete);
                        self.syncDailyRoutineMarkers();
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Closes the confirm delete daily routine event dialog
                 */
                closeConfirmDeleteEventDialog: function() {
                    this.showConfirmDeleteEventDialog(false);
                    this.eventToDelete = null;
                },


                /**
                 * Opens the confirm delete script dialog
                 */
                openConfirmDeleteScriptDialog: function() {
                    this.showConfirmDeleteScriptDialog(true);
                },

                /**
                 * Removes the target reached script
                 */
                removeTargetReachedScript: function() {
                    this.addEditEventTargetReachedScript("");
                    this.addEditEventTargetReachedScriptType = GoNorth.DailyRoutines.ScriptTypes.none
                    this.addEditEventTargetReachedScriptCode = "";
                    this.addEditEventTargetReachedScriptGraph = null;

                    this.closeConfirmDeleteScriptDialog();
                },

                /**
                 * Closes the confirm delete script dialog
                 */
                closeConfirmDeleteScriptDialog: function() {
                    this.showConfirmDeleteScriptDialog(false);
                },


                /**
                 * Saves a daily routine event
                 * @param {object} routineEvent Routine event to save
                 * @returns {jQuery.Deferred} Deferred for the loading process
                 */
                saveDailyRoutineEvent: function(routineEvent) {
                    var def = new jQuery.Deferred();

                    var currentNpcId = this.currentNpcId();
                    GoNorth.HttpClient.post("/api/KortistoApi/SaveDailyRoutineEvent?id=" + encodeURIComponent(currentNpcId), GoNorth.DailyRoutines.serializeRoutineEvent(routineEvent)).done(function(eventId) {
                        Map.invalidateCachedNpc(currentNpcId);

                        if(!routineEvent.eventId) {
                            routineEvent.eventId = eventId;
                        }

                        def.resolve();
                    }).fail(function() {
                        def.reject();
                    });

                    return def.promise();
                },


                /**
                 * Acquires a lock for the npc
                 */
                acquireLock: function() {
                    this.showNpcLockedByDialog(false);
                    this.npcLockedBy("");
                    var self = this;
                    GoNorth.LockService.acquireLock("KortistoNpc", this.currentNpcId()).done(function(isLocked, lockedUsername) {
                        if(isLocked)
                        {
                            self.showNpcLockedByDialog(true);
                            self.npcLockedBy(lockedUsername);
                            self.leaveEditMode();
                        }
                    }).fail(function() {
                        self.errorOccured(true);
                        self.leaveEditMode();
                    });
                },

                /**
                 * Closes the npc locked by dialog
                 */
                closeNpcLockedByDialog: function() {
                    this.showNpcLockedByDialog(false);
                },


                /**
                 * Compare function for the daily routines array
                 * @param {object} event1 Daily routines event 1
                 * @param {object} event2 Daily routines event 2
                 * @returns {number} Compare value
                 */
                compareTimeEvents: function(event1, event2) {
                    var d1 = event1.earliestTime();
                    var d2 = event2.earliestTime();

                    return GoNorth.BindingHandlers.compareTimes(d1, d2);                    
                },


                /**
                 * Toggles the daily routine callout
                 */
                toggleDailyRoutineCallout: function() {
                    this.showEventCallout(!this.showEventCallout());
                },

                /**
                 * Toggles if disabled events should be shown or not
                 */
                toogleShowDisabledEvents: function() {
                    this.showDisabledEvents(!this.showDisabledEvents());
                    this.showEventCallout(false);
                    this.syncDailyRoutineMarkers();
                },


                /**
                 * Builds the npc link for the current npc
                 */
                buildNpcLink: function() {
                    return "/Kortisto/Npc?id=" + this.currentNpcId();
                },


                /**
                 * Builds the url parameters
                 * @returns {string} Url parameters
                 */
                buildUrlParameters: function() {
                    if(!this.isEditingDailyRoutine())
                    {
                        return "";
                    }
                    
                    return "&dailyRoutineNpcId=" + this.currentNpcId();
                }
            };

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /**
             * Daily Routine Marker
             * 
             * @param {object} latLng Coordinates of the marker
             * @param {object} routineEvent Daily routine event
             * @class
             */
            Map.DailyRoutineMarker = function(latLng, routineEvent) 
            {
                Map.BaseMarker.apply(this);

                this.routineEvent = routineEvent

                this.isTrackingImplementationStatus = false;
                this.serializePropertyName = "DailyRoutineMarker";

                this.disableCopyLink = true;
                this.disableGeometryEditing = true;

                this.initMarker(latLng);
            }

            Map.DailyRoutineMarker.prototype = jQuery.extend({ }, Map.BaseMarker.prototype)

            /**
             * Returns the icon url
             * 
             * @return {string} Icon Url
             */
            Map.DailyRoutineMarker.prototype.getIconUrl = function() {
                return this.routineEvent.enabledByDefault() ? "/img/karta/dailyRoutineMarker.png" : "/img/karta/dailyRoutineMarkerDisabled.png";
            }

            /**
             * Returns the icon retina url
             * 
             * @return {string} Icon Retina Url
             */
            Map.DailyRoutineMarker.prototype.getIconRetinaUrl = function() {
                return this.routineEvent.enabledByDefault() ? "/img/karta/dailyRoutineMarker_2x.png" : "/img/karta/dailyRoutineMarkerDisabled_2x.png" ;
            }

            /**
             * Returns the icon label
             * 
             * @returns {string} Icon Label
             */
            Map.DailyRoutineMarker.prototype.getIconLabel = function() {
                var label = this.routineEvent.movementTarget.name;
                if(!this.routineEvent.enabledByDefault()) {
                    label += " (" + GoNorth.DailyRoutines.Util.formatTimeSpan(Map.Localization.TimeFormat, this.routineEvent.earliestTime(), this.routineEvent.latestTime()) + ")";
                }
                return label;
            }

            /**
             * Loads the content
             * 
             * @returns {jQuery.Deferred} Deferred
             */
            Map.DailyRoutineMarker.prototype.loadContent = function() {
                var def = new jQuery.Deferred();

                // setTimeout is required to prevent the content to be overwritten with loading circle again
                var self = this;
                setTimeout(function() {
                    var dailyRoutineHtml = "<h4>" + jQuery("<div></div>").text(self.routineEvent.movementTarget.name).html() + "</h4>";
                    var contentHtml = "<span class='gn-kartaDailyRoutinePopupLabel'>" + Map.Localization.RandomTimeFrame + ":</span> " + GoNorth.DailyRoutines.Util.formatTimeSpan(Map.Localization.TimeFormat, self.routineEvent.earliestTime(), self.routineEvent.latestTime()) + "<br/>";
                    contentHtml += "<span class='gn-kartaDailyRoutinePopupLabel'>" + Map.Localization.TargetState + ":</span> " + self.routineEvent.targetState() + "<br/>";
                    contentHtml += "<span class='gn-kartaDailyRoutinePopupLabel'>" + Map.Localization.ScriptOnTargetReached + ":</span> " + self.routineEvent.scriptName() + "<br/>";
                    contentHtml += "<span class='gn-kartaDailyRoutinePopupLabel'>" + Map.Localization.EnabledByDefault + ":</span> " + (self.routineEvent.enabledByDefault() ? Map.Localization.Yes : Map.Localization.No) + "<br/>";
                    dailyRoutineHtml +=  "<div class='gn-kartaPopupContent'>" + contentHtml + "</div>";
                    def.resolve(dailyRoutineHtml);
                }, 1);

                return def.promise();
            }

            /**
             * Serializes the marker
             * 
             * @param {object} map Map
             * @returns {object} Serialized data
             */
            Map.DailyRoutineMarker.prototype.serialize = function(map) {
                var serializedObject = this.serializeBaseData(map);
                return serializedObject;
            }

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /// Default Geometry color
            var defaultGeometryColor = "#0000CC";

            /**
             * Map View Model
             * @class
             */
            Map.ViewModel = function()
            {
                this.isLoading = new ko.observable(false);
                this.isReadonly = new ko.observable(false);
                this.showWaitOnPageDialog = new ko.observable(false);
                this.lockedByUser = new ko.observable("");
                this.errorOccured = new ko.observable(false);
                this.additionalError = new ko.observable("");

                this.id = new ko.observable("");
                this.preSelectType = GoNorth.Util.getParameterFromUrl("preSelectType");
                this.preSelectId = GoNorth.Util.getParameterFromUrl("preSelectId");
                this.zoomOnMarkerType = GoNorth.Util.getParameterFromUrl("zoomOnMarkerType");
                this.zoomOnMarkerId = GoNorth.Util.getParameterFromUrl("zoomOnMarkerId");
                this.preSelectChapter = parseInt(GoNorth.Util.getParameterFromUrl("chapter"));

                this.dailyRoutineEditor = new Map.DailyRoutineEditor(this, this.isLoading, this.errorOccured);

                var paramId = GoNorth.Util.getParameterFromUrl("id");
                if(paramId)
                {
                    this.setId(paramId);
                }

                this.map = null;
                this.mapGeometryToolbar = null;

                this.currentMapName = new ko.observable(Karta.Map.Localization.Karta);
                this.mapUrlTemplate = new ko.computed(function() {
                    return "/api/KartaApi/MapImage?mapId=" + encodeURIComponent(this.id()) + "&z={z}&x={x}&y={y}&maxZoom={maxZoom}&maxTileCountX={maxTileCountX}&maxTileCountY={maxTileCountY}"
                }, this);
                this.mapMaxZoom = new ko.observable();
                this.mapImageWidth = new ko.observable();
                this.mapImageHeight = new ko.observable();
                this.mapLoaded = new ko.observable(false);

                this.allMaps = new ko.observableArray();

                this.kirjaMarkerManager = new Map.KirjaMarkerManager(this);
                this.kortistoMarkerManager = new Map.KortistoMarkerManager(this);
                this.styrMarkerManager = new Map.StyrMarkerManager(this);
                this.kartaMarkerManager = new Map.KartaMarkerManager(this);
                this.aikaMarkerManager = new Map.AikaMarkerManager(this);
                this.noteMarkerManager = new Map.NoteMarkerManager(this);

                this.showMarkerLabels = new ko.observable(true);

                this.selectedMarkerObjectId = new ko.observable("");
                this.currentValidManager = null;

                this.showConfirmDeleteDialog = new ko.observable(false);
                this.markerToDelete = null;
                this.markerToDeleteManager = null;

                this.showMarkerNameDialog = new ko.observable(false);
                this.dialogMarkerName = new ko.observable("");
                this.showMarkerNameDialogDescription = new ko.observable(false);
                this.showMarkerNameDialogColor = new ko.observable(false);
                this.dialogMarkerDescription = new ko.observable("");
                this.dialogMarkerColor = new ko.observable("#a9a9a9");
                this.dialogMarkerNameDef = null;

                this.showMarkerExportNameDialog = new ko.observable(false);
                this.markerExportName = new ko.observable("");
                this.markerToEditExportName = null;
                this.markerToEditSaveCallback = null;
                
                this.compareDialog = new GoNorth.ImplementationStatus.CompareDialog.ViewModel();

                this.isInGeometryEditMode = new ko.observable(false);
                this.geometryEditMarker = null;
                this.geometryEditMarkerManager = null;

                this.showGeometrySettingDialog = new ko.observable(false);
                this.showConfirmGeometryDeleteDialog = new ko.observable(false);
                this.availableGeometryColors = [
                    {
                        name: GoNorth.Karta.Map.Localization.GeometryColorBlue,
                        color: defaultGeometryColor,
                    },
                    {
                        name: GoNorth.Karta.Map.Localization.GeometryColorRed,
                        color: "#CC0000",
                    },
                    {
                        name: GoNorth.Karta.Map.Localization.GeometryColorGreen,
                        color: "#008800",
                    },
                    {
                        name: GoNorth.Karta.Map.Localization.GeometryColorPurple,
                        color: "#66008e",
                    },
                    {
                        name: GoNorth.Karta.Map.Localization.GeometryColorWhite,
                        color: "#FFFFFF",
                    },
                    {
                        name: GoNorth.Karta.Map.Localization.GeometryColorYellow,
                        color: "#FDFF00",
                    }
                ];
                this.selectedGeometryColor = new ko.observable("");
                this.editGeometry = null;
                
                this.selectedChapter = new ko.observable(null);
                this.chapters = new ko.observableArray();

                this.selectedChapterName = new ko.computed(function() {
                    var selectedChapter = this.selectedChapter();
                    if(selectedChapter) 
                    {
                        return selectedChapter.number + ": " + selectedChapter.name;
                    }

                    return Map.Localization.EditingDefaultChapter;
                }, this);

                this.isNonDefaultChapterSelected = new ko.computed(function() {
                    var selectedChapter = this.selectedChapter();
                    if(selectedChapter) 
                    {
                        return !selectedChapter.isDefault;
                    }

                    return false;
                }, this);

                this.exportObjectDialog = new GoNorth.Shared.ExportObjectDialog.ViewModel(this.isLoading, this.errorOccured);

                this.loadAllMaps();

                var chapterDef = null;
                if(Map.hasAikaRights)
                {
                    chapterDef = this.loadChapters();
                }
                else
                {
                    chapterDef = new jQuery.Deferred();
                    chapterDef.resolve();
                }

                var self = this;
                chapterDef.done(function() {
                    if(self.id())
                    {
                        self.loadMap(self.id());
                    }
                });

                var lastId = this.id();
                GoNorth.Util.onUrlParameterChanged(function() {
                    var id = GoNorth.Util.getParameterFromUrl("id");
                    if(id != lastId) {
                        var chapterByUrl = parseInt(GoNorth.Util.getParameterFromUrl("chapter"));
                        if(!isNaN(chapterByUrl))
                        {
                            self.switchChapterByNumber(chapterByUrl, true);
                        }
                        else if(self.chapters().length > 0)
                        {
                            self.switchChapter(self.chapters()[0], true);
                        }

                        GoNorth.Karta.Map.readUrlMapLocations();
                        lastId = id;
                        self.switchMap(GoNorth.Util.getParameterFromUrl("id"), true);
                    }
                });

                GoNorth.Karta.Map.switchToMap = function(mapId) {
                    if(self.id() != mapId) {
                        self.switchMap(mapId);
                    }
                }
            };

            Map.ViewModel.prototype = {
                /**
                 * Resets the error state
                 */
                resetErrorState: function() {
                    this.errorOccured(false);
                    this.additionalError("");
                },

                /**
                 * Checks the pre selection
                 */
                checkPreSelection: function() {
                    if(!this.preSelectType || !this.preSelectId)
                    {
                        return;
                    }

                    this.kirjaMarkerManager.checkPreSelection(this.preSelectType, this.preSelectId);
                    this.kortistoMarkerManager.checkPreSelection(this.preSelectType, this.preSelectId);
                    this.styrMarkerManager.checkPreSelection(this.preSelectType, this.preSelectId);
                    this.kartaMarkerManager.checkPreSelection(this.preSelectType, this.preSelectId);
                    this.aikaMarkerManager.checkPreSelection(this.preSelectType, this.preSelectId);
                    this.noteMarkerManager.checkPreSelection(this.preSelectType, this.preSelectId);

                    this.preSelectType = null;
                    this.preSelectId = null;
                },

                /**
                 * Checks the marker which should be zoomed on
                 */
                checkZoomOnMarker: function() {
                    if(!this.zoomOnMarkerType || !this.zoomOnMarkerId)
                    {
                        return;
                    }

                    this.kirjaMarkerManager.checkZoomOnMarker(this.zoomOnMarkerType, this.zoomOnMarkerId);
                    this.kortistoMarkerManager.checkZoomOnMarker(this.zoomOnMarkerType, this.zoomOnMarkerId);
                    this.styrMarkerManager.checkZoomOnMarker(this.zoomOnMarkerType, this.zoomOnMarkerId);
                    this.kartaMarkerManager.checkZoomOnMarker(this.zoomOnMarkerType, this.zoomOnMarkerId);
                    this.aikaMarkerManager.checkZoomOnMarker(this.zoomOnMarkerType, this.zoomOnMarkerId);
                    this.noteMarkerManager.checkZoomOnMarker(this.zoomOnMarkerType, this.zoomOnMarkerId);

                    this.zoomOnMarkerType = null;
                    this.zoomOnMarkerId = null;
                },

                /**
                 * Callback after the map was loaded
                 */
                mapReady: function(map) {
                    this.map = map;

                    this.kirjaMarkerManager.createLayerForMap(map);
                    this.kortistoMarkerManager.createLayerForMap(map);
                    this.styrMarkerManager.createLayerForMap(map);
                    this.kartaMarkerManager.createLayerForMap(map);
                    this.aikaMarkerManager.createLayerForMap(map);
                    this.noteMarkerManager.createLayerForMap(map);

                    this.kirjaMarkerManager.parseUnparsedMarkers(map);
                    this.kortistoMarkerManager.parseUnparsedMarkers(map);
                    this.styrMarkerManager.parseUnparsedMarkers(map);
                    this.kartaMarkerManager.parseUnparsedMarkers(map);
                    this.aikaMarkerManager.parseUnparsedMarkers(map);
                    this.noteMarkerManager.parseUnparsedMarkers(map);

                    this.dailyRoutineEditor.createLayerForMap(map);

                    this.checkPreSelection();
                    this.checkZoomOnMarker();

                    this.initEditGeometryToolbar(map);

                    if(!GoNorth.Util.getParameterFromUrl("mapLat"))
                    {
                        this.refreshUrlMapLocations();
                    }
                    this.refreshUrlParameters();
                },
                
                /**
                 * Refreshes the url map locations
                 */
                refreshUrlMapLocations: function() {
                    if(GoNorth.Karta.Map.refreshUrlMapLocations) 
                    {
                        GoNorth.Karta.Map.refreshUrlMapLocations();
                    }
                },


                /**
                 * Loads all available maps
                 */
                loadAllMaps: function() {
                    this.resetErrorState();
                    var self = this;
                    GoNorth.HttpClient.get("/api/KartaApi/Maps").done(function(maps) {
                        self.allMaps(maps);

                        if(!self.id() && maps.length > 0)
                        {
                            self.loadMap(maps[0].id);
                        }
                    }).fail(function() {
                        self.errorOccured(true);
                    });
                },


                /**
                 * Loads chapters
                 */
                loadChapters: function() {
                    var def = new jQuery.Deferred();

                    this.resetErrorState();
                    var self = this;
                    GoNorth.HttpClient.get("/api/AikaApi/GetChapters").done(function(chapters) {
                        if(!chapters)
                        {
                            chapters = [];
                        }

                        var aggregatedChapters = [];
                        var aggregatedChapterName = "";
                        var curChapterNumber = -1;
                        for(var curChapter = 0; curChapter < chapters.length; ++curChapter)
                        {
                            if(curChapter == 0)
                            {
                                curChapterNumber = chapters[curChapter].number;
                            }

                            if(chapters[curChapter].number != curChapterNumber)
                            {
                                aggregatedChapters.push({
                                    number: curChapterNumber,
                                    name: aggregatedChapterName,
                                });

                                aggregatedChapterName = "";
                                curChapterNumber = chapters[curChapter].number;
                            }

                            if(aggregatedChapterName)
                            {
                                aggregatedChapterName += " / ";
                            }
                            aggregatedChapterName += chapters[curChapter].name;
                        }
                        
                        if(aggregatedChapterName) 
                        {
                            aggregatedChapters.push({
                                number: curChapterNumber,
                                name: aggregatedChapterName,
                            });
                        }

                        if(aggregatedChapters.length > 0)
                        {
                            aggregatedChapters[0].isDefault = true;
                            var chapterToSelect = aggregatedChapters[0];
                            if(self.preSelectChapter != null && !isNaN(self.preSelectChapter))
                            {
                                for(var curChapter = 0; curChapter < aggregatedChapters.length; ++curChapter)
                                {
                                    if(aggregatedChapters[curChapter].number == self.preSelectChapter)
                                    {
                                        chapterToSelect = aggregatedChapters[curChapter];
                                        break;
                                    }
                                }
                            }
                            self.preSelectChapter = null;
                            self.switchChapter(chapterToSelect, true);
                        }

                        self.chapters(aggregatedChapters);
                        def.resolve();
                    }).fail(function() {
                        self.errorOccured(true);
                        def.reject();
                    });

                    return def.promise();
                },

                /**
                 * Switches the chapter by a chapter number
                 * 
                 * @param {int} chapterNumber Chapter number to which to switch
                 * @param {bool} dontUpdateUrl true if the Url should be not be updated, else false
                 */
                switchChapterByNumber: function(chapterNumber, dontUpdateUrl) {
                    var chapters = this.chapters();
                    if(chapters == null || chapters.length == 0 || this.getSelectedChapterNumber() == chapterNumber)
                    {
                        return;
                    }

                    var bestChapter = chapters[0];
                    for(var curChapter = 0; curChapter < chapters.length; ++curChapter)
                    {
                        if(chapters[curChapter].number >= chapterNumber)
                        {
                            bestChapter = chapters[curChapter];
                            break;
                        }
                    }

                    if(bestChapter != this.selectedChapter())
                    {
                        this.switchChapter(bestChapter, dontUpdateUrl);
                    }
                },

                /**
                 * Switches the chapter
                 * 
                 * @param {object} chapter Chapter to select
                 * @param {bool} dontUpdateUrl true if the Url should be not be updated, else false
                 */
                switchChapter: function(chapter, dontUpdateUrl) {
                    this.selectedChapter(chapter);

                    this.kirjaMarkerManager.adjustMarkersToChapter(chapter.number, this.map);
                    this.kortistoMarkerManager.adjustMarkersToChapter(chapter.number, this.map);
                    this.styrMarkerManager.adjustMarkersToChapter(chapter.number, this.map);
                    this.kartaMarkerManager.adjustMarkersToChapter(chapter.number, this.map);
                    this.aikaMarkerManager.adjustMarkersToChapter(chapter.number, this.map);
                    this.noteMarkerManager.adjustMarkersToChapter(chapter.number, this.map);

                    if(dontUpdateUrl)
                    {
                        return;
                    }

                    this.refreshUrlParameters();
                },

                /**
                 * Returns the currently selected chapter number
                 * 
                 * @returns {int} Currently Selected chapter number, -1 if no chapter is selected
                 */
                getSelectedChapterNumber: function() {
                    if(!this.selectedChapter())
                    {
                        return -1;
                    }

                    return this.selectedChapter().number;
                },


                /**
                 * Sets the id
                 * 
                 * @param {string} id Id of the page
                 * @param {bool} dontPushState true if the url change should not be pushed as a state, else falsedontPushState
                 */
                setId: function(id, dontPushState) {
                    var pushNewState = !!this.id() && this.id() != id;
                    this.id(id);

                    if(dontPushState)
                    {
                        return;
                    }

                    var parameterValue = this.buildUrlParameters();
                    if(pushNewState)
                    {
                        GoNorth.Util.setUrlParameters(parameterValue);
                    }
                    else
                    {
                        GoNorth.Util.replaceUrlParameters(parameterValue);
                    }
                },

                /**
                 * Refreshes the url parameters
                 */
                refreshUrlParameters: function() {
                    var parameterValue = this.buildUrlParameters();
                    GoNorth.Util.replaceUrlParameters(parameterValue);
                    this.refreshUrlMapLocations();
                },

                /**
                 * Builds the url parameters
                 * 
                 * @returns {string} Url parameters
                 */
                buildUrlParameters: function() {
                    var parameterValue = "id=" + this.id();
                    if(this.isNonDefaultChapterSelected && this.isNonDefaultChapterSelected() && this.selectedChapter())
                    {
                        parameterValue += "&chapter=" + this.selectedChapter().number;
                    }

                    if(this.dailyRoutineEditor.isEditingDailyRoutine())
                    {
                        parameterValue += this.dailyRoutineEditor.buildUrlParameters();
                    }

                    return parameterValue;
                },

                /**
                 * Switches the map which is currently displayed if ifs different to the current one
                 * 
                 * @param {string} id Id of the map
                 * @param {bool} dontPushState true if the url change should not be pushed as a state, else false
                 */
                switchMap: function(id, dontPushState) {
                    if(this.id() == id)
                    {
                        return;
                    }

                    this.kirjaMarkerManager.resetMarkers();
                    this.kortistoMarkerManager.resetMarkers();
                    this.styrMarkerManager.resetMarkers();
                    this.kartaMarkerManager.resetMarkers();
                    this.aikaMarkerManager.resetMarkers();
                    this.noteMarkerManager.resetMarkers();
                    this.dailyRoutineEditor.leaveEditMode();
                    this.loadMap(id, dontPushState);
                },

                /**
                 * Loads a map
                 * 
                 * @param {string} id Id of the map
                 * @param {bool} dontPushState true if the url change should not be pushed as a state, else false
                 */
                loadMap: function(id, dontPushState) {
                    this.resetErrorState();
                    this.isLoading(true);
                    var self = this;
                    GoNorth.HttpClient.get("/api/KartaApi/Map?id=" + encodeURIComponent(id)).done(function(map) {
                        if(!map)
                        {
                            self.errorOccured(true);
                            self.isLoading(false);
                            return;
                        }

                        self.currentMapName(map.name);

                        self.mapMaxZoom(map.maxZoom);
                        self.mapImageWidth(map.width);
                        self.mapImageHeight(map.height);
                        self.setId(id, dontPushState);

                        if(self.map)
                        {
                            self.kirjaMarkerManager.parseMarkers(map.kirjaPageMarker, self.map);
                            self.kortistoMarkerManager.parseMarkers(map.npcMarker, self.map);
                            self.styrMarkerManager.parseMarkers(map.itemMarker, self.map);
                            self.kartaMarkerManager.parseMarkers(map.mapChangeMarker, self.map);
                            self.aikaMarkerManager.parseMarkers(map.questMarker, self.map);
                            self.noteMarkerManager.parseMarkers(map.noteMarker, self.map);
                        }
                        else
                        {
                            self.kirjaMarkerManager.setUnparsedMarkers(map.kirjaPageMarker);
                            self.kortistoMarkerManager.setUnparsedMarkers(map.npcMarker);
                            self.styrMarkerManager.setUnparsedMarkers(map.itemMarker);
                            self.kartaMarkerManager.setUnparsedMarkers(map.mapChangeMarker);
                            self.aikaMarkerManager.setUnparsedMarkers(map.questMarker);
                            self.noteMarkerManager.setUnparsedMarkers(map.noteMarker);
                        }

                        if(!self.mapLoaded())
                        {
                            self.mapLoaded(true);
                        }

                        self.acquireLock();

                        if(self.isNonDefaultChapterSelected())
                        {
                            var chapterNumber = self.getSelectedChapterNumber();
                            self.kirjaMarkerManager.adjustMarkersToChapter(chapterNumber, self.map);
                            self.kortistoMarkerManager.adjustMarkersToChapter(chapterNumber, self.map);
                            self.styrMarkerManager.adjustMarkersToChapter(chapterNumber, self.map);
                            self.kartaMarkerManager.adjustMarkersToChapter(chapterNumber, self.map);
                            self.aikaMarkerManager.adjustMarkersToChapter(chapterNumber, self.map);
                            self.noteMarkerManager.adjustMarkersToChapter(chapterNumber, self.map);
                        }

                        self.isLoading(false);
                    }).fail(function() {
                        self.errorOccured(true);
                        self.isLoading(false);
                    });
                },

                /**
                 * Adds a marker to the map
                 * 
                 * @param {object} map Map Object
                 * @param {object} latLng Click coordinates
                 */
                addMarkerToMap: function(map, latLng) {
                    if(this.isLoading()) {
                        return;
                    }

                    if(this.currentValidManager) {
                        this.addMarkerForValidManager(map, latLng);
                    } else if(this.dailyRoutineEditor.isEditingDailyRoutine()) {
                        this.dailyRoutineEditor.addMarker(map, latLng);
                    }
                },

                /**
                 * Adds a marker for the valid manager
                 * 
                 * @param {object} map Map Object
                 * @param {object} latLng Click coordinates
                 */
                addMarkerForValidManager: function(map, latLng) {
                    this.resetErrorState();

                    var markerDef = this.currentValidManager.createMarker(this.selectedMarkerObjectId(), latLng);

                    var self = this;
                    markerDef.done(function(marker) {
                        self.setMarkerDragCallback(marker);
                        self.setupNewMarker(marker);
                        if(self.isNonDefaultChapterSelected())
                        {
                            marker.setAddedInChapter(self.selectedChapter().number);
                        }
                        self.saveNewMarker(marker, map);
                    });
                },

                /**
                 * Sets a markers position on the map
                 * @param {GoNorth.Karta.Map.BaseMarker} marker Marker to setup
                 */
                setupNewMarker: function(marker) {
                    this.setMarkerPixelPosition(marker, this.map, true);
                },

                /**
                 * Sets a markers drag callback function
                 * 
                 * @param {object} marker Marker to set the drag callback for
                 */
                setMarkerDragCallback: function(marker) {
                    var self = this;
                    marker.setOnDragEnd(function() {
                        self.saveNewMarkerPos(marker, self.map);
                    });
                },

                /**
                 * Opens the delete dialog for a marker
                 * 
                 * @param {object} marker Marker to open the dialog for
                 * @param {object} manager Manager to which the marker belongs
                 */
                openDeleteDialog: function(marker, manager) {
                    var self = this;
                    marker.setDeleteCallback(function() {
                        self.showConfirmDeleteDialog(true);
                        self.markerToDelete = marker;
                        self.markerToDeleteManager = manager;
                    });
                },

                /**
                 * Deletes the marker for which the dialog is shown
                 */
                deleteMarker: function() {
                    if(!this.isNonDefaultChapterSelected() || (this.markerToDelete.getAddedInChapter() >= 0 && this.markerToDelete.getAddedInChapter() == this.getSelectedChapterNumber()))
                    {
                        this.sendDeleteMarkerRequest(this.markerToDelete, this.markerToDeleteManager);
                    }
                    else
                    {
                        this.markerToDelete.setDeletedInChapter(this.getSelectedChapterNumber());
                        this.saveMarker(this.markerToDelete);
                    }

                    this.markerToDelete.removeFrom(this.map);
                    this.closeConfirmDeleteDialog();
                },

                /**
                 * Sends a request to delete a marker
                 * 
                 * @param {object} marker Marker to delete
                 */
                sendDeleteMarkerRequest: function(marker, markerToDeleteManager) {
                    // Send delete request
                    this.resetErrorState();
                    this.isLoading(true);
                    var self = this;
                    GoNorth.HttpClient.delete("/api/KartaApi/DeleteMapMarker?id=" + this.id() + "&markerId=" + marker.id + "&markerType=" + marker.markerType).done(function(data) {
                        markerToDeleteManager.removeMarker(marker, self.selectedChapter());

                        self.isLoading(false);
                    }).fail(function(xhr) {
                        self.errorOccured(true);
                        self.isLoading(false);

                        // If marker is related to anything that prevents deleting a bad request (400) will be returned
                        if(xhr.status == 400 && xhr.responseText)
                        {
                            self.additionalError(xhr.responseText);
                        }

                        marker.addTo(self.map);
                    });
                },

                /**
                 * Closes the confirm delete dialog
                 */
                closeConfirmDeleteDialog: function() {
                    this.showConfirmDeleteDialog(false);
                    this.markerToDelete = null;
                    this.markerToDeleteManager = null;
                },


                
                /**
                 * Opens the edit export name dialog
                 * 
                 * @param {object} marker Marker to edit the export name for 
                 * @param {function} markerToEditSaveCallback Callback function that will be triggered on save of the export name of the marker, if null the default save will be triggered
                 */
                openEditExportNameDialog: function(marker, markerToEditSaveCallback) {
                    this.showMarkerExportNameDialog(true);
                    this.markerExportName(marker.exportName ? marker.exportName : "");
                    this.markerToEditExportName = marker;
                    this.markerToEditSaveCallback = markerToEditSaveCallback ? markerToEditSaveCallback : null;
                },

                /**
                 * Saves the marker export name
                 */
                saveMarkerExportName: function() {
                    if(!this.markerToEditExportName)
                    {
                        return;
                    }

                    if(this.markerToEditSaveCallback) {
                        this.markerToEditSaveCallback(this.markerExportName());
                        this.closeMarkerExportNameDialog();
                        return;
                    }

                    this.markerToEditExportName.setExportName(this.markerExportName());
                    this.saveMarker(this.markerToEditExportName);

                    this.closeMarkerExportNameDialog();
                },

                /**
                 * Closes the confirm delete dialog
                 */
                closeMarkerExportNameDialog: function() {
                    this.showMarkerExportNameDialog(false);
                    this.markerToEditExportName = null;
                    this.markerToEditSaveCallback = null;
                },


                /**
                 * Saves a new marker
                 * 
                 * @param {object} marker New Marker
                 * @param {object} map Map Object
                 * @param {function} removeFunction Remove Function to remove the object in case of an error
                 */
                saveNewMarker: function(marker, map, removeFunction) {
                    this.isLoading(true);

                    var self = this;
                    GoNorth.HttpClient.get("/api/KartaApi/GetNewMapMarkerId").done(function(id) {
                        marker.setId(id);
                        self.saveMarker(marker);
                    }).fail(function() {
                        marker.removeFrom(map);
                        self.currentValidManager.removeMarker(marker);
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Sets the marker pixel position
                 * 
                 * @param {object} marker Marker
                 * @param {map} map Map
                 * @param {bool} fromAdd true if the position was set during an add, else false
                 */
                setMarkerPixelPosition: function(marker, map, fromAdd) {
                    var pixelPos = map.project(marker.getLatLng(), map.getMaxZoom());
                    if(!this.isNonDefaultChapterSelected() || fromAdd)
                    {
                        marker.setPixelCoords(pixelPos.x, pixelPos.y);
                    }
                    else
                    {
                        marker.setChapterPixelCoords(this.selectedChapter().number, pixelPos.x, pixelPos.y);
                    }
                },

                /**
                 * Saves the new marker position after a marker was dragged
                 * 
                 * @param {object} marker Marker
                 * @param {map} map Map
                 */
                saveNewMarkerPos: function(marker, map) {
                    var oldPosition = map.unproject([ marker.x, marker.y ], map.getMaxZoom());
                    var newPosition = marker.getLatLng();
                    var offsetDiff = { 
                        lat: newPosition.lat - oldPosition.lat,
                        lng: newPosition.lng - oldPosition.lng
                    };
                    this.setMarkerPixelPosition(marker, map, false);
                    marker.moveGeometry(offsetDiff);

                    this.saveMarker(marker);
                },

                /**
                 * Saves a marker
                 * 
                 * @param {object} marker Marker to save
                 */
                saveMarker: function(marker) {
                    if(this.isReadonly())
                    {
                        return;
                    }

                    var request = {};
                    request[marker.serializePropertyName] = marker.serialize(this.map);

                    // Saves the markers
                    this.isLoading(true);
                    var self = this;
                    GoNorth.HttpClient.post("/api/KartaApi/SaveMapMarker?id=" + this.id(), request).done(function(data) {
                        marker.flagAsNotImplemented();
                        self.isLoading(false);
                    }).fail(function(xhr) {
                        self.errorOccured(true);
                        self.isLoading(false);
                    });
                },

                /**
                 * Resets the marker object data
                 */
                resetMarkerObjectData: function() {
                    this.selectedMarkerObjectId("");
                    if(this.currentValidManager)
                    {
                        this.currentValidManager.resetSelectionData();
                    }
                    this.currentValidManager = null;

                    this.dailyRoutineEditor.leaveEditMode();
                },

                /**
                 * Selects an object id which is valid
                 */
                setCurrentObjectId: function(objectId, markerManager) {
                    if(this.isInGeometryEditMode())
                    {
                        this.leaveGeometryEditMode()
                    }

                    this.dailyRoutineEditor.leaveEditMode();

                    this.selectedMarkerObjectId(objectId);
                    if(this.currentValidManager && this.currentValidManager != markerManager)
                    {
                        this.currentValidManager.resetSelectionData();
                    }
                    this.currentValidManager = markerManager;
                },


                /**
                 * Opens the marker name dialog
                 * 
                 * @param {string} existingName Existing name in case of edit
                 * @param {bool} showDescription true if a description field should be shown, else false
                 * @param {string} existingDescription Existing description in case of edit
                 * @param {bool} showColor true if a color field should be shown, else false
                 * @param {string} existingColor Existing color in case of edit
                 * @returns {jQuery.Deferred} Deferred which will be resolve with the name and description if the user saves
                 */
                openMarkerNameDialog: function(existingName, showDescription, existingDescription, showColor, existingColor) {
                    this.showMarkerNameDialog(true);
                    this.dialogMarkerName(existingName ? existingName : "");
                    this.showMarkerNameDialogDescription(showDescription ? true : false);
                    this.dialogMarkerDescription(showDescription && existingDescription ? existingDescription : "");
                    this.showMarkerNameDialogColor(showColor ? true : false);
                    this.dialogMarkerColor(existingColor ? existingColor : "#a9a9a9");
                    this.dialogMarkerNameDef = new jQuery.Deferred();
                    
                    GoNorth.Util.setupValidation("#gn-markerNameForm");

                    return this.dialogMarkerNameDef.promise();
                },

                /**
                 * Saves the marker name
                 */
                saveMarkerName: function() {
                    if(!jQuery("#gn-markerNameForm").valid())
                    {
                        return;
                    }

                    if(this.dialogMarkerNameDef != null)
                    {
                        this.dialogMarkerNameDef.resolve(this.dialogMarkerName(), this.dialogMarkerDescription(), this.dialogMarkerColor());
                        this.dialogMarkerNameDef = null;
                    }

                    this.closeMarkerNameDialog();
                },

                /**
                 * Closes the marker name dialog
                 */
                closeMarkerNameDialog: function() {
                    this.showMarkerNameDialog(false);
                    this.dialogMarkerName("");
                    this.showMarkerNameDialogDescription(false);
                    this.dialogMarkerDescription("");

                    if(this.dialogMarkerNameDef != null)
                    {
                        this.dialogMarkerNameDef.reject();
                        this.dialogMarkerNameDef = null;
                    }
                },


                /**
                 * Inits the edit geometry toolbar
                 * 
                 * @param {object} map Map object
                 */
                initEditGeometryToolbar: function(map) {
                    Map.addColorpickerToDrawToolbar();

                    this.mapGeometryToolbar = new L.Control.Draw({
                        position: 'topleft',
                        draw: {
                            rectangle: {
                                showArea: false,
                                shapeOptions: {
                                    color: defaultGeometryColor
                                }
                            },
                            polyline: {
                                showLength: false,
                                shapeOptions: {
                                    color: defaultGeometryColor
                                }
                            },
                            polygon: {
                                showArea: false,
                                showLength: false,
                                shapeOptions: {
                                    color: defaultGeometryColor
                                }
                            },
                            circle: {
                                showRadius: false,
                                shapeOptions: {
                                    color: defaultGeometryColor
                                }
                            },
                            colorPicker: {
                                availableGeometryColors: this.availableGeometryColors,
                                viewModel: this
                            },
                            circlemarker: false,
                            marker: false
                        },
                        edit: false
                    });

                    var self = this;
                    map.on("layerremove", function(layerEvent) {
                        if(self.geometryEditMarker != null && self.geometryEditMarker.isMarker(layerEvent.layer))
                        {
                            self.leaveGeometryEditMode();
                        }
                    });

                    map.on(L.Draw.Event.CREATED, function (event) {
                        if(!self.geometryEditMarker)
                        {
                            return;
                        }

                        var layer = event.layer;
                        
                        self.isLoading(true);
                        self.resetErrorState();
                        GoNorth.HttpClient.get("/api/KartaApi/GetNewMapMarkerId").done(function(id) {
                            layer.id = id;
                            self.geometryEditMarker.addGeometry(layer);
                            self.geometryEditMarkerManager.addGeometryToLayer(layer);

                            if(!layer.options.editing)
                            {
                                layer.options.editing = {};
                            }
                            layer.editing.enable();
                            layer.on("edit", function() {
                                self.saveMarker(self.geometryEditMarker);
                            });
                            layer.on("click", function() {
                                self.openGeometrySettingsDialog(layer);
                            });
                            jQuery(layer.getElement()).addClass("gn-kartaGeometryEditable");

                            self.saveMarker(self.geometryEditMarker);
                        }).fail(function() {
                            self.isLoading(false);
                            self.errorOccured(true);
                        });
                    });
                },

                /**
                 * Enters the geometry edit mode
                 * 
                 * @param {object} marker Marker for which the geometry is edited
                 * @param {object} markerManager Marker Manager to which the marker belongs
                 */
                enterGeometryEditMode: function(marker, markerManager) {
                    this.resetMarkerObjectData();

                    if(this.geometryEditMarker)
                    {
                        this.geometryEditMarker.setGeometryEditMode(false);
                    }

                    if(!this.isInGeometryEditMode())
                    {
                        this.map.addControl(this.mapGeometryToolbar);
                    }

                    marker.closePopup();
                    this.geometryEditMarker = marker;
                    this.geometryEditMarkerManager = markerManager;
                    this.isInGeometryEditMode(true);

                    var self = this;
                    marker.setGeometryEditMode(true, function() {
                        self.saveMarker(self.geometryEditMarker);
                    }, function(layer) {
                        self.openGeometrySettingsDialog(layer);
                    });
                },

                /**
                 * Leaves the geometry edit mode
                 */
                leaveGeometryEditMode: function() {
                    if(this.isInGeometryEditMode())
                    {
                        this.map.removeControl(this.mapGeometryToolbar);
                    }

                    this.geometryEditMarker.setGeometryEditMode(false);

                    this.geometryEditMarker = null;
                    this.geometryEditMarkerManager = null;
                    this.isInGeometryEditMode(false);
                },

                /**
                 * Opens the geometry settings dialog
                 * 
                 * @param {object} layer Layer to edit
                 */
                openGeometrySettingsDialog: function(layer) {
                    this.showGeometrySettingDialog(true);
                    this.selectedGeometryColor(layer.options.color)
                    this.editGeometry = layer;
                },

                /**
                 * Opens the delete geometry dialog
                 */
                openDeleteGeometryDialog: function() {
                    this.showConfirmGeometryDeleteDialog(true);
                },

                /**
                 * Deletes the geometry
                 */
                deleteGeometry: function() {
                    this.geometryEditMarker.removeGeometry(this.editGeometry, this.map);
                    this.saveMarker(this.geometryEditMarker);
                    this.closeConfirmGeometryDeleteDialog();
                    this.closeMarkerGeometrySettingsDialog();
                },

                /**
                 * Closes the confirm geometry delete dialog
                 */
                closeConfirmGeometryDeleteDialog: function() {
                    this.showConfirmGeometryDeleteDialog(false);
                },

                /**
                 * Saves the marker geometry settings
                 */
                saveMarkerGeometrySettings: function() {
                    this.editGeometry.setStyle({ fillColor: this.selectedGeometryColor(), color: this.selectedGeometryColor() });
                    this.saveMarker(this.geometryEditMarker);
                    this.closeMarkerGeometrySettingsDialog();
                },

                /**
                 * Closes the marker geometry settings dialog
                 */
                closeMarkerGeometrySettingsDialog: function() {
                    this.showGeometrySettingDialog(false);
                    this.editGeometry = null;
                },


                /**
                 * Exports the map
                 */
                exportObject: function() {
                    this.exportObjectDialog.exportObject("/api/KartaApi/ExportMap?id=" + this.id(), "/api/KartaApi/DownloadExportMap?id=" + this.id(), false);
                },


                /**
                 * Acquires a lock
                 */
                acquireLock: function() {
                    GoNorth.LockService.releaseCurrentLock();
                    this.lockedByUser("");
                    this.isReadonly(false);

                    var self = this;
                    GoNorth.LockService.acquireLock("KartaMap", this.id()).done(function(isLocked, lockedUsername) { 
                        if(isLocked)
                        {
                            self.isReadonly(true);
                            self.lockedByUser(lockedUsername);
                            self.resetMarkerObjectData();

                            self.kirjaMarkerManager.disable();
                            self.kortistoMarkerManager.disable();
                            self.styrMarkerManager.disable();
                            self.kartaMarkerManager.disable();
                            self.aikaMarkerManager.disable();
                            self.noteMarkerManager.disable();
                        }
                    }).fail(function() {
                        self.errorOccured(true);
                    });
                }
            };

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));