(function(GoNorth) {
    "use strict";
    (function(Task) {
        (function(ManageBoards) {

            /// Board Page Size
            var boardPageSize = 20;

            /**
             * List of Task Boards
             * 
             * @param {string} title Title of the list
             * @param {string} toogleStatusIcon Icon class used for the status toogle button
             * @param {string} toogleStatusToolTip Tooltip for the status toogle button
             * @param {string} apiMethod Api Method used to load the boards
             * @param {bool} isExpandedByDefault true if the list is expanded by default, else false
             * @param {ko.observable} errorOccuredObservable Observable which will be set to true or false if an error occured or a new load is started
             * @class
             */
            ManageBoards.TaskBoardList = function(title, toogleStatusIcon, toogleStatusToolTip, apiMethod, isExpandedByDefault, errorOccuredObservable)
            {
                this.apiMethod = apiMethod;

                this.title = title;
                this.toogleStatusIcon = toogleStatusIcon;
                this.toogleStatusToolTip = toogleStatusToolTip;

                this.isExpanded = new ko.observable(isExpandedByDefault);

                this.boards = new ko.observableArray();
                this.hasMore = new ko.observable(false);
                this.currentPage = new ko.observable(0);

                this.isLoading = new ko.observable(false);
                this.prevLoading = new ko.observable(false);
                this.nextLoading = new ko.observable(false);

                this.errorOccured = errorOccuredObservable;
            };

            ManageBoards.TaskBoardList.prototype = {

                /**
                 * Toogles the visibility of the list
                 */
                toogleVisibility: function() {
                    this.isExpanded(!this.isExpanded());
                },

                /**
                 * Loads Boards
                 */
                loadBoards: function() {
                    this.errorOccured(false);
                    this.isLoading(true);
                    var self = this;
                    jQuery.ajax({ 
                        url: "/api/TaskApi/" + this.apiMethod + "?start=" + (this.currentPage() * boardPageSize) + "&pageSize=" + boardPageSize, 
                        type: "GET"
                    }).done(function(data) {
                       self.boards(data.boards);
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

                    this.loadBoards();
                },

                /**
                 * Loads the next page
                 */
                nextPage: function() {
                    this.currentPage(this.currentPage() + 1);
                    this.nextLoading(true);

                    this.loadBoards();
                }
            };

        }(Task.ManageBoards = Task.ManageBoards || {}));
    }(GoNorth.Task = GoNorth.Task || {}));
}(window.GoNorth = window.GoNorth || {}));