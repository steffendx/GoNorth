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
    (function(Shared) {

        /**
         * Class to trigger a download
         * @class
         */
        Shared.DownloadSubmitter = function()
        {
            this.creationDeferred = null;
        };

        Shared.DownloadSubmitter.prototype = {
            /**
             * Triggers a download
             * @param url Url to download
             * @param paramValues Parameter
             */
            triggerDownload: function(url, paramValues) {
                var antiforgeryHeader = GoNorth.Util.generateAntiForgeryHeader();
                var submitForm = jQuery("<form style='display: none'></form>");
                submitForm.prop("action", url);
                submitForm.prop("method", "POST");

                var antiforgeryHeaderControl = jQuery("<input type='hidden' name='__RequestVerificationToken'/>");
                antiforgeryHeaderControl.val(antiforgeryHeader["RequestVerificationToken"]);
                submitForm.append(antiforgeryHeaderControl);

                for(var curParam in paramValues) 
                {
                    if(!Array.isArray(paramValues[curParam]))
                    {
                        var paramInput = jQuery("<input type='hidden'/>");
                        paramInput.prop("name", curParam);
                        paramInput.val(paramValues[curParam]);
                        submitForm.append(paramInput);
                    }
                    else
                    {
                        var paramArray = paramValues[curParam];
                        for(var curValue = 0; curValue < paramArray.length; ++curValue)
                        {
                            var paramInput = jQuery("<input type='hidden'/>");
                            paramInput.prop("name", curParam + "[]");
                            paramInput.val(paramArray[curValue]);
                            submitForm.append(paramInput);
                        }
                    }
                }
                
                submitForm.appendTo("body");
                submitForm.submit();
                submitForm.remove();
            }
        };

    }(GoNorth.Shared = GoNorth.Shared || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(FlexFieldDatabase) {
        (function(ExportForms) {

            /**
             * Dialog to export values
             * @param {string} apiControllerName Api Controller name
             * @param {ko.observable} currentFolderId Observable for the current folder id
             * @param {ko.observable} currentFolderName Name of the current folder
             * @param {ko.observableArray} availableTemplates Available templates
             * @class
             */
            ExportForms.ValueExportDialog = function(apiControllerName, currentFolderId, currentFolderName, availableTemplates)
            {
                this.apiControllerName = apiControllerName;

                this.currentFolderId = currentFolderId;
                this.currentFolderName = currentFolderName;

                var self = this;
                this.availableTemplates = availableTemplates;
                this.selectedTemplate = new ko.observable(null);
                this.selectedTemplate.subscribe(function() {
                    self.loadTemplateFields();
                });

                this.isVisible = new ko.observable(false);

                this.fields = new ko.observableArray();
                this.selectedFields = new ko.pureComputed(function() {
                    var fields = this.fields();
                    var selectedFields = [];
                    for(var curField = 0; curField < fields.length; ++curField)
                    {
                        if(fields[curField].isSelected()) 
                        {
                            selectedFields.push(fields[curField]);
                        }
                    }
                    return selectedFields;
                }, this);

                this.isLoading = new ko.observable(false);
                this.errorOccured = new ko.observable(false);
            };

            
            ExportForms.ValueExportDialog.prototype = {
                /**
                 * Loads the template fields
                 */
                loadTemplateFields: function() {
                    if(!this.selectedTemplate() || !this.isVisible()) {
                        this.fields([]);
                        return;
                    }

                    var url = "/api/" + this.apiControllerName + "/FlexFieldTemplate?id=" + this.selectedTemplate().id;

                    this.isLoading(true);

                    var self = this;
                    GoNorth.HttpClient.get(url).done(function(data) {
                        self.isLoading(false);

                        var fields = [];
                        for(var curField = 0; curField < data.fields.length; ++curField)
                        {
                            if(data.fields[curField].fieldType == FlexFieldDatabase.ObjectForm.FlexFieldGroup)
                            {
                                continue;
                            }

                            var convertedField = data.fields[curField];
                            convertedField.isSelected = new ko.observable(false);
                            fields.push(convertedField);
                        }
                        
                        self.fields(fields);
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Exports values
                 */
                exportValues: function() {
                    var selectedFields = this.selectedFields();
                    if(!this.selectedTemplate()) {
                        return;
                    }

                    var downloadSubmitter = new GoNorth.Shared.DownloadSubmitter();
                    var selectedFieldNames = [];
                    for(var curField = 0; curField < selectedFields.length; ++curField)
                    {
                        selectedFieldNames.push(selectedFields[curField].name)
                    }
                    downloadSubmitter.triggerDownload("/api/" + this.apiControllerName + "/ExportFieldValues", {
                        SelectedTemplate: this.selectedTemplate().id,
                        SelectedFields: selectedFieldNames,
                        FolderId: this.currentFolderId()
                    });
                },

                /**
                 * Opens the dialog
                 */
                openDialog: function() {
                    this.isLoading(false);
                    this.errorOccured(false);
                    this.isVisible(true);
                    this.loadTemplateFields();
                },

                /**
                 * Closes the dialog
                 */
                closeDialog: function() {
                    this.isVisible(false);
                }
            };

        }(FlexFieldDatabase.ExportForms = FlexFieldDatabase.ExportForms || {}));
    }(GoNorth.FlexFieldDatabase = GoNorth.FlexFieldDatabase || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(FlexFieldDatabase) {
        (function(ExportForms) {

            // Import log pagesize
            var importLogPageSize = 25;

            /**
             * Dialog to import values
             * @param {string} apiControllerName Api Controller name
             * @param {ko.observable} currentFolderId Observable for the current folder id
             * @param {ko.observable} currentFolderName Name of the current folder
             * @class
             */
            ExportForms.ValueImportDialog = function(apiControllerName, currentFolderId, currentFolderName)
            {
                this.apiControllerName = apiControllerName;

                this.currentFolderId = currentFolderId;
                this.currentFolderName = currentFolderName;
                
                this.createPreCheckUrl = new ko.computed(function() {
                    return "/api/" + this.apiControllerName + "/ImportFieldValuesPreCheck";
                }, this); 

                this.preCheckWasRun = new ko.observable(false);
                this.importWasRun = new ko.observable(false);
                this.filename = new ko.observable("");
                this.templateId = new ko.observable("");
                this.columns = new ko.observableArray();
                this.existingRows = new ko.observableArray();
                this.newRows = new ko.observableArray();
                this.importedId = new ko.observable("");
                this.importedExistingRows = new ko.observableArray();
                this.importedNewRows = new ko.observableArray();

                this.showPreviousImportsList = new ko.observable(false);
                this.previousImports = new ko.observableArray();
                this.previousImportsHasMore = new ko.observable(false);
                this.currentImportsListPage = new ko.observable(0);
                this.previousImportsLoading = new ko.observable(false);
                this.previousImportsPrevLoading = new ko.observable(false);
                this.previousImportsNextLoading = new ko.observable(false);
                this.previousImportedId = new ko.observable("");
                this.previousImportedColumns = new ko.observableArray();
                this.previousImportedExistingRows = new ko.observableArray();
                this.previousImportedNewRows = new ko.observableArray();

                this.isVisible = new ko.observable(false);

                this.isLoading = new ko.observable(false);
                this.errorOccured = new ko.observable(false);
                this.additionalErrorMessage = new ko.observable("");
            };

            
            ExportForms.ValueImportDialog.prototype = {
                /**
                 * Gets called if a file is added
                 */
                onValueFileAdded: function() {
                    this.isLoading(true);
                    this.errorOccured(false);
                    this.additionalErrorMessage("");
                },

                /**
                 * Gets called on scucess of the precheck
                 * @param data Result data
                 */
                onPreCheckSuccess: function(data) {
                    this.preCheckWasRun(true);
                    this.filename(data.filename);
                    this.templateId(data.templateId);
                    this.columns(data.columns);
                    this.existingRows(this.addSelectedObservable(data.existingRows));
                    this.newRows(this.addSelectedObservable(data.newRows));

                    this.isLoading(false);
                },

                /**
                 * Adds the selected observables for an array
                 * @param {object[]} rowArray Array with rows to manipulate
                 * @returns Updated array
                 */
                addSelectedObservable: function(rowArray) {
                    for(var curRow = 0; curRow < rowArray.length; ++curRow)
                    {
                        rowArray[curRow] = {
                            isSelected: new ko.observable(true),
                            rowData: rowArray[curRow]
                        };
                    }

                    return rowArray;
                },

                /**
                 * Gets called if an error occures during 
                 * @param err Error data
                 * @param xhr Xhr Object
                 */
                onPreCheckError: function(err, xhr) {
                    this.isLoading(false);
                    this.errorOccured(true);

                    if(xhr && xhr.status == 400 && err && err.value)
                    {
                        this.additionalErrorMessage(err.value);
                    }
                    else
                    {
                        this.additionalErrorMessage("");
                    }
                },

                /**
                 * Runs the import
                 */
                runImport: function() {
                    var requestObject = {
                        filename: this.filename(),
                        templateId: this.templateId(),
                        targetFolderId: this.currentFolderId(),
                        columns: this.columns(),
                        existingRows: this.extractRows(this.existingRows, true),
                        newRows: this.extractRows(this.newRows, true)
                    };
                    
                    this.isLoading(true);
                    this.errorOccured(false);

                    var self = this;
                    GoNorth.HttpClient.post("/api/" + this.apiControllerName + "/ImportFieldValues", requestObject).done(function(data) {
                        self.importWasRun(true);
                        self.isLoading(false);

                        self.importedId(data.id);
                        self.importedExistingRows(self.addSelectedObservable(data.existingRows));
                        self.importedNewRows(self.addSelectedObservable(data.newRows));
                    }).fail(function(xhr) {
                        self.isLoading(false);
                        self.errorOccured(true);

                        if(xhr && xhr.status == 400 && err && err.value)
                        {
                            self.additionalErrorMessage(err.value);
                        }
                        else
                        {
                            self.additionalErrorMessage("");
                        }
                    });
                },

                /**
                 * Extracts the selected rows from an array
                 * @param {ko.observableArray} rowArray Row array
                 * @param {bool} onlySelected true if only selected rows must be returned, else false
                 * @returns {object} Extracted rows
                 */
                extractRows: function(rowArray, onlySelected) {
                    var rows = rowArray();
                    var selectedRows = [];

                    for(var curRow = 0; curRow < rows.length; ++curRow)
                    {
                        if(rows[curRow].isSelected() || !onlySelected)
                        {
                            selectedRows.push(rows[curRow].rowData);
                        }
                    }

                    return selectedRows;
                },

                /**
                 * Exports the results of the import
                 */
                runResultExport: function() {
                    var targetId = this.importedId();
                    if(this.showPreviousImportsList()) {
                        targetId = this.previousImportedId();
                    }

                    window.location = "/api/" + this.apiControllerName + "/ExportFieldValueImportResult?id=" + encodeURIComponent(targetId);
                },

                /**
                 * Stringifies the entries of an array
                 * @param {object[]} arr Array to stringify
                 * @returns {string[]} Stringified array
                 */
                stringifyArray: function(arr) {
                    var result = [];
                    for(var curEntry = 0; curEntry < arr.length; ++curEntry)
                    {
                        result.push(JSON.stringify(arr[curEntry]));
                    }
                    return result;
                },

                /**
                 * Shows previous imports
                 */
                showPreviousImports: function() {
                    this.showPreviousImportsList(true);
                    this.previousImportsPrevLoading(false);
                    this.previousImportsNextLoading(true);
                    this.previousImportedId("");

                    this.loadPreviousImportsPage();
                },

                /**
                 * Loads the previous imports page
                 */
                prevPreviousImportsPage: function() {
                    this.previousImportsPrevLoading(true);
                    this.currentImportsListPage(this.currentImportsListPage() - 1);

                    this.loadPreviousImportsPage();
                },

                /**
                 * Loads the next imports page
                 */
                nextPreviousImportsPage: function() {
                    this.previousImportsNextLoading(true);
                    this.currentImportsListPage(this.currentImportsListPage() + 1);

                    this.loadPreviousImportsPage();
                },

                /**
                 * Loads a page of previous imports
                 */
                loadPreviousImportsPage: function() {
                    this.previousImportsLoading(true);
                    this.errorOccured(false);

                    var self = this;
                    GoNorth.HttpClient.get("/api/" + this.apiControllerName + "/GetFlexFieldValueImportLogs?start=" + (this.currentImportsListPage() * importLogPageSize) + "&pageSize=" + importLogPageSize).done(function(data) {
                        self.previousImportsLoading(false);
                        self.previousImportsPrevLoading(false);
                        self.previousImportsNextLoading(false);

                        self.previousImportsHasMore(data.hasMore);
                        self.previousImports(data.logs);
                    }).fail(function(xhr) {
                        self.previousImportsLoading(false);
                        self.previousImportsPrevLoading(false);
                        self.previousImportsNextLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Shows the log of a previous import
                 * @param {object} importLog Import log
                 */
                showPreviousImportLog: function(importLog) {
                    this.previousImportsLoading(true);
                    this.previousImportsPrevLoading(true);
                    this.previousImportsNextLoading(true);

                    var self = this;
                    GoNorth.HttpClient.get("/api/" + this.apiControllerName + "/GetFlexFieldValueImportLog?id=" + encodeURIComponent(importLog.id)).done(function(data) {
                        self.previousImportsLoading(false);
                        self.previousImportsPrevLoading(false);
                        self.previousImportsNextLoading(false);

                        self.previousImportedId(data.id);
                        self.previousImportedColumns(data.columns);
                        self.previousImportedExistingRows(self.addSelectedObservable(data.existingRows));
                        self.previousImportedNewRows(self.addSelectedObservable(data.newRows));
                    }).fail(function(xhr) {
                        self.previousImportsLoading(false);
                        self.previousImportsPrevLoading(false);
                        self.previousImportsNextLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Shows the import content
                 */
                showImportsContent: function() {
                    this.showPreviousImportsList(false);
                },

                /**
                 * Shows the imports log list
                 */
                showImportsLogList: function() {
                    this.previousImportedId("");
                    this.previousImportedExistingRows.removeAll();
                    this.previousImportedNewRows.removeAll();
                    this.previousImportedColumns.removeAll();
                },
                
                /**
                 * Opens the dialog
                 */
                openDialog: function() {
                    this.preCheckWasRun(false);
                    this.importWasRun(false);
                    this.filename("");
                    this.columns.removeAll();
                    this.existingRows.removeAll();
                    this.newRows.removeAll();
                    this.importedId("");
                    this.importedExistingRows.removeAll();
                    this.importedNewRows.removeAll();
                    this.showPreviousImportsList(false);
                    this.previousImports.removeAll();
                    this.previousImportsHasMore(false);
                    this.currentImportsListPage(0);
                    this.previousImportedId("");
                    this.previousImportedExistingRows.removeAll();
                    this.previousImportedNewRows.removeAll();
                    this.previousImportedColumns.removeAll();
                    this.isLoading(false);
                    this.errorOccured(false);
                    this.isVisible(true);
                },

                /**
                 * Closes the dialog
                 */
                closeDialog: function() {
                    this.isVisible(false);
                }
            };

        }(FlexFieldDatabase.ExportForms = FlexFieldDatabase.ExportForms || {}));
    }(GoNorth.FlexFieldDatabase = GoNorth.FlexFieldDatabase || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(FlexFieldDatabase) {
        (function(Overview) {

            /**
             * Flex Field Folder Tree View Dialog
             * @param {string} apiControllerName Api Controller name
             * @class
             */
            Overview.FlexFieldFolderTreeViewDialog = function(apiControllerName)
            {
                this.apiControllerName = apiControllerName;

                this.isOpen = new ko.observable(false);

                this.moveObjectError = new ko.observable(false);
                this.dialogLoading = new ko.observable(false);

                this.folderToMoveId = new ko.observable("");
                this.rootFolders = new ko.observableArray();
                this.selectedFolderId = new ko.observable("");
                this.hasSelectedFolder = new ko.observable(false);

                this.chooseFolderDeferred = null;
            };

            Overview.FlexFieldFolderTreeViewDialog.prototype = {
                /**
                 * Opens the folder choose dialog
                 * 
                 * @param {string} folderToMoveId Id of the folder to move, null if no folder is being moved
                 * @returns {jQuery.Deferred} Deferred that will be resolved with the id of the selected folder
                 */
                openDialog: function(folderToMoveId) {
                    if(this.chooseFolderDeferred)
                    {
                        this.chooseFolderDeferred.reject();
                    }

                    this.rootFolders.removeAll();
                    this.hasSelectedFolder(false);
                    this.selectedFolderId("");
                    this.folderToMoveId(folderToMoveId);
                    this.loadFolders(null);
                    this.isOpen(true);

                    this.chooseFolderDeferred = new jQuery.Deferred();
                    return this.chooseFolderDeferred.promise();
                },

                /**
                 * Loads the child folders 
                 * @param {object} folder Folder to toggle
                 */
                toggleFolder: function(folder) {
                    if(folder.id == this.folderToMoveId())
                    {
                        folder.hasLoadedChildren(true);
                        return;
                    }

                    folder.isExpanded(!folder.isExpanded());

                    if(!folder.hasLoadedChildren())
                    {
                        folder.hasLoadedChildren(true);
                        this.loadFolders(folder);
                    }
                },

                /**
                 * Loads folders
                 * 
                 * @param {object} parentObject Parent object
                 */
                loadFolders: function(parentObject) {
                    var additionalParameter = "";
                    if(parentObject) 
                    {
                        additionalParameter += "&parentId=" + parentObject.id;
                    }

                    this.moveObjectError(false);
                    if(parentObject)
                    {
                        parentObject.isLoading(true);
                    }
                    else
                    {
                        this.dialogLoading(true);
                    }

                    var self = this;
                    GoNorth.HttpClient.get("/api/" + this.apiControllerName + "/Folders?start=0&pageSize=500" + additionalParameter).done(function(folders) {
                        if(parentObject)
                        {
                            parentObject.isLoading(false);
                        }
                        else
                        {
                            self.dialogLoading(false);
                        }

                        var childObjects = [];
                        for(var curFolder = 0; curFolder < folders.folders.length; ++curFolder)
                        {
                            childObjects.push({
                                id: folders.folders[curFolder].id,
                                name: folders.folders[curFolder].name,
                                isExpanded: new ko.observable(false),
                                isLoading: new ko.observable(false),
                                hasLoadedChildren: new ko.observable(false),
                                children: new ko.observableArray()
                            });
                        }

                        if(parentObject)
                        {
                            parentObject.children(childObjects);
                        }
                        else
                        {
                            self.rootFolders(childObjects);
                        }
                    }).fail(function() {
                        self.moveObjectError(true);
                        if(parentObject)
                        {
                            parentObject.isLoading(false);
                        }
                        else
                        {
                            self.dialogLoading(false);
                        }
                    });
                },

                /**
                 * Selects a folder to move the object to
                 * @param {object} folder Selected folder
                 */
                selectFolder: function(folder) {
                    if(this.folderToMoveId() && folder.id == this.folderToMoveId())
                    {
                        return;
                    }

                    this.selectedFolderId(folder.id);
                    this.hasSelectedFolder(true);
                },

                /**
                 * Moves the selected object
                 */
                moveObject: function() {
                    if(this.chooseFolderDeferred)
                    {
                        this.chooseFolderDeferred.resolve(this.selectedFolderId());
                        this.chooseFolderDeferred = null;
                    }

                    this.isOpen(false);
                },

                /**
                 * Cancels the dialog
                 */
                cancelDialog: function() {
                    this.isOpen(false);

                    if(this.chooseFolderDeferred)
                    {
                        this.chooseFolderDeferred.reject();
                        this.chooseFolderDeferred = null;
                    }
                }
            };

        }(FlexFieldDatabase.Overview = FlexFieldDatabase.Overview || {}));
    }(GoNorth.FlexFieldDatabase = GoNorth.FlexFieldDatabase || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(FlexFieldDatabase) {
        (function(Overview) {

            // Page Size
            var pageSize = 48;

            /**
             * Overview Management Base View Model
             * @param {string} apiControllerName Api Controller name
             * @param {string} objectPageUrl Object Page Url
             * @class
             */
            Overview.BaseViewModel = function(apiControllerName, objectPageUrl)
            {
                var currentPage = 0;
                var pageFromUrl = parseInt(GoNorth.Util.getParameterFromUrl("page"));
                if(!isNaN(pageFromUrl))
                {
                    currentPage = pageFromUrl;
                }

                this.apiControllerName = apiControllerName;
                this.objectPageUrl = objectPageUrl;

                this.availableTemplates = new ko.observableArray();

                this.currentFolderId = new ko.observable("");
                var folderId = GoNorth.Util.getParameterFromUrl("folderId");
                if(folderId)
                {
                    this.currentFolderId(folderId);
                }
                this.parentFolderId = new ko.observable("");
                this.currentFolderName = new ko.observable("");
                this.currentFolderNameDisplay = new ko.computed(function() {
                    var folderName = this.currentFolderName();
                    if(folderName)
                    {
                        return " - " + folderName;
                    }

                    return "";
                }, this);
                
                this.currentPage = new ko.observable(currentPage);
                this.displayObjectRows = new ko.observableArray();
                this.hasMore = new ko.observable(false);
                this.isLoading = new ko.observable(false);
                this.prevLoading = new ko.observable(false);
                this.nextLoading = new ko.observable(false);

                var searchTermToUse = "";
                var searchTermFromUrl = GoNorth.Util.getParameterFromUrl("searchTerm");
                if(searchTermFromUrl)
                {
                    searchTermToUse = searchTermFromUrl;
                }
                this.searchPattern = new ko.observable(searchTermToUse);
                this.currentSearchPattern = searchTermToUse;

                this.initializeEmptyValues();

                var folderPageFromUrl = parseInt(GoNorth.Util.getParameterFromUrl("folderPage"));
                if(!isNaN(folderPageFromUrl))
                {
                    this.folderPage = folderPageFromUrl;
                }

                var objectPageFromUrl = parseInt(GoNorth.Util.getParameterFromUrl("objectPage"));
                if(!isNaN(objectPageFromUrl))
                {
                    this.flexFieldObjectPage = objectPageFromUrl;
                }

                var objectStartPageSizeFromUrl = parseInt(GoNorth.Util.getParameterFromUrl("objectStartPageSize"));
                if(!isNaN(objectStartPageSizeFromUrl))
                {
                    this.flexFieldObjectStartPageSize = objectStartPageSizeFromUrl;
                }

                if(parseInt(GoNorth.Util.getParameterFromUrl("useStartPageSize")) == 1)
                {
                    this.useFlexFieldObjectStartPageSize = true;
                }

                this.showConfirmDeleteFolderDialog = new ko.observable(false);
                this.deleteFolderError = new ko.observable("");
                this.deleteFolderId = "";

                this.showFolderCreateEditDialog = new ko.observable(false);
                this.createEditFolderName = new ko.observable();
                this.createEditFolderDescription = new ko.observable();
                this.createEditFolderError = new ko.observable();
                this.editFolderId = new ko.observable("");
                this.hasFolderImageInQueue = new ko.observable(false);
                this.editFolderImageId = new ko.observable("");
                this.createEditFolderUrl = new ko.computed(function() {
                    return "/api/" + this.apiControllerName + "/UploadFolderImage?id=" + this.editFolderImageId();
                }, this); 
                this.clearFolderFiles = null;
                this.processFolderQueue = null;

                this.isDraggingObject = new ko.observable(false);
                this.flexFieldFolderTreeViewDialog = new Overview.FlexFieldFolderTreeViewDialog(apiControllerName);

                this.exportValueDialog = new FlexFieldDatabase.ExportForms.ValueExportDialog(apiControllerName, this.currentFolderId, this.currentFolderName, this.availableTemplates);
                this.importValueDialog = new FlexFieldDatabase.ExportForms.ValueImportDialog(apiControllerName, this.currentFolderId, this.currentFolderName);
                
                this.dialogLoading = new ko.observable(false);

                this.errorOccured = new ko.observable(false);

                this.currentDisplayRowSize = -1;

                this.prevLoading(true);
                this.nextLoading(true);
                this.loadPage(true);
                this.loadAvailableTemplates();

                var self = this;
                GoNorth.Util.onUrlParameterChanged(function() {
                    var folderId = GoNorth.Util.getParameterFromUrl("folderId");
                    if(folderId == self.currentFolderId())
                    {
                        return;
                    }

                    if(folderId)
                    {
                        self.currentFolderId(folderId);
                    }
                    else
                    {
                        self.currentFolderId("");
                    }

                    self.showAllLoading();
                    self.currentPage(0);
                    self.initializeEmptyValues();
                    self.loadPage(true);
                });

                var throttledUpdatedDisplay = GoNorth.Util.throttle(function() {
                    self.updateDisplay(true);
                }, 20);
                jQuery(window).resize(throttledUpdatedDisplay);
            };

            Overview.BaseViewModel.prototype = {
                /**
                 * Initializes empty values
                 */
                initializeEmptyValues: function() {
                    this.folders = [];
                    this.hasMoreFolders = false;
                    this.folderPage = 0;
    
                    this.flexFieldObjects = [];
                    this.hasMoreFlexFieldObjects = false;
                    this.flexFieldObjectPage = 0;
                    this.flexFieldObjectStartPageSize = 0;
                    this.useFlexFieldObjectStartPageSize = false;
                },

                /**
                 * Resets the loading state
                 */
                resetLoading: function() {
                    this.isLoading(false);
                    this.prevLoading(false);
                    this.nextLoading(false);
                },

                /**
                 * Sets the loading state to loading all
                 */
                showAllLoading: function() {
                    this.isLoading(true);
                    this.prevLoading(true);
                    this.nextLoading(true);
                },

                /**
                 * Loads the available templates
                 */
                loadAvailableTemplates: function() {
                    var self = this;
                    GoNorth.HttpClient.get("/api/" + this.apiControllerName + "/FlexFieldTemplates?start=0&pageSize=1000").done(function(data) {
                        self.availableTemplates(data.flexFieldObjects);
                    }).fail(function() {
                        self.errorOccured(true);
                    });
                },

                /**
                 * Saves paging information
                 */
                savePagingInformation: function() {
                    var urlParameters = "?" + this.buildUrlParameters(false);
                    window.history.replaceState(urlParameters, null, urlParameters)
                },

                /**
                 * Loads a page
                 * 
                 * @param {bool} isFirst true if its the first load, else false
                 */
                loadPage: function(isFirst) {
                    this.savePagingInformation();

                    var loadingDefs = [];
                    if(!this.currentSearchPattern)
                    {
                        loadingDefs.push(this.loadFolders());
                    }
                    loadingDefs.push(this.loadFlexFieldObjects(isFirst));

                    this.errorOccured(false);
                    var self = this;
                    jQuery.when.apply(jQuery, loadingDefs).done(function() {
                        self.updateDisplay(false);

                        self.resetLoading();
                    }).fail(function() {
                        self.errorOccured(true);
                        self.resetLoading();
                    });
                },

                /**
                 * Loads folders
                 * 
                 * @returns {jQuery.Deferred} Deferred for the loading process
                 */
                loadFolders: function() {
                    var deferred = new jQuery.Deferred();
                    if(this.folderPage < this.currentPage())
                    {
                        this.folders = [];
                        deferred.resolve();
                        return deferred.promise();
                    }

                    var idAppend = "?start=" + (this.currentPage() * pageSize) + "&pageSize=" + pageSize;
                    if(this.currentFolderId()) 
                    {
                        idAppend += "&parentId=" + this.currentFolderId();
                    }

                    var self = this;
                    GoNorth.HttpClient.get("/api/" + this.apiControllerName + "/Folders" + idAppend).done(function(data) {
                        self.parentFolderId(data.parentId);
                        self.currentFolderName(data.folderName);
                        self.folders = data.folders;
                        self.hasMoreFolders = data.hasMore;
                        deferred.resolve();
                    }).fail(function() {
                        deferred.reject();
                    });

                    return deferred.promise();
                },

                /**
                 * Loads flex field objects
                 * 
                 * @param {bool} isFirst true if its the first load, else false
                 * @returns {jQuery.Deferred} Deferred for the loading process
                 */
                loadFlexFieldObjects: function(isFirst) {
                    var deferred = new jQuery.Deferred();
                    if(!isFirst && this.hasMoreFolders)
                    {
                        deferred.resolve();
                        return deferred.promise();
                    }

                    var pageIndex = this.flexFieldObjectPage * pageSize;
                    if(this.useFlexFieldObjectStartPageSize)
                    {
                        pageIndex += this.flexFieldObjectStartPageSize;
                    }
                    var idAppend = "?start=" + pageIndex + "&pageSize=" + pageSize;
                    if(this.currentFolderId()) 
                    {
                        idAppend += "&parentId=" + this.currentFolderId();
                    }

                    var url = "/api/" + this.apiControllerName + "/FlexFieldObjects" + idAppend;
                    if(this.currentSearchPattern)
                    {
                        url = "/api/" + this.apiControllerName + "/SearchFlexFieldObjects?searchPattern=" + this.currentSearchPattern + "&start=" + this.currentPage() + "&pageSize=" + pageSize;
                    }

                    var self = this;
                    GoNorth.HttpClient.get(url).done(function(data) {
                        self.flexFieldObjects = data.flexFieldObjects;
                        self.hasMoreFlexFieldObjects = data.hasMore;
                        deferred.resolve();
                    }).fail(function() {
                        deferred.reject();
                    });

                    return deferred.promise();
                },

                /**
                 * Searches for Flex Field Objects
                 */
                searchFlexFieldObjects: function() {
                    this.currentSearchPattern = this.searchPattern();
                    this.currentPage(0);
                    this.initializeEmptyValues();

                    this.showAllLoading();
                    this.loadPage();
                },             

                /**
                 * Updates the display
                 * @param {boolean} isFromResize true if the update is triggered from a resize event
                 */
                updateDisplay: function(isFromResize) {
                    var rowSize = 6;
                    if(GoNorth.Util.isBootstrapMd())
                    {
                        rowSize = 4;
                    }

                    if(isFromResize && rowSize == this.currentDisplayRowSize)
                    {
                        return;
                    }
                    this.currentDisplayRowSize = rowSize;
                    
                    var self = this;
                    var finalResult = [];
                    var curRow = [];
                    finalResult.push(curRow);
                    jQuery.each(this.folders, function(index, folder) {
                        curRow.push({
                            template: "gn-folderTemplate",
                            id: folder.id,
                            parentId: folder.parentFolderId,
                            name: folder.name,
                            description: folder.description,
                            imageFile: folder.imageFile,
                            thumbnailImage: folder.thumbnailImageFile ? folder.thumbnailImageFile : folder.imageFile,
                            tileUrl: window.location.pathname + "?folderId=" + folder.id,
                            isFolder: true
                        });

                        if(curRow.length >= rowSize)
                        {
                            curRow = [];
                            finalResult.push(curRow);
                        }
                    });

                    var objectsLeft = false;
                    if(!this.hasMoreFolders && this.folders.length < pageSize)
                    {
                        jQuery.each(this.flexFieldObjects, function(index, flexFieldObject) {
                            if(index + self.folders.length >= pageSize)
                            {
                                objectsLeft = true;
                                return false;
                            }

                            curRow.push({
                                template: "gn-flexFieldObjectTemplate",
                                id: flexFieldObject.id,
                                parentId: flexFieldObject.parentFolderId,
                                name: flexFieldObject.name,
                                imageFile: flexFieldObject.imageFile,
                                thumbnailImage: flexFieldObject.thumbnailImageFile ? flexFieldObject.thumbnailImageFile : flexFieldObject.imageFile,
                                tileUrl: self.objectPageUrl + "?id=" + flexFieldObject.id,
                                isFolder: false
                            });
    
                            if(curRow.length >= rowSize)
                            {
                                curRow = [];
                                finalResult.push(curRow);
                            }
                        });

                        if(this.folders.length > 0)
                        {
                            this.flexFieldObjectStartPageSize = pageSize - this.folders.length;
                        }
                    }
                    
                    this.hasMore(this.hasMoreFolders || this.hasMoreFlexFieldObjects || (this.folders.length >= pageSize && this.flexFieldObjects.length > 0) || objectsLeft);

                    this.displayObjectRows(finalResult)
                },

                /**
                 * Loads the previous page
                 */
                prevPage: function() {
                    this.currentPage(this.currentPage() - 1);
                    if(this.folderPage > this.currentPage())
                    {
                        this.folderPage = this.currentPage();
                        this.flexFieldObjectPage = 0;
                    }
                    else
                    {
                        this.calcFlexFieldObjectPage();
                    }

                    this.prevLoading(true);

                    this.loadPage();
                },

                /**
                 * Loads the next page
                 */
                nextPage: function() {
                    this.currentPage(this.currentPage() + 1);
                    if(this.hasMoreFolders)
                    {
                        this.folderPage = this.currentPage();
                    }
                    else
                    {
                        this.calcFlexFieldObjectPage();
                    }

                    this.nextLoading(true);

                    this.loadPage();
                },

                /**
                 * Calculates the flex field objcet page
                 */
                calcFlexFieldObjectPage: function() {
                    this.flexFieldObjectPage = this.currentPage() - this.folderPage - 1;
                    if(this.flexFieldObjectPage < 0)
                    {
                        this.flexFieldObjectPage = 0;
                        this.useFlexFieldObjectStartPageSize = false;
                    }
                    else
                    {
                        this.useFlexFieldObjectStartPageSize = true;
                    }
                },

                /**
                 * Builds the url parameters
                 * 
                 * @param {bool} useParentId true if the parent id should be used, false if the current folder id should be used
                 * @returns {string} Url Parameters
                 */
                buildUrlParameters: function(useParentId) {
                    var urlParameters = "";
                    if(!useParentId && this.currentFolderId())
                    {
                        urlParameters = "folderId=" + this.currentFolderId() + "&";
                    }
                    else if(useParentId && this.parentFolderId())
                    {
                        urlParameters = "folderId=" + this.parentFolderId() + "&";
                    }

                    urlParameters += "page=" + this.currentPage() + "&folderPage=" + this.folderPage + "&objectPage=" + this.flexFieldObjectPage + "&objectStartPageSize=" + this.flexFieldObjectStartPageSize + "&useStartPageSize=" + (this.useFlexFieldObjectStartPageSize ? 1 : 0);
                    if(this.currentSearchPattern)
                    {
                        urlParameters += "&searchTerm=" + encodeURIComponent(this.currentSearchPattern);
                    }

                    return urlParameters;
                },

                /**
                 * Navigates a level back up
                 */
                navigateLevelBack: function() {
                    GoNorth.Util.setUrlParameters(this.buildUrlParameters(true));
                },


                /**
                 * Opens a folder image
                 * @param {string} imageUrl Image Url to open
                 */
                openFolderImage: function(imageUrl) {
                    window.open(imageUrl);
                },


                /**
                 * Opens the create folder dialog
                 */
                openCreateFolderDialog: function() {
                    this.showFolderCreateEditDialog(true);
                    this.createEditFolderName("");
                    this.createEditFolderDescription("");
                    this.resetSharedCreateEditDialog();
                    this.editFolderId("");
                },

                /**
                 * Opens the edit folder dialog
                 * 
                 * @param {object} folder Folder to edit
                 */
                openEditFolderDialog: function(folder) {
                    this.showFolderCreateEditDialog(true);
                    this.createEditFolderName(folder.name);
                    this.createEditFolderDescription(folder.description ? folder.description : "");
                    this.resetSharedCreateEditDialog();
                    this.editFolderId(folder.id);
                },

                /**
                 * Resets the shared create / edit folder values
                 */
                resetSharedCreateEditDialog: function() {
                    this.editFolderImageId("");
                    this.createEditFolderError("");
                    this.clearFolderFiles();
                    this.hasFolderImageInQueue(false);
                    this.dialogLoading(false);
                    GoNorth.Util.setupValidation("#gn-folderCreateEditForm");
                },

                /**
                 * Closes the create/edit folder
                 */
                closeCreateEditFolderDialog: function() {
                    this.showFolderCreateEditDialog(false);
                    this.dialogLoading(false);
                },

                /**
                 * Receives the dropzone trigger functions
                 * 
                 * @param {function} clearFiles Clears all files from the dropzone if triggered
                 * @param {function} processQueue Processes the queue when triggered
                 */
                receiveDropzoneTriggers: function(clearFiles, processQueue) {
                    this.clearFolderFiles = clearFiles;
                    this.processFolderQueue = processQueue;
                },

                /**
                 * Function is triggered after a folder image is added
                 */
                folderImageAdded: function() {
                    this.hasFolderImageInQueue(true);
                },

                /**
                 * Saves the folder
                 */
                saveFolder: function() {
                    if(!jQuery("#gn-folderCreateEditForm").valid())
                    {
                        return;
                    }

                     // Send data
                     var requestFolder = {
                        name: this.createEditFolderName(),
                        description: this.createEditFolderDescription(),
                        parentId: this.currentFolderId()
                    };

                    var url = "/api/" + this.apiControllerName + "/CreateFolder";
                    if(this.editFolderId())
                    {
                        url = "/api/" + this.apiControllerName + "/UpdateFolder?id=" + this.editFolderId();
                    }

                    var self = this;
                    this.dialogLoading(true);
                    GoNorth.HttpClient.post(url, requestFolder).done(function(folderId) {
                        if(self.hasFolderImageInQueue())
                        {
                            self.editFolderImageId(folderId);
                            self.processFolderQueue();
                        }
                        else
                        {
                            self.folderSuccess();
                        }
                    }).fail(function(xhr) {
                        self.folderError(xhr);
                    });
                },

                /**
                 * Handles a folder create success
                 */
                folderSuccess: function() {
                    this.closeCreateEditFolderDialog();
                    this.loadPage();
                },

                /**
                 * Handles a folder create error
                 * 
                 * @param {object} xhr The xhr object for reading error messages
                 */
                folderError: function(xhr) {
                    this.dialogLoading(false);
                    this.createEditFolderError(xhr.responseJSON);
                },

                /**
                 * Opens the delete dialog for a folder
                 * 
                 * @param {object} folder Folder to delete
                 */
                openDeleteFolderDialog: function(folder) {
                    this.showConfirmDeleteFolderDialog(true);
                    this.deleteFolderError("");
                    this.dialogLoading(false);
                    this.deleteFolderId = folder.id;
                },

                /**
                 * Closes the delete folder dialog for a folder
                 */
                closeConfirmDeleteFolderDialog: function() {
                    this.showConfirmDeleteFolderDialog(false);
                    this.dialogLoading(false);
                    this.deleteFolderId = "";
                },

                /**
                 * Deletes the folder for which the dialog is opened
                 */
                deleteFolder: function() {
                    var self = this;
                    this.dialogLoading(true);
                    GoNorth.HttpClient.delete("/api/" + this.apiControllerName + "/DeleteFolder?id=" + this.deleteFolderId).done(function(data) {
                        self.closeConfirmDeleteFolderDialog();
                        self.loadPage();
                    }).fail(function(xhr) {
                        self.dialogLoading(false);
                        self.deleteFolderError(xhr.responseText);
                    });
                },


                /**
                 * Gets called when the user starts dragging an object
                 * @param {object} ui UI object
                 */
                onStartDragObject: function(ui) {
                    this.errorOccured(false);
                    this.isDraggingObject(true);

                    ui.helper.bind("click.prevent", function(event) { event.preventDefault(); });
                },

                /**
                 * Gets called when the user stops dragging an object
                 * @param {object} ui UI object
                 */
                onStopDragObject: function(ui) {
                    this.isDraggingObject(false);

                    setTimeout(function() { ui.helper.unbind("click.prevent"); }, 300);
                },

                /**
                 * Moves an object to a new category
                 * @param {object} objectToMove Object to move
                 * @param {object} newTargetId Id of the new category
                 */
                moveObjectToCategory: function(objectToMove, newTargetId) {
                    var apiMethod = "MoveObjectToFolder";
                    if(objectToMove.isFolder)
                    {
                        apiMethod = "MoveFolderToFolder";
                    }

                    if(!newTargetId)
                    {
                        newTargetId = "";
                    }

                    var self = this;
                    this.errorOccured(false);
                    this.showAllLoading();
                    GoNorth.HttpClient.post("/api/" + this.apiControllerName + "/" + apiMethod + "?id=" + objectToMove.id + "&newParentId=" + newTargetId, {}).done(function() {
                        self.loadPage();
                    }).fail(function(xhr) {
                        self.errorOccured(true);
                        self.deleteFolderError(xhr.responseText);
                    });
                },

                /**
                 * Opens the move object to category dialog
                 * @param {object} objectToMove The object to move
                 */
                openMoveObjectToCategoryDialog: function(objectToMove) {
                    var self = this;
                    this.flexFieldFolderTreeViewDialog.openDialog(objectToMove.isFolder ? objectToMove.id : null).done(function(targetFolderId) {
                        self.moveObjectToCategory(objectToMove, targetFolderId);
                    });
                },


                /**
                 * Opens the export value dialog
                 */
                openExportValueDialog: function() {
                    this.exportValueDialog.openDialog();
                },

                /**
                 * Opens the import value dialog
                 */
                openImportValueDialog: function() {
                    this.importValueDialog.openDialog();
                },


                /**
                 * Opens a new flex field object form
                 * 
                 * @param {object} template Template for the Flex Field Object
                 */
                openNewFlexFieldObjectForm: function(template) {
                    window.location = this.objectPageUrl + "?templateId=" + template.id + "&folderId=" + this.currentFolderId();
                }
            };

        }(FlexFieldDatabase.Overview = FlexFieldDatabase.Overview || {}));
    }(GoNorth.FlexFieldDatabase = GoNorth.FlexFieldDatabase || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Kortisto) {
        (function(Overview) {

            /**
             * Overview Management View Model
             * @class
             */
            Overview.ViewModel = function()
            {
                GoNorth.FlexFieldDatabase.Overview.BaseViewModel.apply(this, [ "KortistoApi", "/Kortisto/Npc" ]);
            };

            Overview.ViewModel.prototype = jQuery.extend({ }, GoNorth.FlexFieldDatabase.Overview.BaseViewModel.prototype);

        }(Kortisto.Overview = Kortisto.Overview || {}));
    }(GoNorth.Kortisto = GoNorth.Kortisto || {}));
}(window.GoNorth = window.GoNorth || {}));