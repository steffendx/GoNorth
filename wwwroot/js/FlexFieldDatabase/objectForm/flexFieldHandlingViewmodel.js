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
                 * Renames a field
                 * 
                 * @param {IFlexField} field Object Field
                 */
                renameField: function(field) {
                    this.openCreateEditFieldDialog(true, field.name()).done(function(name) {
                        field.name(name);
                    });
                },


                /**
                 * Opens the create/edit field dialog
                 * 
                 * @param {bool} isEdit true if its an edit operation, else false
                 * @param {string} existingName Existing name of the field
                 * @returns {jQuery.Deferred} Deferred which will be resolved once the user presses save
                 */
                openCreateEditFieldDialog: function(isEdit, existingName) {
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
                        this.createEditFieldDeferred.resolve(this.createEditFieldName());
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
                 * @param {IFlexField} field Field to move up
                 */
                moveFieldUp: function(field) {
                    this.fieldManager.moveFieldUp(field);
                },

                /**
                 * Moves a field down
                 * 
                 * @param {IFlexField} field Field to move down
                 */
                moveFieldDown: function(field) {
                    this.fieldManager.moveFieldDown(field);
                },


                /**
                 * Opens the delete field dialog
                 * 
                 * @param {IFlexField} field Field to delete
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
                 * @param {IFlexField} field Field for which the settings should be opened
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