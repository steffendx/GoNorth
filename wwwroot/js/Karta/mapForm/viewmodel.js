(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /// Default Geometry color
            var defaultGeometryColor = "#0000CC";

            /**
             * Map View Model
             * @class
             */
            Map.ViewModel = function()
            {
                this.isLoading = new ko.observable(false);
                this.isReadonly = new ko.observable(false);
                this.showWaitOnPageDialog = new ko.observable(false);
                this.lockedByUser = new ko.observable("");
                this.errorOccured = new ko.observable(false);
                this.additionalError = new ko.observable("");

                this.id = new ko.observable("");
                this.preSelectType = GoNorth.Util.getParameterFromUrl("preSelectType");
                this.preSelectId = GoNorth.Util.getParameterFromUrl("preSelectId");
                this.zoomOnMarkerType = GoNorth.Util.getParameterFromUrl("zoomOnMarkerType");
                this.zoomOnMarkerId = GoNorth.Util.getParameterFromUrl("zoomOnMarkerId");
                this.preSelectChapter = parseInt(GoNorth.Util.getParameterFromUrl("chapter"));

                this.dailyRoutineEditor = new Map.DailyRoutineEditor(this, this.isLoading, this.errorOccured);

                var paramId = GoNorth.Util.getParameterFromUrl("id");
                if(paramId)
                {
                    this.setId(paramId);
                }

                this.map = null;
                this.mapGeometryToolbar = null;

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
                this.noteMarkerManager = new Map.NoteMarkerManager(this);

                this.showMarkerLabels = new ko.observable(true);

                this.selectedMarkerObjectId = new ko.observable("");
                this.currentValidManager = null;

                this.showConfirmDeleteDialog = new ko.observable(false);
                this.markerToDelete = null;
                this.markerToDeleteManager = null;

                this.showMarkerNameDialog = new ko.observable(false);
                this.dialogMarkerName = new ko.observable("");
                this.showMarkerNameDialogDescription = new ko.observable(false);
                this.dialogMarkerDescription = new ko.observable("");
                this.dialogMarkerNameDef = null;

                this.showMarkerExportNameDialog = new ko.observable(false);
                this.markerExportName = new ko.observable("");
                this.markerToEditExportName = null;
                this.markerToEditSaveCallback = null;
                
                this.compareDialog = new GoNorth.ImplementationStatus.CompareDialog.ViewModel();

                this.isInGeometryEditMode = new ko.observable(false);
                this.geometryEditMarker = null;
                this.geometryEditMarkerManager = null;

                this.showGeometrySettingDialog = new ko.observable(false);
                this.showConfirmGeometryDeleteDialog = new ko.observable(false);
                this.availableGeometryColors = [
                    {
                        name: GoNorth.Karta.Map.Localization.GeometryColorBlue,
                        color: defaultGeometryColor,
                    },
                    {
                        name: GoNorth.Karta.Map.Localization.GeometryColorRed,
                        color: "#CC0000",
                    },
                    {
                        name: GoNorth.Karta.Map.Localization.GeometryColorGreen,
                        color: "#008800",
                    },
                    {
                        name: GoNorth.Karta.Map.Localization.GeometryColorPurple,
                        color: "#66008e",
                    },
                    {
                        name: GoNorth.Karta.Map.Localization.GeometryColorWhite,
                        color: "#FFFFFF",
                    },
                    {
                        name: GoNorth.Karta.Map.Localization.GeometryColorYellow,
                        color: "#FDFF00",
                    }
                ];
                this.selectedGeometryColor = new ko.observable("");
                this.editGeometry = null;
                
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
                GoNorth.Util.onUrlParameterChanged(function() {
                    var id = GoNorth.Util.getParameterFromUrl("id");
                    if(id != lastId) {
                        var chapterByUrl = parseInt(GoNorth.Util.getParameterFromUrl("chapter"));
                        if(!isNaN(chapterByUrl))
                        {
                            self.switchChapterByNumber(chapterByUrl, true);
                        }
                        else if(self.chapters().length > 0)
                        {
                            self.switchChapter(self.chapters()[0], true);
                        }

                        GoNorth.Karta.Map.readUrlMapLocations();
                        lastId = id;
                        self.switchMap(GoNorth.Util.getParameterFromUrl("id"), true);
                    }
                });

                GoNorth.Karta.Map.switchToMap = function(mapId) {
                    if(self.id() != mapId) {
                        self.switchMap(mapId);
                    }
                }
            };

            Map.ViewModel.prototype = {
                /**
                 * Resets the error state
                 */
                resetErrorState: function() {
                    this.errorOccured(false);
                    this.additionalError("");
                },

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
                    this.noteMarkerManager.checkPreSelection(this.preSelectType, this.preSelectId);

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
                    this.noteMarkerManager.checkZoomOnMarker(this.zoomOnMarkerType, this.zoomOnMarkerId);

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
                    this.noteMarkerManager.createLayerForMap(map);

                    this.kirjaMarkerManager.parseUnparsedMarkers(map);
                    this.kortistoMarkerManager.parseUnparsedMarkers(map);
                    this.styrMarkerManager.parseUnparsedMarkers(map);
                    this.kartaMarkerManager.parseUnparsedMarkers(map);
                    this.aikaMarkerManager.parseUnparsedMarkers(map);
                    this.noteMarkerManager.parseUnparsedMarkers(map);

                    this.dailyRoutineEditor.createLayerForMap(map);

                    this.checkPreSelection();
                    this.checkZoomOnMarker();

                    this.initEditGeometryToolbar(map);

                    if(!GoNorth.Util.getParameterFromUrl("mapLat"))
                    {
                        this.refreshUrlMapLocations();
                    }
                    this.refreshUrlParameters();
                },
                
                /**
                 * Refreshes the url map locations
                 */
                refreshUrlMapLocations: function() {
                    if(GoNorth.Karta.Map.refreshUrlMapLocations) 
                    {
                        GoNorth.Karta.Map.refreshUrlMapLocations();
                    }
                },


                /**
                 * Loads all available maps
                 */
                loadAllMaps: function() {
                    this.resetErrorState();
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

                    this.resetErrorState();
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
                            var chapterToSelect = aggregatedChapters[0];
                            if(self.preSelectChapter != null && !isNaN(self.preSelectChapter))
                            {
                                for(var curChapter = 0; curChapter < aggregatedChapters.length; ++curChapter)
                                {
                                    if(aggregatedChapters[curChapter].number == self.preSelectChapter)
                                    {
                                        chapterToSelect = aggregatedChapters[curChapter];
                                        break;
                                    }
                                }
                            }
                            self.preSelectChapter = null;
                            self.switchChapter(chapterToSelect, true);
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
                 * @param {bool} dontUpdateUrl true if the Url should be not be updated, else false
                 */
                switchChapterByNumber: function(chapterNumber, dontUpdateUrl) {
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
                        this.switchChapter(bestChapter, dontUpdateUrl);
                    }
                },

                /**
                 * Switches the chapter
                 * 
                 * @param {object} chapter Chapter to select
                 * @param {bool} dontUpdateUrl true if the Url should be not be updated, else false
                 */
                switchChapter: function(chapter, dontUpdateUrl) {
                    this.selectedChapter(chapter);

                    this.kirjaMarkerManager.adjustMarkersToChapter(chapter.number, this.map);
                    this.kortistoMarkerManager.adjustMarkersToChapter(chapter.number, this.map);
                    this.styrMarkerManager.adjustMarkersToChapter(chapter.number, this.map);
                    this.kartaMarkerManager.adjustMarkersToChapter(chapter.number, this.map);
                    this.aikaMarkerManager.adjustMarkersToChapter(chapter.number, this.map);
                    this.noteMarkerManager.adjustMarkersToChapter(chapter.number, this.map);

                    if(dontUpdateUrl)
                    {
                        return;
                    }

                    this.refreshUrlParameters();
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
                 * @param {bool} dontPushState true if the url change should not be pushed as a state, else falsedontPushState
                 */
                setId: function(id, dontPushState) {
                    var pushNewState = !!this.id() && this.id() != id;
                    this.id(id);

                    if(dontPushState)
                    {
                        return;
                    }

                    var parameterValue = this.buildUrlParameters();
                    if(pushNewState)
                    {
                        GoNorth.Util.setUrlParameters(parameterValue);
                    }
                    else
                    {
                        GoNorth.Util.replaceUrlParameters(parameterValue);
                    }
                },

                /**
                 * Refreshes the url parameters
                 */
                refreshUrlParameters: function() {
                    var parameterValue = this.buildUrlParameters();
                    GoNorth.Util.replaceUrlParameters(parameterValue);
                    this.refreshUrlMapLocations();
                },

                /**
                 * Builds the url parameters
                 * 
                 * @returns {string} Url parameters
                 */
                buildUrlParameters: function() {
                    var parameterValue = "id=" + this.id();
                    if(this.isNonDefaultChapterSelected && this.isNonDefaultChapterSelected() && this.selectedChapter())
                    {
                        parameterValue += "&chapter=" + this.selectedChapter().number;
                    }

                    if(this.dailyRoutineEditor.isEditingDailyRoutine())
                    {
                        parameterValue += this.dailyRoutineEditor.buildUrlParameters();
                    }

                    return parameterValue;
                },

                /**
                 * Switches the map which is currently displayed if ifs different to the current one
                 * 
                 * @param {string} id Id of the map
                 * @param {bool} dontPushState true if the url change should not be pushed as a state, else false
                 */
                switchMap: function(id, dontPushState) {
                    if(this.id() == id)
                    {
                        return;
                    }

                    this.kirjaMarkerManager.resetMarkers();
                    this.kortistoMarkerManager.resetMarkers();
                    this.styrMarkerManager.resetMarkers();
                    this.kartaMarkerManager.resetMarkers();
                    this.aikaMarkerManager.resetMarkers();
                    this.noteMarkerManager.resetMarkers();
                    this.dailyRoutineEditor.leaveEditMode();
                    this.loadMap(id, dontPushState);
                },

                /**
                 * Loads a map
                 * 
                 * @param {string} id Id of the map
                 * @param {bool} dontPushState true if the url change should not be pushed as a state, else false
                 */
                loadMap: function(id, dontPushState) {
                    this.resetErrorState();
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
                        self.setId(id, dontPushState);

                        if(self.map)
                        {
                            self.kirjaMarkerManager.parseMarkers(map.kirjaPageMarker, self.map);
                            self.kortistoMarkerManager.parseMarkers(map.npcMarker, self.map);
                            self.styrMarkerManager.parseMarkers(map.itemMarker, self.map);
                            self.kartaMarkerManager.parseMarkers(map.mapChangeMarker, self.map);
                            self.aikaMarkerManager.parseMarkers(map.questMarker, self.map);
                            self.noteMarkerManager.parseMarkers(map.noteMarker, self.map);
                        }
                        else
                        {
                            self.kirjaMarkerManager.setUnparsedMarkers(map.kirjaPageMarker);
                            self.kortistoMarkerManager.setUnparsedMarkers(map.npcMarker);
                            self.styrMarkerManager.setUnparsedMarkers(map.itemMarker);
                            self.kartaMarkerManager.setUnparsedMarkers(map.mapChangeMarker);
                            self.aikaMarkerManager.setUnparsedMarkers(map.questMarker);
                            self.noteMarkerManager.setUnparsedMarkers(map.noteMarker);
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
                            self.noteMarkerManager.adjustMarkersToChapter(chapterNumber, self.map);
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
                    if(this.isLoading()) {
                        return;
                    }

                    if(this.currentValidManager) {
                        this.addMarkerForValidManager(map, latLng);
                    } else if(this.dailyRoutineEditor.isEditingDailyRoutine()) {
                        this.dailyRoutineEditor.addMarker(map, latLng);
                    }
                },

                /**
                 * Adds a marker for the valid manager
                 * 
                 * @param {object} map Map Object
                 * @param {object} latLng Click coordinates
                 */
                addMarkerForValidManager: function(map, latLng) {
                    this.resetErrorState();

                    var markerDef = this.currentValidManager.createMarker(this.selectedMarkerObjectId(), latLng);

                    var self = this;
                    markerDef.done(function(marker) {
                        self.setMarkerDragCallback(marker);
                        self.setupNewMarker(marker);
                        if(self.isNonDefaultChapterSelected())
                        {
                            marker.setAddedInChapter(self.selectedChapter().number);
                        }
                        self.saveNewMarker(marker, map);
                    });
                },

                /**
                 * Sets a markers position on the map
                 * @param {GoNorth.Karta.Map.BaseMarker} marker Marker to setup
                 */
                setupNewMarker: function(marker) {
                    this.setMarkerPixelPosition(marker, this.map, true);
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
                 * Opens the delete dialog for a marker
                 * 
                 * @param {object} marker Marker to open the dialog for
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
                        this.sendDeleteMarkerRequest(this.markerToDelete, this.markerToDeleteManager);
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
                sendDeleteMarkerRequest: function(marker, markerToDeleteManager) {
                    // Send delete request
                    this.resetErrorState();
                    this.isLoading(true);
                    var self = this;
                    jQuery.ajax({ 
                        url: "/api/KartaApi/DeleteMapMarker?id=" + this.id() + "&markerId=" + marker.id + "&markerType=" + marker.markerType, 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        type: "DELETE"
                    }).done(function(data) {
                        markerToDeleteManager.removeMarker(marker, self.selectedChapter());

                        self.isLoading(false);
                    }).fail(function(xhr) {
                        self.errorOccured(true);
                        self.isLoading(false);

                        // If marker is related to anything that prevents deleting a bad request (400) will be returned
                        if(xhr.status == 400 && xhr.responseText)
                        {
                            self.additionalError(xhr.responseText);
                        }

                        marker.addTo(self.map);
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
                 * Opens the edit export name dialog
                 * 
                 * @param {object} marker Marker to edit the export name for 
                 * @param {function} markerToEditSaveCallback Callback function that will be triggered on save of the export name of the marker, if null the default save will be triggered
                 */
                openEditExportNameDialog: function(marker, markerToEditSaveCallback) {
                    this.showMarkerExportNameDialog(true);
                    this.markerExportName(marker.exportName ? marker.exportName : "");
                    this.markerToEditExportName = marker;
                    this.markerToEditSaveCallback = markerToEditSaveCallback ? markerToEditSaveCallback : null;
                },

                /**
                 * Saves the marker export name
                 */
                saveMarkerExportName: function() {
                    if(!this.markerToEditExportName)
                    {
                        return;
                    }

                    if(this.markerToEditSaveCallback) {
                        this.markerToEditSaveCallback(this.markerExportName());
                        this.closeMarkerExportNameDialog();
                        return;
                    }

                    this.markerToEditExportName.setExportName(this.markerExportName());
                    this.saveMarker(this.markerToEditExportName);

                    this.closeMarkerExportNameDialog();
                },

                /**
                 * Closes the confirm delete dialog
                 */
                closeMarkerExportNameDialog: function() {
                    this.showMarkerExportNameDialog(false);
                    this.markerToEditExportName = null;
                    this.markerToEditSaveCallback = null;
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
                    var oldPosition = map.unproject([ marker.x, marker.y ], map.getMaxZoom());
                    var newPosition = marker.getLatLng();
                    var offsetDiff = { 
                        lat: newPosition.lat - oldPosition.lat,
                        lng: newPosition.lng - oldPosition.lng
                    };
                    this.setMarkerPixelPosition(marker, map, false);
                    marker.moveGeometry(offsetDiff);

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
                    request[marker.serializePropertyName] = marker.serialize(this.map);

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

                    this.dailyRoutineEditor.leaveEditMode();
                },

                /**
                 * Selects an object id which is valid
                 */
                setCurrentObjectId: function(objectId, markerManager) {
                    if(this.isInGeometryEditMode())
                    {
                        this.leaveGeometryEditMode()
                    }

                    this.dailyRoutineEditor.leaveEditMode();

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
                 * @param {bool} showDescription true if a description field should be shown, else false
                 * @param {string} existingDescription Existing description in case of edit
                 * @returns {jQuery.Deferred} Deferred which will be resolve with the name and description if the user saves
                 */
                openMarkerNameDialog: function(existingName, showDescription, existingDescription) {
                    this.showMarkerNameDialog(true);
                    this.dialogMarkerName(existingName ? existingName : "");
                    this.showMarkerNameDialogDescription(showDescription ? true : false);
                    this.dialogMarkerDescription(showDescription && existingDescription ? existingDescription : "");
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
                        this.dialogMarkerNameDef.resolve(this.dialogMarkerName(), this.dialogMarkerDescription());
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
                    this.showMarkerNameDialogDescription(false);
                    this.dialogMarkerDescription("");

                    if(this.dialogMarkerNameDef != null)
                    {
                        this.dialogMarkerNameDef.reject();
                        this.dialogMarkerNameDef = null;
                    }
                },


                /**
                 * Inits the edit geometry toolbar
                 * 
                 * @param {object} map Map object
                 */
                initEditGeometryToolbar: function(map) {
                    Map.addColorpickerToDrawToolbar();

                    this.mapGeometryToolbar = new L.Control.Draw({
                        position: 'topleft',
                        draw: {
                            rectangle: {
                                showArea: false,
                                shapeOptions: {
                                    color: defaultGeometryColor
                                }
                            },
                            polyline: {
                                showLength: false,
                                shapeOptions: {
                                    color: defaultGeometryColor
                                }
                            },
                            polygon: {
                                showArea: false,
                                showLength: false,
                                shapeOptions: {
                                    color: defaultGeometryColor
                                }
                            },
                            circle: {
                                showRadius: false,
                                shapeOptions: {
                                    color: defaultGeometryColor
                                }
                            },
                            colorPicker: {
                                availableGeometryColors: this.availableGeometryColors,
                                viewModel: this
                            },
                            circlemarker: false,
                            marker: false
                        },
                        edit: false
                    });

                    var self = this;
                    map.on("layerremove", function(layerEvent) {
                        if(self.geometryEditMarker != null && self.geometryEditMarker.isMarker(layerEvent.layer))
                        {
                            self.leaveGeometryEditMode();
                        }
                    });

                    map.on(L.Draw.Event.CREATED, function (event) {
                        if(!self.geometryEditMarker)
                        {
                            return;
                        }

                        var layer = event.layer;
                        
                        self.isLoading(true);
                        self.resetErrorState();
                        jQuery.ajax({
                            url: "/api/KartaApi/GetNewMapMarkerId",
                            type: "GET"
                        }).done(function(id) {
                            layer.id = id;
                            self.geometryEditMarker.addGeometry(layer);
                            self.geometryEditMarkerManager.addGeometryToLayer(layer);

                            if(!layer.options.editing)
                            {
                                layer.options.editing = {};
                            }
                            layer.editing.enable();
                            layer.on("edit", function() {
                                self.saveMarker(self.geometryEditMarker);
                            });
                            layer.on("click", function() {
                                self.openGeometrySettingsDialog(layer);
                            });
                            jQuery(layer.getElement()).addClass("gn-kartaGeometryEditable");

                            self.saveMarker(self.geometryEditMarker);
                        }).fail(function() {
                            self.isLoading(false);
                            self.errorOccured(true);
                        });
                    });
                },

                /**
                 * Enters the geometry edit mode
                 * 
                 * @param {object} marker Marker for which the geometry is edited
                 * @param {object} markerManager Marker Manager to which the marker belongs
                 */
                enterGeometryEditMode: function(marker, markerManager) {
                    this.resetMarkerObjectData();

                    if(this.geometryEditMarker)
                    {
                        this.geometryEditMarker.setGeometryEditMode(false);
                    }

                    if(!this.isInGeometryEditMode())
                    {
                        this.map.addControl(this.mapGeometryToolbar);
                    }

                    marker.closePopup();
                    this.geometryEditMarker = marker;
                    this.geometryEditMarkerManager = markerManager;
                    this.isInGeometryEditMode(true);

                    var self = this;
                    marker.setGeometryEditMode(true, function() {
                        self.saveMarker(self.geometryEditMarker);
                    }, function(layer) {
                        self.openGeometrySettingsDialog(layer);
                    });
                },

                /**
                 * Leaves the geometry edit mode
                 */
                leaveGeometryEditMode: function() {
                    if(this.isInGeometryEditMode())
                    {
                        this.map.removeControl(this.mapGeometryToolbar);
                    }

                    this.geometryEditMarker.setGeometryEditMode(false);

                    this.geometryEditMarker = null;
                    this.geometryEditMarkerManager = null;
                    this.isInGeometryEditMode(false);
                },

                /**
                 * Opens the geometry settings dialog
                 * 
                 * @param {object} layer Layer to edit
                 */
                openGeometrySettingsDialog: function(layer) {
                    this.showGeometrySettingDialog(true);
                    this.selectedGeometryColor(layer.options.color)
                    this.editGeometry = layer;
                },

                /**
                 * Opens the delete geometry dialog
                 */
                openDeleteGeometryDialog: function() {
                    this.showConfirmGeometryDeleteDialog(true);
                },

                /**
                 * Deletes the geometry
                 */
                deleteGeometry: function() {
                    this.geometryEditMarker.removeGeometry(this.editGeometry, this.map);
                    this.saveMarker(this.geometryEditMarker);
                    this.closeConfirmGeometryDeleteDialog();
                    this.closeMarkerGeometrySettingsDialog();
                },

                /**
                 * Closes the confirm geometry delete dialog
                 */
                closeConfirmGeometryDeleteDialog: function() {
                    this.showConfirmGeometryDeleteDialog(false);
                },

                /**
                 * Saves the marker geometry settings
                 */
                saveMarkerGeometrySettings: function() {
                    this.editGeometry.setStyle({ fillColor: this.selectedGeometryColor(), color: this.selectedGeometryColor() });
                    this.saveMarker(this.geometryEditMarker);
                    this.closeMarkerGeometrySettingsDialog();
                },

                /**
                 * Closes the marker geometry settings dialog
                 */
                closeMarkerGeometrySettingsDialog: function() {
                    this.showGeometrySettingDialog(false);
                    this.editGeometry = null;
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
                            self.noteMarkerManager.disable();
                        }
                    }).fail(function() {
                        self.errorOccured(true);
                    });
                }
            };

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));