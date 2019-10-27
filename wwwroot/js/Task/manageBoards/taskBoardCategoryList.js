(function(GoNorth) {
    "use strict";
    (function(Task) {
        (function(ManageBoards) {

            /**
             * List of Task Board categories
             * 
             * @param {function} reloadBoardsFunc Function to reload the boards
             * @class
             */
            ManageBoards.TaskBoardCategoryList = function(reloadBoardsFunc)
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
                this.errorOccured = new ko.observable(false);
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