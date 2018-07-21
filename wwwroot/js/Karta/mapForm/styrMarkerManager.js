(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /// Styr Page Size
            var styrPageSize = 20;

            /**
             * Styr Marker Manager
             * 
             * @param {object} viewModel Viewmodel to which the manager belongs
             * @class
             */
            Map.StyrMarkerManager = function(viewModel) 
            {
                Map.MarkerManager.apply(this, [ viewModel ]);

                this.title = GoNorth.Karta.Map.Localization.StyrMarkerTitle;

                this.markerType = "Item";
            }

            Map.StyrMarkerManager.prototype = jQuery.extend({ }, Map.MarkerManager.prototype)

            /**
             * Sends the entries request
             * 
             * @returns {jQuery.Deferred} Deferred for the async call
             */
            Map.StyrMarkerManager.prototype.sendEntriesRequest = function() {
                var def = new jQuery.Deferred();
                jQuery.ajax({ 
                    url: "/api/StyrApi/SearchFlexFieldObjects?searchPattern=" + this.searchTerm() + "&start=" + (this.currentPage() * styrPageSize) + "&pageSize=" + styrPageSize, 
                    type: "GET"
                }).done(function(data) {
                    def.resolve({
                        entries: data.flexFieldObjects,
                        hasMore: data.hasMore
                    });
                }).fail(function() {
                    def.reject();
                })

                return def.promise();
            };

            /**
             * Creates a new marker
             * 
             * @param {string} objectId Object Id
             * @param {object} latLng Lat/Long Position
             */
            Map.StyrMarkerManager.prototype.createMarker = function(objectId, latLng) {
                var def = new jQuery.Deferred();
                var itemName = "";
                var item = this.findEntryById(objectId);
                if(item) 
                {
                    itemName = item.name;
                }

                var marker = new Map.StyrMarker(objectId, itemName, latLng);
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
            Map.StyrMarkerManager.prototype.parseMarker = function(unparsedMarker, latLng) {
                return new Map.StyrMarker(unparsedMarker.itemId, unparsedMarker.itemName, latLng);
            };

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));