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