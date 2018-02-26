(function(GoNorth) {
    "use strict";
    (function(ImplementationStatus) {
        (function(Overview) {

            /**
             * Base Implementation for implementation status object list
             * 
             * @param {ko.observable} loadingObs Observbale for loading display
             * @param {ko.observable} errorOccuredObs Observable if an error occurs
             * @param {GoNorth.ImplementationStatus.CompareDialog.ViewModel} compareDialog Compare Dialog
             * @class
             */
            Overview.ImplementationStatusObjectList = function(loadingObs, errorOccuredObs, compareDialog)
            {
                this.isInitialized = false;
                this.hasMarkerTypeRow = false;

                this.compareDialog = compareDialog;

                this.objects = new ko.observableArray();
                this.hasMore = new ko.observable(false);
                this.currentPage = new ko.observable(0);

                this.isLoading = loadingObs;
                this.prevLoading = new ko.observable(false);
                this.nextLoading = new ko.observable(false);

                this.errorOccured = errorOccuredObs;

                this.pageSize = 50;
            };

            Overview.ImplementationStatusObjectList.prototype = {
                /**
                 * Loads the objects
                 * 
                 * @returns {jQuery.Deferred} Deferred for the loading process
                 */
                loadObjects: function() {
                    var def = new jQuery.Deferred();
                    def.reject("Not implemented");
                    return def.promise();
                },

                /**
                 * Opens the compare
                 * 
                 * @param {object} obj Object to check
                 */
                openCompare: function(obj) {
                    var self = this;
                    this.openCompareDialog(obj).done(function() {
                        self.loadPage();
                    });
                },

                /**
                 * Opens the compare dialog for an object
                 * 
                 * @param {object} obj Object to check
                 * @return {jQuery.Deferred} Deferred that will get resolved after the object was marked as implemented
                 */
                openCompareDialog: function(obj) {

                },

                /**
                 * Builds the url for an object
                 * 
                 * @param {object} obj Object to open
                 * @returns {string}  Url of the object
                 */
                buildObjectUrl: function(obj) {

                },
                

                /**
                 * Initializes the list
                 */
                init: function() {
                    if(!this.isInitialized)
                    {
                        this.loadPage();
                        this.isInitialized = true;
                    }
                },

                /**
                 * Loads a page with objects
                 */
                loadPage: function() {
                    this.errorOccured(false);
                    this.isLoading(true);
                    var self = this;
                    this.loadObjects().done(function(data) {
                       self.objects(data.objects);
                       self.hasMore(data.hasMore);

                       self.resetLoadingState();
                    }).fail(function() {
                        self.errorOccured(true);
                        self.resetLoadingState();
                    });
                },

                /**
                 * Resets the loading state
                 */
                resetLoadingState: function() {
                    this.isLoading(false);
                    this.prevLoading(false);
                    this.nextLoading(false);
                },

                /**
                 * Loads the previous page
                 */
                prevPage: function() {
                    this.currentPage(this.currentPage() - 1);
                    this.prevLoading(true);

                    this.loadPage();
                },

                /**
                 * Loads the next page
                 */
                nextPage: function() {
                    this.currentPage(this.currentPage() + 1);
                    this.nextLoading(true);

                    this.loadPage();
                }
            };

        }(ImplementationStatus.Overview = ImplementationStatus.Overview || {}));
    }(GoNorth.ImplementationStatus = GoNorth.ImplementationStatus || {}));
}(window.GoNorth = window.GoNorth || {}));