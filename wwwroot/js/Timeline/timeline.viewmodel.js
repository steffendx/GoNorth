(function(GoNorth) {
    "use strict";
    (function(Timeline) {

        /**
         * Page Size
         */
        var pageSize = 50;

        /**
         * Timeline View Model
         * @class
         */
        Timeline.ViewModel = function()
        {
            var existingPagingData = this.loadPagingData();

            this.dayEntries = new ko.observableArray();
            this.startIndices = new ko.observableArray(existingPagingData);
            this.hasMore = new ko.observable(false);

            this.isLoading = new ko.observable(false);
            this.prevLoading = new ko.observable(false);
            this.nextLoading = new ko.observable(false);

            this.errorOccured = new ko.observable(false);

            this.nextPage();
        };

        Timeline.ViewModel.prototype = {
            /**
             * Loads a page
             * 
             * @param {int} startIndex Start Page
             * @param {bool} pushIndices true to push the indices, else false
             */
            loadPage: function(startIndex, pushIndices) {
                var self = this;
                this.errorOccured(false);
                this.isLoading(true);

                GoNorth.HttpClient.get("/api/TimelineApi/Entries?start=" + startIndex + "&pageSize=" + pageSize).done(function(data) {
                    self.dayEntries(self.parseDayEntries(data.entries));
                    self.hasMore(data.hasMore);
                    if(pushIndices) 
                    {
                        self.startIndices.push(data.continueStart);
                        self.savePagingData();
                    }

                    self.isLoading(false);
                    self.prevLoading(false);
                    self.nextLoading(false);
                }).fail(function() {
                    self.errorOccured(true);
                    self.isLoading(false);
                });
            },

            /**
             * Loads the first page
             */
            firstPage: function() {
                this.prevLoading(true);
                this.startIndices([0]);
                this.savePagingData();
                this.loadPage(0, true);  
            },

            /**
             * Loads the previous page
             */
            prevPage: function() {
                this.prevLoading(true);
                this.startIndices.pop();
                this.savePagingData();
                this.loadPage(this.startIndices()[this.startIndices().length - 2], false);  
            },

            /**
             * Loads the next page
             */
            nextPage: function() {
                this.nextLoading(true);
                this.loadPage(this.startIndices()[this.startIndices().length - 1], true);  
            },

            /**
             * Parses the day entries
             * 
             * @param {object[]} entries Entries to parse
             * @returns {object[]} Parsed entries
             */
            parseDayEntries: function(entries) {
                var result = [];
                var currentDay = null;
                var currentMonthObject = null;
                jQuery.each(entries, function(index, curEntry) 
                {
                    var currentTimestamp = new Date(curEntry.timestamp);
                    if(!currentDay || (currentDay.getFullYear() != currentTimestamp.getFullYear() || currentDay.getMonth() != currentTimestamp.getMonth() || currentDay.getDate() != currentTimestamp.getDate()))
                    {
                        currentMonthObject = {
                            timestamp: moment(currentTimestamp).format("L"),
                            entries: []
                        };
                        result.push(currentMonthObject);

                        currentDay = currentTimestamp;
                    }

                    currentMonthObject.entries.push({
                        timestamp: moment(currentTimestamp).format("LT"),
                        userName: curEntry.userDisplayName,
                        content: curEntry.content
                    });
                });

                return result;
            },


            /**
             * Saves the paging data
             */
            savePagingData: function() {
                var startIndices = this.startIndices();
                if(startIndices.length > 1)
                {
                    startIndices = startIndices.slice(0, startIndices.length - 1);
                }
                var pagingData = "pagingData=" + encodeURIComponent(JSON.stringify(startIndices));
                GoNorth.Util.replaceUrlParameters(pagingData);
            },

            /**
             * Loads the paging data
             * 
             * @returns {number[]} Start indices
             */
            loadPagingData: function() {
                var existingPagingData = [0];
                var pagingParamData = GoNorth.Util.getParameterFromUrl("pagingData");
                if(pagingParamData) 
                {
                    try
                    {
                        existingPagingData = JSON.parse(pagingParamData);
                    }
                    catch(e)
                    {                       
                    }
                }

                return existingPagingData;
            }
        };

    }(GoNorth.Timeline = GoNorth.Timeline || {}));
}(window.GoNorth = window.GoNorth || {}));