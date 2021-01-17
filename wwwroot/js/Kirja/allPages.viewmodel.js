(function(GoNorth) {
    "use strict";
    (function(Kirja) {
        (function(AllPages) {

            /// Page Size
            var pageSize = 50;

            /**
             * All Page View Model
             * @class
             */
            AllPages.ViewModel = function()
            {
                var currentPage = 0;
                var pageFromUrl = parseInt(GoNorth.Util.getParameterFromUrl("page"));
                if(!isNaN(pageFromUrl))
                {
                    currentPage = pageFromUrl;
                }

                var initialSearchPattern = GoNorth.Util.getParameterFromUrl("searchTerm");
                if(!initialSearchPattern)
                {
                    initialSearchPattern = "";
                }

                this.searchPattern = new ko.observable(initialSearchPattern);
                this.searchPatternToUse = initialSearchPattern;
                this.pages = new ko.observableArray();
                this.hasMore = new ko.observable(false);
                this.currentPage = new ko.observable(currentPage);

                this.isLoading = new ko.observable(false);
                this.prevLoading = new ko.observable(false);
                this.nextLoading = new ko.observable(false);

                this.errorOccured = new ko.observable(false);

                this.nextLoading(true);
                this.searchPages();
            };

            AllPages.ViewModel.prototype = {
                /**
                 * Starts a new search
                 */
                startNewSearch: function() {
                    this.searchPatternToUse = this.searchPattern();
                    this.currentPage(0);
                    this.hasMore(false);
                    this.searchPages();
                },

                /**
                 * Search pages
                 */
                searchPages: function() {
                    this.errorOccured(false);
                    this.isLoading(true);

                    var urlParameters = "page=" + this.currentPage();
                    if(this.searchPatternToUse)
                    {
                        urlParameters += "&searchTerm=" + encodeURIComponent(this.searchPatternToUse);
                    }
                    GoNorth.Util.replaceUrlParameters(urlParameters);

                    var self = this;
                    GoNorth.HttpClient.get("/api/KirjaApi/SearchPages?searchPattern=" + encodeURIComponent(this.searchPatternToUse) + "&start=" + (this.currentPage() * pageSize) + "&pageSize=" + pageSize).done(function(data) {
                       self.pages(data.pages);
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

                    this.searchPages();
                },

                /**
                 * Loads the next page
                 */
                nextPage: function() {
                    this.currentPage(this.currentPage() + 1);
                    this.nextLoading(true);

                    this.searchPages();
                },

                /**
                 * Opens a new window to create a page
                 */
                openCreatePage: function() {
                    window.location = "/Kirja?newPage=1";
                },

                /**
                 * Builds the url for a kirja page
                 * 
                 * @param {object} page Page to open
                 * @returns {string} Url of the kirja page
                 */
                buildPageUrl: function(page) {
                    return "/Kirja?id=" + page.id;
                }
            };

        }(Kirja.AllPages = Kirja.AllPages || {}));
    }(GoNorth.Kirja = GoNorth.Kirja || {}));
}(window.GoNorth = window.GoNorth || {}));