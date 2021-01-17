(function(GoNorth) {
    "use strict";
    (function(ImplementationStatus) {
        (function(Overview) {

            /**
             * Implementation for implementation status item list
             * 
             * @param {ko.observable} loadingObs Observbale for loading display
             * @param {ko.observable} errorOccuredObs Observable if an error occurs
             * @param {GoNorth.ImplementationStatus.CompareDialog.ViewModel} compareDialog Compare Dialog
             * @class
             */
            Overview.ImplementationStatusItemList = function(loadingObs, errorOccuredObs, compareDialog)
            {
                Overview.ImplementationStatusObjectList.apply(this, [ loadingObs, errorOccuredObs, compareDialog ]);
            };

            Overview.ImplementationStatusItemList.prototype = jQuery.extend({ }, Overview.ImplementationStatusObjectList.prototype)

            /**
             * Loads the objects
             * 
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Overview.ImplementationStatusItemList.prototype.loadObjects = function() {
                var def = new jQuery.Deferred();

                GoNorth.HttpClient.get("/api/StyrApi/GetNotImplementedItems?&start=" + (this.currentPage() * this.pageSize) + "&pageSize=" + this.pageSize).done(function(data) {
                   def.resolve({
                      objects: data.flexFieldObjects,
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
            Overview.ImplementationStatusItemList.prototype.openCompareDialog = function(obj) {
                return this.compareDialog.openItemCompare(obj.id, obj.name);
            };

            /**
             * Builds the url for an object
             * 
             * @param {object} obj Object to open
             * @returns {string}  Url of the object
             */
            Overview.ImplementationStatusItemList.prototype.buildObjectUrl = function(obj) {
                return "/Styr/Item?id=" + obj.id;
            };

        }(ImplementationStatus.Overview = ImplementationStatus.Overview || {}));
    }(GoNorth.ImplementationStatus = GoNorth.ImplementationStatus || {}));
}(window.GoNorth = window.GoNorth || {}));