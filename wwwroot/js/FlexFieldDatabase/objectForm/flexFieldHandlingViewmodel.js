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
                this.fieldToEdit = null;
                this.createEditFieldName = new ko.observable("");
                this.createEditFieldAdditionalConfigurationDisabled = new ko.observable(false);
                this.createEditFieldHasAdditionalConfiguration = new ko.observable(false);
                this.createEditFieldAdditionalConfiguration = new ko.observable("");
                this.createEditFieldAdditionalConfigurationLabel = new ko.observable("");
                this.createEditFieldDeferred = null;

                this.showConfirmFieldDeleteDialog = new ko.observable(false);
                this.fieldToDelete = null;
                this.fieldToDeleteParent = null;

                this.showFieldScriptSettingsDialog = new ko.observable(false);
                this.dontExportFieldToScript = new ko.observable();
                this.additionalFieldScriptNames = new ko.observable();
                this.scriptSettingsField = null;

                this.showFieldGroupCreateEditDialog = new ko.observable(false);
                this.fieldGroupToEdit = null;
                this.isEditingFieldGroup = new ko.observable(false);
                this.createEditFieldGroupName = new ko.observable("");
                this.createEditFieldGroupExpandedByDefault = new ko.observable(false);

                this.showDuplicateFieldNameError = new ko.observable(false);

                var self = this;
                this.createEditFieldName.subscribe(function() {
                    self.showDuplicateFieldNameError(false);
                });
                this.createEditFieldGroupName.subscribe(function() {
                    self.showDuplicateFieldNameError(false);
                });
                
                this.showConfirmFieldGroupDeleteDialog = new ko.observable(false);
                this.fieldGroupToDelete = null;
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
                    this.openCreateEditFieldDialog(true, field, field.hasAdditionalConfiguration(), field.getAdditionalConfiguration(), field.getAdditionalConfigurationLabel(), disableAdditionalConfig).done(function(name, additionalConfiguration) {
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
                 * @param {FlexFieldBase} fieldToEdit Field to edit
                 * @param {bool} hasAdditionalConfiguration true if additional configuration is required for the field
                 * @param {string} existingAdditionalConfiguration Existing additional Configuration
                 * @param {string} additionalConfigurationLabel Label for the additional configuration
                 * @param {bool} disableAdditionalConfiguration true if the additional configuration should be disabled, else false
                 * @returns {jQuery.Deferred} Deferred which will be resolved once the user presses save
                 */
                openCreateEditFieldDialog: function(isEdit, fieldToEdit, hasAdditionalConfiguration, existingAdditionalConfiguration, additionalConfigurationLabel, disableAdditionalConfiguration) {
                    this.createEditFieldDeferred = new jQuery.Deferred();

                    this.isEditingField(isEdit);
                    if(fieldToEdit)
                    {
                        this.createEditFieldName(fieldToEdit.name());
                        this.fieldToEdit = fieldToEdit;
                    }
                    else
                    {
                        this.createEditFieldName("");
                        this.fieldToEdit = null;
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

                    // TODO: Check for field edit to ignore current ifeld
                    if(this.fieldManager.isFieldNameInUse(this.createEditFieldName(), this.fieldToEdit))
                    {
                        this.showDuplicateFieldNameError(true);
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
                    this.fieldToEdit = null;
                    this.showFieldCreateEditDialog(false);
                },


                /**
                 * Opens the create new field group dialog
                 */
                openCreateNewFieldGroupDialog: function() {
                    GoNorth.Util.setupValidation("#gn-fieldGroupCreateEditForm");
                    this.showFieldGroupCreateEditDialog(true);
                    this.fieldGroupToEdit = null;
                    this.isEditingFieldGroup(false);
                    this.createEditFieldGroupName("");
                    this.createEditFieldGroupExpandedByDefault(true);
                },

                /**
                 * Opens the edit field group dialog
                 * 
                 * @param {FieldGroup} fieldGroupToEdit Field group to edit
                 */
                openEditFieldGroupDialog: function(fieldGroupToEdit) {
                    GoNorth.Util.setupValidation("#gn-fieldGroupCreateEditForm");
                    this.showFieldGroupCreateEditDialog(true);
                    this.fieldGroupToEdit = fieldGroupToEdit;
                    this.isEditingFieldGroup(true);
                    this.createEditFieldGroupName(fieldGroupToEdit.name());
                    this.createEditFieldGroupExpandedByDefault(fieldGroupToEdit.isExpandedByDefault);
                },

                /**
                 * Saves the field group
                 */
                saveFieldGroup: function() {
                    if(!jQuery("#gn-fieldGroupCreateEditForm").valid())
                    {
                        return;
                    }

                    if(this.fieldManager.isFieldNameInUse(this.createEditFieldGroupName(), this.fieldGroupToEdit))
                    {
                        this.showDuplicateFieldNameError(true);
                        return;
                    }

                    if(this.fieldGroupToEdit == null)
                    {
                        var fieldGroup = this.fieldManager.addFieldGroup(this.createEditFieldGroupName());
                        fieldGroup.isExpandedByDefault = this.createEditFieldGroupExpandedByDefault();
                        fieldGroup.areFieldsExpanded(fieldGroup.isExpandedByDefault);
                    }
                    else
                    {
                        this.fieldGroupToEdit.name(this.createEditFieldGroupName());
                        this.fieldGroupToEdit.isExpandedByDefault = this.createEditFieldGroupExpandedByDefault();
                        this.fieldGroupToEdit.areFieldsExpanded(this.fieldGroupToEdit.isExpandedByDefault);
                    }
                    this.closeFieldGroupDialog();
                },

                /**
                 * Closes the field group dialog
                 */
                closeFieldGroupDialog: function() {
                    this.fieldGroupToEdit = null;
                    this.showFieldGroupCreateEditDialog(false);
                },

                /**
                 * Opens the confirm delete field group dialog
                 * 
                 * @param {FieldGroup} fieldGroup Field group to delete
                 */
                openConfirmDeleteFieldGroupDialog: function(fieldGroup) {
                    this.showConfirmFieldGroupDeleteDialog(true);
                    this.fieldGroupToDelete = fieldGroup;
                },

                /**
                 * Closes the confirm field group delete dialog
                 */
                closeConfirmFieldGroupDeleteDialog: function() {
                    this.showConfirmFieldGroupDeleteDialog(false);
                    this.fieldGroupToDelete = null;
                },

                /**
                 * Deletes the current field group
                 */
                deleteFieldGroup: function() {
                    this.fieldManager.deleteFieldGroup(this.fieldGroupToDelete);
                    this.closeConfirmFieldGroupDeleteDialog();
                },

                /**
                 * Checks if a field drop is allowed
                 * 
                 * @param {object} dropEvent Drop event 
                 */
                checkFieldDropAllowed: function(dropEvent) {
                    if(dropEvent.item.getType() == ObjectForm.FlexFieldGroup && dropEvent.targetParent != this.fieldManager.fields) {
                        dropEvent.cancelDrop = true;
                    }
                },


                /**
                 * Opens the delete field dialog
                 * 
                 * @param {FlexFieldBase} field Field to delete
                 * @param {object} fieldParent Field parent
                 */
                openConfirmDeleteFieldDialog: function(field, fieldParent) {
                    this.showConfirmFieldDeleteDialog(true);
                    this.fieldToDelete = field;
                    this.fieldToDeleteParent = fieldParent;
                },

                /**
                 * Closes the confirm field delete dialog
                 */
                closeConfirmFieldDeleteDialog: function() {
                    this.showConfirmFieldDeleteDialog(false);
                    this.fieldToDelete = null;
                    this.fieldToDeleteParent = null;
                },

                /**
                 * Deletes the field for which the dialog is opened
                 */
                deleteField: function() {
                    if(this.fieldToDeleteParent != null && typeof(this.fieldToDeleteParent.getType) == "function" && this.fieldToDeleteParent.getType() == ObjectForm.FlexFieldGroup)
                    {
                        this.fieldToDeleteParent.deleteField(this.fieldToDelete);
                    }
                    else
                    {
                        this.fieldManager.deleteField(this.fieldToDelete);
                    }

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