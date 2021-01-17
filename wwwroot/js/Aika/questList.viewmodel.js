(function(GoNorth) {
    "use strict";
    (function(Aika) {
        (function(QuestList) {

            // Page Size
            var pageSize = 50;

            /**
             * Quest List View Model
             * @class
             */
            QuestList.ViewModel = function()
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

                this.currentPage = new ko.observable(currentPage);
                this.quests = new ko.observableArray();
                this.hasMore = new ko.observable(false);
                this.isLoading = new ko.observable(false);
                this.prevLoading = new ko.observable(false);
                this.nextLoading = new ko.observable(false);

                this.searchPattern = new ko.observable(initialSearchPattern);
                this.searchPatternToUse = initialSearchPattern;

                this.errorOccured = new ko.observable(false);

                this.loadPage();
            };

            QuestList.ViewModel.prototype = {
                /**
                 * Searchs quests
                 */
                searchQuests: function() {
                    this.searchPatternToUse = this.searchPattern();
                    this.currentPage(0);
                    this.nextLoading(true);
                    
                    this.loadPage();
                },

                /**
                 * Loads a page
                 */
                loadPage: function() {
                    var self = this;
                    this.errorOccured(false);
                    this.isLoading(true);
                    
                    var urlParameters = "page=" + this.currentPage();
                    if(this.searchPatternToUse)
                    {
                        urlParameters += "&searchTerm=" + encodeURIComponent(this.searchPatternToUse);
                    }
                    GoNorth.Util.replaceUrlParameters(urlParameters);
    
                    GoNorth.HttpClient.get("/api/AikaApi/GetQuests?searchPattern=" + this.searchPatternToUse + "&start=" + (this.currentPage() * pageSize) + "&pageSize=" + pageSize).done(function(data) {
                        self.quests(data.quests);
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
                 * Opens the new quest form
                 */
                createNewQuest: function() {
                    window.location = "/Aika/Quest";
                },

                /**
                 * Builds the url for a quest
                 * 
                 * @param {object} quest Quest to build the url for
                 * @returns {string} Url for the quest
                 */
                buildQuestUrl: function(quest) {
                    return "/Aika/Quest?id=" + quest.id;
                }
            };

        }(Aika.QuestList = Aika.QuestList || {}));
    }(GoNorth.Aika = GoNorth.Aika || {}));
}(window.GoNorth = window.GoNorth || {}));