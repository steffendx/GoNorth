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