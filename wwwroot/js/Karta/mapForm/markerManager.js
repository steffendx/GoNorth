(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /// Selection Mode None
            var selectionModeNone = 0;

            /// Selection Mode Default
            var selectionModeDefault = 1;

            /**
             * Marker Manager
             * 
             * @param {object} viewModel Viewmodel to which the manager belongs
             * @class
             */
            Map.MarkerManager = function(viewModel) 
            {
                this.viewModel = viewModel;

                this.markerSelectionMode = selectionModeNone;

                this.preSelectType = null;
                this.markerType = null;

                this.isExpanded = new ko.observable(false);
                this.isLoading = new ko.observable(false);
                this.errorOccured = new ko.observable(false);

                this.loadedEntries = new ko.observableArray();
                this.searchTerm = new ko.observable("");
                this.currentPage = new ko.observable(0);
                this.hasMore = new ko.observable(false);

                this.additionalButtons = new ko.observableArray();

                this.markerChildShowId = new ko.observable("");

                this.hideSearchBar = false;
                this.hidePaging = false;

                this.markers = [];
                this.unparsedMarkers = [];

                this.markerLayer = null;
                this.markerMap = null;
                this.isLayerVisible = new ko.observable(true);
                var self = this;
                this.isLayerVisible.subscribe(function() {
                    self.syncLayerVisibility();
                });
            }

            Map.MarkerManager.prototype = {
                /**
                 * Creates a layer for a map
                 * 
                 * @param {object} map Map to which the layer should be added
                 */
                createLayerForMap: function(map) {
                    this.markerMap = map;
                    this.markerLayer = L.layerGroup();
                    if(this.isLayerVisible())
                    {
                        this.markerLayer.addTo(map);
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
                        if(!this.isNotSelected())
                        {
                            this.viewModel.resetMarkerObjectData();
                        }
                    }
                },

                /**
                 * Checks the pre selection
                 * 
                 * @param {string} preSelectType Type of the pre select (Quest, ...)
                 * @param {string} preSelectId Id of the pre selection
                 * @returns {jQuery.Deferred} Deferred for the loading process
                 */
                checkPreSelection: function(preSelectType, preSelectId)
                {
                    var def = new jQuery.Deferred();
                    if(!this.preSelectType || this.preSelectType != preSelectType)
                    {
                        def.reject();
                        return def.promise();
                    }

                    this.isExpanded(true);

                    this.isLoading(true);
                    this.errorOccured(false);
                    var self = this;
                    this.loadPreSelectionObject(preSelectType, preSelectId).done(function(entry) {
                        self.searchTerm(entry.name);
                        self.loadedEntries([ entry ]);
                        self.hasMore(false);
                        self.isLoading(false);

                        if(!self.isNotSelected())
                        {
                            self.viewModel.resetMarkerObjectData();
                        }
                        self.selectEntry(entry);
                        def.resolve();
                    }).fail(function() {
                        self.errorOccured(true);
                        self.isLoading(false);
                        def.reject();
                    });
                    
                    return def.promise();
                },

                /**
                 * Loads the pre selection object
                 * 
                 * @param {string} preSelectType Type of the pre select (Quest, ...)
                 * @param {string} preSelectId Id of the pre selection object
                 * @returns {jQuery.Deferred} Deferred for the loading process
                 */
                loadPreSelectionObject: function(preSelectType, preSelectId)
                {
                    var def = new jQuery.Deferred();
                    def.reject("Not implemented");
                    return def.promise();
                },

                /**
                 * Checks if the marker manager must zoom on a marker
                 * 
                 * @param {string} zoomOnMarkerType Type of the marker to zoom on (Npc, Item, Quest, ...)
                 * @param {string} zoomOnMarkerId Id of the marker to zoom on
                 */
                checkZoomOnMarker: function(zoomOnMarkerType, zoomOnMarkerId) {
                    if(!this.markerType || this.markerType != zoomOnMarkerType)
                    {
                        return;
                    }

                    for(var curMarker = 0; curMarker < this.markers.length; ++curMarker)
                    {
                        if(this.markers[curMarker].id == zoomOnMarkerId)
                        {
                            var self = this;
                            this.checkZoomOnMarkerPreSelectionRequirements(this.markers[curMarker]).done(function() {
                                self.viewModel.switchChapterByNumber(self.markers[curMarker].getAddedInChapter());
                                self.markers[curMarker].zoomOn(self.markerMap);
                            });
                            return;
                        }
                    }
                },

                /**
                 * Checks if marker has pre selection requirements for zooming on (like selecting a quest for a marker)
                 * 
                 * @param {object} marker Marker which will be zoomed on
                 * @returns {jQuery.Deferred} Deferred for loading process
                 */
                checkZoomOnMarkerPreSelectionRequirements: function(marker) {
                    var def = new jQuery.Deferred();
                    def.resolve();
                    return def.promise();
                },
                
                /**
                 * Toogles the visibility
                 */
                toogleVisibility: function() {
                    this.isExpanded(!this.isExpanded());

                    if(this.loadedEntries().length === 0)
                    {
                        this.currentPage(0);
                        this.loadEntries();
                    }
                },

                /**
                 * Starts a new search
                 */
                startNewSearch: function() {
                    this.currentPage(0);
                    this.loadEntries();
                },

                /**
                 * Loads the previous search page
                 */
                prevPage: function() {
                    this.currentPage(this.currentPage() - 1);

                    this.loadEntries();
                },

                /**
                 * Loads the next search page
                 */
                nextPage: function() {
                    this.currentPage(this.currentPage() + 1);

                    this.loadEntries();
                },

                /**
                 * Loads the entries
                 */
                loadEntries: function() {
                    this.onEntrySelected(null);

                    this.isLoading(true);
                    this.errorOccured(false);
                    var self = this;
                    this.sendEntriesRequest().done(function(data) {
                        self.loadedEntries(data.entries);
                        self.hasMore(data.hasMore);
                        self.isLoading(false);

                        if(!self.isNotSelected())
                        {
                            self.viewModel.resetMarkerObjectData();
                        }
                    }).fail(function() {
                        self.errorOccured(true);
                        self.isLoading(false);
                    });
                },

                /**
                 * Resets the selection data
                 */
                resetSelectionData: function() {
                    this.markerSelectionMode = selectionModeNone;
                },

                /**
                 * Gets called whenever an entry is selected
                 * 
                 * @param {object} entry Entry that was selected
                 */
                onEntrySelected: function(entry)
                {

                },

                /**
                 * Deselects the current entry
                 */
                deselectCurrentEntry: function() {
                    this.onEntrySelected(null);
                    this.resetSelectionData();
                    this.viewModel.setCurrentObjectId(null, null);
                },

                /**
                 * Selects an entry
                 * 
                 * @param {object} entry Entry to select
                 */
                selectEntry: function(entry) {
                    if(this.viewModel.isReadonly())
                    {
                        return;
                    }

                    if(this.viewModel.selectedMarkerObjectId() == entry.id)
                    {
                        this.deselectCurrentEntry();
                        return;
                    }

                    this.onEntrySelected(entry);

                    this.viewModel.setCurrentObjectId(entry.id, this);
                    this.markerSelectionMode = selectionModeDefault;

                    if(!this.isLayerVisible())
                    {
                        this.isLayerVisible(true);
                    }
                },

                /**
                 * Returns true if the manager is not selected, else false
                 * 
                 * @returns {bool} true if the manager is not selected, else false
                 */
                isNotSelected: function() {
                    return this.markerSelectionMode == selectionModeNone;
                },

                /**
                 * Returns true if the default mode is selected, else false
                 * 
                 * @returns {bool} true if the default mode is selected, else false
                 */
                isDefaultSelected: function() {
                    return this.markerSelectionMode == selectionModeDefault;
                },


                /**
                 * Resets the markers
                 */
                resetMarkers: function() {
                    this.markers = [];
                    this.unparsedMarkers = [];
                },

                /**
                 * Saves unparsed markers to parse later after map was loaded
                 */
                setUnparsedMarkers: function(unparsedMarkers)
                {
                    this.unparsedMarkers = unparsedMarkers;
                },

                /**
                 * Parses unparsed markers
                 * 
                 * @param {object} map Map for parsing
                 */
                parseUnparsedMarkers: function(map) {
                    this.parseMarkers(this.unparsedMarkers, map);
                },

                /**
                 * Returns the lat lng coordinates from a serialized marker
                 * 
                 * @param {object} serializedMarker Serialized Marker
                 * @param {object} map Map for unprojecting
                 */
                getLatLngFromSerializedMarker: function(serializedMarker, map) {
                    return map.unproject([ serializedMarker.x, serializedMarker.y ], map.getMaxZoom());
                },

                /**
                 * Parses markers
                 * 
                 * @param {object[]} markers to parse
                 * @param {object} map Map for parsing
                 */
                parseMarkers: function(markers, map) {
                    if(!markers)
                    {
                        markers = [];
                    }

                    this.markers = [];
                    for(var curMarker = 0; curMarker < markers.length; ++curMarker)
                    {
                        var latLng = this.getLatLngFromSerializedMarker(markers[curMarker], map);

                        var marker = this.parseMarker(markers[curMarker], latLng);
                        this.viewModel.setMarkerDragCallback(marker);
                        marker.setBaseDataFromSerialized(markers[curMarker]);

                        this.pushMarker(marker);
                    }
                },

                /**
                 * Removes a marker
                 * 
                 * @param {object} marker Marker to remove
                 */
                removeMarker: function(marker) {
                    for(var curMarker = 0; curMarker < this.markers.length; ++curMarker)
                    {
                        if(this.markers[curMarker] == marker)
                        {
                            this.markers.splice(curMarker, 1);
                            return;
                        }
                    }
                },

                /**
                 * Adjustes the markers to a chapter
                 * 
                 * @param {int} chapterNumber Number of the chapter
                 * @param {object} map Map object for calculating lat long
                 */
                adjustMarkersToChapter: function(chapterNumber, map) {
                    for(var curMarker = 0; curMarker < this.markers.length; ++curMarker)
                    {
                        this.markers[curMarker].adjustPositionToChapter(chapterNumber, map);

                        if(!this.canPushMarkerToMap(this.markers[curMarker]))
                        {
                            continue;
                        }

                        if(this.markers[curMarker].isValidForChapter(chapterNumber))
                        {
                            this.markers[curMarker].addTo(this.markerLayer);
                        }
                        else
                        {
                            this.markers[curMarker].removeFrom(this.markerLayer);
                        }
                    }
                },


                /**
                 * Sets a markers edit callback function
                 * 
                 * @param {object} marker Marker to set the edit callback for
                 */
                setEditCallback: function(marker) {
                },

                /**
                 * Sets a markers drag callback function
                 * 
                 * @param {object} marker Marker to set the delete callback for
                 */
                setDeleteCallback: function(marker) {
                    var self = this;
                    marker.setDeleteCallback(function() {
                        self.viewModel.openDeleteDialog(marker, self);
                    });
                },

                /**
                 * Checks if a new marker can be pushed to be the map
                 * 
                 * @param {marker} Marker Marker to push
                 * @returns {bool} true if marker can be pushed, else false
                 */
                canPushMarkerToMap: function(marker) {
                    return true;
                },

                /**
                 * Pushes a new marker
                 * 
                 * @param {marker} marker Marker to push
                 */
                pushMarker: function(marker) {
                    this.setEditCallback(marker);
                    this.setDeleteCallback(marker);
                    marker.setMapId(this.viewModel.id());
                    marker.setMarkerType(this.markerType);
                    marker.setCompareDialog(this.viewModel.compareDialog);
                    this.markers.push(marker);

                    var currentChapter = this.viewModel.getSelectedChapterNumber();

                    if((currentChapter == -1 || marker.isValidForChapter(currentChapter)) && this.canPushMarkerToMap(marker))
                    {
                        marker.addTo(this.markerLayer);
                    }
                },


                /**
                 * Disables the markers
                 */
                disable: function() {
                    for(var curMarker = 0; curMarker < this.markers.length; ++curMarker)
                    {
                        this.markers[curMarker].disable();
                    }
                },

                
                /**
                 * Sends the entries request
                 * 
                 * @returns {jQuery.Deferred} Deferred for the async call
                 */
                sendEntriesRequest: function() {
                    var def = new jQuery.Deferred();
                    def.reject();

                    return def.promise();
                },

                /**
                 * Creates a new marker
                 * 
                 * @param {string} objectId Object Id
                 * @param {object} latLng Lat/Long Position
                 */
                createMarker: function(objectId, latLng) {

                },

                /**
                 * Parses a marker
                 * 
                 * @param {object} unparsedMarker Unparsed marker
                 * @param {object} latLng Lat/Long Position
                 */
                parseMarker: function(unparsedMarker, latLng) {
                    return {};
                }
            };

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));