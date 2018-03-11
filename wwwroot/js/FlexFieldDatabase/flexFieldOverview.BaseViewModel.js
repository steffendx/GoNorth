(function(GoNorth) {
    "use strict";
    (function(FlexFieldDatabase) {
        (function(Overview) {

            // Page Size
            var pageSize = 48;

            // Row Size
            var rowSize = 6;

            /**
             * Overview Management Base View Model
             * @param {string} apiControllerName Api Controller name
             * @param {string} objectPageUrl Object Page Url
             * @class
             */
            Overview.BaseViewModel = function(apiControllerName, objectPageUrl)
            {
                this.apiControllerName = apiControllerName;
                this.objectPageUrl = objectPageUrl;

                this.availableTemplates = new ko.observableArray();

                this.currentFolderId = new ko.observable("");
                var folderId = GoNorth.Util.getParameterFromHash("folderId");
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
                
                this.currentPage = new ko.observable(0);
                this.displayObjectRows = new ko.observableArray();
                this.hasMore = new ko.observable(false);
                this.isLoading = new ko.observable(false);
                this.prevLoading = new ko.observable(false);
                this.nextLoading = new ko.observable(false);

                this.searchPattern = new ko.observable("");
                this.currentSearchPattern = "";

                this.initializeEmptyValues();

                this.showConfirmDeleteFolderDialog = new ko.observable(false);
                this.deleteFolderError = new ko.observable("");
                this.deleteFolderId = "";

                this.showFolderCreateEditDialog = new ko.observable(false);
                this.createEditFolderName = new ko.observable();
                this.createEditFolderError = new ko.observable();
                this.editFolderId = new ko.observable("");
                
                this.dialogLoading = new ko.observable(false);

                this.errorOccured = new ko.observable(false);

                this.prevLoading(true);
                this.nextLoading(true);
                this.loadPage(true);
                this.loadAvailableTemplates();

                var self = this;
                window.onhashchange = function() {
                    var folderId = GoNorth.Util.getParameterFromHash("folderId");
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
                    self.initializeEmptyValues();
                    self.loadPage(true);
                }
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
                    jQuery.ajax("/api/" + this.apiControllerName + "/FlexFieldTemplates?start=0&pageSize=1000").done(function(data) {
                        self.availableTemplates(data.flexFieldObjects);
                    }).fail(function() {
                        self.errorOccured(true);
                    });
                },

                /**
                 * Loads a page
                 * 
                 * @param {bool} isFirst true if its the first load, else false
                 */
                loadPage: function(isFirst) {
                    var loadingDefs = [];
                    if(!this.currentSearchPattern)
                    {
                        loadingDefs.push(this.loadFolders());
                    }
                    loadingDefs.push(this.loadFlexFieldObjects(isFirst));

                    this.errorOccured(false);
                    var self = this;
                    jQuery.when.apply(jQuery, loadingDefs).done(function() {
                        self.updateDisplay();

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
                    jQuery.ajax("/api/" + this.apiControllerName + "/Folders" + idAppend).done(function(data) {
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
                    jQuery.ajax(url).done(function(data) {
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
                 */
                updateDisplay: function() {
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
                            tileUrl: "#folderId=" + folder.id
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
                                tileUrl: self.objectPageUrl + "#id=" + flexFieldObject.id
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
                 * Navigates a level back up
                 */
                navigateLevelBack: function() {
                    if(this.parentFolderId())
                    {
                        window.location.hash = "#folderId=" + this.parentFolderId();
                    }
                    else
                    {
                        window.location.hash = "";
                    }
                },


                /**
                 * Opens the create folder dialog
                 */
                openCreateFolderDialog: function() {
                    this.showFolderCreateEditDialog(true);
                    this.createEditFolderName("");
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
                    this.resetSharedCreateEditDialog();
                    this.editFolderId(folder.id);
                },

                /**
                 * Resets the shared create / edit folder values
                 */
                resetSharedCreateEditDialog: function() {
                    this.createEditFolderError("");
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
                        parentId: this.currentFolderId()
                    };

                    var url = "/api/" + this.apiControllerName + "/CreateFolder";
                    if(this.editFolderId())
                    {
                        url = "/api/" + this.apiControllerName + "/UpdateFolder?id=" + this.editFolderId();
                    }

                    var self = this;
                    this.dialogLoading(true);
                    jQuery.ajax({ 
                        url: url, 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        data: JSON.stringify(requestFolder), 
                        type: "POST",
                        contentType: "application/json"
                    }).done(function(data) {
                        self.closeCreateEditFolderDialog();
                        self.loadPage();
                    }).fail(function(xhr) {
                        self.dialogLoading(false);
                        self.createEditFolderError(xhr.responseJSON);
                    });
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
                    jQuery.ajax({ 
                        url: "/api/" + this.apiControllerName + "/DeleteFolder?id=" + this.deleteFolderId, 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        type: "DELETE"
                    }).done(function(data) {
                        self.closeConfirmDeleteFolderDialog();
                        self.loadPage();
                    }).fail(function(xhr) {
                        self.dialogLoading(false);
                        self.deleteFolderError(xhr.responseText);
                    });
                },


                /**
                 * Opens a new flex field object form
                 * 
                 * @param {object} template Template for the Flex Field Object
                 */
                openNewFlexFieldObjectForm: function(template) {
                    window.location = this.objectPageUrl + "#templateId=" + template.id + "&folderId=" + this.currentFolderId();
                }
            };

        }(FlexFieldDatabase.Overview = FlexFieldDatabase.Overview || {}));
    }(GoNorth.FlexFieldDatabase = GoNorth.FlexFieldDatabase || {}));
}(window.GoNorth = window.GoNorth || {}));