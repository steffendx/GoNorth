(function(GoNorth) {
    "use strict";
    (function(Karta) {
        (function(Map) {

            /// Kirja Page Size
            var kirjaPageSize = 20;
            
            /// New Kirja Page Button Id
            var newKirjaPageButtonId = "NewKirjaPage";

            /// New Kirja Selection Mode
            var newKirjaPageSelectionMode = 2;

            /**
             * Kirja Marker Manager
             * 
             * @param {object} viewModel Viewmodel to which the manager belongs
             * @class
             */
            Map.KirjaMarkerManager = function(viewModel) 
            {
                Map.MarkerManager.apply(this, [ viewModel ]);

                this.title = GoNorth.Karta.Map.Localization.KirjaMarkerTitle;
                
                this.markerType = "KirjaPage";

                this.additionalButtons.push({
                    buttonId: newKirjaPageButtonId,
                    title: GoNorth.Karta.Map.Localization.KirjaMarkerNewPage,
                    callback: this.createNewKirjaMarker
                });
            }

            Map.KirjaMarkerManager.prototype = jQuery.extend({ }, Map.MarkerManager.prototype)

            /**
             * Sends the entries request
             * 
             * @returns {jQuery.Deferred} Deferred for the async call
             */
            Map.KirjaMarkerManager.prototype.sendEntriesRequest = function() {
                var def = new jQuery.Deferred();
                GoNorth.HttpClient.get("/api/KirjaApi/SearchPages?searchPattern=" + this.searchTerm() + "&start=" + (this.currentPage() * kirjaPageSize) + "&pageSize=" + kirjaPageSize).done(function(data) {
                    def.resolve({
                        entries: data.pages,
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
            Map.KirjaMarkerManager.prototype.createMarker = function(objectId, latLng) {
                var def = new jQuery.Deferred();
                
                if(this.isDefaultSelected())
                {
                    this.createMarkerFromExistingPage(def, objectId, latLng);
                }
                else if(this.markerSelectionMode == newKirjaPageSelectionMode)
                {
                    this.createMarkerFromNewPage(def, latLng);
                }
                else
                {
                    def.reject();
                }

                return def.promise();
            };

            /**
             * Creates a new marker from an existing page
             * 
             * @param {jQuery.Deferred} def Deferred for the creation process
             * @param {string} pageId Page Id
             * @param {object} latLng Lat/Long Position
             */
            Map.KirjaMarkerManager.prototype.createMarkerFromExistingPage = function(def, pageId, latLng) {
                var pageName = "";
                var page = this.findEntryById(pageId);
                if(page) 
                {
                    pageName = page.name;
                }

                var marker = new Map.KirjaMarker(pageId, pageName, latLng);
                this.pushMarker(marker);
                def.resolve(marker);
            };

            /**
             * Creates a new marker from a new page
             * 
             * @param {jQuery.Deferred} def Deferred for the creation process
             * @param {object} latLng Lat/Long Position
             */
            Map.KirjaMarkerManager.prototype.createMarkerFromNewPage = function(def, latLng) {
                this.viewModel.showWaitOnPageDialog(true);

                var self = this;
                var newPage = window.open("/Kirja?newPage=1");
                newPage.onbeforeunload = function() {
                    self.viewModel.showWaitOnPageDialog(false);
                };
                newPage.newKirjaPageSaved = function(id, name) {
                    var marker = new Map.KirjaMarker(id, name, latLng);
                    self.pushMarker(marker);

                    self.viewModel.showWaitOnPageDialog(false);

                    def.resolve(marker);
                };
            };

            /**
             * Creates a new kirja page for a marker
             */
            Map.KirjaMarkerManager.prototype.createNewKirjaMarker = function() {
                if(this.markerSelectionMode == newKirjaPageSelectionMode)
                {
                    this.deselectCurrentEntry();
                    return;
                }

                this.viewModel.setCurrentObjectId(newKirjaPageButtonId, this);
                this.markerSelectionMode = newKirjaPageSelectionMode;
            };

            /**
             * Parses a marker
             * 
             * @param {object} unparsedMarker Unparsed marker
             * @param {object} latLng Lat/Long Position
             */
            Map.KirjaMarkerManager.prototype.parseMarker = function(unparsedMarker, latLng) {
                return new Map.KirjaMarker(unparsedMarker.pageId, unparsedMarker.pageName, latLng);
            };

        }(Karta.Map = Karta.Map || {}));
    }(GoNorth.Karta = GoNorth.Karta || {}));
}(window.GoNorth = window.GoNorth || {}));