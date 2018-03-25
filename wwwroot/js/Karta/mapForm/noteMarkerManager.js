(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /// New Note Button Id
            var newNoteButtonId = "NewNote";

            /**
             * Note Marker Manager
             * 
             * @param {object} viewModel Viewmodel to which the manager belongs
             * @class
             */
            Map.NoteMarkerManager = function(viewModel) 
            {
                Map.MarkerManager.apply(this, [ viewModel ]);

                this.title = GoNorth.Karta.Map.Localization.NoteMarkerTitle;

                this.markerType = "Note";

                this.hideSearchBar = true;
                this.hidePaging = true;

                this.additionalButtons.push({
                    buttonId: newNoteButtonId,
                    title: GoNorth.Karta.Map.Localization.NoteMarkerNewNote,
                    callback: this.createNewNoteMarker
                });
            }

            Map.NoteMarkerManager.prototype = jQuery.extend({ }, Map.MarkerManager.prototype)

            /**
             * Sends the entries request
             * 
             * @returns {jQuery.Deferred} Deferred for the async call
             */
            Map.NoteMarkerManager.prototype.sendEntriesRequest = function() {
                var def = new jQuery.Deferred();
                def.resolve({
                    entries: [],
                    hasMore: false
                });

                return def.promise();
            };

            /**
             * Sets the create mode for creating a new note marker
             */
            Map.NoteMarkerManager.prototype.createNewNoteMarker = function() {
                if(this.viewModel.selectedMarkerObjectId() == newNoteButtonId)
                {
                    this.deselectCurrentEntry();
                    return;
                }

                this.viewModel.setCurrentObjectId(newNoteButtonId, this);
            };

            /**
             * Creates a new marker
             * 
             * @param {string} objectId Object Id
             * @param {object} latLng Lat/Long Position
             */
            Map.NoteMarkerManager.prototype.createMarker = function(objectId, latLng) {
                var def = new jQuery.Deferred();
                
                var self = this;
                this.viewModel.openMarkerNameDialog("", true).then(function(name, description) {
                    var marker = new Map.NoteMarker(name, description, latLng);
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
            Map.NoteMarkerManager.prototype.setEditCallback = function(marker) {
                var self = this;
                marker.setEditCallback(function() {
                    self.viewModel.openMarkerNameDialog(marker.name, true, marker.description).then(function(name, description) {
                        if(marker.name == name && marker.description == description)
                        {
                            return;
                        }

                        marker.name = name;
                        marker.description = description;

                        // Update popup
                        if(marker.marker.getPopup())
                        {
                            jQuery(marker.marker.getPopup().getElement()).find(".gn-kartaNoteMarkerTitle").text(name);
                            jQuery(marker.marker.getPopup().getElement()).find(".gn-kartaPopupContent").text(description);
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
            Map.NoteMarkerManager.prototype.parseMarker = function(unparsedMarker, latLng) {
                return new Map.NoteMarker(unparsedMarker.name, unparsedMarker.description, latLng);
            };

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));