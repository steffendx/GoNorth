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
                    jQuery.ajax({ 
                        url: url, 
                        type: "GET"
                    }).done(function(data) {
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