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