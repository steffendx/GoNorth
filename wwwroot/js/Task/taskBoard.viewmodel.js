(function(GoNorth) {
    "use strict";
    (function(ChooseObjectDialog) {

        /// Dialog Page Size
        var dialogPageSize = 15;

        /**
         * Page View Model
         * @class
         */
        ChooseObjectDialog.ViewModel = function()
        {
            this.showDialog = new ko.observable(false);
            this.dialogTitle = new ko.observable("");
            this.showNewButtonInDialog = new ko.observable(false);
            this.dialogSearchCallback = null;
            this.dialogCreateNewCallback = null;
            this.dialogSearchPattern = new ko.observable("");
            this.dialogIsLoading = new ko.observable(false);
            this.dialogEntries = new ko.observableArray();
            this.dialogHasMore = new ko.observable(false);
            this.dialogCurrentPage = new ko.observable(0);
            this.errorOccured = new ko.observable(false);
            this.idObservable = null;

            this.choosingDeferred = null;
        };

        ChooseObjectDialog.ViewModel.prototype = {
            /**
             * Opens the dialog to search for npcs
             * 
             * @param {string} dialogTitle Title of the dialog
             * @param {function} createCallback Optional callback that will get triggered on hitting the new button, if none is provided the button will be hidden
             * @returns {jQuery.Deferred} Deferred for the selecting process
             */
            openNpcSearch: function(dialogTitle, createCallback) {
                return this.openDialog(dialogTitle, this.searchNpcs, createCallback, null);
            },

            /**
             * Opens the dialog to search for items
             * 
             * @param {string} dialogTitle Title of the dialog
             * @param {function} createCallback Optional callback that will get triggered on hitting the new button, if none is provided the button will be hidden
             * @returns {jQuery.Deferred} Deferred for the selecting process
             */
            openItemSearch: function(dialogTitle, createCallback) {
                return this.openDialog(dialogTitle, this.searchItems, createCallback, null);
            },

            /**
             * Opens the dialog to search for kirja pages
             * 
             * @param {string} dialogTitle Title of the dialog
             * @param {function} createCallback Optional callback that will get triggered on hitting the new button, if none is provided the button will be hidden
             * @param {ko.observable} idObservable Optional id observable which will be used to exclude the current object from the search
             * @returns {jQuery.Deferred} Deferred for the selecting process
             */
            openKirjaPageSearch: function(dialogTitle, createCallback, idObservable) {
                return this.openDialog(dialogTitle, this.searchPages, createCallback, idObservable);
            },

            /**
             * Opens the dialog to search for quests
             * 
             * @param {string} dialogTitle Title of the dialog
             * @param {function} createCallback Optional callback that will get triggered on hitting the new button, if none is provided the button will be hidden
             * @returns {jQuery.Deferred} Deferred for the selecting process
             */
            openQuestSearch: function(dialogTitle, createCallback) {
                return this.openDialog(dialogTitle, this.searchQuest, createCallback, null);
            },

            /**
             * Opens the dialog to search for chapter details
             * 
             * @param {string} dialogTitle Title of the dialog
             * @param {function} createCallback Optional callback that will get triggered on hitting the new button, if none is provided the button will be hidden
             * @param {ko.observable} idObservable Optional id observable which will be used to exclude the current object from the search
             * @returns {jQuery.Deferred} Deferred for the selecting process
             */
            openChapterDetailSearch: function(dialogTitle, createCallback, idObservable) {
                return this.openDialog(dialogTitle, this.searchChapterDetails, createCallback, idObservable);
            },

            /**
             * Opens the dialog
             * 
             * @param {string} dialogTitle Title of the dialog
             * @param {function} searchCallback Function that gets called on starting a search
             * @param {function} createCallback Function that gets called on hitting t he new button
             * @param {ko.observable} idObservable Optional id observable which will be used to exclude the current object from the search
             * @returns {jQuery.Deferred} Deferred for the selecting process
             */
            openDialog: function(dialogTitle, searchCallback, createCallback, idObservable) {
                if(this.choosingDeferred)
                {
                    this.choosingDeferred.reject();
                    this.choosingDeferred = null;
                }

                this.showDialog(true);
                this.dialogTitle(dialogTitle);
                this.dialogCreateNewCallback = typeof createCallback == "function" ? createCallback : null;
                this.showNewButtonInDialog(this.dialogCreateNewCallback ? true : false);
                this.dialogSearchCallback = searchCallback;
                this.dialogSearchPattern("");
                this.dialogIsLoading(false);
                this.dialogEntries([]);
                this.dialogHasMore(false);
                this.dialogCurrentPage(0);
                this.idObservable = idObservable;

                this.choosingDeferred = new jQuery.Deferred();
                return this.choosingDeferred.promise();
            },

            /**
             * Selects an object
             * 
             * @param {object} selectedObject Selected object
             */
            selectObject: function(selectedObject) {
                if(this.choosingDeferred)
                {
                    this.choosingDeferred.resolve(selectedObject);
                    this.choosingDeferred = null;
                }

                this.closeDialog();
            },

            /**
             * Cancels the dialog
             */
            cancelDialog: function() {
                if(this.choosingDeferred)
                {
                    this.choosingDeferred.reject();
                    this.choosingDeferred = null;
                }

                this.closeDialog();
            },

            /**
             * Closes the dialog
             */
            closeDialog: function() {
                this.showDialog(false);
            },

            /**
             * Starts a new dialog search
             */
            startNewDialogSearch: function() {
                this.dialogCurrentPage(0);
                this.dialogHasMore(false);
                this.runDialogSearch();
            },

            /**
             * Loads the previous dialog page
             */
            prevDialogPage: function() {
                this.dialogCurrentPage(this.dialogCurrentPage() - 1);
                this.runDialogSearch();
            },

            /**
             * Loads the previous dialog page
             */
            nextDialogPage: function() {
                this.dialogCurrentPage(this.dialogCurrentPage() + 1);
                this.runDialogSearch();
            },

            /**
             * Runs the dialog search
             */
            runDialogSearch: function() {
                this.dialogIsLoading(true);
                this.errorOccured(false);
                var self = this;
                this.dialogSearchCallback(this.dialogSearchPattern()).done(function(result) {
                    self.dialogHasMore(result.hasMore);
                    self.dialogEntries(result.entries);
                    self.dialogIsLoading(false);
                }).fail(function() {
                    self.errorOccured(true);
                    self.dialogIsLoading(false);
                });
            },

            /**
             * Creates a dialog object
             * 
             * @param {string} name Name of the object
             * @param {string} openLink Link to open the object
             */
            createDialogObject: function(id, name, openLink) {
                return {
                    id: id,
                    name: name,
                    openLink: openLink
                };
            },

            /**
             * Searches kirja pages
             * 
             * @param {string} searchPattern Search Pattern
             * @returns {jQuery.Deferred} Deferred for the result
             */
            searchPages: function(searchPattern) {
                var def = new jQuery.Deferred();

                var searchUrl = "/api/KirjaApi/SearchPages?searchPattern=" + encodeURIComponent(searchPattern) + "&start=" + (this.dialogCurrentPage() * dialogPageSize) + "&pageSize=" + dialogPageSize;
                if(this.idObservable)
                {
                    searchUrl += "&excludeId=" + this.idObservable();
                }

                var self = this;
                jQuery.ajax({ 
                    url: searchUrl, 
                    type: "GET"
                }).done(function(data) {
                    var result = {
                        hasMore: data.hasMore,
                        entries: []
                    };

                    for(var curEntry = 0; curEntry < data.pages.length; ++curEntry)
                    {
                        result.entries.push(self.createDialogObject(data.pages[curEntry].id, data.pages[curEntry].name, "/Kirja#id=" + data.pages[curEntry].id));
                    }

                    def.resolve(result);
                }).fail(function() {
                    def.reject();
                });

                return def.promise();
            },

            /**
             * Opens a page to create a new kirja page
             */
            openCreatePage: function() {
                this.dialogCreateNewCallback();
            },


            /**
             * Searches kortisto npcs
             * 
             * @param {string} searchPattern Search Pattern
             * @returns {jQuery.Deferred} Deferred for the result
             */
            searchNpcs: function(searchPattern) {
                var def = new jQuery.Deferred();
                
                var self = this;
                jQuery.ajax({ 
                    url: "/api/KortistoApi/SearchFlexFieldObjects?searchPattern=" + encodeURIComponent(searchPattern) + "&start=" + (this.dialogCurrentPage() * dialogPageSize) + "&pageSize=" + dialogPageSize, 
                    type: "GET"
                }).done(function(data) {
                    var result = {
                        hasMore: data.hasMore,
                        entries: []
                    };

                    for(var curEntry = 0; curEntry < data.flexFieldObjects.length; ++curEntry)
                    {
                        result.entries.push(self.createDialogObject(data.flexFieldObjects[curEntry].id, data.flexFieldObjects[curEntry].name, "/Kortisto/Npc#id=" + data.flexFieldObjects[curEntry].id));
                    }

                    def.resolve(result);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            },


            /**
             * Searches styr items
             * 
             * @param {string} searchPattern Search Pattern
             * @returns {jQuery.Deferred} Deferred for the result
             */
            searchItems: function(searchPattern) {
                var def = new jQuery.Deferred();
                
                var self = this;
                jQuery.ajax({ 
                    url: "/api/StyrApi/SearchFlexFieldObjects?searchPattern=" + encodeURIComponent(searchPattern) + "&start=" + (this.dialogCurrentPage() * dialogPageSize) + "&pageSize=" + dialogPageSize, 
                    type: "GET"
                }).done(function(data) {
                    var result = {
                        hasMore: data.hasMore,
                        entries: []
                    };

                    for(var curEntry = 0; curEntry < data.flexFieldObjects.length; ++curEntry)
                    {
                        result.entries.push(self.createDialogObject(data.flexFieldObjects[curEntry].id, data.flexFieldObjects[curEntry].name, "/Styr/Item#id=" + data.flexFieldObjects[curEntry].id));
                    }

                    def.resolve(result);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            },


            /**
             * Searches aika quests
             * 
             * @param {string} searchPattern Search Pattern
             * @returns {jQuery.Deferred} Deferred for the result
             */
            searchQuest: function(searchPattern) {
                var def = new jQuery.Deferred();
                
                var self = this;
                jQuery.ajax({ 
                    url: "/api/AikaApi/GetQuests?searchPattern=" + encodeURIComponent(searchPattern) + "&start=" + (this.dialogCurrentPage() * dialogPageSize) + "&pageSize=" + dialogPageSize, 
                    type: "GET"
                }).done(function(data) {
                    var result = {
                        hasMore: data.hasMore,
                        entries: []
                    };

                    for(var curEntry = 0; curEntry < data.quests.length; ++curEntry)
                    {
                        result.entries.push(self.createDialogObject(data.quests[curEntry].id, data.quests[curEntry].name, "/Aika/Quest#id=" + data.quests[curEntry].id));
                    }

                    def.resolve(result);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            },

            /**
             * Searches aika chapter details
             * 
             * @param {string} searchPattern Search Pattern
             * @returns {jQuery.Deferred} Deferred for the result
             */
            searchChapterDetails: function(searchPattern) {
                var def = new jQuery.Deferred();
                
                var self = this;
                jQuery.ajax({ 
                    url: "/api/AikaApi/GetChapterDetails?searchPattern=" + encodeURIComponent(searchPattern) + "&start=" + (this.dialogCurrentPage() * dialogPageSize) + "&pageSize=" + dialogPageSize, 
                    type: "GET"
                }).done(function(data) {
                    var result = {
                        hasMore: data.hasMore,
                        entries: []
                    };

                    for(var curEntry = 0; curEntry < data.details.length; ++curEntry)
                    {
                        if(self.idObservable && self.idObservable() == data.details[curEntry].id)
                        {
                            continue;
                        }

                        result.entries.push(self.createDialogObject(data.details[curEntry].id, data.details[curEntry].name, "/Aika/Detail#id=" + data.details[curEntry].id));
                    }

                    def.resolve(result);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            }
            
        };

    }(GoNorth.ChooseObjectDialog = GoNorth.ChooseObjectDialog || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Task) {
        (function(TaskBoard) {

            /**
             * Task
             * @param {object} serverData Server Data
             * @class
             */
            TaskBoard.Task = function(serverData)
            {
                this.id = serverData.id;
                this.name = new ko.observable("");
                this.description = new ko.observable("");
                this.assignedTo = new ko.observable("");
                this.status = new ko.observable(0);

                this.parseTaskFromServerResponse(serverData)
            };

            TaskBoard.Task.prototype = {
                /**
                 * Parses the task values from a server response
                 * 
                 * @param {object} serverData Server Data
                 */
                parseTaskFromServerResponse: function(serverData) {
                    this.name(serverData.name);
                    this.description(serverData.description);
                    this.assignedTo(serverData.assignedTo);
                    this.status(serverData.status);
                }
            };

        }(Task.TaskBoard = Task.TaskBoard || {}));
    }(GoNorth.Task = GoNorth.Task || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Task) {
        (function(TaskBoard) {

            /**
             * Container for Tasks for a status
             * @param {int} status Status for the column
             * @class
             */
            TaskBoard.StatusColumnTaskContainer = function(status)
            {
                this.status = status;
                this.tasks = new ko.observableArray();
            };

            TaskBoard.StatusColumnTaskContainer.prototype = {
            };

        }(Task.TaskBoard = Task.TaskBoard || {}));
    }(GoNorth.Task = GoNorth.Task || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Task) {
        (function(TaskBoard) {

            /**
             * Task Group
             * @param {object} viewModel ViewModel to which the task belongs
             * @param {object} taskGroup Task Group with data
             * @class
             */
            TaskBoard.TaskGroup = function(viewModel, taskGroup)
            {
                TaskBoard.Task.apply(this, [ taskGroup ]);

                this.viewModel = viewModel;
                this.isExpanded = new ko.observable(true);

                this.statusColumns = [];
                this.statusColumnLookup = {};
                for(var curStatus = 0; curStatus < viewModel.taskStatus.length; ++curStatus)
                {
                    var statusValue = viewModel.taskStatus[curStatus].value;
                    var statusColumn = new TaskBoard.StatusColumnTaskContainer(statusValue);
                    this.statusColumns.push(statusColumn);
                    this.statusColumnLookup[statusValue] = statusColumn;
                }

                this.parseFromServerResponse(taskGroup)
            };
            
            TaskBoard.TaskGroup.prototype = jQuery.extend({ }, TaskBoard.Task.prototype)

            /**
             * Parses the values from a server response
             */
            TaskBoard.TaskGroup.prototype.parseFromServerResponse = function(taskGroup) {
                TaskBoard.Task.prototype.parseTaskFromServerResponse.apply(this, [ taskGroup ]);

                this.isExpanded(taskGroup.status != this.viewModel.taskStatus[this.viewModel.taskStatus.length - 1].value);

                this.clearColumns();
                if(taskGroup.tasks)
                {
                    this.parseTasks(taskGroup.tasks);
                }
            };

            /**
             * Parses a list of tasks
             * 
             * @param {object[]} tasks Tasks returned from the server
             */
            TaskBoard.TaskGroup.prototype.parseTasks = function(tasks) {
                for(var curTask = 0; curTask < tasks.length; ++curTask)
                {
                    var newTask = new TaskBoard.Task(tasks[curTask]);
                    this.addTask(newTask);
                }
            };

            /**
             * Adds a task to the group
             * 
             * @param {Task} task Task to add
             */
            TaskBoard.TaskGroup.prototype.addTask = function(task) {
                var addToColumn = this.statusColumnLookup[task.status()];
                if(!addToColumn)
                {
                    addToColumn = this.statusColumns[0]; 
                }

                addToColumn.tasks.push(task);
            };

            /**
             * Moves a task to its correct column after status change
             * 
             * @param {Task} task Task to move
             * @param {int} oldStatus Old Status of the task
             */
            TaskBoard.TaskGroup.prototype.moveTaskToCorrectStatusColumn = function(task, oldStatus) {
                var oldColumn = this.statusColumnLookup[oldStatus];
                if(oldColumn)
                {
                    oldColumn.tasks.remove(task);
                }

                this.addTask(task);
            };

            /**
             * Removes a task
             * 
             * @param {Task} Task Task to remove
             */
            TaskBoard.TaskGroup.prototype.removeTask = function(task) {
                var removeFromColumn = this.statusColumnLookup[task.status()];
                if(removeFromColumn)
                {
                    removeFromColumn.tasks.remove(task);
                }
            }

            /**
             * Clears all tasks from the task columns
             */
            TaskBoard.TaskGroup.prototype.clearColumns = function() {
                for(var curColumn = 0; curColumn < this.statusColumns.length; ++curColumn)
                {
                    this.statusColumns[curColumn].tasks([]);
                }
            };

            /**
             * Toogles the expanded state
             */
            TaskBoard.TaskGroup.prototype.toogleExpanded = function() {
                this.isExpanded(!this.isExpanded());
            };
            
        }(Task.TaskBoard = Task.TaskBoard || {}));
    }(GoNorth.Task = GoNorth.Task || {}));
}(window.GoNorth = window.GoNorth || {}));
(function(GoNorth) {
    "use strict";
    (function(Task) {
        (function(TaskBoard) {

            /// Available Columns for Tasks
            var availableColumnsForTasks = 9;

            /**
             * Task Board View Model
             * @param {object[]} taskStatus Possible Task Status
             * @class
             */
            TaskBoard.ViewModel = function(taskStatus)
            {
                this.id = new ko.observable("");
                var paramId = GoNorth.Util.getParameterFromHash("id");
                if(paramId)
                {
                    this.setId(paramId);
                }

                this.taskStatus = taskStatus;

                var taskColumnWidth = Math.floor(availableColumnsForTasks / taskStatus.length);
                this.taskColumnClass = "col-sm-" + taskColumnWidth + " col-md-" + taskColumnWidth + " col-lg-" + taskColumnWidth;

                this.isLoading = new ko.observable(false);
                this.isReadonly = new ko.observable(false);

                this.errorOccured = new ko.observable(false);
                this.additionalErrorDetails = new ko.observable("");

                this.allBoards = new ko.observableArray();
                this.allUsers = new ko.observableArray();

                this.boardName = new ko.observable(Task.TaskBoard.Localization.Tasks);
                this.currentBoardDates = new ko.observable("");
                this.taskGroups = new ko.observableArray();

                this.showTaskDialog = new ko.observable(false);
                this.taskDialogTitle = new ko.observable("");
                this.taskDialogName = new ko.observable("");
                this.taskDialogDescription = new ko.observable("");
                this.taskDialogAssignedTo = new ko.observable(null);
                this.taskDialogStatus = new ko.observable(null);
                this.isTaskEditDialog = new ko.observable(false);
                this.isTaskDialogReadonly = new ko.observable(false);
                this.taskDialogLockedPrefix = new ko.observable("");
                this.taskDialogLockedByUser = new ko.observable("");
                this.editTaskGroup = null;
                this.addTaskToGroup = null;
                this.editTask = null;
                this.groupForEditTask = null;

                this.linkDialog = new GoNorth.ChooseObjectDialog.ViewModel();
                this.linkDialogInsertHtmlCallback = null;

                this.showDeleteDialog = new ko.observable(false);
                this.deleteDialogText = new ko.observable("");


                this.userDeferred = this.loadAllUsers();
                this.loadAllOpenBoards();
                
                var self = this;
                this.showTaskDialog.subscribe(function(newValue) {
                    if(!newValue)
                    {
                        self.releaseLock();
                    }
                });

                if(this.id())
                {
                    this.userDeferred.done(function() {
                        self.loadBoard(self.id());
                    });
                }

                var lastId = this.id();
                window.onhashchange = function() {
                    var id = GoNorth.Util.getParameterFromHash("id");
                    if(id != lastId) {
                        lastId = id;
                        self.switchBoard(GoNorth.Util.getParameterFromHash("id"));
                    }
                }
            };

            TaskBoard.ViewModel.prototype = {
                /**
                 * Resets the error state
                 */
                resetErrorState: function() {
                    this.errorOccured(false);
                    this.additionalErrorDetails("");
                },

                /**
                 * Loads all open boards
                 */
                loadAllOpenBoards: function() {
                    this.resetErrorState();
                    this.isLoading(true);
                    var self = this;
                    jQuery.ajax({ 
                        url: "/api/TaskApi/GetOpenTaskBoards?start=0&pageSize=100", 
                        type: "GET"
                    }).done(function(data) {
                        self.allBoards(data.boards);
                        self.isLoading(false);

                        if(!self.id() && data.boards.length > 0)
                        {
                            self.userDeferred.done(function() {
                                self.loadBoard(data.boards[0].id);
                            });
                        }
                    }).fail(function() {
                        self.errorOccured(true);
                        self.isLoading(false);
                    });
                },

                /**
                 * Loads all users
                 */
                loadAllUsers: function() {
                    var def = new jQuery.Deferred();

                    var self = this;
                    jQuery.ajax({ 
                        url: "/api/UtilApi/GetAllUsers", 
                        type: "GET"
                    }).done(function(users) {
                        self.allUsers(users);
                        def.resolve();
                    }).fail(function() {
                        self.errorOccured(true);
                        def.reject();
                    });

                    return def.promise();
                },

                /**
                 * Sets the id
                 * 
                 * @param {string} id Id of the board
                 */
                setId: function(id) {
                    this.id(id);
                    window.location.hash = "id=" + id;
                },

                /**
                 * Switches the board
                 * 
                 * @param {string} boardId Id of the board
                 */
                switchBoard: function(boardId) {
                    if(this.id() == boardId)
                    {
                        return;
                    }

                    this.loadBoard(boardId);
                },

                /**
                 * Loads a board
                 * 
                 * @param {string} id Id of the board
                 */
                loadBoard: function(id) {
                    this.errorOccured(false);
                    this.isLoading(true);
                    this.setId(id);
                    var self = this;
                    jQuery.ajax({
                        url: "/api/TaskApi/GetTaskBoard?id=" + encodeURIComponent(id),
                        method: "GET"
                    }).done(function(board) {
                        self.boardName(board.name);
                        self.currentBoardDates(self.formatTaskBoardDates(board));
                        self.isReadonly(board.isClosed);

                        if(board.taskGroups)
                        {
                            self.taskGroups(self.parseTaskGroups(board.taskGroups))
                        }
                        else
                        {
                            self.taskGroups([]);
                        }

                        self.isLoading(false);
                    }).fail(function() {
                        self.errorOccured(true);
                        self.isLoading(false);
                    });
                },

                /**
                 * Parses a list of task groups
                 * 
                 * @param {object[]} taskGroups Task Groups returned from the server
                 * @returns {objec[]} Parsed Task Groups
                 */
                parseTaskGroups: function(taskGroups) {
                    var parsedTaskGroups = [];
                    for(var curTaskGroup = 0; curTaskGroup < taskGroups.length; ++curTaskGroup)
                    {
                        parsedTaskGroups.push(new TaskBoard.TaskGroup(this, taskGroups[curTaskGroup]));
                    }

                    return parsedTaskGroups;
                },


                /**
                 * Formats the task board dates for display
                 */
                formatTaskBoardDates: function(taskBoard) {
                    var formatedDates = "";
                    if(taskBoard.plannedStart)
                    {
                        formatedDates = moment(taskBoard.plannedStart).format("L");
                    }

                    if(taskBoard.plannedStart && taskBoard.plannedEnd)
                    {
                        formatedDates += " - " + moment(taskBoard.plannedEnd).format("L");
                    }
                    else if(formatedDates)
                    {
                        formatedDates = Task.TaskBoard.Localization.StartingFrom + " " + formatedDates;
                    }

                    if(formatedDates)
                    {
                        formatedDates = "(" + formatedDates + ")";
                    }

                    return formatedDates;
                },


                /**
                 * Opens the create task group dialog
                 */
                openCreateTaskGroupDialog: function() {
                    this.taskDialogTitle(Task.TaskBoard.Localization.NewTaskGroup);
                    this.taskDialogLockedPrefix(Task.TaskBoard.Localization.LockedTaskGroupPrefix);

                    this.resetTaskDialogValues();
                    this.isTaskEditDialog(false);
                    this.editTaskGroup = null;
                    this.addTaskToGroup = null;
                    this.editTask = null;
                    this.groupForEditTask = null;
                    
                    this.releaseLock();

                    this.openSharedTaskDialog();
                },

                /**
                 * Opens the edit task group dialog
                 * 
                 * @param {object} taskGroup Task Group to edit
                 */
                openEditTaskGroupDialog: function(taskGroup) {
                    if(this.isLoading())
                    {
                        return;
                    }

                    this.taskDialogTitle(Task.TaskBoard.Localization.EditTaskGroup);
                    this.taskDialogLockedPrefix(Task.TaskBoard.Localization.LockedTaskGroupPrefix);

                    this.setTaskDialogValuesFromTask(taskGroup);
                    this.isTaskEditDialog(true);
                    this.editTaskGroup = taskGroup;
                    this.addTaskToGroup = null;
                    this.editTask = null;
                    this.groupForEditTask = null;

                    this.acquireLock("TaskGroup", taskGroup.id);

                    this.openSharedTaskDialog();
                },

                /**
                 * Opens the dialog for creating a new task
                 * 
                 * @param {object} taskGroup Taskgroup to which the new task should be added
                 */
                openCreateNewTaskDialog: function(taskGroup) {
                    this.taskDialogTitle(Task.TaskBoard.Localization.NewTask);
                    this.taskDialogLockedPrefix(Task.TaskBoard.Localization.LockedTaskPrefix);

                    this.resetTaskDialogValues();
                    this.isTaskEditDialog(false);
                    this.editTaskGroup = null;
                    this.addTaskToGroup = taskGroup;
                    this.editTask = null;
                    this.groupForEditTask = null;

                    this.releaseLock();

                    this.openSharedTaskDialog();
                },

                /**
                 * Opens the edit task dialog
                 * 
                 * @param {TaskGroup} taskGroup Task Group to which the task belongs
                 * @param {Task} task Task To edit
                 */
                openEditTaskDialog: function(taskGroup, task) {
                    if(this.isLoading())
                    {
                        return;
                    }

                    this.taskDialogTitle(Task.TaskBoard.Localization.EditTask);
                    this.taskDialogLockedPrefix(Task.TaskBoard.Localization.LockedTaskPrefix);

                    this.setTaskDialogValuesFromTask(task);
                    this.isTaskEditDialog(true);
                    this.editTaskGroup = null;
                    this.addTaskToGroup = null;
                    this.editTask = task;
                    this.groupForEditTask = taskGroup;
                    
                    this.acquireLock("Task", task.id);

                    this.openSharedTaskDialog();
                },

                /**
                 * Resets the task dialog values to empty
                 */
                resetTaskDialogValues: function() {
                    this.taskDialogName("");
                    this.taskDialogDescription("");
                    this.taskDialogAssignedTo(null);
                    this.taskDialogStatus(null);
                },

                /**
                 * Sets the task dialog values from a task
                 * 
                 * @param {object} task Task to read the values from
                 */
                setTaskDialogValuesFromTask: function(task) {
                    this.taskDialogName(task.name());
                    this.taskDialogDescription(task.description());
                    this.taskDialogAssignedTo(task.assignedTo());
                    this.taskDialogStatus(task.status());
                },

                /**
                 * Opens the task dialog and sets shared values
                 */
                openSharedTaskDialog: function() {
                    this.resetErrorState();
                    this.showTaskDialog(true);
                    GoNorth.Util.setupValidation("#gn-taskDialogForm");
                },

                /**
                 * Saves the task dialog
                 * 
                 * @param {bool} closeDialog true if the dialog should be closed after save, else false
                 */
                saveTaskDialog: function(closeDialog) {
                    // Validate Data
                    if(!jQuery("#gn-taskDialogForm").valid())
                    {
                        return;
                    }

                    // Send Request
                    var url = "/api/TaskApi/CreateTaskGroup?boardId=" + this.id();
                    if(this.editTaskGroup)
                    {
                        url = "/api/TaskApi/UpdateTaskGroup?boardId=" + this.id() + "&groupId=" + this.editTaskGroup.id;
                    }
                    else if(this.addTaskToGroup)
                    {
                        url = "/api/TaskApi/CreateTask?boardId=" + this.id() + "&groupId=" + this.addTaskToGroup.id;
                    }
                    else if(this.editTask)
                    {
                        url = "/api/TaskApi/UpdateTask?boardId=" + this.id() + "&groupId=" + this.groupForEditTask.id + "&taskId=" + this.editTask.id;
                    }

                    var request = {
                        name: this.taskDialogName(),
                        description: this.taskDialogDescription(),
                        assignedTo: this.taskDialogAssignedTo(),
                        status: this.taskDialogStatus()
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
                    }).done(function(data) {
                        if(self.editTaskGroup)
                        {
                            self.editTaskGroup.parseFromServerResponse(data);
                        }
                        else if(self.addTaskToGroup)
                        {
                            var newTask = new TaskBoard.Task(data);
                            self.addTaskToGroup.addTask(newTask);
                            if(!closeDialog)
                            {
                                self.editTask = newTask;
                                self.groupForEditTask = self.addTaskToGroup;
                                self.addTaskToGroup = null;
                            }
                        }
                        else if(self.editTask)
                        {
                            var oldTaskStatus = self.editTask.status();
                            self.editTask.parseTaskFromServerResponse(data);
                            if(self.editTask.status() != oldTaskStatus)
                            {
                                self.groupForEditTask.moveTaskToCorrectStatusColumn(self.editTask, oldTaskStatus);
                            }
                        }
                        else
                        {
                            var newTaskGroup = new TaskBoard.TaskGroup(self, data);
                            self.taskGroups.push(newTaskGroup);
                            if(!closeDialog)
                            {
                                self.editTaskGroup = newTaskGroup;
                            }
                        }

                        self.isLoading(false);
                    }).fail(function(xhr) {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                
                    if(closeDialog)
                    {
                        this.closeTaskDialog();
                    }
                },

                /**
                 * Closes the task dialog
                 */
                closeTaskDialog: function() {
                    this.resetErrorState();
                    this.showTaskDialog(false);
                },


                /**
                 * Saves a task or task group after a quick edit
                 * 
                 * @param {TaskGroup} taskGroup Task Group to save
                 * @param {Task} task Task to save, if null an update for the group will be saved
                 * @returns {jQuery.Deferred} Deferred for the save process
                 */
                saveTaskQuickEdit: function(taskGroup, task) {
                    if(this.isLoading())
                    {
                        return;
                    }

                    var saveObj = task;
                    if(!saveObj)
                    {
                        saveObj = taskGroup;
                    }

                    var request = {
                        name: saveObj.name(),
                        description: saveObj.description(),
                        assignedTo: saveObj.assignedTo() ? saveObj.assignedTo() : null,
                        status: saveObj.status()
                    };

                    var url = "/api/TaskApi/UpdateTaskGroup?boardId=" + this.id() + "&groupId=" + taskGroup.id; 
                    if(task)
                    {
                        url = "/api/TaskApi/UpdateTask?boardId=" + this.id() + "&groupId=" + taskGroup.id + "&taskId=" + task.id;
                    }

                    var def = new jQuery.Deferred();
                    this.isLoading(true);
                    this.resetErrorState();
                    var self = this;
                    jQuery.ajax({ 
                        url: url, 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        data: JSON.stringify(request), 
                        type: "POST",
                        contentType: "application/json"
                    }).done(function(data) {
                        self.isLoading(false);
                        def.resolve();
                    }).fail(function(xhr) {
                        self.isLoading(false);
                        self.errorOccured(true);
                        def.reject();
                    });

                    return def.promise();
                },

                /**
                 * Drops a task to a new status
                 * 
                 * @param {TaskGroup} taskGroup Task group
                 * @param {Task} task Task
                 * @param {int} newStatus New Status
                 */
                dropTaskToStatus: function(taskGroup, task, newStatus) {
                    if(task.status() == newStatus || this.isLoading())
                    {
                        return;
                    }

                    var oldStatus = task.status();
                    task.status(newStatus);
                    taskGroup.moveTaskToCorrectStatusColumn(task, oldStatus);

                    this.saveTaskQuickEdit(taskGroup, task).fail(function() {
                        // Move back to old column on error
                        task.status(oldStatus);
                        taskGroup.moveTaskToCorrectStatusColumn(task, newStatus);
                    });
                },


                /**
                 * Generates the rich text buttons
                 * 
                 * @returns {object} Rich text buttons
                 */
                generateRichTextButtons: function() {
                    var self = this;

                    var allButtons = {};
                    if(GoNorth.Task.TaskBoard.hasKirjaRights)
                    {
                        allButtons.insertWikiLink = {
                            title: GoNorth.Task.TaskBoard.Localization.ToolbarButtonInsertKirjaLinkTitle,
                            icon: "glyphicon-book",
                            callback: function(htmlInsert) {
                                self.linkDialogInsertHtmlCallback = htmlInsert;
                                self.linkDialog.openKirjaPageSearch(GoNorth.Task.TaskBoard.Localization.ToolbarButtonInsertKirjaLinkTitle).then(function(selectedObject) {
                                    self.addLinkFromLinkDialog(selectedObject);
                                });
                            }
                        };
                    }

                    if(GoNorth.Task.TaskBoard.hasAikaRights)
                    {
                        allButtons.insertQuestLink = {
                            title: GoNorth.Task.TaskBoard.Localization.ToolbarButtonInsertAikaQuestLinkTitle,
                            icon: "glyphicon-king",
                            callback: function(htmlInsert) {
                                self.linkDialogInsertHtmlCallback = htmlInsert;
                                self.linkDialog.openQuestSearch(GoNorth.Task.TaskBoard.Localization.ToolbarButtonInsertAikaQuestLinkTitle).then(function(selectedObject) {
                                    self.addLinkFromLinkDialog(selectedObject);
                                });
                            }
                        };
                    }

                    if(GoNorth.Task.TaskBoard.hasKortistoRights)
                    {
                        allButtons.insertNpcLink = {
                            title: GoNorth.Task.TaskBoard.Localization.ToolbarButtonInsertKortistoNpcLinkTitle,
                            icon: "glyphicon-user",
                            callback: function(htmlInsert) {
                                self.linkDialogInsertHtmlCallback = htmlInsert;
                                self.linkDialog.openNpcSearch(GoNorth.Task.TaskBoard.Localization.ToolbarButtonInsertKortistoNpcLinkTitle).then(function(selectedObject) {
                                    self.addLinkFromLinkDialog(selectedObject);
                                });
                            }
                        };
                    }

                    if(GoNorth.Task.TaskBoard.hasStyrRights)
                    {
                        allButtons.insertItemLink = {
                            title: GoNorth.Task.TaskBoard.Localization.ToolbarButtonInsertStyrItemLinkTitle,
                            icon: "glyphicon-apple",
                            callback: function(htmlInsert) {
                                self.linkDialogInsertHtmlCallback = htmlInsert;
                                self.linkDialog.openItemSearch(GoNorth.Task.TaskBoard.Localization.ToolbarButtonInsertStyrItemLinkTitle).then(function(selectedObject) {
                                    self.addLinkFromLinkDialog(selectedObject);
                                });
                            }
                        };
                    }

                    return allButtons;
                },

                /**
                 * Adds a link from the link dialog
                 * 
                 * @param {object} linkObj Link object
                 */
                addLinkFromLinkDialog: function(linkObj) {
                    this.linkDialogInsertHtmlCallback("<a href='" + linkObj.openLink + "' target='_blank'>" + linkObj.name + "</a>");
                },

                /**
                 * Callback if a new image file was uploaded
                 * 
                 * @param {string} image Image Filename that was uploaded
                 * @returns {string} Url of the new image
                 */
                imageUploaded: function(image) {
                    return "/api/TaskApi/TaskImage?imageFile=" + encodeURIComponent(image);
                },

                /**
                 * Callback if an error occured during upload
                 * 
                 * @param {string} errorMessage Error Message
                 * @param {object} xhr Xhr Object
                 */
                uploadError: function(errorMessage, xhr) {
                    this.errorOccured(true);
                    if(xhr && xhr.responseText)
                    {
                        this.additionalErrorDetails(xhr.responseText);
                    }
                    else
                    {
                        this.additionalErrorDetails(errorMessage);
                    }
                },

                /**
                 * Checks if a user wants to open a link from the description
                 * 
                 * @param {object} viewModel Viewmodel
                 * @param {object} e Event object
                 */
                checkDescriptionOpenLink: function(viewModel, e) {
                    if(e.ctrlKey && jQuery(e.target).is("a"))
                    {
                        window.open(jQuery(e.target).prop("href"));
                        return false;
                    }

                    return true;
                },


                /**
                 * Opens the delete dialog
                 */
                openDeleteDialog: function() {
                    this.showDeleteDialog(true);
                    
                    if(this.editTaskGroup)
                    {
                        this.deleteDialogText(Task.TaskBoard.Localization.AreYouSureYouWantToDeleteTheTaskGroup);
                    }
                    else
                    {
                        this.deleteDialogText(Task.TaskBoard.Localization.AreYouSureYouWantToDeleteTheTask);
                    }
                },

                /**
                 * Deletes the currently selected task or task group
                 */
                deleteTask: function() {
                    // Build Url
                    var url = ""
                    if(this.editTaskGroup)
                    {
                        url = "/api/TaskApi/DeleteTaskGroup?boardId=" + this.id() + "&groupId=" + this.editTaskGroup.id;
                    }
                    else if(this.editTask)
                    {
                        url = "/api/TaskApi/DeleteTask?boardId=" + this.id() + "&groupId=" + this.groupForEditTask.id + "&taskId=" + this.editTask.id;
                    }

                    if(!url)
                    {
                        return;
                    }

                    // Send request
                    this.closeDeleteDialog();
                    this.closeTaskDialog();

                    var def = new jQuery.Deferred();
                    this.isLoading(true);
                    this.resetErrorState();
                    var self = this;
                    jQuery.ajax({ 
                        url: url, 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        type: "DELETE",
                    }).done(function(data) {
                        if(self.editTaskGroup)
                        {
                            self.taskGroups.remove(self.editTaskGroup);
                        }
                        else
                        {
                            self.groupForEditTask.removeTask(self.editTask);
                        }

                        self.isLoading(false);
                    }).fail(function(xhr) {
                        self.isLoading(false);
                        self.errorOccured(true);

                        // If object is related to anything that prevents deleting a bad request (400) will be returned
                        if(xhr.status == 400 && xhr.responseText)
                        {
                            self.additionalErrorDetails(xhr.responseText);
                        }
                    });
                },

                /**
                 * Closes the delete dialog
                 */
                closeDeleteDialog: function() {
                    this.showDeleteDialog(false);
                },


                /**
                 * Releases the current lock
                 */
                releaseLock: function() {
                    this.isTaskDialogReadonly(false);
                    this.taskDialogLockedByUser("");
                    GoNorth.LockService.releaseCurrentLock();
                },

                /**
                 * Acquires a lock
                 * 
                 * @param {string} category Categroy of the task / taskgroup
                 * @param {string} id Id of the task / taskgroup
                 */
                acquireLock: function(category, id) {
                    this.releaseLock();
                    if(this.isReadonly())
                    {
                        return;
                    }

                    var self = this;
                    GoNorth.LockService.acquireLock(category, id).done(function(isLocked, lockedUsername) { 
                        if(isLocked)
                        {
                            self.isTaskDialogReadonly(true);
                            self.taskDialogLockedByUser(lockedUsername);
                        }
                    }).fail(function() {
                        self.errorOccured(true);
                    });
                }
            };

        }(Task.TaskBoard = Task.TaskBoard || {}));
    }(GoNorth.Task = GoNorth.Task || {}));
}(window.GoNorth = window.GoNorth || {}));