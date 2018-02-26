(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /**
             * Map View Model
             * @class
             */
            Map.ViewModel = function()
            {
                this.id = new ko.observable("");
                this.preSelectType = GoNorth.Util.getParameterFromHash("preSelectType");
                this.preSelectId = GoNorth.Util.getParameterFromHash("preSelectId");
                this.zoomOnMarkerType = GoNorth.Util.getParameterFromHash("zoomOnMarkerType");
                this.zoomOnMarkerId = GoNorth.Util.getParameterFromHash("zoomOnMarkerId");
                var paramId = GoNorth.Util.getParameterFromHash("id");
                if(paramId)
                {
                    this.setId(paramId);
                }
                
                this.isLoading = new ko.observable(false);
                this.isReadonly = new ko.observable(false);
                this.showWaitOnPageDialog = new ko.observable(false);
                this.lockedByUser = new ko.observable("");

                this.map = null;

                this.currentMapName = new ko.observable(Karta.Map.Localization.Karta);
                this.mapUrlTemplate = new ko.computed(function() {
                    return "/api/KartaApi/MapImage?mapId=" + encodeURIComponent(this.id()) + "&z={z}&x={x}&y={y}&maxZoom={maxZoom}&maxTileCountX={maxTileCountX}&maxTileCountY={maxTileCountY}"
                }, this);
                this.mapMaxZoom = new ko.observable();
                this.mapImageWidth = new ko.observable();
                this.mapImageHeight = new ko.observable();
                this.mapLoaded = new ko.observable(false);

                this.allMaps = new ko.observableArray();

                this.kirjaMarkerManager = new Map.KirjaMarkerManager(this);
                this.kortistoMarkerManager = new Map.KortistoMarkerManager(this);
                this.styrMarkerManager = new Map.StyrMarkerManager(this);
                this.kartaMarkerManager = new Map.KartaMarkerManager(this);
                this.aikaMarkerManager = new Map.AikaMarkerManager(this);

                this.selectedMarkerObjectId = new ko.observable("");
                this.currentValidManager = null;

                this.showConfirmDeleteDialog = new ko.observable(false);
                this.markerToDelete = null;
                this.markerToDeleteManager = null;

                this.showMarkerNameDialog = new ko.observable(false);
                this.dialogMarkerName = new ko.observable("");
                this.dialogMarkerNameDef = null;
                
                this.compareDialog = new GoNorth.ImplementationStatus.CompareDialog.ViewModel();


                this.selectedChapter = new ko.observable(null);
                this.chapters = new ko.observableArray();

                this.selectedChapterName = new ko.computed(function() {
                    var selectedChapter = this.selectedChapter();
                    if(selectedChapter) 
                    {
                        return selectedChapter.number + ": " + selectedChapter.name;
                    }

                    return Map.Localization.EditingDefaultChapter;
                }, this);

                this.isNonDefaultChapterSelected = new ko.computed(function() {
                    var selectedChapter = this.selectedChapter();
                    if(selectedChapter) 
                    {
                        return !selectedChapter.isDefault;
                    }

                    return false;
                }, this);

                this.errorOccured = new ko.observable(false);

                this.loadAllMaps();

                var chapterDef = null;
                if(Map.hasAikaRights)
                {
                    chapterDef = this.loadChapters();
                }
                else
                {
                    chapterDef = new jQuery.Deferred();
                    chapterDef.resolve();
                }

                var self = this;
                chapterDef.done(function() {
                    if(self.id())
                    {
                        self.loadMap(self.id());
                    }
                });

                var lastId = this.id();
                window.onhashchange = function() {
                    var id = GoNorth.Util.getParameterFromHash("id");
                    if(id != lastId) {
                        lastId = id;
                        self.switchMap(GoNorth.Util.getParameterFromHash("id"));
                    }
                }
            };

            Map.ViewModel.prototype = {
                /**
                 * Checks the pre selection
                 */
                checkPreSelection: function() {
                    if(!this.preSelectType || !this.preSelectId)
                    {
                        return;
                    }

                    this.kirjaMarkerManager.checkPreSelection(this.preSelectType, this.preSelectId);
                    this.kortistoMarkerManager.checkPreSelection(this.preSelectType, this.preSelectId);
                    this.styrMarkerManager.checkPreSelection(this.preSelectType, this.preSelectId);
                    this.kartaMarkerManager.checkPreSelection(this.preSelectType, this.preSelectId);
                    this.aikaMarkerManager.checkPreSelection(this.preSelectType, this.preSelectId);

                    this.preSelectType = null;
                    this.preSelectId = null;
                },

                /**
                 * Checks the marker which should be zoomed on
                 */
                checkZoomOnMarker: function() {
                    if(!this.zoomOnMarkerType || !this.zoomOnMarkerId)
                    {
                        return;
                    }

                    this.kirjaMarkerManager.checkZoomOnMarker(this.zoomOnMarkerType, this.zoomOnMarkerId);
                    this.kortistoMarkerManager.checkZoomOnMarker(this.zoomOnMarkerType, this.zoomOnMarkerId);
                    this.styrMarkerManager.checkZoomOnMarker(this.zoomOnMarkerType, this.zoomOnMarkerId);
                    this.kartaMarkerManager.checkZoomOnMarker(this.zoomOnMarkerType, this.zoomOnMarkerId);
                    this.aikaMarkerManager.checkZoomOnMarker(this.zoomOnMarkerType, this.zoomOnMarkerId);

                    this.zoomOnMarkerType = null;
                    this.zoomOnMarkerId = null;
                },

                /**
                 * Callback after the map was loaded
                 */
                mapReady: function(map) {
                    this.map = map;

                    this.kirjaMarkerManager.createLayerForMap(map);
                    this.kortistoMarkerManager.createLayerForMap(map);
                    this.styrMarkerManager.createLayerForMap(map);
                    this.kartaMarkerManager.createLayerForMap(map);
                    this.aikaMarkerManager.createLayerForMap(map);

                    this.kirjaMarkerManager.parseUnparsedMarkers(map);
                    this.kortistoMarkerManager.parseUnparsedMarkers(map);
                    this.styrMarkerManager.parseUnparsedMarkers(map);
                    this.kartaMarkerManager.parseUnparsedMarkers(map);
                    this.aikaMarkerManager.parseUnparsedMarkers(map);

                    this.checkPreSelection();
                    this.checkZoomOnMarker();
                },
                

                /**
                 * Loads all available maps
                 */
                loadAllMaps: function() {
                    this.errorOccured(false);
                    var self = this;
                    jQuery.ajax({
                        url: "/api/KartaApi/Maps",
                        method: "GET"
                    }).done(function(maps) {
                        self.allMaps(maps);

                        if(!self.id() && maps.length > 0)
                        {
                            self.loadMap(maps[0].id);
                        }
                    }).fail(function() {
                        self.errorOccured(true);
                    });
                },


                /**
                 * Loads chapters
                 */
                loadChapters: function() {
                    var def = new jQuery.Deferred();

                    this.errorOccured(false);
                    var self = this;
                    jQuery.ajax({
                        url: "/api/AikaApi/GetChapters",
                        method: "GET"
                    }).done(function(chapters) {
                        if(!chapters)
                        {
                            chapters = [];
                        }

                        var aggregatedChapters = [];
                        var aggregatedChapterName = "";
                        var curChapterNumber = -1;
                        for(var curChapter = 0; curChapter < chapters.length; ++curChapter)
                        {
                            if(curChapter == 0)
                            {
                                curChapterNumber = chapters[curChapter].number;
                            }

                            if(chapters[curChapter].number != curChapterNumber)
                            {
                                aggregatedChapters.push({
                                    number: curChapterNumber,
                                    name: aggregatedChapterName,
                                });

                                aggregatedChapterName = "";
                                curChapterNumber = chapters[curChapter].number;
                            }

                            if(aggregatedChapterName)
                            {
                                aggregatedChapterName += " / ";
                            }
                            aggregatedChapterName += chapters[curChapter].name;
                        }
                        
                        if(aggregatedChapterName) 
                        {
                            aggregatedChapters.push({
                                number: curChapterNumber,
                                name: aggregatedChapterName,
                            });
                        }

                        if(aggregatedChapters.length > 0)
                        {
                            aggregatedChapters[0].isDefault = true;
                            self.selectedChapter(aggregatedChapters[0]);
                        }

                        self.chapters(aggregatedChapters);
                        def.resolve();
                    }).fail(function() {
                        self.errorOccured(true);
                        def.reject();
                    });

                    return def.promise();
                },

                /**
                 * Switches the chapter by a chapter number
                 * 
                 * @param {int} chapterNumber Chapter number to which to switch
                 */
                switchChapterByNumber: function(chapterNumber) {
                    var chapters = this.chapters();
                    if(chapters == null || chapters.length == 0 || this.getSelectedChapterNumber() == chapterNumber)
                    {
                        return;
                    }

                    var bestChapter = chapters[0];
                    for(var curChapter = 0; curChapter < chapters.length; ++curChapter)
                    {
                        if(chapters[curChapter].number >= chapterNumber)
                        {
                            bestChapter = chapters[curChapter];
                            break;
                        }
                    }

                    if(bestChapter != this.selectedChapter())
                    {
                        this.switchChapter(bestChapter);
                    }
                },

                /**
                 * Switches the chapter
                 * 
                 * @param {object} chapter Chapter to select
                 */
                switchChapter: function(chapter) {
                    this.selectedChapter(chapter);

                    this.kirjaMarkerManager.adjustMarkersToChapter(chapter.number, this.map);
                    this.kortistoMarkerManager.adjustMarkersToChapter(chapter.number, this.map);
                    this.styrMarkerManager.adjustMarkersToChapter(chapter.number, this.map);
                    this.kartaMarkerManager.adjustMarkersToChapter(chapter.number, this.map);
                    this.aikaMarkerManager.adjustMarkersToChapter(chapter.number, this.map);
                },

                /**
                 * Returns the currently selected chapter number
                 * 
                 * @returns {int} Currently Selected chapter number, -1 if no chapter is selected
                 */
                getSelectedChapterNumber: function() {
                    if(!this.selectedChapter())
                    {
                        return -1;
                    }

                    return this.selectedChapter().number;
                },


                /**
                 * Sets the id
                 * 
                 * @param {string} id Id of the page
                 */
                setId: function(id) {
                    this.id(id);
                    window.location.hash = "id=" + id;
                },

                /**
                 * Switches the map which is currently displayed if ifs different to the current one
                 * 
                 * @param {string} id Id of the map
                 */
                switchMap: function(id) {
                    if(this.id() == id)
                    {
                        return;
                    }

                    this.kirjaMarkerManager.resetMarkers();
                    this.kortistoMarkerManager.resetMarkers();
                    this.styrMarkerManager.resetMarkers();
                    this.kartaMarkerManager.resetMarkers();
                    this.aikaMarkerManager.resetMarkers();
                    this.loadMap(id);
                },

                /**
                 * Loads a map
                 * 
                 * @param {string} id Id of the map
                 */
                loadMap: function(id) {
                    this.errorOccured(false);
                    this.isLoading(true);
                    var self = this;
                    jQuery.ajax({
                        url: "/api/KartaApi/Map?id=" + encodeURIComponent(id),
                        method: "GET"
                    }).done(function(map) {
                        self.currentMapName(map.name);

                        self.mapMaxZoom(map.maxZoom);
                        self.mapImageWidth(map.width);
                        self.mapImageHeight(map.height);
                        self.setId(id);

                        if(self.map)
                        {
                            self.kirjaMarkerManager.parseMarkers(map.kirjaPageMarker, self.map);
                            self.kortistoMarkerManager.parseMarkers(map.npcMarker, self.map);
                            self.styrMarkerManager.parseMarkers(map.itemMarker, self.map);
                            self.kartaMarkerManager.parseMarkers(map.mapChangeMarker, self.map);
                            self.aikaMarkerManager.parseMarkers(map.questMarker, self.map);
                        }
                        else
                        {
                            self.kirjaMarkerManager.setUnparsedMarkers(map.kirjaPageMarker);
                            self.kortistoMarkerManager.setUnparsedMarkers(map.npcMarker);
                            self.styrMarkerManager.setUnparsedMarkers(map.itemMarker);
                            self.kartaMarkerManager.setUnparsedMarkers(map.mapChangeMarker);
                            self.aikaMarkerManager.setUnparsedMarkers(map.questMarker);
                        }

                        if(!self.mapLoaded())
                        {
                            self.mapLoaded(true);
                        }

                        self.acquireLock();

                        if(self.isNonDefaultChapterSelected())
                        {
                            var chapterNumber = self.getSelectedChapterNumber();
                            self.kirjaMarkerManager.adjustMarkersToChapter(chapterNumber, self.map);
                            self.kortistoMarkerManager.adjustMarkersToChapter(chapterNumber, self.map);
                            self.styrMarkerManager.adjustMarkersToChapter(chapterNumber, self.map);
                            self.kartaMarkerManager.adjustMarkersToChapter(chapterNumber, self.map);
                            self.aikaMarkerManager.adjustMarkersToChapter(chapterNumber, self.map);
                        }

                        self.isLoading(false);
                    }).fail(function() {
                        self.errorOccured(true);
                        self.isLoading(false);
                    });
                },

                /**
                 * Adds a marker to the map
                 * 
                 * @param {object} map Map Object
                 * @param {object} latLng Click coordinates
                 */
                addMarkerToMap: function(map, latLng) {
                    if(!this.currentValidManager || this.isLoading()) {
                        return;
                    }

                    this.errorOccured(false);

                    var markerDef = this.currentValidManager.createMarker(this.selectedMarkerObjectId(), latLng);

                    var self = this;
                    markerDef.done(function(marker) {
                        self.setMarkerDragCallback(marker);
                        self.setMarkerPixelPosition(marker, map, true);

                        if(self.isNonDefaultChapterSelected())
                        {
                            marker.setAddedInChapter(self.selectedChapter().number);
                        }

                        self.saveNewMarker(marker, map);
                    });
                },

                /**
                 * Sets a markers drag callback function
                 * 
                 * @param {object} marker Marker to set the drag callback for
                 */
                setMarkerDragCallback: function(marker) {
                    var self = this;
                    marker.setOnDragEnd(function() {
                        self.saveNewMarkerPos(marker, self.map);
                    });
                },

                /**
                 * Sets a markers drag callback function
                 * 
                 * @param {object} marker Marker to set the drag callback for
                 * @param {object} manager Manager to which the marker belongs
                 */
                openDeleteDialog: function(marker, manager) {
                    var self = this;
                    marker.setDeleteCallback(function() {
                        self.showConfirmDeleteDialog(true);
                        self.markerToDelete = marker;
                        self.markerToDeleteManager = manager;
                    });
                },

                /**
                 * Deletes the marker for which the dialog is shown
                 */
                deleteMarker: function() {
                    if(!this.isNonDefaultChapterSelected() || (this.markerToDelete.getAddedInChapter() >= 0 && this.markerToDelete.getAddedInChapter() == this.getSelectedChapterNumber()))
                    {
                        this.markerToDeleteManager.removeMarker(this.markerToDelete, this.selectedChapter());
                        this.sendDeleteMarkerRequest(this.markerToDelete);
                    }
                    else
                    {
                        this.markerToDelete.setDeletedInChapter(this.getSelectedChapterNumber());
                        this.saveMarker(this.markerToDelete);
                    }

                    this.markerToDelete.removeFrom(this.map);
                    this.closeConfirmDeleteDialog();
                },

                /**
                 * Sends a request to delete a marker
                 * 
                 * @param {object} marker Marker to delete
                 */
                sendDeleteMarkerRequest: function(marker) {
                    // Send delete request
                    this.isLoading(true);
                    var self = this;
                    jQuery.ajax({ 
                        url: "/api/KartaApi/DeleteMapMarker?id=" + this.id() + "&markerId=" + marker.id + "&markerType=" + marker.markerType, 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        type: "DELETE"
                    }).done(function(data) {
                        self.isLoading(false);
                    }).fail(function(xhr) {
                        self.errorOccured(true);
                        self.isLoading(false);
                    });
                },

                /**
                 * Closes the confirm delete dialog
                 */
                closeConfirmDeleteDialog: function() {
                    this.showConfirmDeleteDialog(false);
                    this.markerToDelete = null;
                    this.markerToDeleteManager = null;
                },


                /**
                 * Saves a new marker
                 * 
                 * @param {object} marker New Marker
                 * @param {object} map Map Object
                 * @param {function} removeFunction Remove Function to remove the object in case of an error
                 */
                saveNewMarker: function(marker, map, removeFunction) {
                    this.isLoading(true);

                    var self = this;
                    jQuery.ajax({
                        url: "/api/KartaApi/GetNewMapMarkerId",
                        type: "GET"
                    }).done(function(id) {
                        marker.setId(id);
                        self.saveMarker(marker);
                    }).fail(function() {
                        marker.removeFrom(map);
                        self.currentValidManager.removeMarker(marker);
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Sets the marker pixel position
                 * 
                 * @param {object} marker Marker
                 * @param {map} map Map
                 * @param {bool} fromAdd true if the position was set during an add, else false
                 */
                setMarkerPixelPosition: function(marker, map, fromAdd) {
                    var pixelPos = map.project(marker.getLatLng(), map.getMaxZoom());
                    if(!this.isNonDefaultChapterSelected() || fromAdd)
                    {
                        marker.setPixelCoords(pixelPos.x, pixelPos.y);
                    }
                    else
                    {
                        marker.setChapterPixelCoords(this.selectedChapter().number, pixelPos.x, pixelPos.y);
                    }
                },

                /**
                 * Saves the new marker position after a marker was dragged
                 * 
                 * @param {object} marker Marker
                 * @param {map} map Map
                 */
                saveNewMarkerPos: function(marker, map) {
                    this.setMarkerPixelPosition(marker, map, false);

                    this.saveMarker(marker);
                },

                /**
                 * Saves a marker
                 * 
                 * @param {object} marker Marker to save
                 */
                saveMarker: function(marker) {
                    if(this.isReadonly())
                    {
                        return;
                    }

                    var request = {};
                    request[marker.serializePropertyName] = marker.serialize();

                    // Saves the markers
                    this.isLoading(true);
                    var self = this;
                    jQuery.ajax({ 
                        url: "/api/KartaApi/SaveMapMarker?id=" + this.id(), 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        data: JSON.stringify(request), 
                        type: "POST",
                        contentType: "application/json"
                    }).done(function(data) {
                        marker.flagAsNotImplemented();
                        self.isLoading(false);
                    }).fail(function(xhr) {
                        self.errorOccured(true);
                        self.isLoading(false);
                    });
                },

                /**
                 * Resets the marker object data
                 */
                resetMarkerObjectData: function() {
                    this.selectedMarkerObjectId("");
                    if(this.currentValidManager)
                    {
                        this.currentValidManager.resetSelectionData();
                    }
                    this.currentValidManager = null;
                },

                /**
                 * Selects an object id which is valid
                 */
                setCurrentObjectId: function(objectId, markerManager) {
                    this.selectedMarkerObjectId(objectId);
                    if(this.currentValidManager && this.currentValidManager != markerManager)
                    {
                        this.currentValidManager.resetSelectionData();
                    }
                    this.currentValidManager = markerManager;
                },


                /**
                 * Opens the marker name dialog
                 * 
                 * @param {string} existingName Existing name in case of edit
                 */
                openMarkerNameDialog: function(existingName) {
                    this.showMarkerNameDialog(true);
                    this.dialogMarkerName(existingName ? existingName : "");
                    this.dialogMarkerNameDef = new jQuery.Deferred();
                    
                    GoNorth.Util.setupValidation("#gn-markerNameForm");

                    return this.dialogMarkerNameDef.promise();
                },

                /**
                 * Saves the marker name
                 */
                saveMarkerName: function() {
                    if(!jQuery("#gn-markerNameForm").valid())
                    {
                        return;
                    }

                    if(this.dialogMarkerNameDef != null)
                    {
                        this.dialogMarkerNameDef.resolve(this.dialogMarkerName());
                        this.dialogMarkerNameDef = null;
                    }

                    this.closeMarkerNameDialog();
                },

                /**
                 * Closes the marker name dialog
                 */
                closeMarkerNameDialog: function() {
                    this.showMarkerNameDialog(false);
                    this.dialogMarkerName("");

                    if(this.dialogMarkerNameDef != null)
                    {
                        this.dialogMarkerNameDef.reject();
                        this.dialogMarkerNameDef = null;
                    }
                },


                /**
                 * Acquires a lock
                 */
                acquireLock: function() {
                    GoNorth.LockService.releaseCurrentLock();
                    this.lockedByUser("");
                    this.isReadonly(false);

                    var self = this;
                    GoNorth.LockService.acquireLock("KartaMap", this.id()).done(function(isLocked, lockedUsername) { 
                        if(isLocked)
                        {
                            self.isReadonly(true);
                            self.lockedByUser(lockedUsername);
                            self.resetMarkerObjectData();

                            self.kirjaMarkerManager.disable();
                            self.kortistoMarkerManager.disable();
                            self.styrMarkerManager.disable();
                            self.kartaMarkerManager.disable();
                            self.aikaMarkerManager.disable();
                        }
                    }).fail(function() {
                        self.errorOccured(true);
                    });
                }
            };

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));