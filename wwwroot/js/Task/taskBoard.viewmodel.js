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
             * Opens the dialog to search for skills
             * 
             * @param {string} dialogTitle Title of the dialog
             * @param {function} createCallback Optional callback that will get triggered on hitting the new button, if none is provided the button will be hidden
             * @returns {jQuery.Deferred} Deferred for the selecting process
             */
            openSkillSearch: function(dialogTitle, createCallback) {
                return this.openDialog(dialogTitle, this.searchSkills, createCallback, null);
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
                        result.entries.push(self.createDialogObject(data.pages[curEntry].id, data.pages[curEntry].name, "/Kirja?id=" + data.pages[curEntry].id));
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
                        result.entries.push(self.createDialogObject(data.flexFieldObjects[curEntry].id, data.flexFieldObjects[curEntry].name, "/Kortisto/Npc?id=" + data.flexFieldObjects[curEntry].id));
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
                        result.entries.push(self.createDialogObject(data.flexFieldObjects[curEntry].id, data.flexFieldObjects[curEntry].name, "/Styr/Item?id=" + data.flexFieldObjects[curEntry].id));
                    }

                    def.resolve(result);
                }).fail(function(xhr) {
                    def.reject();
                });

                return def.promise();
            },


            /**
             * Searches Evne skills
             * 
             * @param {string} searchPattern Search Pattern
             * @returns {jQuery.Deferred} Deferred for the result
             */
            searchSkills: function(searchPattern) {
                var def = new jQuery.Deferred();
                
                var self = this;
                jQuery.ajax({ 
                    url: "/api/EvneApi/SearchFlexFieldObjects?searchPattern=" + encodeURIComponent(searchPattern) + "&start=" + (this.dialogCurrentPage() * dialogPageSize) + "&pageSize=" + dialogPageSize, 
                    type: "GET"
                }).done(function(data) {
                    var result = {
                        hasMore: data.hasMore,
                        entries: []
                    };

                    for(var curEntry = 0; curEntry < data.flexFieldObjects.length; ++curEntry)
                    {
                        result.entries.push(self.createDialogObject(data.flexFieldObjects[curEntry].id, data.flexFieldObjects[curEntry].name, "/Evne/Skill?id=" + data.flexFieldObjects[curEntry].id));
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
                        result.entries.push(self.createDialogObject(data.quests[curEntry].id, data.quests[curEntry].name, "/Aika/Quest?id=" + data.quests[curEntry].id));
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

                        result.entries.push(self.createDialogObject(data.details[curEntry].id, data.details[curEntry].name, "/Aika/Detail?id=" + data.details[curEntry].id));
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
(function (GoNorth) {
    "use strict";
    (function (BindingHandlers) {

        if (typeof ko !== "undefined") {
            /**
             * Sets the task type color for an element
             * @param {object} element HTML Element
             * @param {object[]} allTaskTypes All task types
             * @param {string} taskTypeId Task type id
             */
            function setTaskTypeColor(element, allTaskTypes, taskTypeId)
            {
                var targetColor = null;
                var defaultColor = null;
                for(var curTaskType = 0; curTaskType < allTaskTypes.length; ++curTaskType)
                {
                    if(allTaskTypes[curTaskType].id == taskTypeId)
                    {
                        targetColor = allTaskTypes[curTaskType].color;
                        break;
                    }

                    if(allTaskTypes[curTaskType].isDefault)
                    {
                        defaultColor = allTaskTypes[curTaskType].color;
                    }
                }

                if(!defaultColor && allTaskTypes.length > 0)
                {
                    defaultColor = allTaskTypes[allTaskTypes.length - 1].color;
                }

                if(!targetColor)
                {
                    targetColor = defaultColor;
                }

                if(!targetColor)
                {
                    return;
                }

                jQuery(element).css("border-color", targetColor);
            }

            /**
             * Task type color binding
             */
            ko.bindingHandlers.taskTypeColorBinding = {
                init: function (element, valueAccessor, allBindings) {
                    var allTaskTypes = allBindings.get("taskTypes");
                    var taskTypeId = ko.utils.unwrapObservable(valueAccessor());

                    if(ko.isObservable(allTaskTypes)) {
                        allTaskTypes.subscribe(function() {
                            setTaskTypeColor(element, ko.utils.unwrapObservable(allTaskTypes), taskTypeId);
                        });
                    }

                    setTaskTypeColor(element, ko.utils.unwrapObservable(allTaskTypes), taskTypeId);
                },
                update: function (element, valueAccessor, allBindings) {
                    var allTaskTypes = allBindings.get("taskTypes");
                    var taskTypeId = ko.utils.unwrapObservable(valueAccessor());
                    setTaskTypeColor(element, ko.utils.unwrapObservable(allTaskTypes), taskTypeId);
                }
            }
        }

    }(GoNorth.BindingHandlers = GoNorth.BindingHandlers || {}));
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
                this.taskNumber = 0;
                this.taskTypeId = new ko.observable(null);
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
                    this.taskNumber = serverData.taskNumber;
                    this.taskTypeId(serverData.taskTypeId);
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
                this.isHovering = new ko.observable(false);
            };

            TaskBoard.StatusColumnTaskContainer.prototype = {
                /**
                 * Sets the state of the column to being hovered by a task
                 */
                activateTaskHovering: function() {
                    this.isHovering(true);
                },

                /**
                 * Sets the state of the column to not being hovered by a task
                 */
                disableTaskHovering: function() {
                    this.isHovering(false);
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
             * Task Group
             * @param {object} viewModel ViewModel to which the task belongs
             * @param {object} taskGroup Task Group with data
             * @param {function} resizeColumnFunc Function to resize the height of the columns
             * @class
             */
            TaskBoard.TaskGroup = function(viewModel, taskGroup, resizeColumnFunc)
            {
                TaskBoard.Task.apply(this, [ taskGroup ]);

                this.viewModel = viewModel;
                this.isExpanded = new ko.observable(true);
                this.isExpanded.subscribe(function() {
                    resizeColumnFunc();
                });
                this.resizeColumnFunc = resizeColumnFunc;

                this.statusColumns = [];
                this.statusColumnLookup = {};
                for(var curStatus = 0; curStatus < viewModel.taskStatus.length; ++curStatus)
                {
                    var statusValue = viewModel.taskStatus[curStatus].value;
                    var statusColumn = new TaskBoard.StatusColumnTaskContainer(statusValue);
                    statusColumn.tasks.subscribe(function() {
                        resizeColumnFunc();
                    });
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
                this.initialTaskGroupToOpenId = GoNorth.Util.getParameterFromUrl("taskGroupId");
                this.initialTaskToOpenId = GoNorth.Util.getParameterFromUrl("taskId");

                this.id = new ko.observable("");
                var paramId = GoNorth.Util.getParameterFromUrl("id");
                if(paramId)
                {
                    this.setId(paramId);
                }

                this.taskStatus = taskStatus;

                var taskColumnWidth = Math.floor(availableColumnsForTasks / taskStatus.length);
                this.taskColumnClass = "col-sm-" + taskColumnWidth + " col-md-" + taskColumnWidth + " col-lg-" + taskColumnWidth;

                this.isLoading = new ko.observable(false);
                this.disableSortables = new ko.pureComputed(function() {
                    return !this.isLoading();
                }, this);
                this.isReadonly = new ko.observable(false);

                this.errorOccured = new ko.observable(false);
                this.additionalErrorDetails = new ko.observable("");

                this.taskGroupTypes = new ko.observableArray();
                this.taskTypes = new ko.observableArray();

                this.allBoardCategories = new ko.observableArray();
                this.allBoards = new ko.observableArray();
                this.allBoardsWithoutCurrent = new ko.pureComputed(function() {
                    var id = this.id();
                    var allBoards = this.allBoards();
                    var targetBoards = [];
                    for(var curBoard = 0; curBoard < allBoards.length; ++curBoard)
                    {
                        if(allBoards[curBoard].id != id)
                        {
                            targetBoards.push(allBoards[curBoard]);
                        }
                    }

                    return targetBoards;
                }, this);
                this.groupedBoards = new ko.observableArray();
                this.allUsers = new ko.observableArray();

                this.boardName = new ko.observable(Task.TaskBoard.Localization.Tasks);
                this.currentBoardDates = new ko.observable("");
                this.taskGroups = new ko.observableArray();
                
                var self = this;
                this.taskGroups.subscribe(function() {
                    self.resizeColumnHeight();
                })

                this.showTaskDialog = new ko.observable(false);
                this.taskDialogTitle = new ko.observable("");
                this.taskDialogEditNumber = new ko.observable(null);
                this.taskDialogAllTaskTypes = new ko.observableArray();
                this.taskDialogTaskTypeId = new ko.observable("");
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

                this.showMoveTaskToBoardDialog = new ko.observable(false);
                this.isMovingTaskToBoard = new ko.observable(false);
                this.targetTaskBoardGroups = new ko.observableArray();
                this.isLoadingMoveTaskGroups = new ko.observable(false);
                this.errorOccuredLoadingMoveTaskGroups = new ko.observable(false);
                this.moveTargetTaskBoard = new ko.observable(null);
                this.moveTargetTaskGroup = new ko.observable(null);

                this.userDeferred = this.loadAllUsers();
                this.lastOpenedBoardIdDef = this.getLastOpenedBoardId();
                this.loadAllBoardCategoriesDef = this.loadAllBoardCategories();
                this.loadAllOpenBoards();
                this.loadAllTaskTypes();
                
                this.showTaskDialog.subscribe(function(newValue) {
                    if(!newValue)
                    {
                        self.releaseLock();
                        self.setTaskDialogParameter("");
                    }
                });

                if(this.id())
                {
                    this.userDeferred.done(function() {
                        self.loadBoard(self.id());
                    });
                    this.saveLastOpenedBoardId(this.id());
                }

                var lastId = this.id();
                GoNorth.Util.onUrlParameterChanged(function() {
                    var id = GoNorth.Util.getParameterFromUrl("id");
                    if(id != lastId) {
                        lastId = id;
                        self.switchBoard(id);
                    }
                });

                jQuery(window).resize(function() {
                    self.resizeColumnHeight();
                });
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
                 * Resizes the column background color, important to fully fill columns on drag of sortable without disturbing the sortable
                 */
                resizeColumnBackgroundColor: GoNorth.Util.debounce(function() {
                    if(GoNorth.Util.isBootstrapXs())
                    {
                        jQuery(".gn-taskGroupBackgroundColor").hide();
                        return;
                    }

                    
                    jQuery(".gn-taskGroupBackgroundColor").show();
                    jQuery(".gn-taskGroupRow").each(function() {
                        var height = jQuery(this).outerHeight() + "px";
                        jQuery(this).find(".gn-taskGroupBackgroundColor").css("height", height);
                    });
                }, 5),

                /**
                 * Resizes the column height
                 */
                resizeColumnHeight: GoNorth.Util.debounce(function() {
                    // Check if is in mobile
                    if(GoNorth.Util.isBootstrapXs())
                    {
                        jQuery(".gn-taskGroupColumnTaskContainer").each(function() { jQuery(this).css("min-height", "85px"); });
                        jQuery(".gn-taskGroupTaskSortable").each(function() { jQuery(this).css("min-height", "85px"); })

                        this.resizeColumnBackgroundColor();
                        return;
                    }

                    // Reset height to allow rows to shrink
                    jQuery(".gn-taskGroupColumnTaskContainer").each(function() { jQuery(this).css("min-height", "auto"); });
                    jQuery(".gn-taskGroupTaskSortable").each(function() { jQuery(this).css("min-height", "auto"); })

                    jQuery(".gn-taskGroupRow").each(function() {
                        var height = jQuery(this).outerHeight() + "px";
                        jQuery(this).find(".gn-taskGroupColumnTaskContainer").css("min-height", height);
                        jQuery(this).find(".gn-taskGroupTaskSortable").css("min-height", height);
                    });

                    this.resizeColumnBackgroundColor();
                }, 5),

                /**
                 * Loads all task types
                 */
                loadAllTaskTypes: function() {
                    var self = this;
                    var taskGroupTypesDef = jQuery.ajax({ 
                        url: "/api/TaskApi/GetTaskGroupTypes", 
                        type: "GET"
                    }).done(function(data) {
                        self.taskGroupTypes(data);
                    });

                    var taskTypesDef = jQuery.ajax({ 
                        url: "/api/TaskApi/GetTaskTypes", 
                        type: "GET"
                    }).done(function(data) {
                        self.taskTypes(data);
                    });

                    jQuery.when(taskGroupTypesDef, taskTypesDef).fail(function(err) {
                        self.errorOccured();
                    });
                },

                /**
                 * Loads all board categories
                 * @returns {jQuery.Deferred} jQuery Deferred
                 */
                loadAllBoardCategories: function() {
                    var def = new jQuery.Deferred();

                    var self = this;
                    jQuery.ajax({ 
                        url: "/api/TaskApi/GetTaskBoardCategories", 
                        type: "GET"
                    }).done(function(data) {
                        self.allBoardCategories(data);
                        def.resolve();
                    }).fail(function() {
                        def.reject();
                    });

                    return def.promise();
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

                        
                        self.loadAllBoardCategoriesDef.done(function() {
                            self.groupBoards();

                            if(!self.id() && data.boards.length > 0)
                            {
                                self.lastOpenedBoardIdDef.done(function(lastOpenedBoardId) {
                                    self.userDeferred.done(function() {

                                        var boardId = lastOpenedBoardId ? lastOpenedBoardId : data.boards[0].id;
                                        self.expandCategoryThatContainsBoard(boardId);
                                        self.loadBoard(boardId);
                                    });
                                });
                            } 
                            else if(self.id()) 
                            {
                                self.expandCategoryThatContainsBoard(self.id());
                            }
                        });
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
                 * Groups the boards by category
                 */
                groupBoards: function() {
                    var categories = this.allBoardCategories();
                    var boards = this.allBoards();

                    var groupedBoards = [];
                    var categoryLookup = {};
                    for(var curCategory = 0; curCategory  < categories.length; ++curCategory)
                    {
                        var newCategory = {
                            isCategory: true,
                            id: categories[curCategory].id,
                            name: new ko.observable(categories[curCategory].name),
                            isExpanded: new ko.observable(categories[curCategory].isExpandedByDefault),
                            boards: new ko.observableArray()
                        }
                        categoryLookup[categories[curCategory].id] = newCategory;
                        groupedBoards.push(newCategory);
                    }

                    for(var curBoard = 0; curBoard < boards.length; ++curBoard)
                    {
                        boards[curBoard].isCategory = false;
                        if(categoryLookup[boards[curBoard].categoryId])
                        {
                            categoryLookup[boards[curBoard].categoryId].boards.push(boards[curBoard])
                        }
                        else
                        {
                            groupedBoards.push(boards[curBoard]);
                        }
                    }

                    this.groupedBoards(groupedBoards);
                },

                /**
                 * Expands a category that contains a board
                 * @param {string} boardId Id of the board
                 */
                expandCategoryThatContainsBoard: function(boardId) {
                    var groupedBoards = this.groupedBoards();
                    for(var curGroup = 0; curGroup < groupedBoards.length; ++curGroup)
                    {
                        if(!groupedBoards[curGroup].isCategory)
                        {
                            continue;
                        }

                        var boards = groupedBoards[curGroup].boards();
                        for(var curBoard = 0; curBoard < boards.length; ++curBoard)
                        {
                            if(boards[curBoard].id == boardId) 
                            {
                                groupedBoards[curGroup].isExpanded(true);
                                return;
                            }
                        }
                    }
                },

                /**
                 * Toogles the board category expanded state
                 * @param {object} category Category to toogle
                 */
                toogleBoardCategoryExpanded: function(category) {
                    category.isExpanded(!category.isExpanded());
                },

                /**
                 * Sets the id
                 * 
                 * @param {string} id Id of the board
                 */
                setId: function(id) {
                    var pushIdAsNewState = this.id() && this.id() != id;
                    this.id(id);
                    var parameterValue = "id=" + id;
                    if(pushIdAsNewState)
                    {
                        GoNorth.Util.setUrlParameters(parameterValue);
                    }
                    else
                    {
                        GoNorth.Util.replaceUrlParameters(parameterValue);
                    }
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
                    this.saveLastOpenedBoardId(boardId);
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
                        // If a user has a reference to a board that can no longer be loaded we must fall back to an old board
                        if(!board)
                        {
                            if(self.allBoards().length > 0)
                            {
                                self.loadBoard(self.allBoards()[0].id);
                            }
                            else
                            {
                                self.errorOccured(true);
                            }
                            return;
                        }

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

                        if(self.initialTaskGroupToOpenId)
                        {
                            self.openTaskGroupById(self.initialTaskGroupToOpenId);
                            self.initialTaskGroupToOpenId = null;
                        }

                        if(self.initialTaskToOpenId)
                        {
                            self.openTaskById(self.initialTaskToOpenId);
                            self.initialTaskToOpenId = null;
                        }
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
                        parsedTaskGroups.push(new TaskBoard.TaskGroup(this, taskGroups[curTaskGroup], this.resizeColumnHeight.bind(this)));
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
                 * Loads the last opened board id
                 * 
                 * @returns {jQuery.Deferred} Deferred for the loading process
                 */
                getLastOpenedBoardId: function() {
                    var def = new jQuery.Deferred();
                    jQuery.ajax({
                        url: "/api/TaskApi/GetLastOpenedTaskBoard",
                        method: "GET"
                    }).done(function(boardId) {
                        def.resolve(boardId);
                    }).fail(function() {
                        def.reject();
                    });

                    return def.promise();
                },

                /**
                 * Saves the last opened board id
                 * 
                 * @param {string} boardId Id of the board
                 */
                saveLastOpenedBoardId: function(boardId) {
                    jQuery.ajax({
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        url: "/api/TaskApi/SetLastOpenedTaskBoard?boardId=" + encodeURIComponent(boardId),
                        method: "POST"
                    });
                },


                /**
                 * Opens a task group by id
                 * 
                 * @param {string} taskGroupId Task group id
                 */
                openTaskGroupById: function(taskGroupId) {
                    var taskGroups = this.taskGroups();
                    for(var curTaskGroup = 0; curTaskGroup < taskGroups.length; ++curTaskGroup)
                    {
                        if(taskGroups[curTaskGroup].id == taskGroupId)
                        {
                            this.openEditTaskGroupDialog(taskGroups[curTaskGroup]);
                            return;
                        }
                    }
                },

                /**
                 * Opens a task by id
                 * 
                 * @param {string} taskId Task id
                 */
                openTaskById: function(taskId) {
                    var taskGroups = this.taskGroups();
                    for(var curTaskGroup = 0; curTaskGroup < taskGroups.length; ++curTaskGroup)
                    {
                        var taskGroup = taskGroups[curTaskGroup];
                        for(var curColumn = 0; curColumn < taskGroup.statusColumns.length; ++curColumn)
                        {
                            var statusColumnTasks = taskGroup.statusColumns[curColumn].tasks();
                            for(var curTask = 0; curTask < statusColumnTasks.length; ++curTask)
                            {
                                if(statusColumnTasks[curTask].id == taskId)
                                {
                                    this.openEditTaskDialog(taskGroup, statusColumnTasks[curTask]);
                                    return;
                                }
                            }
                        }
                    }
                },


                /**
                 * Opens the create task group dialog
                 */
                openCreateTaskGroupDialog: function() {
                    this.taskDialogTitle(Task.TaskBoard.Localization.NewTaskGroup);
                    this.taskDialogEditNumber(null);
                    this.taskDialogLockedPrefix(Task.TaskBoard.Localization.LockedTaskGroupPrefix);

                    this.taskDialogAllTaskTypes(this.taskGroupTypes());
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
                    this.taskDialogEditNumber(taskGroup.taskNumber);
                    this.taskDialogLockedPrefix(Task.TaskBoard.Localization.LockedTaskGroupPrefix);

                    this.taskDialogAllTaskTypes(this.taskGroupTypes());
                    this.setTaskDialogValuesFromTask(taskGroup);
                    this.isTaskEditDialog(true);
                    this.editTaskGroup = taskGroup;
                    this.addTaskToGroup = null;
                    this.editTask = null;
                    this.groupForEditTask = null;

                    this.acquireLock("TaskGroup", taskGroup.id);

                    this.setTaskDialogParameter("taskGroupId=" + taskGroup.id);

                    this.openSharedTaskDialog();
                },

                /**
                 * Opens the dialog for creating a new task
                 * 
                 * @param {object} taskGroup Taskgroup to which the new task should be added
                 */
                openCreateNewTaskDialog: function(taskGroup) {
                    this.taskDialogTitle(Task.TaskBoard.Localization.NewTask);
                    this.taskDialogEditNumber(null);
                    this.taskDialogLockedPrefix(Task.TaskBoard.Localization.LockedTaskPrefix);

                    this.taskDialogAllTaskTypes(this.taskTypes());
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
                    this.taskDialogEditNumber(task.taskNumber);
                    this.taskDialogLockedPrefix(Task.TaskBoard.Localization.LockedTaskPrefix);

                    this.taskDialogAllTaskTypes(this.taskTypes());
                    this.setTaskDialogValuesFromTask(task);
                    this.isTaskEditDialog(true);
                    this.editTaskGroup = null;
                    this.addTaskToGroup = null;
                    this.editTask = task;
                    this.groupForEditTask = taskGroup;
                    
                    this.acquireLock("Task", task.id);

                    this.setTaskDialogParameter("taskId=" + task.id);

                    this.openSharedTaskDialog();
                },

                /**
                 * Sets the task dialog parameters
                 * 
                 * @param {string} dialogParameters Dialog Parameters to set
                 */
                setTaskDialogParameter: function(dialogParameters) {
                    var parameterValue = "id=" + this.id();
                    if(dialogParameters)
                    {
                        parameterValue += "&" + dialogParameters;
                    }

                    GoNorth.Util.replaceUrlParameters(parameterValue);
                },

                /**
                 * Returns the id of the default task type id from a type list
                 * @returns {string} Id of the task type
                 */
                getDefaultTaskTypeIdFromDialogTypeList: function() {
                    var taskTypeList = this.taskDialogAllTaskTypes();
                    for(var curType = 0; curType < taskTypeList.length; ++curType)
                    {
                        if(taskTypeList[curType].isDefault)
                        {
                            return taskTypeList[curType].id;
                        }
                    }

                    return taskTypeList.length > 0 ? taskTypeList[taskTypeList.length - 1].id : null;
                },

                /**
                 * Resets the task dialog values to empty
                 */
                resetTaskDialogValues: function() {
                    this.taskDialogTaskTypeId(this.getDefaultTaskTypeIdFromDialogTypeList());
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
                    this.taskDialogTaskTypeId(task.taskTypeId() ? task.taskTypeId() : this.getDefaultTaskTypeIdFromDialogTypeList());
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
                        taskTypeId: this.taskDialogTaskTypeId(),
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
                            var newTaskGroup = new TaskBoard.TaskGroup(self, data, self.resizeColumnHeight.bind(self));
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
                 * @param {TaskGroup} oldParentTaskGroup Old parent task group
                 * @param {int} targetIndex Target index for the task
                 * @returns {jQuery.Deferred} Deferred for the save process
                 */
                saveTaskQuickEdit: function(taskGroup, task, oldParentTaskGroup, targetIndex) {
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
                        taskTypeId: saveObj.taskTypeId(),
                        name: saveObj.name(),
                        description: saveObj.description(),
                        assignedTo: saveObj.assignedTo() ? saveObj.assignedTo() : null,
                        status: saveObj.status()
                    };

                    var url = "/api/TaskApi/UpdateTaskGroup?boardId=" + this.id() + "&groupId=" + taskGroup.id; 
                    if(task)
                    {
                        url = "/api/TaskApi/UpdateTask?boardId=" + this.id() + "&groupId=" + taskGroup.id + "&taskId=" + task.id + "&targetIndex=" + targetIndex;
                        if(oldParentTaskGroup && oldParentTaskGroup.id != taskGroup.id)
                        {
                            url += "&oldGroupId=" + oldParentTaskGroup.id;
                        }
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
                 * @param {TaskGroup} oldParentTaskGroup Old parent task group
                 * @param {int} newStatus New Status
                 * @param {int} targetIndex Target index for the task
                 */
                dropTaskToStatus: function(taskGroup, task, oldParentTaskGroup, newStatus, targetIndex) {
                    if(this.isLoading())
                    {
                        return;
                    }

                    var oldStatus = task.status();
                    task.status(newStatus);

                    this.saveTaskQuickEdit(taskGroup, task, oldParentTaskGroup, targetIndex).fail(function() {
                        // Move back to old column on error
                        if(taskGroup.id != oldParentTaskGroup.id)
                        {
                            taskGroup.removeTask(task);
                        }

                        task.status(oldStatus);
                        oldParentTaskGroup.moveTaskToCorrectStatusColumn(task, newStatus);
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
                 * Opens the move task to board dialog
                 */
                openMoveTaskToBoardDialog: function() {
                    this.showMoveTaskToBoardDialog(true);
                    this.isMovingTaskToBoard(this.editTaskGroup == null);
                    
                    this.moveTargetTaskBoard(null);
                    this.moveTargetTaskGroup(null);
                    this.targetTaskBoardGroups.removeAll();
                },

                /**
                 * Loads the target task boards for a selected task board
                 */
                loadTargetTaskBoardGroups: function() {
                    if(this.editTaskGroup)
                    {
                        return;
                    }

                    this.targetTaskBoardGroups.removeAll();
                    if(!this.moveTargetTaskBoard())
                    {
                        return;
                    }

                    this.isLoadingMoveTaskGroups(true);
                    this.errorOccuredLoadingMoveTaskGroups(false);
                    var self = this;
                    jQuery.ajax({
                        url: "/api/TaskApi/GetTaskBoard?id=" + encodeURIComponent(this.moveTargetTaskBoard()),
                        method: "GET"
                    }).done(function(board) {
                        if(board.taskGroups)
                        {
                            self.targetTaskBoardGroups(board.taskGroups)
                        }
                        self.isLoadingMoveTaskGroups(false);
                    }).fail(function() {
                        self.isLoadingMoveTaskGroups(false);
                        self.errorOccuredLoadingMoveTaskGroups(true);
                    });
                },

                /**
                 * Formats the name of a group for moving a task
                 * @param {object} taskGroup Task group to format
                 * @returns {string} Name of the group to display
                 */
                formatGroupNameForMove: function(taskGroup) {
                    var name = taskGroup.name;
                    for(var curStatus = 0; curStatus < this.taskStatus.length; ++curStatus)
                    {
                        if(this.taskStatus[curStatus].value == taskGroup.status)
                        {
                            name += " (" + this.taskStatus[curStatus].displayName + ")";
                            break;
                        }
                    }
                    return name;
                },

                /**
                 * Moves a task to a new target board
                 */
                moveTaskToBoard: function() {
                    // Validate data, jQuery validate had problems with the two selects, therefore fallback to using observable is used
                    if(!this.moveTargetTaskBoard() || (!this.moveTargetTaskGroup() && this.isMovingTaskToBoard()))
                    {
                        return
                    }
                    
                    // Build Url
                    var url = ""
                    if(this.editTaskGroup)
                    {
                        url = "/api/TaskApi/MoveTaskGroupToBoard?sourceBoardId=" + this.id() + "&groupId=" + this.editTaskGroup.id + "&targetBoardId=" + this.moveTargetTaskBoard();
                    }
                    else if(this.editTask)
                    {
                        url = "/api/TaskApi/MoveTaskToBoard?sourceBoardId=" + this.id() + "&sourceGroupId=" + this.groupForEditTask.id + "&taskId=" + this.editTask.id + "&targetBoardId=" + this.moveTargetTaskBoard() + "&targetGroupId=" + this.moveTargetTaskGroup();
                    }

                    if(!url)
                    {
                        return;
                    }

                    // Send request
                    this.closeMoveTaskToBoardDialog();
                    this.closeTaskDialog();

                    this.isLoading(true);
                    this.resetErrorState();
                    var self = this;
                    jQuery.ajax({ 
                        url: url, 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        type: "POST",
                    }).done(function() {
                        if(self.editTaskGroup)
                        {
                            self.taskGroups.remove(self.editTaskGroup);
                        }
                        else
                        {
                            self.groupForEditTask.removeTask(self.editTask);
                        }

                        self.isLoading(false);
                    }).fail(function() {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
                },

                /**
                 * Closes the move task to board dialog
                 */
                closeMoveTaskToBoardDialog: function() {
                    this.showMoveTaskToBoardDialog(false);
                },


                /**
                 * Reorders the task group
                 * @param {object} sortArg Sortable arguments
                 */
                reorderTaskGroup: function(sortArg) {
                    this.isLoading(true);
                    this.resetErrorState();
                    var self = this;
                    jQuery.ajax({ 
                        url: "/api/TaskApi/ReorderTaskGroup?boardId=" + this.id() + "&groupId=" + sortArg.item.id + "&targetIndex=" + sortArg.targetIndex, 
                        headers: GoNorth.Util.generateAntiForgeryHeader(),
                        type: "POST",
                        contentType: "application/json"
                    }).done(function(data) {
                        self.isLoading(false);
                    }).fail(function(xhr) {
                        self.isLoading(false);
                        self.errorOccured(true);
                    });
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
                 * Acquires a lock for the task dialog
                 * 
                 * @param {string} category Category of the task / taskgroup
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