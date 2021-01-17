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