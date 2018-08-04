(function(GoNorth) {
    "use strict";
    (function(ImplementationStatus) {
        (function(Overview) {

            /**
             * Implementation for implementation status dialog list
             * 
             * @param {ko.observable} loadingObs Observbale for loading display
             * @param {ko.observable} errorOccuredObs Observable if an error occurs
             * @param {GoNorth.ImplementationStatus.CompareDialog.ViewModel} compareDialog Compare Dialog
             * @class
             */
            Overview.ImplementationStatusDialogList = function(loadingObs, errorOccuredObs, compareDialog)
            {
                Overview.ImplementationStatusObjectList.apply(this, [ loadingObs, errorOccuredObs, compareDialog ]);
            };

            Overview.ImplementationStatusDialogList.prototype = jQuery.extend({ }, Overview.ImplementationStatusObjectList.prototype)

            /**
             * Loads the objects
             * 
             * @returns {jQuery.Deferred} Deferred for the loading process
             */
            Overview.ImplementationStatusDialogList.prototype.loadObjects = function() {
                var def = new jQuery.Deferred();

                jQuery.ajax({ 
                    url: "/api/TaleApi/GetNotImplementedDialogs?&start=" + (this.currentPage() * this.pageSize) + "&pageSize=" + this.pageSize, 
                    type: "GET"
                }).done(function(data) {
                   def.resolve({
                      objects: data.dialogs,
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
            Overview.ImplementationStatusDialogList.prototype.openCompareDialog = function(obj) {
                return this.compareDialog.openDialogCompare(obj.id, obj.name);
            };

            /**
             * Builds the url for an object
             * 
             * @param {object} obj Object to open
             * @returns {string}  Url of the object
             */
            Overview.ImplementationStatusDialogList.prototype.buildObjectUrl = function(obj) {
                return "/Tale?npcId=" + obj.relatedObjectId;
            };

        }(ImplementationStatus.Overview = ImplementationStatus.Overview || {}));
    }(GoNorth.ImplementationStatus = GoNorth.ImplementationStatus || {}));
}(window.GoNorth = window.GoNorth || {}));