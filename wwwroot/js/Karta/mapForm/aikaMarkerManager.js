(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /// Aika Page Size
            var aikaPageSize = 20;

            /**
             * Aika Marker Manager
             * 
             * @param {object} viewModel Viewmodel to which the manager belongs
             * @class
             */
            Map.AikaMarkerManager = function(viewModel) 
            {
                Map.MarkerManager.apply(this, [ viewModel ]);

                this.title = GoNorth.Karta.Map.Localization.AikaMarkerTitle;

                this.preSelectType = "Quest";
                this.markerType = "Quest";
            }

            Map.AikaMarkerManager.prototype = jQuery.extend({ }, Map.MarkerManager.prototype)

            /**
             * Sends the entries request
             * 
             * @returns {jQuery.Deferred} Deferred for the async call
             */
            Map.AikaMarkerManager.prototype.sendEntriesRequest = function() {
                var def = new jQuery.Deferred();
                jQuery.ajax({ 
                    url: "/api/AikaApi/GetQuests?searchPattern=" + this.searchTerm() + "&start=" + (this.currentPage() * aikaPageSize) + "&pageSize=" + aikaPageSize, 
                    type: "GET"
                }).done(function(data) {
                    def.resolve({
                        entries: data.quests,
                        hasMore: data.hasMore
                    });
                }).fail(function() {
                    def.reject();
                })

                return def.promise();
            };

            /**
             * Loads the pre selection object
             * 
             * @param {string} preSelectType Type of the pre select (Quest, ...)
             * @param {string} preSelectId Id of the pre selection object
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Map.AikaMarkerManager.prototype.loadPreSelectionObject = function(preSelectType, preSelectId) {
                var def = new jQuery.Deferred();
                
                jQuery.ajax({ 
                    url: "/api/AikaApi/GetQuest?id=" + preSelectId, 
                    type: "GET"
                }).done(function(data) {
                    def.resolve(data);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Checks if marker has pre selection requirements for zooming on (like selecting a quest for a marker)
             * 
             * @param {object} marker Marker which will be zoomed on
             * @returns {jQuery.Deferred} Deferred for loading process
             */
            Map.AikaMarkerManager.prototype.checkZoomOnMarkerPreSelectionRequirements = function(marker) {
                return this.checkPreSelection(this.preSelectType, marker.questId);
            };

            /**
             * Gets called whenever an entry is selected
             * 
             * @param {object} entry Entry that was selected
             */
            Map.AikaMarkerManager.prototype.onEntrySelected = function(entry)
            {
                if(entry && (this.viewModel.selectedMarkerObjectId() != entry.id || this.markerChildShowId() != entry.id))
                {
                    this.markerChildShowId(entry.id);
                }
                else
                {
                    this.markerChildShowId("");
                }

                this.syncVisibleMarkers();
            };

            /**
             * Checks if a new marker can be pushed to be the map
             * 
             * @param {marker} Marker Marker to push
             * @returns {bool} true if marker can be pushed, else false
             */
            Map.AikaMarkerManager.prototype.syncVisibleMarkers = function() {
                if(!this.markerLayer)
                {
                    return;
                }

                var currentChapter = this.viewModel.getSelectedChapterNumber();

                for(var curMarker = 0; curMarker < this.markers.length; ++curMarker)
                {
                    if(this.markers[curMarker].questId != this.markerChildShowId())
                    {
                        this.markers[curMarker].removeFrom(this.markerLayer);
                    }
                    else
                    {
                        if(this.markers[curMarker].isValidForChapter(currentChapter))
                        {
                            this.markers[curMarker].addTo(this.markerLayer);
                        }
                    }
                }
            };

            /**
             * Checks if a new marker can be pushed to be the map
             * 
             * @param {marker} Marker Marker to push
             * @returns {bool} true if marker can be pushed, else false
             */
            Map.AikaMarkerManager.prototype.canPushMarkerToMap = function(marker) {
                return marker.questId == this.markerChildShowId();
            };

            /**
             * Creates a new marker
             * 
             * @param {string} objectId Object Id
             * @param {object} latLng Lat/Long Position
             */
            Map.AikaMarkerManager.prototype.createMarker = function(objectId, latLng) {
                var def = new jQuery.Deferred();
                
                var self = this;
                this.viewModel.openMarkerNameDialog().then(function(name) {
                    self.markerChildShowId(objectId);
                    self.syncVisibleMarkers();

                    var marker = new Map.AikaMarker(objectId, name, latLng);
                    self.pushMarker(marker);
                    def.resolve(marker);
                });

                return def.promise();
            };

            /**
             * Sets a markers edit callback function
             * 
             * @param {object} marker Marker to set the edit callback for
             */
            Map.AikaMarkerManager.prototype.setEditCallback = function(marker) {
                var self = this;
                marker.setEditCallback(function() {
                    self.viewModel.openMarkerNameDialog(marker.name).then(function(name) {
                        if(marker.name == name)
                        {
                            return;
                        }

                        marker.name = name;

                        // Update popup
                        if(marker.marker.getPopup())
                        {
                            jQuery(marker.marker.getPopup().getElement()).find(".gn-kartaPopupContent").text(name)
                        }

                        self.viewModel.saveMarker(marker);
                    });
                });
            };

            /**
             * Parses a marker
             * 
             * @param {object} unparsedMarker Unparsed marker
             * @param {object} latLng Lat/Long Position
             */
            Map.AikaMarkerManager.prototype.parseMarker = function(unparsedMarker, latLng) {
                return new Map.AikaMarker(unparsedMarker.questId, unparsedMarker.name, latLng);
            };

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));