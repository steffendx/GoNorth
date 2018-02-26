(function(GoNorth) {
    "use strict";
    (function(FlexFieldDatabase) {
        (function(ManageTemplates) {

            // Page Size
            var pageSize = 50;

            /**
             * Manage Templates Base View Model
             * @param {string} apiControllerName Api Controller name
             * @param {string} objectPageUrl Object Page Url
             * @class
             */
            ManageTemplates.BaseViewModel = function(apiControllerName, objectPageUrl)
            {
                this.apiControllerName = apiControllerName;
                this.objectPageUrl = objectPageUrl;

                this.currentPage = new ko.observable(0);
                this.templates = new ko.observableArray();
                this.hasMore = new ko.observable(false);
                this.isLoading = new ko.observable(false);
                this.prevLoading = new ko.observable(false);
                this.nextLoading = new ko.observable(false);

                this.errorOccured = new ko.observable(false);

                this.loadPage();
            };

            ManageTemplates.BaseViewModel.prototype = {
                /**
                 * Loads a page
                 */
                loadPage: function() {
                    var self = this;
                    this.errorOccured(false);
                    this.isLoading(true);
    
                    jQuery.ajax("/api/" + this.apiControllerName + "/FlexFieldTemplates?start=" + (this.currentPage() * pageSize) + "&pageSize=" + pageSize).done(function(data) {
                        self.templates(data.flexFieldObjects);
                        self.hasMore(data.hasMore);

                        self.isLoading(false);
                        self.prevLoading(false);
                        self.nextLoading(false);
                    }).fail(function() {
                        self.errorOccured(true);
                        self.isLoading(false);
                    });
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
                },


                /**
                 * Opens the object form to create a new template
                 */
                createNewTemplate: function() {
                    window.location = this.objectPageUrl + "#template=1";
                },

                /**
                 * Builds the url for a template
                 * 
                 * @param {object} template Template to build the url for
                 * @returns {string} Url of the template
                 */
                buildTemplateUrl: function(template) {
                    return this.objectPageUrl + "#template=1&id=" + template.id;
                }
            };

        }(FlexFieldDatabase.ManageTemplates = FlexFieldDatabase.ManageTemplates || {}));
    }(GoNorth.FlexFieldDatabase = GoNorth.FlexFieldDatabase || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Kortisto) {
        (function(ManageTemplates) {

            // Page Size
            var pageSize = 50;

            /**
             * Manage Templates Management View Model
             * @class
             */
            ManageTemplates.ViewModel = function()
            {
                GoNorth.FlexFieldDatabase.ManageTemplates.BaseViewModel.apply(this, [ "KortistoApi", "/Kortisto/Npc" ]);
            };

            ManageTemplates.ViewModel.prototype = jQuery.extend({ }, GoNorth.FlexFieldDatabase.ManageTemplates.BaseViewModel.prototype);

        }(Kortisto.ManageTemplates = Kortisto.ManageTemplates || {}));
    }(GoNorth.Kortisto = GoNorth.Kortisto || {}));
}(window.GoNorth = window.GoNorth || {}));