(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /// Kortisto Page Size
            var kortistoPageSize = 20;

            /**
             * Kortisto Marker Manager
             * 
             * @param {object} viewModel Viewmodel to which the manager belongs
             * @class
             */
            Map.KortistoMarkerManager = function(viewModel) 
            {
                Map.MarkerManager.apply(this, [ viewModel ]);

                this.title = GoNorth.Karta.Map.Localization.KortistoMarkerTitle;

                this.markerType = "Npc";
            }

            Map.KortistoMarkerManager.prototype = jQuery.extend({ }, Map.MarkerManager.prototype)

            /**
             * Sends the entries request
             * 
             * @returns {jQuery.Deferred} Deferred for the async call
             */
            Map.KortistoMarkerManager.prototype.sendEntriesRequest = function() {
                var def = new jQuery.Deferred();
                jQuery.ajax({ 
                    url: "/api/KortistoApi/SearchFlexFieldObjects?searchPattern=" + this.searchTerm() + "&start=" + (this.currentPage() * kortistoPageSize) + "&pageSize=" + kortistoPageSize, 
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
            Map.KortistoMarkerManager.prototype.createMarker = function(objectId, latLng) {
                var def = new jQuery.Deferred();
                var npcName = "";
                var npc = this.findEntryById(objectId);
                if(npc) 
                {
                    npcName = npc.name;
                }
                
                var marker = new Map.KortistoMarker(objectId, npcName, latLng);
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
            Map.KortistoMarkerManager.prototype.parseMarker = function(unparsedMarker, latLng) {
                return new Map.KortistoMarker(unparsedMarker.npcId, unparsedMarker.npcName, latLng);
            };

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));