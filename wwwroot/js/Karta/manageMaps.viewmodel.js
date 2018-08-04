(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(ManageMaps) {

            /**
             * Manage Maps View Model
             * @class
             */
            ManageMaps.ViewModel = function()
            {
                this.maps = new ko.observableArray();

                this.errorOccured = new ko.observable(false);

                this.showMapCreateEditDialog = new ko.observable(false);
                this.hasMapImageInQueue = new ko.observable(false);
                this.createEditName = new ko.observable("");
                this.createEditDialogError = new ko.observable();
                this.mapImageIsMissing = new ko.observable(false);
                this.dialogLoading = new ko.observable(false);
                this.editMapId = new ko.observable("");
                this.clearMapFiles = null;
                this.processMapQueue = null;

                this.createEditUrl = new ko.computed(function() {
                    var mapId = this.editMapId();
                    var mapName = this.createEditName();
                    if(mapId) {
                        return "/api/KartaApi/UpdateMap?id=" + mapId + "&name=" + encodeURIComponent(mapName);
                    }
                    return "/api/KartaApi/CreateMap?name=" + encodeURIComponent(mapName);
                }, this);

                this.showConfirmDeleteDialog = new ko.observable(false);
                this.deleteError = new ko.observable("");
                this.deleteMapId = "";

                this.loadMaps();
            };

            ManageMaps.ViewModel.prototype = {
                /**
                 * Loads the maps
                 */
                loadMaps: function() {
                    this.errorOccured(false);
                    var self = this;
                    jQuery.ajax({
                        url: "/api/KartaApi/Maps"
                    }).done(function(maps) {
                        self.maps(maps);
                    }).fail(function() {
                       self.errorOccured(true); 
                    });
                },

                /**
                 * Receives the dropzone trigger functions
                 * 
                 * @param {function} clearFiles Clears all files from the dropzone if triggered
                 * @param {function} processQueue Processes the queue when triggered
                 */
                receiveDropzoneTriggers: function(clearFiles, processQueue) {
                    this.clearMapFiles = clearFiles;
                    this.processMapQueue = processQueue;
                },

                /**
                 * Function is triggered after a map image is added
                 */
                mapImageAdded: function() {
                    this.hasMapImageInQueue(true);
                    this.mapImageIsMissing(false);
                },

                /**
                 * Opens the create map dialog
                 */
                openCreateMapDialog: function() {
                    this.showMapCreateEditDialog(true);
                    this.editMapId("");
                    this.createEditName("");
                    this.resetSharedMapDialogValues();
                },

                /**
                 * Opens the edit map dialog
                 * 
                 * @param {object} map Map to edit
                 */
                openEditMapDialog: function(map) {
                    this.showMapCreateEditDialog(true);
                    this.editMapId(map.id);
                    this.createEditName(map.name);
                    this.resetSharedMapDialogValues();
                },

                /**
                 * Resets the shared map dialog values
                 */
                resetSharedMapDialogValues: function() {
                    this.createEditDialogError("");
                    this.clearMapFiles();
                    this.hasMapImageInQueue(false);
                    this.mapImageIsMissing(false);
                    GoNorth.Util.setupValidation("#gn-mapCreateEditForm");
                },

                /**
                 * Closes the create/edit map dialog
                 */
                closeCreateEditMapDialog: function() {
                    this.showMapCreateEditDialog(false);
                },

                /**
                 * Saves the map
                 */
                saveMap: function() {
                    var imageMissing = false;
                    if(!this.hasMapImageInQueue() && !this.editMapId())
                    {
                        this.mapImageIsMissing(true);
                        imageMissing = true;
                    }

                    if(!jQuery("#gn-mapCreateEditForm").valid() || imageMissing)
                    {
                        return;
                    }

                    // Send Data
                    this.dialogLoading(true);
                    if(!this.editMapId() || this.hasMapImageInQueue())
                    {
                        this.processMapQueue();
                    }
                    else
                    {
                        this.renameMap();
                    }
                },

                /**
                 * Function gets called if the map was created/updated successfully
                 */
                mapSaveSuccess: function() {
                    this.loadMaps();
                    this.dialogLoading(false);
                    this.closeCreateEditMapDialog();
                },

                /**
                 * Function gets called if an error occured during creating/updating the map
                 * 
                 * @param {string} errorMessage Error Message
                 * @param {object} xhr Xhr Object
                 */
                mapSaveError: function(errorMessage, xhr) {
                    this.dialogLoading(false);
                    if(xhr && xhr.responseText)
                    {
                        this.createEditDialogError(xhr.responseText);
                    }
                    else
                    {
                        this.createEditDialogError(errorMessage);
                    }
                },

                /**
                 * Renames the edit map
                 */
                renameMap: function() {
                    this.dialogLoading(true);
                    var self = this;
                    jQuery.ajax({ 
                        url: "/api/KartaApi/RenameMap?id=" + this.editMapId() + "&name=" + encodeURIComponent(this.createEditName()), 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        type: "POST"
                    }).done(function(data) {
                        self.closeCreateEditMapDialog();
                        self.dialogLoading(false);
                        self.loadMaps();
                    }).fail(function(xhr) {
                        self.dialogLoading(false);
                        self.deleteError(xhr.responseText);
                    });
                },


                /**
                 * Builds the url for a map
                 * 
                 * @param {object} map Map to build the url for
                 * @returns {string} Url for the map
                 */
                buildMapUrl: function(map) {
                    return "/Karta?id=" + map.id;
                },


                /**
                 * Opens the map delete dialog
                 * 
                 * @param {object} map Map which should be deleted
                 */
                openDeleteMapDialog: function(map)
                {
                    this.showConfirmDeleteDialog(true);
                    this.deleteError("");
                    this.deleteMapId = map.id;
                },

                /**
                 * Deletes the map for which the confirm delete dialog is opened
                 */
                deleteMap: function() {
                    var self = this;
                    this.dialogLoading(true);
                    jQuery.ajax({ 
                        url: "/api/KartaApi/DeleteMap?id=" + this.deleteMapId, 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        type: "DELETE"
                    }).done(function(data) {
                        self.closeConfirmDeleteDialog();
                        self.dialogLoading(false);
                        self.loadMaps();
                    }).fail(function(xhr) {
                        self.dialogLoading(false);
                        self.deleteError(xhr.responseText);
                    });
                },

                /**
                 * Closes the confirm delete dialog
                 */
                closeConfirmDeleteDialog: function() {
                    this.showConfirmDeleteDialog(false);
                }
            };

        }(Karta.ManageMaps = Karta.ManageMaps || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));