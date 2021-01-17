(function(GoNorth) {
    "use strict";
    (function(ImplementationStatus) {
        (function(Overview) {

            /**
             * Implementation for implementation status marker list
             * 
             * @param {ko.observable} loadingObs Observbale for loading display
             * @param {ko.observable} errorOccuredObs Observable if an error occurs
             * @param {GoNorth.ImplementationStatus.CompareDialog.ViewModel} compareDialog Compare Dialog
             * @class
             */
            Overview.ImplementationStatusMarkerList = function(loadingObs, errorOccuredObs, compareDialog)
            {
                Overview.ImplementationStatusObjectList.apply(this, [ loadingObs, errorOccuredObs, compareDialog ]);

                this.hasMarkerTypeRow = true;
            };

            Overview.ImplementationStatusMarkerList.prototype = jQuery.extend({ }, Overview.ImplementationStatusObjectList.prototype)

            /**
             * Loads the objects
             * 
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Overview.ImplementationStatusMarkerList.prototype.loadObjects = function() {
                var def = new jQuery.Deferred();

                GoNorth.HttpClient.get("/api/KartaApi/GetNotImplementedMarkers?&start=" + (this.currentPage() * this.pageSize) + "&pageSize=" + this.pageSize).done(function(data) {
                   def.resolve({
                      objects: data.markers,
                      hasMore: data.hasMore
                   });
                }).fail(function() {
                    def.reject();
                });

                return def.promise();
            };

            /**
             * Opens the compare dialog for an object
             * 
             * @param {object} obj Object to check
             * @return {jQuery.Deferred} Deferred that will get resolved after the object was marked as implemented
             */
            Overview.ImplementationStatusMarkerList.prototype.openCompareDialog = function(obj) {
                return this.compareDialog.openMarkerCompare(obj.mapId, obj.id, obj.type);
            };

            /**
             * Builds the url for an object
             * 
             * @param {object} obj Object to open
             * @returns {string} Url of the object
             */
            Overview.ImplementationStatusMarkerList.prototype.buildObjectUrl = function(obj) {
                var zoomOnMarkerParam = "&zoomOnMarkerType=" + obj.type + "&zoomOnMarkerId=" + obj.id;
                return "/Karta?id=" + obj.mapId + zoomOnMarkerParam;
            };

        }(ImplementationStatus.Overview = ImplementationStatus.Overview || {}));
    }(GoNorth.ImplementationStatus = GoNorth.ImplementationStatus || {}));
}(window.GoNorth = window.GoNorth || {}));