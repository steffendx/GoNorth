(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /**
             * Npc Daily routine editor
             * 
             * @param {GoNorth.Karta.Map.ViewModel} viewModel Main karta viewmodel
             * @param {ko.observable} isLoading Observable to indicate a process is loading
             * @param {ko.observable} errorOccured Observable to indicate an error occured
             * @class
             */
            Map.DailyRoutineEditor = function(viewModel, isLoading, errorOccured) 
            {
                this.isLoading = isLoading;
                this.errorOccured = errorOccured;

                this.currentNpcId = new ko.observable("");
                this.dailyRoutineEvents = new ko.observableArray();

                this.showEventCallout = new ko.observable(false);
                this.showDisabledEvents = new ko.observable(true);

                this.suggestedNpcStates = new ko.observableArray();

                this.hoursPerDay = new ko.observable(24);
                this.minutesPerHour = new ko.observable(60);

                this.isEditingDailyRoutine = new ko.observable(false);
                this.editingDailyRoutineNpcName = new ko.observable("");

                this.showAddEditEventDialog = new ko.observable(false);
                this.addEditEventName = new ko.observable("");
                this.addEditEventEarliestTime = new ko.observable(GoNorth.BindingHandlers.buildTimeObject(0, 0));
                this.addEditEventLatestTime = new ko.observable(GoNorth.BindingHandlers.buildTimeObject(0, 0));
                this.addEditEventTargetState = new ko.observable("");
                this.addEditEventTargetReachedScript = new ko.observable("");
                this.addEditEventTargetReachedScriptType = GoNorth.DailyRoutines.ScriptTypes.none;
                this.addEditEventTargetReachedScriptCode = "";
                this.addEditEventTargetReachedScriptGraph = null;
                this.addEditEventEnabledByDefault = new ko.observable(true);
                this.eventToEdit = new ko.observable(null);
                this.addMarkerLatLng = null;
                this.addEditEventDialogLoading = new ko.observable(false);
                this.addEditEventDialogErrorOccured = new ko.observable(false);
                GoNorth.DailyRoutines.Util.keepTimeObservablesInOrder(this.addEditEventEarliestTime, this.addEditEventLatestTime);

                this.showConfirmDeleteScriptDialog = new ko.observable(false);

                this.showConfirmDeleteEventDialog = new ko.observable(false);
                this.eventToDelete = null;

                this.viewModel = viewModel;

                this.isLayerVisible = new ko.observable(false);
                this.markerLayer = null;
                this.markerMap = null;
                var self = this;
                this.isLayerVisible.subscribe(function() {
                    self.syncLayerVisibility();
                });
                
                this.objectDialog = new GoNorth.ChooseObjectDialog.ViewModel();
                this.chooseScriptTypeDialog = new GoNorth.DailyRoutines.ChooseScriptTypeDialog.ViewModel();
                this.codeScriptDialog = new GoNorth.ScriptDialog.CodeScriptDialog(this.errorOccured);
                this.nodeScriptDialog = new GoNorth.ScriptDialog.NodeScriptDialog(this.currentNpcId, this.objectDialog, this.codeScriptDialog, this.errorOccured);

                this.showNpcLockedByDialog = new ko.observable(false);
                this.npcLockedBy = new ko.observable("");

                this.timeEventsOverlap = new ko.pureComputed(function() {
                    return GoNorth.DailyRoutines.Util.doEventsOverlap(this.dailyRoutineEvents());
                }, this);

                GoNorth.Util.setupValidation("#gn-addEditEventForm");

                this.loadConfig();
                
                this.dailyRoutineNpcIdFromUrl = GoNorth.Util.getParameterFromUrl("dailyRoutineNpcId");
                this.zoomOnDailyRoutineAfterInit = false;
                if(this.dailyRoutineNpcIdFromUrl && !GoNorth.Util.getParameterFromUrl("mapLat") && !GoNorth.Util.getParameterFromUrl("mapLong") && !GoNorth.Util.getParameterFromUrl("mapZoom"))
                {
                    this.zoomOnDailyRoutineAfterInit = true;
                }

                // Add access for markers
                Map.editDailyRoutineOfMarker = function(npcMarker) {
                    self.editDailyRoutineOfMarker(npcMarker);
                }
            }

            Map.DailyRoutineEditor.prototype = {
                /**
                 * Loads the config
                 */
                loadConfig: function() {
                    var self = this;
                    jQuery.ajax("/api/ProjectConfigApi/GetMiscConfig").done(function(data) {
                        self.hoursPerDay(data.hoursPerDay);
                        self.minutesPerHour(data.minutesPerHour);
                    }).fail(function() {
                        self.errorOccured(true);
                    });

                    jQuery.ajax("/api/ProjectConfigApi/GetJsonConfigByKey?configKey=" + GoNorth.ProjectConfig.ConfigKeys.SetNpcStateAction).done(function(loadedConfigData) {
                        if(!loadedConfigData)
                        {
                            return;
                        }
                        
                        try
                        {
                            var configLines = JSON.parse(loadedConfigData)
                            self.suggestedNpcStates(configLines);
                        }
                        catch(e)
                        {
                            self.errorOccured(true);
                        }
                    }).fail(function() {
                        self.errorOccured(true);
                    })
                },

                /**
                 * Creates a layer for a map
                 * 
                 * @param {object} map Map to which the layer should be added
                 */
                createLayerForMap: function(map) {
                    this.markerMap = map;
                    this.markerLayer = L.layerGroup();
                    if(this.isEditingDailyRoutine())
                    {
                        this.markerLayer.addTo(map);
                        this.syncDailyRoutineMarkers();
                    }

                    if(this.dailyRoutineNpcIdFromUrl) {
                        this.editDailyRoutineByNpcId(this.dailyRoutineNpcIdFromUrl, true);
                        this.dailyRoutineNpcIdFromUrl = null;
                    }
                },

                /**
                 * Sets the layer visibility based on the observable value
                 */
                syncLayerVisibility: function() {
                    if(!this.markerLayer || !this.markerMap)
                    {
                        return;
                    }

                    if(this.isLayerVisible())
                    {
                        this.markerLayer.addTo(this.markerMap);
                    }
                    else
                    {
                        this.markerLayer.removeFrom(this.markerMap);
                    }
                },

                /**
                 * Syncs the daily routine markers
                 */
                syncDailyRoutineMarkers: function() {
                    if(!this.markerLayer) {
                        return;
                    }

                    this.markerLayer.clearLayers();
                    
                    if(!this.dailyRoutineEvents()) {
                        return;
                    }

                    var sortedEvents = this.dailyRoutineEvents().sort(function(event1, event2) {
                        var d1 = event1.earliestTime();
                        var d2 = event2.earliestTime();

                        return GoNorth.BindingHandlers.compareTimes(d1, d2)
                    });

                    // Add markers
                    var mapId = this.viewModel.id();
                    var activeLatLngCoords = [];
                    var activeMovementEvents = [];
                    for(var curDailyRoutineEvent = 0; curDailyRoutineEvent < sortedEvents.length; ++curDailyRoutineEvent)
                    {
                        if(!this.showDisabledEvents() && !sortedEvents[curDailyRoutineEvent].enabledByDefault()) {
                            continue;
                        }

                        var movementTarget = sortedEvents[curDailyRoutineEvent].movementTarget;
                        if(!movementTarget || movementTarget.mapId != mapId) {
                            continue;
                        }

                        var latLng = L.latLng(movementTarget.lat, movementTarget.lng);
                        this.addMarkerForDailyRoutineEvent(latLng, sortedEvents[curDailyRoutineEvent]);

                        if(sortedEvents[curDailyRoutineEvent].enabledByDefault())
                        {
                            activeLatLngCoords.push(latLng);
                            activeMovementEvents.push(sortedEvents[curDailyRoutineEvent]);
                        }
                    }

                    // Show movement flow
                    if(activeMovementEvents.length > 1) {                        
                        activeLatLngCoords.push(activeLatLngCoords[0]);
                        activeMovementEvents.push(activeMovementEvents[0]);

                        var routineLine = L.polyline(activeLatLngCoords, { color: "#ff6631" });
                        routineLine.setText("  ►  ", {repeat: true, attributes: { fill: "#ff6631" }});
                        routineLine.addTo(this.markerLayer);

                        // Add time after path for draw ordering reasons
                        for(var curDailyRoutineEvent = 1; curDailyRoutineEvent < activeMovementEvents.length; ++curDailyRoutineEvent)
                        {
                            var earliest = activeMovementEvents[curDailyRoutineEvent].earliestTime();
                            var latest = activeMovementEvents[curDailyRoutineEvent].latestTime();
                            
                            var textLine = L.polyline([ activeLatLngCoords[curDailyRoutineEvent - 1], activeLatLngCoords[curDailyRoutineEvent] ], { color: "transparent" });
                            textLine.setText(GoNorth.DailyRoutines.Util.formatTimeSpan(Map.Localization.TimeFormat, earliest, latest), { center: true, orientation: "fixed", attributes: { class: "gn-kartaDailyRoutineTimeLabel", fill: "#FFF" } });
                            textLine.addTo(this.markerLayer);
                        }
                    }
                },

                /**
                 * Adds a marker for a daily routine event
                 * @param {L.latLng} latLng Lat lng coordinates
                 * @param {object} routineEvent Daily routine event
                 */
                addMarkerForDailyRoutineEvent: function(latLng, routineEvent) {
                    var self = this;
                    var marker = new Map.DailyRoutineMarker(latLng, routineEvent);
                    marker.setEditCallback(function() {
                        self.editDailyRoutineEvent(routineEvent);
                    });
                    marker.setDeleteCallback(function() {
                        self.openDeleteDailyRoutineEvent(routineEvent);
                    });
                    marker.setExportName(routineEvent.movementTarget && routineEvent.movementTarget.exportName ? routineEvent.movementTarget.exportName : "");
                    marker.setEditExportNameCallback(function() {
                        marker.setExportName(routineEvent.movementTarget && routineEvent.movementTarget.exportName ? routineEvent.movementTarget.exportName : "");
                        self.viewModel.openEditExportNameDialog(marker, function(newName) {
                            marker.setExportName(newName);
                            self.setDailyRoutineEventExportName(routineEvent, newName);
                        });
                    });
                    marker.addTo(this.markerLayer);
                    marker.setOnDragEnd(function() {
                        self.updateDailyRoutineMarkerPosition(marker, routineEvent);
                    });
                    this.viewModel.setupNewMarker(marker);
                },

                /**
                 * Sets the export name of a daily routine event
                 * @param {object} routineEvent Daily routine event
                 * @param {string} newName New export name
                 */
                setDailyRoutineEventExportName: function(routineEvent, newName) {
                    if(!routineEvent.movementTarget) {
                        return;
                    }

                    var oldName = routineEvent.movementTarget.exportName;
                    routineEvent.movementTarget.exportName = newName;

                    this.isLoading(true);
                    this.errorOccured(false);

                    var self = this;
                    this.saveDailyRoutineEvent(routineEvent).done(function() {
                        self.isLoading(false);
                    }).fail(function() {
                        routineEvent.movementTarget.exportName = oldName;
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Updates the daily routine marker position after a drag event
                 * @param {GoNorth.Karta.Map.DailyRoutineMarker} marker Marker that was dragged
                 * @param {object} routineEvent Daily routine event
                 */
                updateDailyRoutineMarkerPosition: function(marker, routineEvent) {
                    var oldPos = {
                        lat: routineEvent.movementTarget.lat,
                        lng: routineEvent.movementTarget.lng
                    }

                    var newPos = marker.getLatLng();
                    routineEvent.movementTarget.lat = newPos.lat;
                    routineEvent.movementTarget.lng = newPos.lng;

                    var self = this;
                    this.isLoading(true);
                    this.errorOccured(false);

                    this.syncDailyRoutineMarkers();
                    this.saveDailyRoutineEvent(routineEvent).done(function() {
                        self.isLoading(false);
                    }).fail(function() {
                        routineEvent.movementTarget.lat = oldPos.lat;
                        routineEvent.movementTarget.lng = oldPos.lng;
                        self.syncDailyRoutineMarkers();
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },


                /**
                 * Edits the daily routine of an npc marker
                 * @param {object} npcMarker Npc marker to edit the raily routine for
                 */
                editDailyRoutineOfMarker: function(npcMarker) {
                    if(this.isEditingDailyRoutine() && this.currentNpcId() == npcMarker.npcId)
                    {
                        this.isLayerVisible(true);
                        this.syncLayerVisibility();

                        npcMarker.closePopup();
                        return;
                    }

                    this.editDailyRoutineByNpcId(npcMarker.npcId, false);
                    npcMarker.closePopup();
                },

                /**
                 * Starst editing the daily routine of an npc by its id
                 * @param {string} npcId Id of the npc
                 * @param {boolean} fromUrl true if the start of the editing is coming from the url
                 */
                editDailyRoutineByNpcId: function(npcId, fromUrl) {
                    if(!fromUrl) {
                        this.viewModel.setCurrentObjectId("", null);
                    }
                    
                    this.isLayerVisible(true);
                    this.syncLayerVisibility();

                    this.isEditingDailyRoutine(true);
                    this.showDisabledEvents(true);
                    this.currentNpcId(npcId);

                    this.isLoading(true);
                    this.errorOccured(false);

                    var self = this;
                    Map.loadNpcCached(npcId).done(function(npc) {
                        self.isLoading(false);

                        if(!self.isEditingDailyRoutine())
                        {
                            return;
                        }

                        self.editingDailyRoutineNpcName(npc.name);
                        self.dailyRoutineEvents(GoNorth.DailyRoutines.deserializeRoutineEventArray(npc.dailyRoutine));
                        self.syncDailyRoutineMarkers();
                        if(self.markerLayer) {
                            self.markerLayer.addTo(self.markerMap);
                        }

                        if(fromUrl && self.zoomOnDailyRoutineAfterInit) {
                            self.zoomOnDailyRoutine();
                        }
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });

                    this.acquireLock();
                    if(!fromUrl) {
                        this.viewModel.refreshUrlParameters();
                    }
                },

                /**
                 * Zooms on the daily routine
                 */
                zoomOnDailyRoutine: function() {
                    this.zoomOnDailyRoutineAfterInit = false;
                    if(this.markerLayer && this.markerLayer.getLayers().length > 0) {
                        var boundingBox = { minLat: 1000000, maxLat: -1000000, minLng: 1000000, maxLng: -1000000 };
                        this.markerLayer.eachLayer(function(layer) {
                            if(!layer.getLatLng) {
                                return;
                            }

                            var latLng = layer.getLatLng();
                            boundingBox.minLat = Math.min(boundingBox.minLat, latLng.lat);
                            boundingBox.maxLat = Math.max(boundingBox.maxLat, latLng.lat);
                            boundingBox.minLng = Math.min(boundingBox.minLng, latLng.lng);
                            boundingBox.maxLng = Math.max(boundingBox.maxLng, latLng.lng);
                        });
                        var leafletBoundingBox = L.latLngBounds(L.latLng(boundingBox.minLat, boundingBox.minLng), L.latLng(boundingBox.maxLat, boundingBox.maxLng));
                        this.markerMap.fitBounds(leafletBoundingBox);
                    }
                },


                /**
                 * Leaves the edit mode
                 */
                leaveEditMode: function() {
                    if(!this.isEditingDailyRoutine())
                    {
                        return;
                    }

                    this.isEditingDailyRoutine(false);
                    this.isLayerVisible(false);
                    this.showEventCallout(false);
                    this.editingDailyRoutineNpcName("");
                    this.currentNpcId("");

                    if(this.markerLayer) {
                        this.markerLayer.removeFrom(this.markerMap);
                    }

                    GoNorth.LockService.releaseCurrentLock();
                    this.viewModel.refreshUrlParameters();
                },


                /**
                 * Adds a new marker
                 * 
                 * @param {object} map Map Object
                 * @param {object} latLng Click coordinates
                 */
                addMarker: function(map, latLng) {                    
                    this.addEditEventName("");
                    this.addEditEventEarliestTime(GoNorth.BindingHandlers.buildTimeObject(0, 0));
                    this.addEditEventLatestTime(GoNorth.BindingHandlers.buildTimeObject(0, 0));
                    this.addEditEventTargetState("");
                    this.addEditEventTargetReachedScript("");
                    this.addEditEventTargetReachedScriptType = GoNorth.DailyRoutines.ScriptTypes.none;
                    this.addEditEventTargetReachedScriptGraph = null;
                    this.addEditEventTargetReachedScriptCode = "";
                    this.addEditEventEnabledByDefault(true);
                    this.eventToEdit(null);

                    this.showEventCallout(false);
                    this.addEditEventDialogLoading(false);
                    this.addEditEventDialogErrorOccured(false);
                    this.showAddEditEventDialog(true);

                    this.addMarkerLatLng = latLng;
                }, 

                /**
                 * Edits a daily routine event
                 * @param {object} event Event to edit
                 */
                editDailyRoutineEvent: function(event) {
                    this.addEditEventName(event.movementTarget.name);
                    this.addEditEventEarliestTime(GoNorth.BindingHandlers.buildTimeObject(event.earliestTime().hours, event.earliestTime().minutes));
                    this.addEditEventLatestTime(GoNorth.BindingHandlers.buildTimeObject(event.latestTime().hours, event.latestTime().minutes));
                    this.addEditEventTargetState(event.targetState());
                    this.addEditEventTargetReachedScript(event.scriptName());
                    this.addEditEventTargetReachedScriptType = event.scriptType;
                    this.addEditEventTargetReachedScriptGraph = event.scriptNodeGraph;
                    this.addEditEventTargetReachedScriptCode = event.scriptCode;
                    this.addEditEventEnabledByDefault(event.enabledByDefault());
                    this.eventToEdit(event);
                    
                    this.showEventCallout(false);
                    this.addEditEventDialogLoading(false);
                    this.addEditEventDialogErrorOccured(false);
                    this.showAddEditEventDialog(true);
                },

                /**
                 * Confirms the add / edit event marker
                 */
                confirmAddEditEvent: function() {
                    if(!jQuery("#gn-addEditEventForm").valid())
                    {
                        return;
                    }

                    var routineEvent = null;
                    var isEdit = false;
                    if(!this.eventToEdit())
                    {
                        var movementTarget = GoNorth.DailyRoutines.createMovementTarget(this.viewModel.id(), this.addEditEventName(), "", this.addMarkerLatLng.lat, this.addMarkerLatLng.lng);
                        routineEvent = GoNorth.DailyRoutines.createRoutineEvent(GoNorth.DailyRoutines.EventTypes.movement, this.addEditEventEarliestTime(), this.addEditEventLatestTime(), movementTarget, 
                                                                         this.addEditEventTargetState(), this.addEditEventTargetReachedScriptType, this.addEditEventTargetReachedScript(), 
                                                                         this.addEditEventTargetReachedScriptGraph, this.addEditEventTargetReachedScriptCode, this.addEditEventEnabledByDefault());
                    }
                    else
                    {
                        routineEvent = this.eventToEdit();
                        routineEvent.earliestTime(GoNorth.BindingHandlers.buildTimeObject(this.addEditEventEarliestTime().hours, this.addEditEventEarliestTime().minutes));
                        routineEvent.latestTime(GoNorth.BindingHandlers.buildTimeObject(this.addEditEventLatestTime().hours, this.addEditEventLatestTime().minutes)),
                        routineEvent.movementTarget.name = this.addEditEventName(),
                        routineEvent.targetState(this.addEditEventTargetState()),
                        routineEvent.scriptType = this.addEditEventTargetReachedScriptType;
                        routineEvent.scriptName(this.addEditEventTargetReachedScript());
                        routineEvent.scriptNodeGraph = this.addEditEventTargetReachedScriptGraph;
                        routineEvent.scriptCode = this.addEditEventTargetReachedScriptCode;
                        routineEvent.enabledByDefault(this.addEditEventEnabledByDefault());
                        isEdit = true;
                    }
                    

                    this.addEditEventDialogLoading(true);
                    this.addEditEventDialogErrorOccured(false);

                    var self = this;
                    this.saveDailyRoutineEvent(routineEvent).done(function() {
                        self.addEditEventDialogLoading(false);

                        if(!isEdit) 
                        {
                            self.dailyRoutineEvents.push(routineEvent);
                        }
                        if(!self.addEditEventEnabledByDefault() && !self.showDisabledEvents()) {
                            self.showDisabledEvents(true);
                        }
                        self.syncDailyRoutineMarkers();
                        self.closeAddEditEventDialog();
                    }).fail(function() {
                        self.addEditEventDialogLoading(false);
                        self.addEditEventDialogErrorOccured(true);
                    });
                },

                /**
                 * Closes the add / edit event marker dialog
                 */
                closeAddEditEventDialog: function() {
                    this.showAddEditEventDialog(false);
                },


                /**
                 * Adds or edit a target reached script
                 */
                addEditTargetReachedScript: function() {
                    if(this.addEditEventTargetReachedScriptType == GoNorth.DailyRoutines.ScriptTypes.none)
                    {
                        this.addTargetReachedScript();
                    }
                    else
                    {
                        this.editTargetReachedScript();
                    }
                },

                /**
                 * Adds a target reached script
                 */
                addTargetReachedScript: function() {
                    var self = this;
                    this.chooseScriptTypeDialog.openDialog().done(function(selectedType) {
                        if(selectedType == GoNorth.DailyRoutines.ChooseScriptTypeDialog.nodeGraph)
                        {
                            self.nodeScriptDialog.openCreateDialog().done(function(result) {
                                self.addEditEventTargetReachedScript(result.name);
                                self.addEditEventTargetReachedScriptType = GoNorth.DailyRoutines.ScriptTypes.nodeGraph;
                                self.addEditEventTargetReachedScriptCode = "";
                                self.addEditEventTargetReachedScriptGraph = result.graph;
                            });
                        }
                        else if(selectedType == GoNorth.DailyRoutines.ChooseScriptTypeDialog.codeScript)
                        {
                            self.codeScriptDialog.openCreateDialog().done(function(result) {
                                self.addEditEventTargetReachedScript(result.name);
                                self.addEditEventTargetReachedScriptType = GoNorth.DailyRoutines.ScriptTypes.codeScript;
                                self.addEditEventTargetReachedScriptCode = result.code;
                                self.addEditEventTargetReachedScriptGraph = null;
                            });
                        }
                    });
                },

                /**
                 * Edits the target reached script
                 */
                editTargetReachedScript: function() {
                    var self = this;
                    if(this.addEditEventTargetReachedScriptType == GoNorth.DailyRoutines.ScriptTypes.nodeGraph)
                    {
                        this.nodeScriptDialog.openEditDialog(this.addEditEventTargetReachedScript(), this.addEditEventTargetReachedScriptGraph).done(function(result) {
                            self.addEditEventTargetReachedScript(result.name);
                            self.addEditEventTargetReachedScriptGraph = result.graph;
                        });
                    }
                    else if(this.addEditEventTargetReachedScriptType == GoNorth.DailyRoutines.ScriptTypes.codeScript)
                    {
                        this.codeScriptDialog.openEditDialog(this.addEditEventTargetReachedScript(), this.addEditEventTargetReachedScriptCode).done(function(result) {
                            self.addEditEventTargetReachedScript(result.name);
                            self.addEditEventTargetReachedScriptCode = result.code;
                        });
                    }
                },


                /**
                 * Opens the confirm delete daily routine event dialog
                 * @param {object} eventToDelete Event to delete
                 */
                openDeleteDailyRoutineEvent: function(eventToDelete) {
                    this.showConfirmDeleteEventDialog(true);
                    this.eventToDelete = eventToDelete;
                },

                /**
                 * Deletes the daily routine event for which the confirm delete dialog is open
                 */
                deleteDailyRoutineEvent: function() {
                    this.dailyRoutineEvents.remove(this.eventToDelete);
                    this.syncDailyRoutineMarkers();
                    
                    this.sendDeleteDailyRoutineEventRequest(this.eventToDelete);
                    this.closeConfirmDeleteEventDialog();
                },

                /**
                 * Sends a delete daily routine event request
                 * @param {object} eventToDelete Event to delete
                 */
                sendDeleteDailyRoutineEventRequest: function(eventToDelete) {
                    this.isLoading(true);
                    this.errorOccured(false);

                    var self = this;
                    var currentNpcId = this.currentNpcId();
                    jQuery.ajax({ 
                        url: "/api/KortistoApi/DeleteDailyRoutineEvent?id=" + encodeURIComponent(currentNpcId) + "&eventId=" + encodeURIComponent(eventToDelete.eventId), 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        type: "DELETE"
                    }).done(function() {
                        Map.invalidateCachedNpc(currentNpcId);

                        self.isLoading(false);
                    }).fail(function() {
                        self.dailyRoutineEvents.push(eventToDelete);
                        self.syncDailyRoutineMarkers();
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Closes the confirm delete daily routine event dialog
                 */
                closeConfirmDeleteEventDialog: function() {
                    this.showConfirmDeleteEventDialog(false);
                    this.eventToDelete = null;
                },


                /**
                 * Opens the confirm delete script dialog
                 */
                openConfirmDeleteScriptDialog: function() {
                    this.showConfirmDeleteScriptDialog(true);
                },

                /**
                 * Removes the target reached script
                 */
                removeTargetReachedScript: function() {
                    this.addEditEventTargetReachedScript("");
                    this.addEditEventTargetReachedScriptType = GoNorth.DailyRoutines.ScriptTypes.none
                    this.addEditEventTargetReachedScriptCode = "";
                    this.addEditEventTargetReachedScriptGraph = null;

                    this.closeConfirmDeleteScriptDialog();
                },

                /**
                 * Closes the confirm delete script dialog
                 */
                closeConfirmDeleteScriptDialog: function() {
                    this.showConfirmDeleteScriptDialog(false);
                },


                /**
                 * Saves a daily routine event
                 * @param {object} routineEvent Routine event to save
                 * @returns {jQuery.Deferred} Deferred for the loading process
                 */
                saveDailyRoutineEvent: function(routineEvent) {
                    var def = new jQuery.Deferred();

                    var currentNpcId = this.currentNpcId();
                    jQuery.ajax({ 
                        url: "/api/KortistoApi/SaveDailyRoutineEvent?id=" + encodeURIComponent(currentNpcId), 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        data: JSON.stringify(GoNorth.DailyRoutines.serializeRoutineEvent(routineEvent)), 
                        type: "POST",
                        contentType: "application/json"
                    }).done(function(eventId) {
                        Map.invalidateCachedNpc(currentNpcId);

                        if(!routineEvent.eventId) {
                            routineEvent.eventId = eventId;
                        }

                        def.resolve();
                    }).fail(function() {
                        def.reject();
                    });

                    return def.promise();
                },


                /**
                 * Acquires a lock for the npc
                 */
                acquireLock: function() {
                    this.showNpcLockedByDialog(false);
                    this.npcLockedBy("");
                    var self = this;
                    GoNorth.LockService.acquireLock("KortistoNpc", this.currentNpcId()).done(function(isLocked, lockedUsername) {
                        if(isLocked)
                        {
                            self.showNpcLockedByDialog(true);
                            self.npcLockedBy(lockedUsername);
                            self.leaveEditMode();
                        }
                    }).fail(function() {
                        self.errorOccured(true);
                        self.leaveEditMode();
                    });
                },

                /**
                 * Closes the npc locked by dialog
                 */
                closeNpcLockedByDialog: function() {
                    this.showNpcLockedByDialog(false);
                },


                /**
                 * Compare function for the daily routines array
                 * @param {object} event1 Daily routines event 1
                 * @param {object} event2 Daily routines event 2
                 * @returns {number} Compare value
                 */
                compareTimeEvents: function(event1, event2) {
                    var d1 = event1.earliestTime();
                    var d2 = event2.earliestTime();

                    return GoNorth.BindingHandlers.compareTimes(d1, d2);                    
                },


                /**
                 * Toggles the daily routine callout
                 */
                toggleDailyRoutineCallout: function() {
                    this.showEventCallout(!this.showEventCallout());
                },

                /**
                 * Toggles if disabled events should be shown or not
                 */
                toogleShowDisabledEvents: function() {
                    this.showDisabledEvents(!this.showDisabledEvents());
                    this.showEventCallout(false);
                    this.syncDailyRoutineMarkers();
                },


                /**
                 * Builds the npc link for the current npc
                 */
                buildNpcLink: function() {
                    return "/Kortisto/Npc?id=" + this.currentNpcId();
                },


                /**
                 * Builds the url parameters
                 * @returns {string} Url parameters
                 */
                buildUrlParameters: function() {
                    if(!this.isEditingDailyRoutine())
                    {
                        return "";
                    }
                    
                    return "&dailyRoutineNpcId=" + this.currentNpcId();
                }
            };

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));