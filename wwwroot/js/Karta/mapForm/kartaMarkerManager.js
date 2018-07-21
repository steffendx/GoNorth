(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /**
             * Karta Marker Manager
             * 
             * @param {object} viewModel Viewmodel to which the manager belongs
             * @class
             */
            Map.KartaMarkerManager = function(viewModel) 
            {
                Map.MarkerManager.apply(this, [ viewModel ]);

                this.title = GoNorth.Karta.Map.Localization.KartaMarkerTitle;

                this.markerType = "MapChange";

                this.hideSearchBar = true;
                this.hidePaging = true;

                this.allMaps = [];

                var self = this;
                this.viewModel.id.subscribe(function() {
                    self.loadedEntries(self.getFilteredMaps());
                    if(!self.isNotSelected())
                    {
                        self.viewModel.resetMarkerObjectData();
                    }
                });
            }

            Map.KartaMarkerManager.prototype = jQuery.extend({ }, Map.MarkerManager.prototype)

            /**
             * Sends the entries request
             * 
             * @returns {jQuery.Deferred} Deferred for the async call
             */
            Map.KartaMarkerManager.prototype.sendEntriesRequest = function() {
                var def = new jQuery.Deferred();
                if(this.allMaps.length > 0)
                {
                    def.resolve({
                        entries: this.getFilteredMaps(),
                        hasMore: false
                    });
                    return def.promise();
                }

                var self = this;
                jQuery.ajax({ 
                    url: "/api/KartaApi/Maps", 
                    type: "GET"
                }).done(function(data) {
                    self.allMaps = data;
                    def.resolve({
                        entries: self.getFilteredMaps(),
                        hasMore: false
                    });
                }).fail(function() {
                    def.reject();
                })

                return def.promise();
            };

            /**
             * Returns all the maps except the one which is currently opened
             * 
             * @returns {object[]} Filtered maps
             */
            Map.KartaMarkerManager.prototype.getFilteredMaps = function() {
                var maps = [];
                for(var curMap = 0; curMap < this.allMaps.length; ++curMap)
                {
                    if(this.allMaps[curMap].id != this.viewModel.id())
                    {
                        maps.push(this.allMaps[curMap]);
                    }
                }
                return maps;
            };

            /**
             * Creates a new marker
             * 
             * @param {string} objectId Object Id
             * @param {object} latLng Lat/Long Position
             */
            Map.KartaMarkerManager.prototype.createMarker = function(objectId, latLng) {
                var def = new jQuery.Deferred();
                var mapName = "";
                var map = this.findEntryById(objectId);
                if(map) 
                {
                    mapName = map.name;
                }

                var marker = new Map.KartaMarker(objectId, mapName, latLng);
                this.pushMarker(marker);
                def.resolve(marker);

                return def.promise();
            };

            /**
             * Parses a marker
             * 
             * @param {object} unparsedMarker Unparsed marker
             * @param {object} latLng Lat/Long Position
             */
            Map.KartaMarkerManager.prototype.parseMarker = function(unparsedMarker, latLng) {
                return new Map.KartaMarker(unparsedMarker.mapId, unparsedMarker.mapName, latLng);
            };

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));