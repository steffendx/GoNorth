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
             * @param {function} getCategoryNameFunction Function that returns the name of a function by its id
             * @param {ko.observable} errorOccuredObservable Observable which will be set to true or false if an error occured or a new load is started
             * @class
             */
            ManageBoards.TaskBoardList = function(title, toogleStatusIcon, toogleStatusToolTip, apiMethod, isExpandedByDefault, getCategoryNameFunction, errorOccuredObservable)
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

                this.getCategoryNameFunction = getCategoryNameFunction;
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
                        for(var curBoard = 0; curBoard < data.boards.length; ++curBoard)
                        {
                            data.boards[curBoard].categoryName = new ko.pureComputed(function() {
                                return self.getCategoryNameFunction(this.categoryId);
                            }, data.boards[curBoard]);
                        }
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
(function(GoNorth) {
    "use strict";
    (function(Task) {
        (function(ManageBoards) {

            /**
             * List of Task Board categories
             * 
             * @param {function} reloadBoardsFunc Function to reload the boards
             * @param {ko.observable} errorOccuredObservable Observable which will be set to true or false if an error occured or a new load is started
             * @class
             */
            ManageBoards.TaskBoardCategoryList = function(reloadBoardsFunc, errorOccuredObservable)
            {
                this.isExpanded = new ko.observable(false);

                this.boardCategories = new ko.observableArray();

                this.showCreateEditCategoryDialog = new ko.observable(false);
                this.showCreateEditCategoryName = new ko.observable("");
                this.showCreateEditCategoryExpandedByDefault = new ko.observable(false);
                this.isEditingCategory = new ko.observable(false);
                this.categoryToEdit = null;

                this.showConfirmDeleteDialog = new ko.observable(false);
                this.isCategoryToDeleteUsedByBoard = new ko.observable(false);
                this.categoryToDelete = null;

                this.isLoading = new ko.observable(false);

                this.reloadBoardsFunc = reloadBoardsFunc;
                this.errorOccured = errorOccuredObservable;
            };

            ManageBoards.TaskBoardCategoryList.prototype = {

                /**
                 * Toogles the visibility of the list
                 */
                toogleVisibility: function() {
                    this.isExpanded(!this.isExpanded());
                },

                /**
                 * Loads the board categories
                 */
                loadBoardCategories: function() {
                    this.errorOccured(false);
                    this.isLoading(true);
                    var self = this;
                    jQuery.ajax({ 
                        url: "/api/TaskApi/GetTaskBoardCategories", 
                        type: "GET"
                    }).done(function(data) {
                        self.boardCategories(data);

                        self.isLoading(false);
                    }).fail(function() {
                        self.errorOccured(true);
                        self.isLoading(false);
                    });
                },

                /**
                 * Opens the new board category dialog
                 */
                openNewBoardCategoryDialog: function() {
                    this.showCreateEditCategoryName("");
                    this.showCreateEditCategoryExpandedByDefault(false);
                    this.isEditingCategory(false);
                    this.categoryToEdit = null;

                    this.openEditBoardCategoryDialogShared();
                },

                /**
                 * Opens the edit board category dialog
                 * @param {object} category Category to edit
                 */
                openEditBoardCategoryDialog: function(category) {
                    this.showCreateEditCategoryName(category.name);
                    this.showCreateEditCategoryExpandedByDefault(category.isExpandedByDefault);
                    this.isEditingCategory(true);
                    this.categoryToEdit = category;

                    this.openEditBoardCategoryDialogShared();
                },

                /**
                 * Sets the shared values for opening the edit board category
                 */
                openEditBoardCategoryDialogShared: function() {
                    this.showCreateEditCategoryDialog(true);
                    GoNorth.Util.setupValidation("#gn-taskBoardCategoryCreateEditForm");
                },

                /**
                 * Saves the board category
                 */
                saveBoardCategory: function() {
                    // Valdiate Data
                    if(!jQuery("#gn-taskBoardCategoryCreateEditForm").valid())
                    {
                        return;
                    }

                    var url = "/api/TaskApi/CreateTaskBoardCategory";
                    if(this.categoryToEdit) {
                        url = "/api/TaskApi/UpdateTaskBoardCategory?id=" + this.categoryToEdit.id;
                    }

                    var request = {
                        name: this.showCreateEditCategoryName(),
                        isExpandedByDefault: this.showCreateEditCategoryExpandedByDefault()
                    };

                    this.isLoading(true);
                    this.errorOccured(false);
                    var self = this;
                    jQuery.ajax({ 
                        url: url, 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        data: JSON.stringify(request), 
                        type: "POST",
                        contentType: "application/json"
                    }).done(function() {
                        self.isLoading(false);
                        self.loadBoardCategories();
                        self.cancelBoardCategoryDialog();
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Cancels the edit board category dialog
                 */
                cancelBoardCategoryDialog: function() {
                    this.showCreateEditCategoryDialog(false);
                    this.categoryToEdit = null;
                },


                /**
                 * Opens the delete board category dialog
                 * @param {object} category Category to delete
                 */
                openDeleteBoardCategoryDialog: function(category) {
                    this.isCategoryToDeleteUsedByBoard(false);
                    this.showConfirmDeleteDialog(true);
                    this.categoryToDelete = category;

                    this.checkCategoryIsUsedByBoard(category);
                },

                /**
                 * Checks if a category is used by any board
                 * @param {object} category Category to check
                 */
                checkCategoryIsUsedByBoard: function(category) {
                    this.errorOccured(false);
                    this.isLoading(true);
                    var self = this;
                    jQuery.ajax({ 
                        url: "/api/TaskApi/IsTaskBoardCategoryUsedByBoard?id=" + category.id, 
                        type: "GET"
                    }).done(function(data) {
                        self.isCategoryToDeleteUsedByBoard(data);
                        self.isLoading(false);
                    }).fail(function() {
                        self.errorOccured(true);
                        self.isLoading(false);
                    });  
                },

                /**
                 * Deletes a board category
                 */
                deleteBoardCategory: function() {
                    this.errorOccured(false);
                    this.isLoading(true);
                    var self = this;
                    jQuery.ajax({ 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        url: "/api/TaskApi/DeleteTaskBoardCategory?id=" + this.categoryToDelete.id, 
                        type: "DELETE"
                    }).done(function(data) {
                        self.isLoading(false);
                        self.closeConfirmDeleteBoardCategoryDialog();
                        self.loadBoardCategories();

                        if(self.isCategoryToDeleteUsedByBoard())
                        {
                            self.reloadBoardsFunc();
                        }
                    }).fail(function() {
                        self.errorOccured(true);
                        self.isLoading(false);
                    });  
                },

                /**
                 * Closes the confirm delete board category
                 */
                closeConfirmDeleteBoardCategoryDialog: function() {
                    this.showConfirmDeleteDialog(false);
                    this.categoryToDelete = null;
                }
            };

        }(Task.ManageBoards = Task.ManageBoards || {}));
    }(GoNorth.Task = GoNorth.Task || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Task) {
        (function(ManageBoards) {

            /**
             * Manage Boards View Model
             * @class
             */
            ManageBoards.ViewModel = function()
            {
                this.isLoading = new ko.observable(false);

                this.errorOccured = new ko.observable(false);
                this.additionalErrorDetails = new ko.observable("");

                this.openBoardList = new ManageBoards.TaskBoardList(GoNorth.Task.ManageBoards.Localization.OpenTaskBoards, "glyphicon-ok", GoNorth.Task.ManageBoards.Localization.CloseTaskBoardToolTip, "GetOpenTaskBoards", true, this.getBoardCategoryNameById.bind(this), this.errorOccured);
                this.closedBoardList = new ManageBoards.TaskBoardList(GoNorth.Task.ManageBoards.Localization.ClosedTaskBoards, "glyphicon-repeat", GoNorth.Task.ManageBoards.Localization.ReopenTaskBoardToolTip, "GetClosedTaskBoards", false, this.getBoardCategoryNameById.bind(this), this.errorOccured);

                this.showBoardCreateEditDialog = new ko.observable(false);
                this.showDateValidationError = new ko.observable(false);
                this.isEditingBoard = new ko.observable(false);
                this.createEditBoardName = new ko.observable("");
                this.createEditBoardCategory = new ko.observable(null);
                this.createEditBoardPlannedStart = new ko.observable(null);
                this.createEditBoardPlannedEnd = new ko.observable(null);
                this.editingBoard = null;

                this.showConfirmDeleteDialog = new ko.observable(false);
                this.deleteBoardId = null;

                this.showConfirmToogleStatusDialog = new ko.observable(false);
                this.isToogleStatusClosing = new ko.observable(false);
                this.toogleStatusBoardId = null;

                this.taskBoardCategoryList = new ManageBoards.TaskBoardCategoryList(this.reloadBoards.bind(this), this.errorOccured);

                this.taskBoardCategoryList.loadBoardCategories();
                this.openBoardList.loadBoards();
                this.closedBoardList.loadBoards();
            };

            ManageBoards.ViewModel.prototype = {

                /**
                 * Resets the error state
                 */
                resetErrorState: function() {
                    this.errorOccured(false);
                    this.additionalErrorDetails("");
                },


                /**
                 * Builds the url for a board
                 * 
                 * @param {object} board Board to open
                 * @returns {string} Url for the board
                 */
                buildTaskBoardUrl: function(board) {
                    return "/Task?id=" + board.id;
                },


                /**
                 * Returns a board category by id
                 * @param {string} categoryId Category id
                 * @returns {object} Board category
                 */
                getBoardCategoryById: function(categoryId) {
                    if(!categoryId) {
                        return null;
                    }

                    var categories = this.taskBoardCategoryList.boardCategories();
                    for(var curCategory = 0; curCategory < categories.length; ++curCategory)
                    {
                        if(categories[curCategory].id == categoryId) 
                        {
                            return categories[curCategory];
                        }
                    }

                    return null;
                },

                /**
                 * Returns the name of a category by its id
                 * @param {string} categoryId Id of the category
                 * @returns {string} name of the category
                 */
                getBoardCategoryNameById: function(categoryId) {
                    var category = this.getBoardCategoryById(categoryId);
                    if(category) 
                    {
                        return category.name;
                    }

                    return "";
                },

                /**
                 * Opens the new board dialog
                 */
                openNewBoardDialog: function() {
                    this.isEditingBoard(false);
                    this.createEditBoardName("");
                    this.createEditBoardCategory(null);
                    this.createEditBoardPlannedStart(null);
                    this.createEditBoardPlannedEnd(null);
                    this.editingBoard = null;
                    
                    this.openBoardDialogShared();
                },

                /**
                 * Opens the edit board dialog
                 * 
                 * @param {object} board Board to edit
                 */
                openEditBoardDialog: function(board) {
                    this.isEditingBoard(true);
                    this.createEditBoardName(board.name);
                    this.createEditBoardCategory(this.getBoardCategoryById(board.categoryId));
                    this.createEditBoardPlannedStart(board.plannedStart ? board.plannedStart : null);
                    this.createEditBoardPlannedEnd(board.plannedEnd ? board.plannedEnd : null);
                    this.editingBoard = board;
                    
                    this.openBoardDialogShared();
                },

                /**
                 * Opens the board dialog and sets up shared values for editing and creating
                 */
                openBoardDialogShared: function() {
                    this.showBoardCreateEditDialog(true);
                    this.showDateValidationError(false);
                    GoNorth.Util.setupValidation("#gn-taskBoardCreateEditForm");
                },

                /**
                 * Saves the board
                 */
                saveBoard: function() {
                    // Valdiate Data
                    if(!jQuery("#gn-taskBoardCreateEditForm").valid())
                    {
                        return;
                    }

                    if(!this.createEditBoardPlannedStart() && this.createEditBoardPlannedEnd() || (this.createEditBoardPlannedStart() && this.createEditBoardPlannedEnd() && this.createEditBoardPlannedStart() > this.createEditBoardPlannedEnd()))
                    {
                        this.showDateValidationError(true);
                        return;
                    }
                    this.showDateValidationError(false);

                    // Send Request
                    var url = "/api/TaskApi/CreateTaskBoard";
                    if(this.editingBoard)
                    {
                        url = "/api/TaskApi/UpdateTaskBoard?id=" + this.editingBoard.id;
                    }

                    var request = {
                        name: this.createEditBoardName(),
                        categoryId: this.createEditBoardCategory() ? this.createEditBoardCategory().id : null,
                        plannedStart: this.createEditBoardPlannedStart(),
                        plannedEnd: this.createEditBoardPlannedEnd()
                    };

                    this.isLoading(true);
                    this.resetErrorState();
                    var self = this;
                    jQuery.ajax({ 
                        url: url, 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        data: JSON.stringify(request), 
                        type: "POST",
                        contentType: "application/json"
                    }).done(function(save) {
                        self.isLoading(false);

                        if(!self.editingBoard || !self.editingBoard.isClosed)
                        {
                            self.openBoardList.loadBoards();
                        }
                        else
                        {
                            self.closedBoardList.loadBoards();
                        }
                        self.cancelBoardDialog();
                    }).fail(function(xhr) {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Cancels the board dialog
                 */
                cancelBoardDialog: function() {
                    this.editingBoard = null;
                    this.showBoardCreateEditDialog(false);
                },


                /**
                 * Opens the confirm delete dialog for a board
                 * 
                 * @param {object} board Board to delete
                 */
                openDeleteBoardDialog: function(board) {
                    this.showConfirmDeleteDialog(true);
                    this.deleteBoardId = board.id;
                },

                /**
                 * Deletes the board
                 */
                deleteBoard: function() {
                    var self = this;
                    this.isLoading(true);
                    this.resetErrorState();
                    jQuery.ajax({ 
                        url: "/api/TaskApi/DeleteTaskBoard?id=" + this.deleteBoardId, 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        type: "DELETE"
                    }).done(function(data) {
                        self.isLoading(false);
                        self.openBoardList.loadBoards();
                        self.closedBoardList.loadBoards();
                    }).fail(function(xhr) {
                        self.isLoading(false);
                        self.errorOccured(true);

                        // If object is related to anything that prevents deleting a bad request (400) will be returned
                        if(xhr.status == 400 && xhr.responseText)
                        {
                            self.additionalErrorDetails(xhr.responseText);
                        }
                    });

                    this.closeConfirmDeleteDialog();
                },

                /**
                 * Closes the confirm delete dialog
                 */
                closeConfirmDeleteDialog: function() {
                    this.showConfirmDeleteDialog(false);
                    this.deleteBoardId = null;
                },


                /**
                 * Opens the confirm toogle status dialog for a board
                 * 
                 * @param {object} board Board to toogle status
                 */
                openToogleBoardStatusDialog: function(board) {
                    this.showConfirmToogleStatusDialog(true);
                    this.isToogleStatusClosing(!board.isClosed);
                    this.toogleStatusBoardId = board.id;
                },

                /**
                 * Toogles the board status
                 */
                toogleBoardStatus: function() {
                    var self = this;
                    this.isLoading(true);
                    this.resetErrorState();
                    jQuery.ajax({ 
                        url: "/api/TaskApi/SetTaskBoardStatus?id=" + this.toogleStatusBoardId + "&closed=" + this.isToogleStatusClosing(), 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        type: "POST"
                    }).done(function(data) {
                        self.isLoading(false);
                        self.openBoardList.loadBoards();
                        self.closedBoardList.loadBoards();
                    }).fail(function(xhr) {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });

                    this.closeConfirmToogleStatusDialog();
                },

                /**
                 * Closes the confirm toogle status dialog
                 */
                closeConfirmToogleStatusDialog: function() {
                    this.showConfirmToogleStatusDialog(false);
                    this.toogleStatusBoardId = null;
                },


                /**
                 * Reloads the boards
                 */
                reloadBoards: function() {
                    this.openBoardList.loadBoards();
                    this.closedBoardList.loadBoards();
                }
            };

        }(Task.ManageBoards = Task.ManageBoards || {}));
    }(GoNorth.Task = GoNorth.Task || {}));
}(window.GoNorth = window.GoNorth || {}));