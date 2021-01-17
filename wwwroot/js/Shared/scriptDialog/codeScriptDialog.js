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